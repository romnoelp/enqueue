import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
];

const publicPathPrefixes = [
  "/api/auth", 
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[PROXY] Checking path:", pathname);

  // Allow exact public routes
  if (publicRoutes.includes(pathname)) {
    console.log("[PROXY] ✅ Allowed (public route):", pathname);
    return NextResponse.next();
  }

  // Allow routes that start with public path prefixes (e.g., /api/auth/*)
  if (publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    console.log("[PROXY] ✅ Allowed (auth route):", pathname);
    return NextResponse.next();
  }

  // Allow other API routes (they handle their own auth)
  if (pathname.startsWith("/api")) {
    console.log("[PROXY]: Allowed (API route):", pathname);
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    console.log("[PROXY]:Allowed (static file):", pathname);
    return NextResponse.next();
  }

  // Check authentication for protected routes
  console.log("[PROXY]: Checking authentication for:", pathname);
  
  try {
    const session = await auth();

    console.log("[PROXY] Session result:", session ? "Found" : "Not found");

    // If no session, redirect to home page
    if (!session || !session.user) {
      console.log("[PROXY] ❌ No session - redirecting to /");
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    console.log("[PROXY] User email:", session.user.email);

    // Verify email domain
    if (!session.user.email?.endsWith("@neu.edu.ph")) {
      console.log("[PROXY] ❌ Invalid email domain - redirecting to /");
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    console.log("[PROXY] ✅ Authentication successful - allowing access");
    // Allow access to protected routes
    return NextResponse.next();
  } catch (error) {
    console.error("[PROXY] ❌ Auth error:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
