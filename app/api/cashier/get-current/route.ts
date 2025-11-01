import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// POST - Get currently serving customer for a counter
export const POST = async (req: NextRequest) => {
  // Verify authentication and cashier role
  const authResult = await verifyAuthAndRole(req, ["cashier"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { counterID } = body;

    if (!counterID) {
      return NextResponse.json(
        { error: "Missing counterID" },
        { status: 400 }
      );
    }

    // Get counter data from Realtime Database
    const counterRef = realtimeDb.ref(`counters/${counterID}`);
    const counterSnapshot = await counterRef.get();
    const counterData = counterSnapshot.val();

    if (!counterData) {
      return NextResponse.json(
        { error: "Unexpected error. Counter cannot be found" },
        { status: 404 }
      );
    }

    // Return currently serving customer or null
    return NextResponse.json({
      currentServing: counterData.serving || null,
    });
  } catch (error) {
    console.error("Error getting current serving:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
