import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersAction,
  getUserByIdAction,
  updateUserRoleAction,
  updateUserStatusAction,
  getUserStatsAction,
  searchUsersAction,
  type UserFilters,
  type PaginationParams,
} from "@/actions/users";
import type { UserRole, UserStatus } from "@/types/firestore";

/**
 * Get paginated and filtered list of users
 */
export function useUserList(
  filters: UserFilters = {},
  pagination: PaginationParams = {}
) {
  return useQuery({
    queryKey: ["users", filters, pagination],
    queryFn: () => getUsersAction(filters, pagination),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single user by ID
 */
export function useUserDetail(uid: string) {
  return useQuery({
    queryKey: ["user", uid],
    queryFn: () => getUserByIdAction(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Search users
 */
export function useSearchUsers(searchQuery: string, limitCount?: number) {
  return useQuery({
    queryKey: ["users-search", searchQuery, limitCount],
    queryFn: () => searchUsersAction(searchQuery, limitCount),
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get user statistics
 */
export function useUserStats() {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStatsAction,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: UserRole }) =>
      updateUserRoleAction(uid, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.uid] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });
}

/**
 * Ban/unban user
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      status,
      reason,
    }: {
      uid: string;
      status: UserStatus;
      reason?: string;
    }) => updateUserStatusAction(uid, status, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.uid] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
  });
}
