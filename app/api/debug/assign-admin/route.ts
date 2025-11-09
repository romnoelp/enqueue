import { NextResponse } from "next/server";
import { auth } from "@/app/lib/authentication/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// Assign admin role to current user
export const POST = async () => {
  try {
    // Use the project's auth helper which returns the session when called
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Type users when accessing extra properties that may exist on the session user
    const user = session.user as unknown as { id?: string; email?: string; name?: string; emailVerified?: boolean };

    // Check if email is @neu.edu.ph
    if (!user.email || !user.email.endsWith("@neu.edu.ph")) {
      return NextResponse.json(
        { message: "Only @neu.edu.ph emails can be assigned roles" },
        { status: 403 }
      );
    }

    // Assign admin role in Realtime Database
  const uid = user.id ?? (user as { sub?: string }).sub ?? null;
    if (!uid) {
      return NextResponse.json({ message: "User ID not available" }, { status: 400 });
    }

    const userRef = realtimeDb.ref(`users/${uid}`);
    await userRef.set({
      email: user.email,
      name: user.name || "",
      emailVerified: user.emailVerified || false,
      neuQueueAppRoles: ["admin"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: "Admin role assigned successfully",
      userId: uid,
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
