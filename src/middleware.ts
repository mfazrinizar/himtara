import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/banned"];
const authPaths = ["/dashboard", "/admin", "/gems/submit"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  // Allow gem detail pages (public)
  if (pathname.startsWith("/gems/")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("x-access-token")?.value;

  // Check if accessing protected routes
  if (authPaths.some((path) => pathname.startsWith(path))) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      // Token invalid, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("x-access-token");
      response.cookies.delete("x-refresh-token");
      return response;
    }

    // RBAC: Admin paths
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
