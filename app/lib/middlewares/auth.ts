import { NextResponse } from "next/server";
import { auth } from "../authentication/auth";
import { AuthUser } from "../../../types";
import { adminAuth, realtimeDb } from "../backend/firebase-admin";
import { Session } from "next-auth";

export type AuthMiddlewareResult =
  | { success: true; user: AuthUser }
  | { success: false; response: NextResponse };

export type AuthRoleMiddlewareResult =
  | { success: true; user: AuthUser; session: Session }
  | { success: false; response: NextResponse };

// Verify session and @neu.edu.ph domain, fetch role from Realtime DB
export const verifyAuthTokenAndDomain = async (): Promise<AuthMiddlewareResult> => {
  try {
    // Auth.js getSession for API routes
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Invalid or missing session" },
          { status: 401 }
        ),
      };
    }

    const email = session.user.email;

    if (!email || !email.endsWith("@neu.edu.ph")) {
      return {
        success: false,
        response: NextResponse.json(
          {
            message: "Unauthorized email domain. Contact admin for more info.",
          },
          { status: 403 }
        ),
      };
    }

    try {
      const firebaseUser = await adminAuth.getUserByEmail(email);
      const userId = firebaseUser.uid;

      // Fetch user role from Realtime DB
      const userRef = realtimeDb.ref(`users/${userId}`);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.val();
      const userRole =
        (firebaseUser.customClaims?.role as string | undefined) ||
        userData?.neuQueueAppRoles?.[0] ||
        userData?.role;

      const user: AuthUser = {
        uid: userId,
        email: email,
        role: userRole,
        email_verified: true, // Auth.js verifies email during OAuth
        name: session.user.name ?? undefined,
        picture: session.user.image ?? undefined,
      };

      return { success: true, user };
    } catch (firebaseError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            message: `Unable to locate user record: ${(firebaseError as Error).message}`,
          },
          { status: 401 }
        ),
      };
    }
  } catch (error) {
    const err = error as { message?: string };
    return {
      success: false,
      response: NextResponse.json(
        { message: `Authentication failed: ${err.message}` },
        { status: 500 }
      ),
    };
  }
};

// Check if user has required role
export const verifyRole = (
  user: AuthUser,
  requiredRoles: string[]
): NextResponse | null => {
  if (!user.role || !requiredRoles.includes(user.role)) {
    return NextResponse.json(
      { message: "Unauthorized request" },
      { status: 401 }
    );
  }
  return null;
};

// Combined auth + role verification (returns session for additional user info)
export const verifyAuthAndRole = async (
  requiredRoles: string[]
): Promise<AuthRoleMiddlewareResult> => {
  try {
    // Auth.js getSession for API routes
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Invalid or missing session" },
          { status: 401 }
        ),
      };
    }

    const email = session.user.email;

    if (!email || !email.endsWith("@neu.edu.ph")) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Unauthorized email domain" },
          { status: 403 }
        ),
      };
    }

    try {
      const firebaseUser = await adminAuth.getUserByEmail(email);
      const userId = firebaseUser.uid;

      // Fetch user role from Realtime DB
      const userRef = realtimeDb.ref(`users/${userId}`);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.val();
      const userRole =
        (firebaseUser.customClaims?.role as string | undefined) ||
        userData?.neuQueueAppRoles?.[0] ||
        userData?.role;

      const user: AuthUser = {
        uid: userId,
        email: email,
        role: userRole,
        email_verified: true, // Auth.js verifies email during OAuth
        name: session.user.name ?? undefined,
        picture: session.user.image ?? undefined,
      };

      // Check role authorization
      if (!userRole || !requiredRoles.includes(userRole)) {
        return {
          success: false,
          response: NextResponse.json(
            { message: "Unauthorized request" },
            { status: 401 }
          ),
        };
      }

      return { success: true, user, session };
    } catch (firebaseError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            message: `Unable to locate user record: ${(firebaseError as Error).message}`,
          },
          { status: 401 }
        ),
      };
    }
  } catch (error) {
    const err = error as { message?: string };
    return {
      success: false,
      response: NextResponse.json(
        { message: `Authentication failed: ${err.message}` },
        { status: 500 }
      ),
    };
  }
};
