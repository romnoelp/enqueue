import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./app/lib/authentication/auth";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/auth", 
];

const apiRoutes = ["/api"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session, redirect to home page
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Verify email domain
    if (!session.user.email?.endsWith("@neu.edu.ph")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Allow access to protected routes
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
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
