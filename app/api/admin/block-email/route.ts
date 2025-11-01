import { NextRequest, NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { realtimeDb } from "@/app/lib/backend/firebase-admin";
import { recordLog } from "@/app/lib/utils/recordLog";
import { ACTION_TYPES } from "@/types";
import { blockEmailSchema } from "@/app/lib/zod-schemas/blockEmail";
import { ZodError } from "zod";

// POST - Block customer email (add to blacklist)
export const POST = async (req: NextRequest) => {
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
    const body = await req.json();
    const parsedBody = blockEmailSchema.parse(body);
    const { email, reason } = parsedBody;

    // Check if email is already blacklisted
    const blacklistRef = realtimeDb.ref("blacklist");
    const snapshot = await blacklistRef
      .orderByChild("email")
      .equalTo(email)
      .get();

    if (snapshot.exists()) {
      return NextResponse.json(
        { error: "Email is already blacklisted." },
        { status: 400 }
      );
    }

    // Add email to blacklist
    const newBlacklistRef = blacklistRef.push();
    await newBlacklistRef.set({
      email,
      reason,
    });

    // Log activity
    await recordLog(
      uid,
      ACTION_TYPES.BLOCK_EMAIL,
      `${displayName} blocks ${email} for ${reason}`
    );

    return NextResponse.json({ message: "Email successfully blacklisted." });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { error: errorMessages },
        { status: 400 }
      );
    }
    console.error("Error blocking email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
