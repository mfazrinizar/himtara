import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";
import { adminDb } from "@/lib/firebase/admin";

export interface ValidatedUser {
  uid: string;
  email: string;
  role: "user" | "admin";
  email_verified: boolean;
}

export interface ValidationResult {
  success: boolean;
  user?: ValidatedUser;
  error?: string;
}

/**
 * Validate that a user is authenticated
 * Returns the verified user data from token
 */
export async function validateAuth(): Promise<ValidationResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("x-access-token")?.value;

    if (!accessToken) {
      return {
        success: false,
        error: "Anda harus login untuk melakukan aksi ini.",
      };
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
      return {
        success: false,
        error: "Sesi Anda telah berakhir. Silakan login kembali.",
      };
    }

    return {
      success: true,
      user: {
        uid: payload.uid,
        email: "", 
        role: payload.role,
        email_verified: payload.email_verified,
      },
    };
  } catch (error) {
    console.error("Auth validation error:", error);
    return {
      success: false,
      error: "Gagal memvalidasi autentikasi.",
    };
  }
}

/**
 * Validate that a user is authenticated and is an active user (not banned)
 * Use this for actions that require an active authenticated user
 */
export async function validateActiveUser(): Promise<ValidationResult> {
  const authResult = await validateAuth();
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  try {
    // Check if user exists and is not banned
    const userDoc = await adminDb
      .collection("users")
      .doc(authResult.user.uid)
      .get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "Akun tidak ditemukan.",
      };
    }

    const userData = userDoc.data();
    if (userData?.status === "banned") {
      return {
        success: false,
        error: "Akun Anda telah diblokir.",
      };
    }

    return {
      success: true,
      user: authResult.user,
    };
  } catch (error) {
    console.error("Active user validation error:", error);
    return {
      success: false,
      error: "Gagal memvalidasi status akun.",
    };
  }
}

/**
 * Validate that a user is authenticated and is an admin
 * Use this for admin-only actions
 */
export async function validateAdmin(): Promise<ValidationResult> {
  const authResult = await validateAuth();
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  // Check role from token
  if (authResult.user.role !== "admin") {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk melakukan aksi ini.",
    };
  }

  try {
    // Double-check with database (in case role was revoked)
    const userDoc = await adminDb
      .collection("users")
      .doc(authResult.user.uid)
      .get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "Akun tidak ditemukan.",
      };
    }

    const userData = userDoc.data();
    
    if (userData?.status === "banned") {
      return {
        success: false,
        error: "Akun Anda telah diblokir.",
      };
    }

    if (userData?.role !== "admin") {
      return {
        success: false,
        error: "Anda tidak memiliki izin admin.",
      };
    }

    return {
      success: true,
      user: {
        ...authResult.user,
        role: "admin",
      },
    };
  } catch (error) {
    console.error("Admin validation error:", error);
    return {
      success: false,
      error: "Gagal memvalidasi status admin.",
    };
  }
}

/**
 * Validate that the provided userId matches the authenticated user
 * Use this to prevent users from acting on behalf of others
 */
export async function validateUserOwnership(
  providedUserId: string
): Promise<ValidationResult> {
  const authResult = await validateActiveUser();
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  if (authResult.user.uid !== providedUserId) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk melakukan aksi ini.",
    };
  }

  return authResult;
}

/**
 * Validate that the user is either the owner or an admin
 * Use this for actions that can be done by owner or admin
 */
export async function validateOwnerOrAdmin(
  ownerId: string
): Promise<ValidationResult & { isAdmin: boolean }> {
  const authResult = await validateActiveUser();
  if (!authResult.success || !authResult.user) {
    return { ...authResult, isAdmin: false };
  }

  const isOwner = authResult.user.uid === ownerId;
  const isAdmin = authResult.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk melakukan aksi ini.",
      isAdmin: false,
    };
  }

  // If claiming to be admin, verify with database
  if (isAdmin && !isOwner) {
    const adminCheck = await validateAdmin();
    if (!adminCheck.success) {
      return { ...adminCheck, isAdmin: false };
    }
  }

  return {
    success: true,
    user: authResult.user,
    isAdmin,
  };
}
