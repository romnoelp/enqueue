import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";

// Verify customer token is valid
export const GET = async (request: NextRequest) => {
  try {
    // Verify token
    const tokenResult = await verifyQueueToken(request, [
      "permission",
      "queue-form",
      "queue-status",
    ]);

    if (!tokenResult.success) {
      return tokenResult.response;
    }

    return NextResponse.json(
      { message: "The token is valid" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
