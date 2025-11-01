import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb, firestoreDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// POST - Start serving next customer from queue
export const POST = async (req: NextRequest) => {
  // Verify authentication and cashier role
  const authResult = await verifyAuthAndRole(req, ["cashier"]);
  if (!authResult.success) {
    return authResult.response;
  }

  if (!authResult.session?.user) {
    return NextResponse.json(
      { error: "User session not found" },
      { status: 401 }
    );
  }

  const uid = authResult.session.user.id;
  const displayName = authResult.session.user.name || uid;

  try {
    const body = await req.json();
    const { stationID, counterID, counterNumber } = body;

    if (!stationID || !counterID || counterNumber === undefined) {
      return NextResponse.json(
        { error: "Missing stationID, counterID, or counterNumber" },
        { status: 400 }
      );
    }

    // Check if counter is already serving a customer
    const counterRef = realtimeDb.ref(`counters/${counterID}`);
    const counterSnapshot = await counterRef.get();
    const counterData = counterSnapshot.val();

    if (counterData?.serving) {
      return NextResponse.json(
        { error: "Counter is already serving a customer" },
        { status: 400 }
      );
    }

    // Find and assign next pending customer using Firestore transaction
    const customerRef = firestoreDb.collection("queue");
    const { customerDocID, customerEmail } = await firestoreDb.runTransaction(
      async (transaction) => {
        const queueSnapshot = await transaction.get(
          customerRef
            .where("stationID", "==", stationID)
            .where("customerStatus", "==", "pending")
            .orderBy("timestamp")
            .limit(1)
        );

        if (queueSnapshot.empty) {
          throw new Error("No pending customers in queue");
        }

        const customerDoc = queueSnapshot.docs[0];
        const customerDocID = customerDoc.id;
        const customerEmail = customerDoc.data().email;

        // Mark customer as ongoing
        transaction.update(customerDoc.ref, { customerStatus: "ongoing" });

        return { customerDocID, customerEmail };
      }
    );

    // Update current-serving in Realtime Database
    const currentServingRef = realtimeDb.ref(
      `current-serving/${stationID}/${counterID}`
    );
    await currentServingRef.set(customerDocID);

    // Assign customer to counter
    await counterRef.update({
      counterNumber,
      stationID,
      uid,
      serving: customerDocID,
    });

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.SERVE_CUSTOMER,
      `${displayName} serves customer ${customerDocID} (${customerEmail})`
    );

    // Toggle queue count to trigger UI updates
    const queueCountRef = realtimeDb.ref(`toggle-queue-count/${stationID}`);
    await queueCountRef.transaction((currentValue) => {
      return currentValue === 1 ? 0 : 1;
    });

    return NextResponse.json({
      message: "Customer assigned to cashier",
      customer: customerDocID,
    });
  } catch (error) {
    console.error("Error serving customer:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
};
