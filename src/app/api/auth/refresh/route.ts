import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signAccessToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    // Verify refresh token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(refreshToken);

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

    // Create new refresh token
    const newRefreshToken = await adminAuth.createCustomToken(decodedToken.uid);

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        status: userData.status,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
