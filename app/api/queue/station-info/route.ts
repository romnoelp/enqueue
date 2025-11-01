import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// GET - Get station information
export const GET = async (req: NextRequest) => {
  // Verify token (accepts queue-status tokens)
  const authResult = await verifyQueueToken(req, ["queue-status"]);
  if (!authResult.success) {
    return authResult.response;
  }

  const { stationID } = authResult.decodedToken;

  if (!stationID) {
    return NextResponse.json(
      { error: "Invalid or missing stationID" },
      { status: 403 }
    );
  }

  try {
    // Get station info from Realtime Database
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationSnapshot = await stationRef.get();

    if (!stationSnapshot.exists()) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    const { name, description } = stationSnapshot.val();

    return NextResponse.json({ stationInfo: { name, description } });
  } catch (error) {
    console.error("Error getting station info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
