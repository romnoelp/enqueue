import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { adminAuth, realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

type UserRole = "admin" | "cashier" | "information" | "superAdmin";

const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  admin: ["cashier", "information"],
  superAdmin: ["admin", "cashier", "information", "superAdmin"],
};

/**
 * Check if a cashier is currently assigned to any counter
 * Returns the active assignment details if found
 */
const checkCashierCounterAssignment = async (uid: string) => {
  const countersRef = realtimeDb.ref("counters");
  const countersSnapshot = await countersRef.get();

  if (!countersSnapshot.exists()) {
    return null;
  }

  const counters = countersSnapshot.val() as Record<
    string,
    { counterNumber: number; stationID: string; uid: string }
  >;

  const assignedCounters = await Promise.all(
    Object.entries(counters).map(async ([counterId, counterData]) => {
      if (counterData.uid !== uid) {
        return null;
      }

      const stationRef = realtimeDb.ref(`stations/${counterData.stationID}`);
      const stationSnapshot = await stationRef.get();
      return {
        counterId,
        counterNumber: counterData.counterNumber,
        stationName: stationSnapshot.exists()
          ? stationSnapshot.val().name
          : "Unknown Station",
      };
    })
  );

  return assignedCounters.find((counter) => counter !== null) || null;
};

// POST - Assign role to user
export const POST = async (req: NextRequest) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole(["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  if (!authResult.session?.user) {
    return NextResponse.json(
      { error: "User session not found" },
      { status: 401 }
    );
  }

  const currentUserUid = authResult.session.user.id || (authResult.session.user as { sub?: string }).sub;
  if (!currentUserUid) {
    return NextResponse.json(
      { error: "User ID not found in session" },
      { status: 401 }
    );
  }
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

    // Check if requester can assign this role
    const validRoles = ROLE_PERMISSIONS[requesterRole as string];
    if (!validRoles?.includes(role as UserRole)) {
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
    const isDemotingCashier = existingRole === "cashier" && role !== "cashier";
    if (isDemotingCashier) {
      const activeAssignment = await checkCashierCounterAssignment(uid);
      if (activeAssignment) {
        return NextResponse.json(
          {
            error: `This cashier is assigned to station '${activeAssignment.stationName}', counter: ${activeAssignment.counterNumber}. Remove them from the station before changing roles.`,
          },
          { status: 400 }
        );
      }
    }

    // Update Firebase Auth custom claims (ensures role persists correctly)
    await adminAuth.setCustomUserClaims(uid, { role: role });
    
    // Revoke refresh tokens to force client to fetch updated claims
    await adminAuth.revokeRefreshTokens(uid);

    // Update user role in Realtime DB (Better Auth compatible)
    await userRef.set({
      role: role,
      neuQueueAppRoles: [role],
      ...(role === "cashier" ? { station: existingData.station ?? null } : {}),
    });

    // Log activity
    const targetUserEmail = existingData?.email || uid;
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
