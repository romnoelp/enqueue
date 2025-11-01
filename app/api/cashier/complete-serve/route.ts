import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb, firestoreDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// POST - Complete transaction with customer
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
    const { queueID, stationID, counterID } = body;

    if (!queueID || !stationID || !counterID) {
      return NextResponse.json(
        { error: "Missing queueID, stationID, or counterID" },
        { status: 400 }
      );
    }

    // Check if queue entry exists
    const queueRef = firestoreDb.collection("queue").doc(queueID);
    const queueSnapshot = await queueRef.get();

    if (!queueSnapshot.exists) {
      return NextResponse.json(
        { error: "Queue entry not found" },
        { status: 404 }
      );
    }

    // Mark customer as complete
    await queueRef.update({ customerStatus: "complete" });

    // Remove from current-serving
    const currentServingRef = realtimeDb.ref(
      `current-serving/${stationID}/${counterID}`
    );
    await currentServingRef.remove();

    // Get current customer before removing
    const currentCounterServing = realtimeDb.ref(
      `counters/${counterID}/serving`
    );
    const currentCustomerData = await currentCounterServing.get();
    const currentCustomer = currentCustomerData.val();

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.COMPLETE_TRANSACTION,
      `${displayName} completes customer ${currentCustomer}`
    );

    // Remove from counter
    await currentCounterServing.remove();

    return NextResponse.json({ message: "Customer marked as complete" });
  } catch (error) {
    console.error("Error completing transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
