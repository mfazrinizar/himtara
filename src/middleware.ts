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

  // Allow gem detail pages (public) but not /gems/submit
  if (pathname.startsWith("/gems/") && !pathname.startsWith("/gems/submit")) {
    return NextResponse.next();
  }
  
  // Allow /gems list page (public)
  if (pathname === "/gems") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("x-access-token")?.value;
  const refreshToken = request.cookies.get("x-refresh-token")?.value;

  // Check if accessing protected routes
  if (authPaths.some((path) => pathname.startsWith(path))) {
    let payload = accessToken ? await verifyAccessToken(accessToken) : null;
    
    // If access token is invalid/expired, try to refresh
    if (!payload && refreshToken) {
      try {
        // Call refresh endpoint
        const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cookie": `x-refresh-token=${refreshToken}`,
          },
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          
          // Verify the new access token
          payload = await verifyAccessToken(data.accessToken);
          
          if (payload) {
            // Create response and set new cookies
            const response = NextResponse.next();
            response.cookies.set("x-access-token", data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 15 * 60, // 15 minutes
              path: "/",
            });
            
            if (data.refreshToken) {
              response.cookies.set("x-refresh-token", data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60, // 7 days
                path: "/",
              });
            }
            
            // RBAC: Admin paths
            if (pathname.startsWith("/admin") && payload.role !== "admin") {
              return NextResponse.json(
                { error: "Forbidden: Admin access required" },
                { status: 403 }
              );
            }
            
            return response;
          }
        }
      } catch (error) {
        console.error("Token refresh error in middleware:", error);
      }
    }
    
    if (!payload) {
      // Both tokens invalid, redirect to login
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
