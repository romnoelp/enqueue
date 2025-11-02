import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";

// GET - Get available cashier employees (not assigned to counters)
export const GET = async (req: NextRequest) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Get all users from Realtime DB
    const usersRef = realtimeDb.ref("users");
    const userSnapshot = await usersRef.get();

    if (!userSnapshot.exists()) {
      return NextResponse.json({ availableCashiers: [] });
    }

    const usersData = userSnapshot.val() as Record<
      string,
      {
        email?: string;
        name?: string;
        displayName?: string;
        neuQueueAppRoles?: string[];
        role?: string;
        counterID?: string;
      }
    >;

    // Filter users who are cashiers and not assigned to a counter
    const availableCashiers = Object.entries(usersData)
      .filter(([, userData]) => {
        const role = userData.neuQueueAppRoles?.[0] || userData.role;
        return role === "cashier" && !userData.counterID;
      })
      .map(([uid, userData]) => ({
        uid,
        email: userData.email,
        name: userData.name || userData.displayName,
        role: userData.neuQueueAppRoles?.[0] || userData.role,
      }));

    return NextResponse.json({ availableCashiers });
  } catch (error) {
    console.error("Error getting available cashiers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
