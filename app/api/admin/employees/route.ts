import { NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { adminAuth, realtimeDb } from "@/app/lib/backend/firebase-admin";

// Get employee users (cashier, information, admin)
export const GET = async () => {
  try {
    // Verify authentication and role
    const authResult = await verifyAuthAndRole(["admin", "superAdmin"]);
    if (!authResult.success) {
      return authResult.response;
    }

    // Determine allowed roles based on current user's role
    const allowedRolesToGet =
      authResult.user.role === "superAdmin"
        ? ["admin", "cashier", "information"]
        : ["cashier", "information"];

    // Fetch any additional user metadata from Realtime DB (optional fallback)
    let realtimeUsers: Record<string, { role?: string; email?: string; name?: string; createdAt?: number; neuQueueAppRoles?: string[] }>
      = {};
    try {
      const usersSnapshot = await realtimeDb.ref("users").get();
      if (usersSnapshot.exists()) {
        realtimeUsers = usersSnapshot.val() as typeof realtimeUsers;
      }
    } catch (dbError) {
      console.error("[Admin Employees] Failed to read users from Realtime DB", dbError);
    }

    // Pull user list from Firebase Auth to match legacy behaviour
    const userList = await adminAuth.listUsers();

    const employees = userList.users
      .map((user) => {
        const realtimeUser = realtimeUsers[user.uid] ?? {};
        const role =
          (user.customClaims?.role as string | undefined) ??
          realtimeUser.neuQueueAppRoles?.[0] ??
          realtimeUser.role;

        if (!role) {
          return null;
        }

        if (user.uid === authResult.user.uid) {
          return null;
        }

        if (!allowedRolesToGet.includes(role)) {
          return null;
        }

        const createdAtString = user.metadata.creationTime;
        const createdAt = createdAtString ? new Date(createdAtString).getTime() : realtimeUser.createdAt;

        return {
          uid: user.uid,
          email: user.email ?? realtimeUser.email,
          name: user.displayName ?? realtimeUser.name,
          role,
          createdAt,
        };
      })
      .filter((employee): employee is NonNullable<typeof employee> => employee !== null);

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
