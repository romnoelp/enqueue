import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb, adminAuth } from "@/app/lib/backend/firebase-admin";

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
    const candidateEntries = Object.entries(usersData).filter(([, userData]) => {
      const role = userData.neuQueueAppRoles?.[0] || userData.role;
      return role === "cashier" && !userData.counterID;
    });

    // Enrich entries with readable names. If Realtime DB lacks a name/email,
    // attempt to fetch the Firebase Auth user record for displayName/email.
    const enriched = await Promise.all(
      candidateEntries.map(async ([uid, userData]) => {
        let email = userData.email;
        let rawName = userData.name || userData.displayName || email;

        if (!rawName) {
          try {
            const authUser = await adminAuth.getUser(uid);
            if (authUser) {
              rawName = authUser.displayName || authUser.email || undefined;
              email = email || authUser.email;
            }
          } catch {
            // ignore individual lookup failures and fall back to uid
          }
        }

        const name = rawName
          ? String(rawName).includes("@")
            ? String(rawName).split("@")[0]
            : String(rawName)
          : uid;

        return {
          uid,
          email,
          name,
          role: userData.neuQueueAppRoles?.[0] || userData.role,
        };
      })
    );

    const availableCashiers = enriched.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return NextResponse.json({ availableCashiers });
  } catch (error) {
    console.error("Error getting available cashiers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
