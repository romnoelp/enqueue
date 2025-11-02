import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import type { Counter } from "@/types";

// GET /api/counter/get/[stationID] - Get all counters for a station
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ stationID: string }> }
) => {
  const { stationID } = await context.params;

  // Verify auth and check if user has admin or superAdmin role
  const authError = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (authError) return authError;

  try {
    // Get all counters
    const counterRef = realtimeDb.ref("counters");
    const snapshot = await counterRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ counterList: [] }, { status: 200 });
    }

    const counters = snapshot.val();

    // Filter counters by stationID and map to array
    const counterList = Object.entries(counters)
      .filter(([, data]) => (data as Counter).stationID === stationID)
      .map(([id, data]) => ({
        id,
        ...(data as Counter),
      }));

    return NextResponse.json({ counterList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching counters:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
