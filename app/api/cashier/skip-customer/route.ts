import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb, firestoreDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// POST - Skip customer (mark as no-show/unsuccessful)
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

    const customerData = queueSnapshot.data();
    if (!customerData?.email) {
      return NextResponse.json(
        { error: "Customer data is missing email" },
        { status: 400 }
      );
    }

    // Mark customer as unsuccessful
    await queueRef.update({ customerStatus: "unsuccessful" });

    // Remove from current-serving
    const currentServingRef = realtimeDb.ref(
      `current-serving/${stationID}/${counterID}`
    );
    await currentServingRef.remove();

    // Remove from counter
    const currentCounterServing = realtimeDb.ref(
      `counters/${counterID}/serving`
    );
    await currentCounterServing.remove();

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.SKIP_CUSTOMER,
      `${displayName} skips customer ${queueID} (${customerData.email})`
    );

    return NextResponse.json({ message: "Customer marked as unsuccessful" });
  } catch (error) {
    console.error("Error skipping customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
