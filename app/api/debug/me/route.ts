import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/authentication/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Debug endpoint to check current user and their role
export const GET = async (request: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user data from Realtime Database
    const userRef = realtimeDb.ref(`users/${session.user.id}`);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.val();

    return NextResponse.json({
      session: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
      },
      realtimeDbData: userData || null,
      hasRole: !!userData?.neuQueueAppRoles || !!userData?.role,
    });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
};
