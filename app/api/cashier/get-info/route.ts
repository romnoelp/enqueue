import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { Counter, CashierType } from "@/types";

type Station = {
  name: string;
  description: string;
  activated: boolean;
  type: CashierType;
};

// GET - Get cashier employee's assigned station and counter info
export const GET = async (req: NextRequest) => {
  // Verify authentication and cashier role
  const authResult = await verifyAuthAndRole( ["cashier"]);
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

  try {
    // Get all counters from Realtime Database
    const counterRef = realtimeDb.ref("counters");
    const counterSnapshot = await counterRef.get();
    const countersData = counterSnapshot.val();

    // If no counters exist, return not assigned
    if (!countersData) {
      return NextResponse.json({
        stationID: "Not assigned",
        stationName: "Not assigned",
        counterNumber: "Not assigned",
        counterID: "Not assigned",
      });
    }

    // Convert counters to array with IDs
    const counters: (Counter & { counterID: string })[] = Object.entries(
      countersData
    ).map(([id, data]) => ({
      counterID: id,
      ...(data as Counter),
    }));

    // Find counter assigned to this cashier
    const assignedCounter = counters.find((counter) => counter.uid === uid);

    if (!assignedCounter) {
      return NextResponse.json({
        stationID: "Not assigned",
        stationName: "Not assigned",
        counterNumber: "Not assigned",
        counterID: "Not assigned",
      });
    }

    // Get station information
    const stationRef = realtimeDb.ref(`stations/${assignedCounter.stationID}`);
    const stationSnapshot = await stationRef.get();
    const stationData = stationSnapshot.val() as Station;

    if (!stationData) {
      return NextResponse.json({
        stationName: "Not assigned",
        counterNumber: "Not assigned",
      });
    }

    return NextResponse.json({
      stationID: assignedCounter.stationID,
      stationName: stationData.name,
      counterNumber: assignedCounter.counterNumber,
      counterID: assignedCounter.counterID,
    });
  } catch (error) {
    console.error("Error getting cashier info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
