import { NextRequest, NextResponse } from "next/server";
import { verifyQueueToken } from "@/app/lib/middlewares/queueAuth";
import { generateToken } from "@/app/lib/utils/jwt";
import { v4 as uuidv4 } from "uuid";

// Exchange permission token for queue-form token
export const GET = async (request: NextRequest) => {
  try {
    // Verify permission token
    const tokenResult = await verifyQueueToken(request, ["permission"]);
    if (!tokenResult.success) {
      return tokenResult.response;
    }

    // Generate queue-form token
    const newToken = generateToken(
      {
        id: uuidv4(),
        access: true,
        type: "queue-form",
      },
      "10m"
    );

    return NextResponse.json({ token: newToken }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
