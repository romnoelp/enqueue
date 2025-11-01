import { NextRequest, NextResponse } from "next/server";
import { verifyAuthTokenAndDomain } from "@/app/lib/middlewares/auth";
import { generateQRCodeWithToken } from "@/app/lib/utils/jwt";

// Generate QR code with permission token
export const GET = async (request: NextRequest) => {
  try {
    // Verify authentication
    const authResult = await verifyAuthTokenAndDomain(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Generate QR code with permission token
    const { qrCode, token } = await generateQRCodeWithToken("permission", "10m");

    return NextResponse.json(
      {
        qrCode,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
};
