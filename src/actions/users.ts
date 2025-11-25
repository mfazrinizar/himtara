"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ServerActionResult, User, UserRole, UserStatus } from "@/types/firestore";

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
 * Get paginated and filtered list of users
 */
export async function getUsersAction(
  filters: UserFilters = {},
  pagination: PaginationParams = {}
): Promise<ServerActionResult<PaginatedResponse<User>>> {
  try {
    const {
      role,
      status,
      searchQuery,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const { page = 1, pageSize = 20 } = pagination;

    // Fetch all users (simplified to avoid Firestore composite index requirements)
    const snapshot = await getDocs(collection(db, "users"));
    let users = snapshot.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id,
    })) as User[];

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
        data: paginatedUsers,
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
 * Get a single user by ID
 */
export async function getUserByIdAction(
  uid: string
): Promise<ServerActionResult<User>> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    return {
      success: true,
      message: "Berhasil mengambil data pengguna.",
      data: {
        ...userDoc.data(),
        uid: userDoc.id,
      } as User,
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
 * Update user role
 */
export async function updateUserRoleAction(
  uid: string,
  role: UserRole
): Promise<ServerActionResult> {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
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
 * Ban/unban a user
 */
export async function updateUserStatusAction(
  uid: string,
  status: UserStatus,
  reason?: string
): Promise<ServerActionResult> {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "Pengguna tidak ditemukan.",
      };
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "banned" && reason) {
      updateData.banReason = reason;
      updateData.bannedAt = serverTimestamp();
    }

    await updateDoc(userRef, updateData);

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
 * Get user statistics
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
    const usersSnapshot = await getDocs(collection(db, "users"));
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
 * Search users by name or email
 */
export async function searchUsersAction(
  searchQuery: string,
  limitCount: number = 10
): Promise<ServerActionResult<User[]>> {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return {
        success: false,
        message: "Query pencarian minimal 2 karakter.",
      };
    }

    const usersQuery = query(
      collection(db, "users"),
      orderBy("displayName"),
      limit(50) // Get more to filter client-side
    );

    const snapshot = await getDocs(usersQuery);
    const searchLower = searchQuery.toLowerCase();

    const results = snapshot.docs
      .map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }) as User)
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
