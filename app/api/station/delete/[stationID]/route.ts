import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { checkStationActivation } from "@/app/lib/middlewares/stationCheck";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// DELETE - Delete station (with activation check)
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { stationID: string } }
) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole(req, ["admin", "superAdmin"]);
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
    const { stationID } = params;

    if (!stationID) {
      return NextResponse.json(
        { error: "Missing stationID" },
        { status: 400 }
      );
    }

    // Check if station exists
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const snapshot = await stationRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    const stationData = snapshot.val();

    // Check station activation
    const activationCheck = await checkStationActivation(req, stationID);
    if (activationCheck) {
      return activationCheck;
    }

    // Get all counters and users
    const counterRef = realtimeDb.ref("counters");
    const counterSnapshot = await counterRef.get();
    const counters = counterSnapshot.val() ?? {};

    const usersRef = realtimeDb.ref("users");
    const usersSnapshot = await usersRef.get();
    const users = usersSnapshot.val() ?? {};

    // Find counters belonging to this station
    const stationCounters = Object.keys(counters).filter(
      (counterID) => counters[counterID].stationID === stationID
    );

    // Prepare batch updates
    const updates: Record<string, null> = {};

    stationCounters.forEach((counterID) => {
      const counterData = counters[counterID];

      // Remove counterID from assigned cashier
      if (counterData.uid && users[counterData.uid]) {
        updates[`users/${counterData.uid}/counterID`] = null;
      }

      // Delete counter
      updates[`counters/${counterID}`] = null;
    });

    // Delete station and current queue number
    updates[`stations/${stationID}`] = null;
    updates[`current-queue-number/${stationID}`] = null;

    // Apply all updates in one batch
    await realtimeDb.ref().update(updates);

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.DELETE_STATION,
      `${displayName} deletes station ${stationData.name}`
    );

    return NextResponse.json({
      message: `${stationData.name} has been deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting station:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
};
