import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGemAction,
  updateGemAction,
  deleteGemAction,
  createReviewAction,
  getGemsAction,
  getGemByIdAction,
  searchGemsAction,
  getGemReviewsAction,
  getGemStatsAction,
  adminApproveGemAction,
  adminRejectGemAction,
  type GemFilters,
  type PaginationParams,
} from "@/actions/gems";
import type { CreateGemInput, CreateReviewInput } from "@/schemas";

/**
 * Get paginated and filtered list of gems
 */
export function useGemList(
  filters: GemFilters = {},
  pagination: PaginationParams = {}
) {
  return useQuery({
    queryKey: ["gems", filters, pagination],
    queryFn: () => getGemsAction(filters, pagination),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single gem by ID
 */
export function useGemDetail(id: string) {
  return useQuery({
    queryKey: ["gem", id],
    queryFn: () => getGemByIdAction(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Search gems
 */
export function useSearchGems(searchQuery: string, limitCount?: number) {
  return useQuery({
    queryKey: ["gems-search", searchQuery, limitCount],
    queryFn: () => searchGemsAction(searchQuery, limitCount),
    enabled: searchQuery.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get gem statistics
 */
export function useGemStats() {
  return useQuery({
    queryKey: ["gem-stats"],
    queryFn: getGemStatsAction,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Get reviews for a gem
 */
export function useGemReviews(gemId: string, limitCount?: number) {
  return useQuery({
    queryKey: ["reviews", gemId, limitCount],
    queryFn: () => getGemReviewsAction(gemId, limitCount),
    enabled: !!gemId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a new gem
 */
export function useCreateGem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateGemInput & { submittedBy: string }) => createGemAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gems"] });
      queryClient.invalidateQueries({ queryKey: ["gem-stats"] });
    },
  });
}

/**
 * Update a gem
 */
export function useUpdateGem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGemInput> }) =>
      updateGemAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gem", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["gems"] });
    },
  });
}

/**
 * Delete a gem
 */
export function useDeleteGem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteGemAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gems"] });
      queryClient.invalidateQueries({ queryKey: ["gem-stats"] });
    },
  });
}

/**
 * Create a review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReviewInput) => createReviewAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.gemId] });
      queryClient.invalidateQueries({ queryKey: ["gem", variables.gemId] });
      queryClient.invalidateQueries({ queryKey: ["gems"] });
    },
  });
}

/**
 * Admin: Approve gem
 */
export function useApproveGem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, verifiedBy }: { id: string; verifiedBy: string }) =>
      adminApproveGemAction(id, verifiedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gem", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["gems"] });
      queryClient.invalidateQueries({ queryKey: ["gem-stats"] });
    },
  });
}

/**
 * Admin: Reject gem
 */
export function useRejectGem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminRejectGemAction(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gem", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["gems"] });
      queryClient.invalidateQueries({ queryKey: ["gem-stats"] });
    },
  });
}
