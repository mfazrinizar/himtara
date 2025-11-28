import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signAccessToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get("x-refresh-token")?.value;
    let newRefreshToken: string | null = null;
    
    // Try to get new refresh token from request body (for token rotation)
    try {
      const body = await request.json();
      // If client provides a new Firebase ID token, use it for rotation
      if (body.newRefreshToken) {
        newRefreshToken = body.newRefreshToken;
      }
      // Fallback: use refreshToken from body if no cookie
      if (!refreshToken && body.refreshToken) {
        refreshToken = body.refreshToken;
      }
    } catch {
      // No body provided
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    // Verify current refresh token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(refreshToken);

    // If a new refresh token is provided, verify it too for rotation
    if (newRefreshToken) {
      const newDecodedToken = await adminAuth.verifyIdToken(newRefreshToken);
      // Ensure it's the same user
      if (newDecodedToken.uid !== decodedToken.uid) {
        return NextResponse.json(
          { error: "Token mismatch" },
          { status: 401 }
        );
      }
    }

    // Get user data
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.status === "banned") {
      return NextResponse.json({ error: "User banned" }, { status: 403 });
    }

    // Create new access token
    const newAccessToken = await signAccessToken({
      uid: decodedToken.uid,
      role: userData.role as "user" | "admin",
      email_verified: decodedToken.email_verified || false,
    });

    // Create response with new tokens
    const response = NextResponse.json({
      accessToken: newAccessToken,
      user: {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        status: userData.status,
      },
    });

    // Set new access token cookie
    response.cookies.set("x-access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Rotate refresh token if a new one was provided
    if (newRefreshToken) {
      response.cookies.set("x-refresh-token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
