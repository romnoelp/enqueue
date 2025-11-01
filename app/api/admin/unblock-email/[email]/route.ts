import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";

// DELETE - Remove email from blacklist
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { email: string } }
) => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole(req, ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  if (!authResult.session?.user) {
    return NextResponse.json(
      { error: "User session not found" },
      { status: 401 }
    );
  }

  const uid = authResult.session.user.id;
  const displayName = authResult.session.user.name || uid;

  try {
    const { email } = params;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Decode the email parameter (in case it contains special characters)
    const decodedEmail = decodeURIComponent(email);

    // Find email in blacklist
    const blacklistRef = realtimeDb.ref("blacklist");
    const blacklistedEmail = await blacklistRef
      .orderByChild("email")
      .equalTo(decodedEmail)
      .get();

    if (!blacklistedEmail.exists()) {
      return NextResponse.json(
        { error: "Email not found in blacklist" },
        { status: 404 }
      );
    }

    // Get the key and remove from blacklist
    const emailKey = Object.keys(blacklistedEmail.val())[0];
    await blacklistRef.child(emailKey).remove();

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.UNBLOCK_EMAIL,
      `${displayName} unblocks ${decodedEmail}`
    );

    return NextResponse.json({ message: "Email removed from blacklist." });
  } catch (error) {
    console.error("Error removing email from blacklist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
