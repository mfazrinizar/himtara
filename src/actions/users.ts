"use server";

import type { ServerActionResult, User, UserRole, UserStatus } from "@/types/firestore";
import { validateAdmin, validateAuth } from "@/lib/auth/validate";

// Helper function to serialize Firestore Admin SDK Timestamp to plain object
function serializeTimestamp(
  timestamp: { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number } | undefined | null
): { seconds: number; nanoseconds: number } | undefined {
  if (!timestamp) return undefined;
  // Handle Admin SDK format (_seconds) or regular format (seconds)
  const seconds = '_seconds' in timestamp ? timestamp._seconds : timestamp.seconds;
  const nanoseconds = '_nanoseconds' in timestamp ? timestamp._nanoseconds : timestamp.nanoseconds;
  return { seconds, nanoseconds };
}

// Helper function to serialize a user document for client components
function serializeUser(user: User): User {
  return {
    ...user,
    createdAt: serializeTimestamp(user.createdAt as unknown as { _seconds: number; _nanoseconds: number } | undefined),
    lastLoginAt: serializeTimestamp(user.lastLoginAt as unknown as { _seconds: number; _nanoseconds: number } | undefined),
    updatedAt: serializeTimestamp(user.updatedAt as unknown as { _seconds: number; _nanoseconds: number } | undefined),
    bannedAt: serializeTimestamp(user.bannedAt as unknown as { _seconds: number; _nanoseconds: number } | undefined),
  } as User;
}

// Types for user management
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  searchQuery?: string;
  sortBy?: "createdAt" | "lastLoginAt" | "displayName";
  sortOrder?: "asc" | "desc";
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };
}

/**
 * Get paginated and filtered list of users (Admin only)
 */
export async function getUsersAction(
  filters: UserFilters = {},
  pagination: PaginationParams = {}
): Promise<ServerActionResult<PaginatedResponse<User>>> {
  try {
    // Validate admin access
    const validation = await validateAdmin();
    if (!validation.success) {
      console.error("getUsersAction validation failed:", validation.error);
      return { success: false, message: validation.error! };
    }

    const { adminDb } = await import("@/lib/firebase/admin");

    const {
      role,
      status,
      searchQuery,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const { page = 1, pageSize = 20 } = pagination;

    // Fetch all users using Admin SDK
    const snapshot = await adminDb.collection("users").get();
    let users = snapshot.docs.map((doc) => serializeUser({
      ...doc.data(),
      uid: doc.id,
    } as User));

    // Client-side filtering
    if (role) {
      users = users.filter((user) => user.role === role);
    }

    if (status) {
      users = users.filter((user) => user.status === status);
    }

    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Client-side sorting
    users.sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const totalCount = users.length;

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = users.slice(startIndex, endIndex);
    const hasMore = endIndex < totalCount;

    return {
      success: true,
      message: "Berhasil mengambil data pengguna.",
      data: {
        data: paginatedUsers.map(serializeUser),
        pagination: {
          page,
          pageSize,
          totalCount,
          hasMore,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Gagal mengambil data pengguna.",
    };
  }
}

/**
 * Get a single user by ID (Admin or self)
 */
export async function getUserByIdAction(
  uid: string
): Promise<ServerActionResult<User>> {
  try {
    // Validate authentication
    const validation = await validateAuth();
    if (!validation.success) {
      return { success: false, message: validation.error! };
    }

    // Only allow admin or self to view user data
    const isAdmin = validation.user?.role === "admin";
    const isSelf = validation.user?.uid === uid;
    
    if (!isAdmin && !isSelf) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk melihat data pengguna ini.",
      };
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil data pengguna.",
      data: serializeUser({
        ...userDoc.data(),
        uid: userDoc.id,
      } as User),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "Gagal mengambil data pengguna.",
    };
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRoleAction(
  uid: string,
  role: UserRole
): Promise<ServerActionResult> {
  try {
    // Validate admin access
    const validation = await validateAdmin();
    if (!validation.success) {
      return { success: false, message: validation.error! };
    }

    // Prevent admin from changing their own role
    if (validation.user?.uid === uid) {
      return {
        success: false,
        message: "Anda tidak dapat mengubah role sendiri.",
      };
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    await userRef.update({
      role,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Role pengguna berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      message: "Gagal memperbarui role pengguna.",
    };
  }
}

/**
 * Ban/unban a user (Admin only)
 */
export async function updateUserStatusAction(
  uid: string,
  status: UserStatus,
  reason?: string
): Promise<ServerActionResult> {
  try {
    // Validate admin access
    const validation = await validateAdmin();
    if (!validation.success) {
      return { success: false, message: validation.error! };
    }

    // Prevent admin from banning themselves
    if (validation.user?.uid === uid) {
      return {
        success: false,
        message: "Anda tidak dapat mengubah status akun sendiri.",
      };
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === "banned" && reason) {
      updateData.banReason = reason;
      updateData.bannedAt = FieldValue.serverTimestamp();
    }

    await userRef.update(updateData);

    return {
      success: true,
      message:
        status === "banned"
          ? "Pengguna berhasil diblokir."
          : "Pengguna berhasil diaktifkan kembali.",
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      message: "Gagal memperbarui status pengguna.",
    };
  }
}

/**
 * Get user statistics (Admin only)
 */
export async function getUserStatsAction(): Promise<
  ServerActionResult<{
    total: number;
    admins: number;
    users: number;
    active: number;
    banned: number;
  }>
> {
  try {
    // Validate admin access
    const validation = await validateAdmin();
    if (!validation.success) {
      return { success: false, message: validation.error! };
    }

    const { adminDb } = await import("@/lib/firebase/admin");
    const usersSnapshot = await adminDb.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => doc.data() as User);

    const stats = {
      total: users.length,
      admins: users.filter((u) => u.role === "admin").length,
      users: users.filter((u) => u.role === "user").length,
      active: users.filter((u) => u.status === "active").length,
      banned: users.filter((u) => u.status === "banned").length,
    };

    return {
      success: true,
      message: "Berhasil mengambil statistik pengguna.",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      message: "Gagal mengambil statistik pengguna.",
    };
  }
}

/**
 * Search users by name or email (Admin only)
 */
export async function searchUsersAction(
  searchQuery: string,
  limitCount: number = 10
): Promise<ServerActionResult<User[]>> {
  try {
    // Validate admin access
    const validation = await validateAdmin();
    if (!validation.success) {
      return { success: false, message: validation.error! };
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return {
        success: false,
        message: "Query pencarian minimal 2 karakter.",
      };
    }

    const { adminDb } = await import("@/lib/firebase/admin");

    // Fetch users and filter client-side
    const snapshot = await adminDb
      .collection("users")
      .orderBy("displayName")
      .limit(50)
      .get();

    const searchLower = searchQuery.toLowerCase();

    const results = snapshot.docs
      .map((doc) => serializeUser({
        ...doc.data(),
        uid: doc.id,
      } as User))
      .filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      )
      .slice(0, limitCount);

    return {
      success: true,
      message: "Berhasil mencari pengguna.",
      data: results,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message: "Gagal mencari pengguna.",
    };
  }
}
