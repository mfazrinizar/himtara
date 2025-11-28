"use server";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Query,
  DocumentData,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ServerActionResult, Gem, Review } from "@/types/firestore";
import type { CreateGemInput, CreateReviewInput } from "@/schemas";

// Helper function to convert Firestore Timestamp to plain object
function serializeTimestamp(
  timestamp: Timestamp | undefined
): { seconds: number; nanoseconds: number } | undefined {
  if (!timestamp) return undefined;
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  };
}

// Helper function to serialize a gem document
function serializeGem(gem: Gem): Gem {
  return {
    ...gem,
    createdAt: serializeTimestamp(gem.createdAt as Timestamp) || gem.createdAt,
    updatedAt: gem.updatedAt
      ? serializeTimestamp(gem.updatedAt as Timestamp) || gem.updatedAt
      : undefined,
    verifiedAt: gem.verifiedAt
      ? serializeTimestamp(gem.verifiedAt as Timestamp) || gem.verifiedAt
      : undefined,
  };
}

// Helper function to serialize a review document
function serializeReview(review: Review): Review {
  return {
    ...review,
    createdAt: serializeTimestamp(review.createdAt as Timestamp) || review.createdAt,
    updatedAt: review.updatedAt
      ? serializeTimestamp(review.updatedAt as Timestamp) || review.updatedAt
      : undefined,
  };
}

