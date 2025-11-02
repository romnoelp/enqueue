import { NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Get users with pending role status
export const GET = async () => {
  try {
    // Verify authentication and role
    const authResult = await verifyAuthAndRole(["admin", "superAdmin"]);
    if (!authResult.success) {
      return authResult.response;
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
