import { NextResponse } from "next/server";
import { auth } from "@/app/lib/authentication/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Debug endpoint to check current user and their role
export const GET = async () => {
  try {
    // Use the project's auth helper to get the session
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = session.user as unknown as {
      id?: string;
      sub?: string;
      email?: string;
      name?: string;
      emailVerified?: boolean;
    };

    const uid = user.id ?? user.sub ?? null;
    if (!uid) {
      return NextResponse.json({ message: "User ID not available" }, { status: 400 });
    }

    // Get user data from Realtime Database
    const userRef = realtimeDb.ref(`users/${uid}`);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.val();

    return NextResponse.json({
      session: {
        id: uid,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      realtimeDbData: userData || null,
      hasRole: !!userData?.neuQueueAppRoles || !!userData?.role,
    });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
