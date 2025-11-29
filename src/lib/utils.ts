import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"
import type { SerializedTimestamp } from "@/types/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a Firestore Timestamp or SerializedTimestamp to a JavaScript Date object
 * @param timestamp - Firestore Timestamp or SerializedTimestamp
 * @returns Date object
 */
export function toDate(timestamp: Timestamp | SerializedTimestamp): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  // Handle SerializedTimestamp
  return new Date(timestamp.seconds * 1000)
}

/**
 * Generate search keywords from text for Firestore array-contains-any search
 * Creates lowercase keywords including:
 * - Individual words (min 2 chars)
 * - Prefix substrings for partial matching
 * @param texts - Array of text strings to generate keywords from
 * @returns Array of unique lowercase keywords (max 50 to stay within Firestore limits)
 */
export function generateSearchKeywords(...texts: (string | undefined)[]): string[] {
  const keywords = new Set<string>();
  
  for (const text of texts) {
    if (!text) continue;
    
    // Split into words, remove special chars, lowercase
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2);
    
    for (const word of words) {
      // Add full word
      keywords.add(word);
      
      // Add prefixes for partial matching (min 2 chars)
      // e.g., "pantai" -> "pa", "pan", "pant", "panta", "pantai"
      for (let i = 2; i <= Math.min(word.length, 8); i++) {
        keywords.add(word.substring(0, i));
      }
    }
  }
  
  // Limit to 50 keywords to stay within reasonable bounds
  return Array.from(keywords).slice(0, 50);
}

/**
 * Generate search tokens from a query string for array-contains-any
 * @param query - Search query string
 * @returns Array of lowercase search tokens (max 30 for array-contains-any limit)
 */
export function generateSearchTokens(query: string): string[] {
  if (!query || query.trim().length < 2) return [];
  
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(token => token.length >= 2)
    .slice(0, 30); // array-contains-any supports up to 30
  
  return tokens;
}
