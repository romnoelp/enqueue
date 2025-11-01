import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import type { CashierType, Station } from "@/types";

// POST /api/queue/available-stations - Get available stations by purpose/type
export const POST = async (req: NextRequest) => {
  // Verify queue token with type "queue-form"
  const tokenResult = await verifyQueueToken(req, ["queue-form"]);
  if (!tokenResult.success) {
    return tokenResult.response;
  }

  try {
    const body = await req.json();
    const { purpose } = body as { purpose: CashierType };

    if (!purpose) {
      return NextResponse.json(
        { message: "Missing purpose field" },
        { status: 400 }
      );
    }

    // Get all stations from Realtime DB
    const stationRef = realtimeDb.ref("stations");
    const stationSnapshot = await stationRef.get();

    if (!stationSnapshot.exists()) {
      return NextResponse.json({ availableStations: [] }, { status: 200 });
    }

    const stations = stationSnapshot.val();

    // Filter activated stations that match the purpose
    const availableStations = Object.entries(stations)
      .map(([stationID, data]) => ({
        id: stationID,
        ...(data as Station),
      }))
      .filter(
        (station) => station.activated === true && station.type === purpose
      );

    return NextResponse.json({ availableStations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available stations:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
