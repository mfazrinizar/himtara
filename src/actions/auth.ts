"use server";

import { cookies } from "next/headers";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { ServerActionResult, User } from "@/types/firestore";
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
} from "@/schemas";

/**
 * Refresh access token using refresh token
 */
export async function refreshTokenAction(): Promise<ServerActionResult<{ user: Partial<User> | null }>> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("x-refresh-token")?.value;

    if (!refreshToken) {
      return {
        success: false,
        message: "No refresh token",
        data: { user: null },
      };
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
      return {
        success: false,
        message: "User not found",
        data: { user: null },
      };
    }

    if (userData.status === "banned") {
      return {
        success: false,
        message: "User banned",
        data: { user: null },
      };
    }

    // Create new access token
    const newAccessToken = await signAccessToken({
      uid: decodedToken.uid,
      role: userData.role as "user" | "admin",
      email_verified: decodedToken.email_verified || false,
    });

    // Set new access token cookie
    cookieStore.set("x-access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return {
      success: true,
      message: "Token refreshed",
      data: {
        user: {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
        },
      },
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      message: "Failed to refresh token",
      data: { user: null },
    };
  }
}

/**
 * Get current authenticated user from httpOnly cookies
 */
export async function getCurrentUserAction(): Promise<ServerActionResult<{ user: Partial<User> | null }>> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("x-access-token")?.value;

    if (!accessToken) {
      // Try to refresh if we have a refresh token
      const refreshResult = await refreshTokenAction();
      if (refreshResult.success && refreshResult.data?.user) {
        return refreshResult;
      }
      
      return {
        success: true,
        message: "No user logged in",
        data: { user: null },
      };
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      // Access token expired, try to refresh
      const refreshResult = await refreshTokenAction();
      if (refreshResult.success && refreshResult.data?.user) {
        return refreshResult;
      }
      
      return {
        success: true,
        message: "Invalid token",
        data: { user: null },
      };
    }

    // Get full user data from Firestore
    const userDoc = await getDoc(doc(db, "users", payload.uid));
    const userData = userDoc.data() as User | undefined;

    return {
      success: true,
      message: "User retrieved",
      data: {
        user: {
          uid: payload.uid,
          email: userData?.email || "",
          displayName: userData?.displayName || "",
          role: payload.role,
        },
      },
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      success: false,
      message: "Failed to get current user",
      data: { user: null },
    };
  }
}

export async function loginAction(
  data: LoginInput
): Promise<ServerActionResult<{ user: Partial<User> }>> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    if (!userCredential.user.emailVerified) {
      return {
        success: false,
        message: "Silakan verifikasi email Anda terlebih dahulu.",
      };
    }

    // Get user doc from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const userData = userDoc.data() as User;

    if (userData.status === "banned") {
      return {
        success: false,
        message: "Akun Anda telah diblokir.",
      };
    }

    // Update last login
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLoginAt: serverTimestamp(),
    });

    // Create tokens
    const accessToken = await signAccessToken({
      uid: userCredential.user.uid,
      role: userData.role,
      email_verified: true,
    });

    const refreshToken = await userCredential.user.getIdToken();

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("x-access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("x-refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return {
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Login error:", error);
    const err = error as { code?: string };
    if (err.code === "auth/invalid-credential") {
      return {
        success: false,
        message: "Email atau kata sandi salah.",
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

export async function registerAction(
  data: RegisterInput
): Promise<ServerActionResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Create user document
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: data.email,
      displayName: data.displayName,
      role: "user",
      status: "active",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return {
      success: true,
      message: "Registrasi berhasil. Silakan verifikasi email Anda.",
    };
  } catch (error: unknown) {
    console.error("Register error:", error);
    const err = error as { code?: string };
    if (err.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email sudah digunakan.",
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

export async function forgotPasswordAction(
  data: ForgotPasswordInput
): Promise<ServerActionResult> {
  try {
    await sendPasswordResetEmail(auth, data.email);
    return {
      success: true,
      message: "Silakan periksa email Anda untuk mengatur ulang kata sandi.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}

export async function logoutAction(): Promise<ServerActionResult> {
  try {
    await signOut(auth);
    const cookieStore = await cookies();
    cookieStore.delete("x-access-token");
    cookieStore.delete("x-refresh-token");

    return {
      success: true,
      message: "Logout berhasil",
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat logout.",
    };
  }
}
