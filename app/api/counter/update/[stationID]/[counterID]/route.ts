import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";
import { addCounterSchema } from "@/app/lib/zod-schemas/addCounter";
import { ZodError } from "zod";

// PUT /api/counter/update/[stationID]/[counterID] - Update counter
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ stationID: string; counterID: string }> }
) => {
  const { stationID, counterID } = await context.params;

  // Verify auth and check if user has admin or superAdmin role
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

  if (!counterID || !stationID) {
    return NextResponse.json(
      { message: "Missing counter ID or station ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const parsedBody = addCounterSchema.parse(body);
    const { counterNumber, employeeUID } = parsedBody;

    // Check if counter exists
    const counterRef = realtimeDb.ref(`counters/${counterID}`);
    const snapshot = await counterRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json(
        { message: "Counter not found" },
        { status: 404 }
      );
    }

    const previousEmployeeUID = snapshot.val().uid;

    // Update counter
    await counterRef.update({
      counterNumber,
      uid: employeeUID || null,
      stationID,
    });

    // Handle employee assignment
    if (employeeUID) {
      const employeeRef = realtimeDb.ref(`users/${employeeUID}`);
      const employeeSnapshot = await employeeRef.get();

      if (!employeeSnapshot.exists()) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }

      // Verify employee is a cashier
      if (employeeSnapshot.val().role !== "cashier") {
        return NextResponse.json(
          { message: "You can only assign an employee of cashier role to counter" },
          { status: 403 }
        );
      }

      // Check if employee is already assigned to another counter
      if (employeeSnapshot.val().counterID) {
        return NextResponse.json(
          { message: "This employee is already assigned to another counter" },
          { status: 400 }
        );
      }

      // Assign counter to employee
      await employeeRef.update({
        counterID,
      });
    } else if (previousEmployeeUID) {
      // Remove counter assignment from previous employee
      const prevEmployeeRef = realtimeDb.ref(`users/${previousEmployeeUID}`);
      await prevEmployeeRef.update({ counterID: null });
    }

    // Get updated counter data
    const updatedSnapshot = await counterRef.get();

    // Get station name for activity log
    const stationRef = realtimeDb.ref(`stations/${stationID}`);
    const stationData = await stationRef.get();
    const stationName = stationData.exists() ? stationData.val().name : "Unknown Station";

    // Record activity log
    await recordLog(
      uid,
      ACTION_TYPES.EDIT_COUNTER,
      `Updated counter ${snapshot.val().counterNumber} from station ${stationName}`
    );

    return NextResponse.json(
      {
        message: `${snapshot.val().counterNumber} has been updated to ${updatedSnapshot.val().counterNumber}`,
        counter: {
          id: counterID,
          counterNumber: updatedSnapshot.val().counterNumber,
          employeeCashier: updatedSnapshot.val().uid || null,
          stationID: updatedSnapshot.val().stationID,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { message: errorMessages },
        { status: 400 }
      );
    }

    console.error("Error updating counter:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
