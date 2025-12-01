import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

/**
 * Cache tags for different data types
 */
export const CACHE_TAGS = {
  // Gems
  GEMS_LIST: "gems-list",
  GEMS_APPROVED: "gems-approved",
  GEMS_SEARCH: "gems-search",
  GEM_DETAIL: (id: string) => `gem-${id}`,
  
  // Reviews
  REVIEWS: "reviews",
  GEM_REVIEWS: (gemId: string) => `reviews-${gemId}`,
  
  // Stats
  GEM_STATS: "gem-stats",
  USER_STATS: "user-stats",
} as const;

/**
 * Cache durations in seconds
 */
export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

/**
 * Revalidate all gem-related caches
 * Call this when gems are created, updated, or deleted
 */
export function revalidateGemsCache() {
  revalidateTag(CACHE_TAGS.GEMS_LIST, "max");
  revalidateTag(CACHE_TAGS.GEMS_APPROVED, "max");
  revalidateTag(CACHE_TAGS.GEMS_SEARCH, "max");
  revalidateTag(CACHE_TAGS.GEM_STATS, "max");
}

/**
 * Revalidate a specific gem's cache
 */
export function revalidateGemCache(gemId: string) {
  revalidateTag(CACHE_TAGS.GEM_DETAIL(gemId), "max");
  revalidateGemsCache();
}

/**
 * Revalidate reviews cache for a gem
 */
export function revalidateReviewsCache(gemId: string) {
  revalidateTag(CACHE_TAGS.REVIEWS, "max");
  revalidateTag(CACHE_TAGS.GEM_REVIEWS(gemId), "max");
  revalidateTag(CACHE_TAGS.GEM_DETAIL(gemId), "max");
}

/**
 * Create a cached function with tags
 * Wrapper around unstable_cache for consistent usage
 */
export function createCachedFunction<T extends (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>>(
  fn: T,
  keyParts: string[],
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  return unstable_cache(fn, keyParts, {
    tags: options.tags,
    revalidate: options.revalidate ?? CACHE_DURATION.MEDIUM,
  });
}
