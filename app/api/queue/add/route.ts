import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken, verifyTokenNotUsed } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb, realtimeDb } from "@/app/lib/backend/firebase-admin";
import { addToQueueSchema } from "@/app/lib/schemas";
import { ZodError } from "zod";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";
import { generateToken } from "@/app/lib/utils/jwt";

// Add customer to queue with validation and transaction
export const POST = async (request: NextRequest) => {
  try {
    const tokenResult = await verifyQueueToken(request, ["queue-form"]);
    if (!tokenResult.success) {
      return tokenResult.response;
    }

    const usedError = await verifyTokenNotUsed(tokenResult.token);
    if (usedError) {
      return usedError;
    }

    const body = await request.json();
    const parsedBody = addToQueueSchema.parse(body);
    const { purpose, email, stationID, customerStatus } = parsedBody;

    // Check blacklist
    const blacklistRef = realtimeDb
      .ref("blacklist")
      .orderByChild("email")
      .equalTo(email);
    const blacklistSnapshot = await blacklistRef.get();

    if (blacklistSnapshot.exists()) {
      return NextResponse.json(
        { message: "You are banned from joining the queue." },
        { status: 403 }
      );
    }

    // Verify station is active
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationSnapshot = await stationRef.get();

    if (!stationSnapshot.exists() || stationSnapshot.val().activated === false) {
      return NextResponse.json(
        { message: "This cashier is not available or not existing" },
        { status: 400 }
      );
    }

    // Check for duplicate queue entry
    const queueCollectionRef = firestoreDb.collection("queue");
    const existingQueueSnapshot = await queueCollectionRef
      .where("email", "==", email)
      .where("stationID", "==", stationID)
      .where("customerStatus", "in", ["pending", "ongoing"])
      .get();

    if (!existingQueueSnapshot.empty) {
      return NextResponse.json(
        { message: "You are already in the queue" },
        { status: 400 }
      );
    }

    // Atomic queue number generation and customer creation
    const queueDocRef = firestoreDb.collection("queue-numbers").doc(purpose);
    const invalidTokenRef = firestoreDb
      .collection("invalid-token")
      .doc(tokenResult.token);

    const queueTransaction = await firestoreDb.runTransaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (transaction: any): Promise<{ queueIDWithPrefix: string; queueToken: string }> => {
        const queueDoc = await transaction.get(queueDocRef);
        let queueNum = 1;

        if (queueDoc.exists) {
          const queueData = queueDoc.data();
          queueNum = (queueData?.currentNumber ?? 0) + 1;
        }

        const queueIDWithPrefix = `${purpose
          .substring(0, 1)
          .toUpperCase()}${queueNum.toString().padStart(3, "0")}`;

        transaction.set(
          queueDocRef,
          { currentNumber: queueNum },
          { merge: true }
        );

        const payload = {
          queueID: queueNum,
          purpose,
          email,
          customerStatus,
          timestamp: Date.now(),
          stationID: stationID,
        };

        // Generate queue status token
        const queueToken = await generateToken(
          {
            id: queueIDWithPrefix,
            stationID,
            email,
            type: "queue-status",
          },
          "10h"
        );

        transaction.set(queueCollectionRef.doc(queueIDWithPrefix), payload);
        transaction.set(invalidTokenRef, { email, timestamp: Date.now() });

        const usedTokenRef = firestoreDb.collection("used-token").doc(queueToken);
        transaction.set(usedTokenRef, { email, timestamp: Date.now() });

        return { queueIDWithPrefix, queueToken };
      }
    );

    // Log queue join activity
    await recordLog(
      email,
      ACTION_TYPES.JOIN_QUEUE,
      `${email} joined the queue at ${stationSnapshot.val().name}`
    );

    // Toggle queue count for real-time UI updates
    const toggleStationQueueCountRef = realtimeDb.ref(
      `toggle-queue-count/${stationID}`
    );
    await toggleStationQueueCountRef.transaction((currentValue: number) => {
      return currentValue === 1 ? 0 : 1;
    });

    return NextResponse.json(
      {
        queueNumber: queueTransaction.queueIDWithPrefix,
        queueToken: queueTransaction.queueToken,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues
            .map((issue: { message: string }) => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
