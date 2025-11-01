import { NextRequest } from "next/server";

// Authenticated user from Better Auth
export interface AuthUser {
  uid: string;
  email?: string;
  role?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
}

// Next.js request with user attached
export type AuthenticatedRequest = NextRequest & {
  user?: AuthUser;
};

// User roles
export type UserRole = "admin" | "cashier" | "information" | "pending" | "superAdmin";
export type EmployeeRole = Extract<UserRole, "admin" | "cashier" | "information">;
