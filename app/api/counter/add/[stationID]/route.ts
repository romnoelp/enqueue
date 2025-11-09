import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";
import { addCounterSchema } from "@/app/lib/zod-schemas/addCounter";
import { ZodError } from "zod";

// POST - Add counter to station
export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ stationID: string }> }
) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  if (!authResult.session?.user) {
    return NextResponse.json(
      { error: "User session not found" },
      { status: 401 }
    );
  }

  const uid = authResult.session.user.id || (authResult.session.user as { sub?: string }).sub;
  
  if (!uid) {
    return NextResponse.json(
      { error: "User ID not found" },
      { status: 401 }
    );
  }

  const displayName = authResult.session.user.name || uid;

  try {
  const { params } = context;
  const { stationID } = await params;

    if (!stationID) {
      return NextResponse.json(
        { error: "Missing stationID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsedBody = addCounterSchema.parse(body);
    const { counterNumber } = parsedBody;

    // Create new counter
    const counterRef = realtimeDb.ref("counters").push();
    await counterRef.set({
      counterNumber,
      employeeCashier: null,
      stationID,
    });

    // Get station name for logging
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationData = await stationRef.get();
    const stationName = stationData.exists()
      ? stationData.val().name
      : "Unknown Station";

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.ADD_COUNTER,
      `${displayName} added counter: ${counterNumber} in ${stationName}`
    );

    return NextResponse.json(
      {
        message: "Counter added successfully",
        counter: {
          id: counterRef.key,
          counterNumber,
          employeeCashier: null,
          stationID,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    console.error("Error adding counter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
