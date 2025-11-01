import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// POST - Assign role to user
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

  const currentUserUid = authResult.session.user.id;
  const currentUserName = authResult.session.user.name || currentUserUid;
  const requesterRole = authResult.user.role;

  try {
    const body = await req.json();
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json(
        { error: "Missing uid or role" },
        { status: 400 }
      );
    }

    // Define role permissions based on requester role
    const validRolesForAdmin = ["cashier", "information"];
    const validRolesForSuperAdmin = [
      "admin",
      "cashier",
      "information",
      "superAdmin",
    ];

    // Check if requester can assign this role
    if (
      (requesterRole === "admin" && !validRolesForAdmin.includes(role)) ||
      (requesterRole === "superAdmin" &&
        !validRolesForSuperAdmin.includes(role))
    ) {
      return NextResponse.json(
        { error: "Unauthorized to assign this role" },
        { status: 403 }
      );
    }

    // Check if user exists in Realtime DB
    const userRef = realtimeDb.ref(`users/${uid}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });
    }

    const existingData = snapshot.val();
    const existingRole = existingData.neuQueueAppRoles?.[0] || existingData.role;

    // Check if cashier is assigned to a counter before role change
    if (existingRole === "cashier" && role !== "cashier") {
      const countersRef = realtimeDb.ref("counters");
      const countersSnapshot = await countersRef.get();

      if (countersSnapshot.exists()) {
        const counters = countersSnapshot.val() as Record<
          string,
          { counterNumber: number; stationID: string; uid: string }
        >;

        const assignedCounters = await Promise.all(
          Object.entries(counters).map(async ([counterId, counterData]) => {
            if (counterData.uid === uid) {
              const stationRef = realtimeDb.ref(
                `stations/${counterData.stationID}`
              );
              const stationSnapshot = await stationRef.get();
              return {
                counterId,
                counterNumber: counterData.counterNumber,
                stationName: stationSnapshot.exists()
                  ? stationSnapshot.val().name
                  : "Unknown Station",
              };
            }
            return null;
          })
        );

        const activeAssignment = assignedCounters.find(
          (counter) => counter !== null
        );

        if (activeAssignment) {
          return NextResponse.json(
            {
              error: `This cashier is assigned to station '${activeAssignment.stationName}', counter: ${activeAssignment.counterNumber}. Remove them from the station before changing roles.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Update user role in Realtime DB (Better Auth compatible)
    await userRef.update({
      neuQueueAppRoles: [role],
      ...(role === "cashier" ? { station: existingData.station ?? null } : {}),
    });

    // Get target user details for logging
    const targetUserRef = realtimeDb.ref(`users/${uid}`);
    const targetUserSnapshot = await targetUserRef.get();
    const targetUserData = targetUserSnapshot.val();
    const targetUserEmail = targetUserData?.email || uid;

    // Log activity
    await recordLog(
      currentUserUid,
      ACTION_TYPES.ASSIGN_ROLE,
      `${currentUserName} changed role of ${targetUserEmail} to ${role}`
    );

    return NextResponse.json({ message: "Role assigned successfully" });
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
