import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb, adminAuth } from "@/app/lib/backend/firebase-admin";

// GET - Get specific user data by UID
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ uid: string }> }
) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
  const { params } = context;
  const { uid } = await params;

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // Get user data from Realtime DB
    const userRef = realtimeDb.ref(`users/${uid}`);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let userData = userSnapshot.val() as Record<string, any> | null;

    // If realtime DB lacks useful display info, try to enrich from Firebase Auth
    if (userData) {
      const hasNameOrEmail = Boolean(
        userData.name || userData.displayName || userData.email
      );

      if (!hasNameOrEmail) {
        try {
          const authUser = await adminAuth.getUser(uid);
          if (authUser) {
            userData = {
              ...userData,
              displayName: userData.displayName || authUser.displayName,
              email: userData.email || authUser.email,
            };
          }
        } catch (err) {
          // ignore lookup failures and return whatever is in realtime DB
        }
      }
    }

    return NextResponse.json({ userData });
  } catch (error) {
    console.error("Error getting user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
