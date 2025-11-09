import { NextResponse } from "next/server";
import { verifyAuthTokenAndDomain } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { neuQueueAppRoles } from "@/app/lib/utils/roles";

// Verify user account and assign role if needed
export const GET = async () => {
  try {
    // Verify authentication using Better Auth
    const authResult = await verifyAuthTokenAndDomain();
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;
    const userRole = user.role;

    // Return user if they have a valid role
    if (userRole && neuQueueAppRoles.includes(userRole.trim())) {
      return NextResponse.json({ user }, { status: 200 });
    }

    // Assign pending role if user doesn't have a valid role
    const userRef = realtimeDb.ref(`users/${user.uid}`);
    await userRef.set({
      role: "pending",
      email: user.email,
      name: user.name,
    });

    const updatedUser = { ...user, role: "pending" };

    return NextResponse.json(
      {
        message: "Your request is pending. Wait for admin approval.",
        user: updatedUser,
      },
      { status: 202 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
};
