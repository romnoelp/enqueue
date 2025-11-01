import { NextRequest, NextResponse } from "next/server";
import { auth } from "../authentication/auth";
import { AuthUser } from "../../../types";
import { realtimeDb } from "../backend/firebase-admin";

export type AuthMiddlewareResult =
  | { success: true; user: AuthUser }
  | { success: false; response: NextResponse };

export type AuthRoleMiddlewareResult =
  | { success: true; user: AuthUser; session: Awaited<ReturnType<typeof auth.api.getSession>> }
  | { success: false; response: NextResponse };

// Verify session and @neu.edu.ph domain, fetch role from Realtime DB
export const verifyAuthTokenAndDomain = async (
  request: NextRequest
): Promise<AuthMiddlewareResult> => {
  try {
    // Better Auth getSession expects headers object (not Headers class)
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
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

    // Fetch user role from Realtime DB
    const userRef = realtimeDb.ref(`users/${session.user.id}`);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.val();
    const userRole = userData?.neuQueueAppRoles?.[0] || userData?.role;

    const user: AuthUser = {
      uid: session.user.id,
      email: session.user.email,
      role: userRole,
      email_verified: session.user.emailVerified,
      name: session.user.name ?? undefined,
      picture: session.user.image ?? undefined,
    };

    return { success: true, user };
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
  request: NextRequest,
  requiredRoles: string[]
): Promise<AuthRoleMiddlewareResult> => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
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

    // Fetch user role from Realtime DB
    const userRef = realtimeDb.ref(`users/${session.user.id}`);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.val();
    const userRole = userData?.neuQueueAppRoles?.[0] || userData?.role;

    const user: AuthUser = {
      uid: session.user.id,
      email: session.user.email,
      role: userRole,
      email_verified: session.user.emailVerified,
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
