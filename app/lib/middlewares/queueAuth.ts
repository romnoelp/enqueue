import { NextRequest, NextResponse } from "next/server";
import { firestoreDb } from "../backend/firebase-admin";
import { TokenType, QueueTokenPayload } from "../../../types";
import { verifyToken } from "../utils/jwt";

export type QueueTokenResult =
  | { success: true; token: string; decodedToken: QueueTokenPayload }
  | { success: false; response: NextResponse };

// Verify JWT token and check type for queue operations
export const verifyQueueToken = async (
  request: NextRequest,
  expectedTypes: TokenType[]
): Promise<QueueTokenResult> => {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Missing or invalid token" },
          { status: 401 }
        ),
      };
    }

    // Check if token is blacklisted
    const invalidTokenDoc = await firestoreDb
      .collection("invalid-token")
      .doc(token)
      .get();

    if (invalidTokenDoc.exists) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Token is already used or invalid" },
          { status: 401 }
        ),
      };
    }

    const decoded = await verifyToken(token);

    const allowedTypes: TokenType[] = [
      "permission",
      "queue-form",
      "queue-status",
    ];
    if (!decoded.type || !allowedTypes.includes(decoded.type)) {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Unknown or invalid token type" },
          { status: 403 }
        ),
      };
    }

    if (expectedTypes && !expectedTypes.includes(decoded.type)) {
      return {
        success: false,
        response: NextResponse.json(
          { message: `Token type '${decoded.type}' is not allowed` },
          { status: 403 }
        ),
      };
    }

    return { success: true, token, decodedToken: decoded as QueueTokenPayload };
  } catch (error) {
    const err = error as { name?: string; message?: string };

    if (err.name === "TokenExpiredError") {
      return {
        success: false,
        response: NextResponse.json(
          { message: "Token has expired" },
          { status: 401 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        { message: err.message || "Token verification failed" },
        { status: 500 }
      ),
    };
  }
};

// Check if token was already used
export const verifyTokenNotUsed = async (
  token: string
): Promise<NextResponse | null> => {
  try {
    const usedTokenRef = firestoreDb.collection("used-token").doc(token);
    const usedTokenDoc = await usedTokenRef.get();

    if (usedTokenDoc.exists) {
      return NextResponse.json(
        { message: "Token has already been used" },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
