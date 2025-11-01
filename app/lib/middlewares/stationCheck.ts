import { NextRequest, NextResponse } from "next/server";
import { realtimeDb } from "../backend/firebase-admin";

// Check if station is deactivated before operations
export const checkStationActivation = async (
  request: NextRequest,
  stationID: string
): Promise<NextResponse | null> => {
  try {
    if (!stationID) {
      return NextResponse.json(
        { message: "Missing station ID" },
        { status: 400 }
      );
    }

    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const snapshot = await stationRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "Station not found" },
        { status: 404 }
      );
    }

    const stationData = snapshot.val();
    if (stationData.activated) {
      return NextResponse.json(
        {
          message: `${stationData.name} is activated, deactivate first`,
        },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
