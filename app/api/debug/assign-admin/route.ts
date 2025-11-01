import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/authentication/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Assign admin role to current user
export const POST = async (request: NextRequest) => {
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

    // Check if email is @neu.edu.ph
    if (!session.user.email?.endsWith("@neu.edu.ph")) {
      return NextResponse.json(
        { message: "Only @neu.edu.ph emails can be assigned roles" },
        { status: 403 }
      );
    }

    // Assign admin role in Realtime Database
    const userRef = realtimeDb.ref(`users/${session.user.id}`);
    await userRef.set({
      email: session.user.email,
      name: session.user.name || "",
      emailVerified: session.user.emailVerified || false,
      neuQueueAppRoles: ["admin"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin role assigned successfully",
      userId: session.user.id,
      role: "admin",
    });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
};
