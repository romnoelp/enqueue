import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";
import { addStationSchema } from "@/app/lib/zod-schemas/addStation";
import { ZodError } from "zod";

// POST - Add new station
export const POST = async (req: NextRequest) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole(req, ["admin", "superAdmin"]);
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
  const displayName = authResult.session.user.name || uid;

  try {
    const body = await req.json();
    const parsedBody = addStationSchema.parse(body);
    const { name, description, activated, type } = parsedBody;

    // Create new station in Realtime DB
    const stationRef = realtimeDb.ref("stations").push();
    const stationID = stationRef.key;

    if (!stationID) {
      return NextResponse.json(
        { error: "Failed to generate station ID" },
        { status: 500 }
      );
    }

    await stationRef.set({
      name,
      description,
      activated,
      type,
    });

    // Initialize current queue number for this station
    const currentNumberRef = realtimeDb.ref(
      `current-queue-number/${stationID}`
    );
    await currentNumberRef.set({
      currentNumber: 1,
    });

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.ADD_STATION,
      `${displayName} added station ${name}`
    );

    return NextResponse.json(
      {
        message: "Station added successfully.",
        station: {
          id: stationID,
          name,
          description,
          activated,
          type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    console.error("Error adding station:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
