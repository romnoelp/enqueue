import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { firestoreDb } from "@/app/lib/backend/firebase-admin";

// GET - Get count of remaining pending customers at a station
export const GET = async (req: NextRequest) => {
  // Verify authentication and cashier role
  const authResult = await verifyAuthAndRole( ["cashier"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const stationID = searchParams.get("stationID");

    if (!stationID) {
      return NextResponse.json(
        { error: "Missing stationID" },
        { status: 400 }
      );
    }

    // Count pending customers for this station
    const queueRef = firestoreDb
      .collection("queue")
      .where("customerStatus", "==", "pending")
      .where("stationID", "==", stationID);

    const remainingQueue = await queueRef.get();

    return NextResponse.json({
      remainingCustomersCount: remainingQueue.size,
    });
  } catch (error) {
    console.error("Error getting remaining pending customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
