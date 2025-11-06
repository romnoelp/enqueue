import { NextResponse } from "next/server";
import { verifyAuthAndRole } from "@/app/lib/middlewares/auth";
import { adminAuth } from "@/app/lib/backend/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

const listAllUsers = async () => {
  const users: UserRecord[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await adminAuth.listUsers(1000, nextPageToken);
    users.push(...result.users);
    nextPageToken = result.pageToken ?? undefined;
  } while (nextPageToken);

  return users;
};

// Get users with pending role status
export const GET = async () => {
  try {
    const authResult = await verifyAuthAndRole(["admin", "superAdmin"]);
    if (!authResult.success) {
      return authResult.response;
    }

    const users = await listAllUsers();

    const pendingUsers = users
      .filter((user) => user.customClaims?.role === "pending")
      .filter((user) => user.uid !== authResult.user.uid)
      .map((user) => ({
        uid: user.uid,
        email: user.email ?? undefined,
        name: user.displayName ?? undefined,
        role: user.customClaims?.role ?? undefined,
        createdAt: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).getTime()
          : undefined,
      }));

    return NextResponse.json({ pendingUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
