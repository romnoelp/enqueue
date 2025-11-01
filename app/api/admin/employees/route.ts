import { NextRequest, NextResponse } from "next/server";
import { verifyAuthTokenAndDomain, verifyRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Get employee users (cashier, information, admin)
export const GET = async (request: NextRequest) => {
  try {
    // Verify authentication
    const authResult = await verifyAuthTokenAndDomain(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Verify role
    const roleError = verifyRole(authResult.user, ["admin", "superAdmin"]);
    if (roleError) {
      return roleError;
    }

    // Determine allowed roles based on current user's role
    const allowedRolesToGet =
      authResult.user.role === "superAdmin"
        ? ["admin", "cashier", "information"]
        : ["cashier", "information"];

    // Get all users from Realtime Database
    const usersRef = realtimeDb.ref("users");
    const usersSnapshot = await usersRef.get();

    const employees: Array<{
      uid: string;
      email?: string;
      name?: string;
      role?: string;
      createdAt?: number;
    }> = [];

    usersSnapshot.forEach(
      (childSnapshot: {
        key: string | null;
        val: () => {
          email?: string;
          name?: string;
          role?: string;
          createdAt?: number;
        };
      }) => {
        const uid = childSnapshot.key;
        const userData = childSnapshot.val();

        // Skip if invalid uid, self, no role, or not allowed role
        if (!uid) return;
        if (uid === authResult.user.uid) return;
        if (!userData.role) return;
        if (!allowedRolesToGet.includes(userData.role)) return;

        employees.push({
          uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          createdAt: userData.createdAt,
        });
      }
    );

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
