import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { Counter } from "@/types";

// GET - Display currently serving customers at a station
export const GET = async (req: NextRequest) => {
  // Verify token (accepts queue-status tokens)
  const authResult = await verifyQueueToken(req, ["queue-status"]);
  if (!authResult.success) {
    return authResult.response;
  }

  const { stationID } = authResult.decodedToken;

  if (!stationID) {
    return NextResponse.json(
      { error: "Invalid token: missing stationID" },
      { status: 401 }
    );
  }

  try {
    // Get all counters for this station
    const countersRef = realtimeDb.ref("counters");
    const snapshot = await countersRef
      .orderByChild("stationID")
      .equalTo(stationID)
      .once("value");

    if (!snapshot.exists()) {
      return NextResponse.json(
        { error: "No counters found for the given stationID" },
        { status: 404 }
      );
    }

    const counters: Record<string, Counter> = snapshot.val();

    // Filter counters that are currently serving someone
    const servingCounters = Object.values(counters)
      .filter((counter) => counter.serving && counter.serving.trim() !== "")
      .map(({ counterNumber, serving }) => ({ counterNumber, serving }));

    return NextResponse.json({ servingCounters });
  } catch (error) {
    console.error("Error getting current serving:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
