import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { TokenType } from "../../../types";

export interface JWTPayload {
  id: string;
  type: TokenType;
  access?: boolean;
  [key: string]: unknown;
}

// Create signed JWT token with expiration
export const generateToken = (
  payload: JWTPayload,
  expiresIn: string = "10m"
): string => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return jwt.sign(payload, SECRET_KEY, { expiresIn } as jwt.SignOptions);
};

// Verify and decode JWT token
export const verifyToken = (token: string): JWTPayload => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return jwt.verify(token, SECRET_KEY) as JWTPayload;
};

// Generate QR code with embedded JWT token
export const generateQRCodeWithToken = async (
  tokenType: TokenType,
  expiresIn: string = "10m"
): Promise<{ token: string; url: string; qrCode: string }> => {
  const NEUQUEUE_ROOT_URL = process.env.NEXT_PUBLIC_NEUQUEUE_ROOT_URL || process.env.NEUQUEUE_ROOT_URL;
  if (!NEUQUEUE_ROOT_URL) {
    throw new Error("Missing NEUQUEUE_ROOT_URL in environment variables");
  }

  const payload: JWTPayload = {
    id: uuidv4(),
    type: tokenType,
  };

  const token = generateToken(payload, expiresIn);
  const url = `${NEUQUEUE_ROOT_URL}?token=${token}`;
  const qrCode = await QRCode.toString(url, { type: "svg" });

  return { token, url, qrCode };
};