// Types for pagination and filtering
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface GemFilters {
  status?: "pending" | "approved" | "rejected";
  submittedBy?: string; // Filter by user UID
  searchQuery?: string;
  minRating?: number;
  island?: string; // Filter by island
  sortBy?: "createdAt" | "ratingAvg" | "reviewCount" | "name";
  sortOrder?: "asc" | "desc";
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
 * Get paginated and filtered list of gems
 */
export async function getGemsAction(
  filters: GemFilters = {},
  pagination: PaginationParams = {}
): Promise<ServerActionResult<PaginatedResponse<Gem>>> {
  try {
    const {
      status,
      submittedBy,
      searchQuery,
      minRating,
      island,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const { page = 1, pageSize = 10 } = pagination;

    // Build query
    let gemsQuery: Query<DocumentData> = collection(db, "gems");
    const constraints: QueryConstraint[] = [];

    // Apply submittedBy filter (for user's own gems)
    if (submittedBy) {
      constraints.push(where("submittedBy", "==", submittedBy));
    }

    // Apply status filter (default to approved only if not filtering by submittedBy)
    if (status) {
      constraints.push(where("status", "==", status));
    } else if (!submittedBy) {
      // Default to approved gems for public listing
      constraints.push(where("status", "==", "approved"));
    }

    // Apply rating filter
    if (minRating !== undefined && minRating > 0) {
      constraints.push(where("ratingAvg", ">=", minRating));
    }

    // Apply island filter
    if (island && island !== "nusantara") {
      constraints.push(where("island", "==", island));
    }

    // Apply sorting
    constraints.push(orderBy(sortBy, sortOrder));

    // For proper pagination, we need to fetch enough documents to reach the current page
    // Firestore doesn't support offset, so we fetch (page * pageSize + 1) and skip client-side
    const fetchLimit = page * pageSize + 1;
    constraints.push(limit(fetchLimit));

    gemsQuery = query(gemsQuery, ...constraints);

    const snapshot = await getDocs(gemsQuery);
    let allGems = snapshot.docs.map((doc) => {
      const data = doc.data();
      return serializeGem({
        id: doc.id,
        ...data,
      } as Gem);
    });

    // Client-side search filtering (Firestore doesn't support full-text search natively)
    if (searchQuery && searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      allGems = allGems.filter(
        (gem) =>
          gem.name?.toLowerCase().includes(searchLower) ||
          gem.description?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const hasMore = allGems.length > startIndex + pageSize;
    const gems = allGems.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      message: "Berhasil mengambil data destinasi.",
      data: {
        data: gems,
        pagination: {
          page,
          pageSize,
          totalCount: gems.length,
          hasMore,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching gems:", error);
    return {
      success: false,
      message: "Gagal mengambil data destinasi.",
    };
  }
}

/**
 * Get a single gem by ID
 */
export async function getGemByIdAction(
  id: string
): Promise<ServerActionResult<Gem>> {
  try {
    const gemDoc = await getDoc(doc(db, "gems", id));

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    const gem = serializeGem({
      id: gemDoc.id,
      ...gemDoc.data(),
    } as Gem);

    return {
      success: true,
      message: "Berhasil mengambil data destinasi.",
      data: gem,
    };
  } catch (error) {
    console.error("Error fetching gem:", error);
    return {
      success: false,
      message: "Gagal mengambil data destinasi.",
    };
  }
}

/**
 * Search gems by name or description
 */
export async function searchGemsAction(
  searchQuery: string,
  limit: number = 10
): Promise<ServerActionResult<Gem[]>> {
  try {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return {
        success: false,
        message: "Query pencarian minimal 2 karakter.",
      };
    }

    // Get all approved gems (Firestore limitation - no full-text search)
    const gemsQuery = query(
      collection(db, "gems"),
      where("status", "==", "approved"),
      orderBy("ratingAvg", "desc")
    );

    const snapshot = await getDocs(gemsQuery);
    const searchLower = searchQuery.toLowerCase();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return serializeGem({
          id: doc.id,
          ...data,
        } as Gem);
      })
      .filter(
        (gem) =>
          gem.name?.toLowerCase().includes(searchLower) ||
          gem.description?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);

    return {
      success: true,
      message: "Berhasil mencari destinasi.",
      data: results,
    };
  } catch (error) {
    console.error("Error searching gems:", error);
    return {
      success: false,
      message: "Gagal mencari destinasi.",
    };
  }
}

/**
 * Create a new gem
 */
export async function createGemAction(
  data: CreateGemInput & { submittedBy: string }
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const gemRef = doc(collection(db, "gems"));
    await setDoc(gemRef, {
      ...data,
      id: gemRef.id,
      status: "pending",
      ratingAvg: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Destinasi berhasil ditambahkan dan menunggu persetujuan.",
      data: { id: gemRef.id },
    };
  } catch (error) {
    console.error("Error creating gem:", error);
    return {
      success: false,
      message: "Gagal menambahkan destinasi.",
    };
  }
}

/**
 * Update an existing gem
 */
export async function updateGemAction(
  id: string,
  data: Partial<CreateGemInput>
): Promise<ServerActionResult> {
  try {
    const gemRef = doc(db, "gems", id);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    await updateDoc(gemRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Destinasi berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error updating gem:", error);
    return {
      success: false,
      message: "Gagal memperbarui destinasi.",
    };
  }
}

/**
 * Delete a gem
 */
export async function deleteGemAction(
  id: string
): Promise<ServerActionResult> {
  try {
    const gemRef = doc(db, "gems", id);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    await deleteDoc(gemRef);

    return {
      success: true,
      message: "Destinasi berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error deleting gem:", error);
    return {
      success: false,
      message: "Gagal menghapus destinasi.",
    };
  }
}

/**
 * Get reviews for a gem with pagination
 */
export async function getGemReviewsAction(
  gemId: string,
  limitCount: number = 10
): Promise<ServerActionResult<Review[]>> {
  try {
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("gemId", "==", gemId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(reviewsQuery);
    const reviews = await Promise.all(
      snapshot.docs.map(async (reviewDoc) => {
        const data = reviewDoc.data();
        const review = {
          id: reviewDoc.id,
          ...data,
        } as Review;

        // Fetch user details to get displayName
        if (review.userId) {
          try {
            const userDocRef = doc(db, "users", review.userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              review.userName = userData?.displayName || "Pengguna";
            }
          } catch (error) {
            console.error("Error fetching user for review:", error);
            review.userName = "Pengguna";
          }
        } else {
          review.userName = "Pengguna";
        }

        return serializeReview(review);
      })
    );

    return {
      success: true,
      message: "Berhasil mengambil ulasan.",
      data: reviews,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {
      success: false,
      message: "Gagal mengambil ulasan.",
    };
  }
}

/**
 * Create a review for a gem
 */
export async function createReviewAction(
  data: CreateReviewInput
): Promise<ServerActionResult> {
  try {
    // Validate gem exists
    const gemRef = doc(db, "gems", data.gemId);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    // Check if user already reviewed this gem
    const existingReviewQuery = query(
      collection(db, "reviews"),
      where("gemId", "==", data.gemId),
      where("userId", "==", data.userId)
    );
    const existingReviewSnapshot = await getDocs(existingReviewQuery);
    
    if (!existingReviewSnapshot.empty) {
      return {
        success: false,
        message: "Anda sudah memberi ulasan untuk destinasi ini.",
      };
    }

    // Add review
    await addDoc(collection(db, "reviews"), {
      ...data,
      createdAt: serverTimestamp(),
    });

    // Update gem rating (recalculate average)
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("gemId", "==", data.gemId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map((doc) => doc.data() as Review);

    const totalRating = reviews.reduce(
      (sum: number, review: Review) => sum + (review.rating || 0),
      0
    );
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await updateDoc(gemRef, {
      ratingAvg: avgRating,
      reviewCount: reviews.length,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Ulasan berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      message: "Gagal menambahkan ulasan.",
    };
  }
}

/**
 * Admin: Approve a gem
 */
export async function adminApproveGemAction(
  id: string,
  verifiedBy: string
): Promise<ServerActionResult> {
  try {
    const gemRef = doc(db, "gems", id);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    await updateDoc(gemRef, {
      status: "approved",
      verifiedBy,
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Destinasi berhasil disetujui.",
    };
  } catch (error) {
    console.error("Error approving gem:", error);
    return {
      success: false,
      message: "Gagal menyetujui destinasi.",
    };
  }
}

/**
 * Admin: Reject a gem
 */
export async function adminRejectGemAction(
  id: string,
  reason?: string
): Promise<ServerActionResult> {
  try {
    const gemRef = doc(db, "gems", id);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    await updateDoc(gemRef, {
      status: "rejected",
      rejectionReason: reason || "Tidak memenuhi kriteria",
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Destinasi berhasil ditolak.",
    };
  } catch (error) {
    console.error("Error rejecting gem:", error);
    return {
      success: false,
      message: "Gagal menolak destinasi.",
    };
  }
}

/**
 * Admin: Update gem status (can change from rejected to approved or vice versa)
 */
export async function adminUpdateGemStatusAction(
  id: string,
  status: "approved" | "rejected",
  verifiedBy?: string,
  reason?: string
): Promise<ServerActionResult> {
  try {
    const gemRef = doc(db, "gems", id);
    const gemDoc = await getDoc(gemRef);

    if (!gemDoc.exists()) {
      return {
        success: false,
        message: "Destinasi tidak ditemukan.",
      };
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "approved") {
      updateData.verifiedBy = verifiedBy;
      updateData.verifiedAt = serverTimestamp();
      // Clear rejection reason when approving
      updateData.rejectionReason = null;
    } else if (status === "rejected") {
      updateData.rejectionReason = reason || "Tidak memenuhi kriteria";
    }

    await updateDoc(gemRef, updateData);

    const statusText = status === "approved" ? "disetujui" : "ditolak";
    return {
      success: true,
      message: `Destinasi berhasil ${statusText}.`,
    };
  } catch (error) {
    console.error("Error updating gem status:", error);
    return {
      success: false,
      message: "Gagal mengubah status destinasi.",
    };
  }
}

/**
 * Get gem statistics for dashboard (uses Admin SDK to bypass rules)
 */
export async function getGemStatsAction(): Promise<
  ServerActionResult<{
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    avgRating: number;
  }>
> {
  try {
    const { adminDb } = await import("@/lib/firebase/admin");
    const gemsSnapshot = await adminDb.collection("gems").get();
    const gems = gemsSnapshot.docs.map((doc) => doc.data() as Gem);

    const approvedGems = gems.filter((g) => g.status === "approved");
    const gemsWithRating = approvedGems.filter((g) => g.ratingAvg > 0);
    const avgRating = gemsWithRating.length > 0
      ? gemsWithRating.reduce((sum, g) => sum + g.ratingAvg, 0) / gemsWithRating.length
      : 0;

    const stats = {
      total: gems.length,
      approved: approvedGems.length,
      pending: gems.filter((g) => g.status === "pending").length,
      rejected: gems.filter((g) => g.status === "rejected").length,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    };

    return {
      success: true,
      message: "Berhasil mengambil statistik.",
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching gem stats:", error);
    return {
      success: false,
      message: "Gagal mengambil statistik.",
    };
  }
}
