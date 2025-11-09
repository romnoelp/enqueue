import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES, Station, Counter } from "@/types";
import { addStationSchema } from "@/app/lib/zod-schemas/addStation";
import { ZodError } from "zod";

// PUT - Update station
export const PUT = async (
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
    const parsedBody = addStationSchema.parse(body);
    const { name, description, activated, type } = parsedBody;

    // Check if station exists
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationSnapshot = await stationRef.get();

    if (!stationSnapshot.exists()) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    const stationData = stationSnapshot.val() as Station;

    // Get counters for this station
    const counterRef = realtimeDb.ref("counters");
    const counterSnapshot = await counterRef
      .orderByChild("stationID")
      .equalTo(stationID)
      .get();

    const counters: Record<string, Counter> = counterSnapshot.exists()
      ? counterSnapshot.val()
      : {};

    // Check if any counter is currently serving
    const hasServingCounter = Object.values(counters).some(
      (counter) => counter.serving && counter.serving.trim() !== ""
    );

    // Check if any counter has assigned cashier
    const hasAssignedCashier = Object.values(counters).some(
      (counter) => counter.uid && counter.uid.trim() !== ""
    );

    // Validation: Cannot deactivate if counters are serving
    if (stationData.activated && activated === false) {
      if (hasServingCounter) {
        return NextResponse.json(
          {
            error:
              "Cannot deactivate station while counters are serving customers.",
          },
          { status: 400 }
        );
      }
    }

    // Validation: Cannot activate without counters and cashiers
    if (!stationData.activated && activated === true) {
      if (Object.keys(counters).length === 0) {
        return NextResponse.json(
          {
            error: "Cannot activate station without counters assigned.",
          },
          { status: 400 }
        );
      }
      if (!hasAssignedCashier) {
        return NextResponse.json(
          {
            error: "Cannot activate station without an assigned cashier.",
          },
          { status: 400 }
        );
      }
    }

    // Update station
    await stationRef.update({
      name,
      description,
      type,
      activated,
    });

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.EDIT_STATION,
      `${displayName} updates station ${stationData.name}`
    );

    return NextResponse.json({
      message: `${stationData.name} updated successfully`,
      station: {
        id: stationID,
        name,
        description,
        activated,
        type,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    console.error("Error updating station:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
