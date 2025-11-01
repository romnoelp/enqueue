import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// DELETE /api/counter/delete/[stationID]/[counterID] - Delete counter
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ stationID: string; counterID: string }> }
) => {
  const { stationID, counterID } = await context.params;

  // Verify auth and check if user has admin or superAdmin role
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

  if (!counterID || !stationID) {
    return NextResponse.json(
      { message: "Missing counter ID or station ID" },
      { status: 400 }
    );
  }

  try {
    // Check if counter exists
    const counterRef = realtimeDb.ref(`counters/${counterID}`);
    const snapshot = await counterRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "Counter not found" },
        { status: 404 }
      );
    }

    const counterData = snapshot.val();
    const updates: Record<string, null> = {};

    // Remove counter assignment from employee if exists
    if (counterData?.uid) {
      updates[`users/${counterData.uid}/counterID`] = null;
    }

    // Remove the counter
    updates[`counters/${counterID}`] = null;

    // Apply all updates in one batch
    await realtimeDb.ref().update(updates);

    // Get station name for activity log
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationSnapshot = await stationRef.get();
    const stationName = stationSnapshot.exists()
      ? stationSnapshot.val().name
      : "Unknown Station";

    // Record activity log
    await recordLog(
      uid,
      ACTION_TYPES.DELETE_COUNTER,
      `Deleted counter ${counterData.counterNumber} from station ${stationName}`
    );

    return NextResponse.json(
      { message: `${counterData.counterNumber} has been removed` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting counter:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
