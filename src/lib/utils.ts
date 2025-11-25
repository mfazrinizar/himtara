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
