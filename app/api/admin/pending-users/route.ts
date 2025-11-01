import { NextRequest, NextResponse } from "next/server";
import { verifyAuthTokenAndDomain, verifyRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Get users with pending role status
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

    // Get all users from Realtime Database
    const usersRef = realtimeDb.ref("users");
    const usersSnapshot = await usersRef
      .orderByChild("role")
      .equalTo("pending")
      .get();

    const pendingUsers: Array<{
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
        const userData = childSnapshot.val() as {
          email?: string;
          name?: string;
          role?: string;
          createdAt?: number;
        };

        // Skip if invalid uid or self
        if (!uid) return;
        if (uid === authResult.user.uid) return;

        pendingUsers.push({
          uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          createdAt: userData.createdAt,
        });
      }
    );

    return NextResponse.json({ pendingUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
