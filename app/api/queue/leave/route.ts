import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES, Counter } from "@/types";

type CounterWithID = { [key: string]: Counter };

// POST - Customer leaves queue
export const POST = async (req: NextRequest) => {
  // Verify token (accepts queue-status tokens)
  const authResult = await verifyQueueToken(req, ["queue-status"]);
  if (!authResult.success) {
    return authResult.response;
  }

  const { queueID, email, stationID } = authResult.decodedToken;

  if (!queueID || !email || !stationID) {
    return NextResponse.json(
      { error: "Invalid token: missing required fields" },
      { status: 401 }
    );
  }

  try {
    // Mark queue entry as unsuccessful
    const queueRef = firestoreDb.collection("queue").doc(queueID);
    await queueRef.set({ customerStatus: "unsuccessful" }, { merge: true });

    // Invalidate the token
    const invalidTokenRef = firestoreDb
      .collection("invalid-token")
      .doc(authResult.token);
    await invalidTokenRef.set({ email, timestamp: Date.now() });

    // Get station name for logging
    const stationSnapshot = await realtimeDb.ref(`stations/${stationID}`).get();
    const stationName = stationSnapshot.val()?.name || "Unknown Station";

    // Remove from current-serving if present
    const currentServingRef = realtimeDb.ref(`current-serving/${stationID}`);
    await currentServingRef.transaction((currentServing: CounterWithID | null) => {
      if (!currentServing) {
        return currentServing;
      }

      // Find counter serving this customer
      const matchingCounterNumber = Object.keys(currentServing).find(
        (counterNumber) => currentServing[counterNumber]?.serving === queueID
      );

      if (matchingCounterNumber) {
        delete currentServing[matchingCounterNumber];
      }

      return currentServing;
    });

    // Remove from counters serving list
    const countersRef = realtimeDb.ref("counters");
    const counterSnapshot = await countersRef.once("value");
    const counters = counterSnapshot.val() as { [key: string]: Counter } | null;

    if (counters) {
      for (const counterKey of Object.keys(counters)) {
        const counter = counters[counterKey];
        if (counter?.serving === queueID) {
          await countersRef.child(counterKey).update({ serving: null });
          break;
        }
      }
    }

    // Log activity
    await recordLog(
      email,
      ACTION_TYPES.LEAVE_QUEUE,
      `${email} left the queue at ${stationName}`
    );

    return NextResponse.json({ message: "Successfully left the queue" });
  } catch (error) {
    console.error("Error leaving queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
