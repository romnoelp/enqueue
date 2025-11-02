import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { CashierType } from "@/types";

// GET - Get all stations
export const GET = async (req: NextRequest) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const stationRef = realtimeDb.ref("stations");
    const snapshot = await stationRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ cashierLocationList: [] });
    }

    const stations = snapshot.val();

    // Map stations to array with IDs
    const cashierLocationList = Object.entries(stations).map(
      ([id, data]) => ({
        id,
        ...(data as {
          name: string;
          description: string;
          type: CashierType;
          activated: boolean;
        }),
      })
    );

    return NextResponse.json({ cashierLocationList });
  } catch (error) {
    console.error("Error getting stations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
