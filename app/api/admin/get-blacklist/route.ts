import { NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { Blacklist } from "@/types";

// GET - Get all blacklisted emails
export const GET = async () => {
  // Verify authentication and admin/superAdmin role
  const authResult = await verifyAuthAndRole( ["admin", "superAdmin"]);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const blacklistRef = realtimeDb.ref("blacklist");
    const snapshot = await blacklistRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({
        message: "No blacklisted emails found.",
        blacklist: [],
      });
    }

    const blacklistedEmails: Blacklist[] = Object.values(snapshot.val());

    return NextResponse.json({ blacklist: blacklistedEmails });
  } catch (error) {
    console.error("Error getting blacklist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
