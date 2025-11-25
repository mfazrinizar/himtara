import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "banned";
export type GemStatus = "pending" | "approved" | "rejected";

// Serialized timestamp for client components
export type SerializedTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp | SerializedTimestamp;
  lastLoginAt: Timestamp | SerializedTimestamp;
  updatedAt?: Timestamp | SerializedTimestamp;
  banReason?: string;
  bannedAt?: Timestamp | SerializedTimestamp;
}

export interface Gem {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  status: GemStatus;
  submittedBy: string;
  ratingAvg: number;
  reviewCount: number;
  createdAt: Timestamp | SerializedTimestamp;
  updatedAt?: Timestamp | SerializedTimestamp;
  verifiedBy?: string;
  verifiedAt?: Timestamp | SerializedTimestamp;
  rejectionReason?: string;
}

export interface Review {
  id: string;
  gemId: string;
  userId: string;
  userName?: string; 
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp | SerializedTimestamp;
  updatedAt?: Timestamp | SerializedTimestamp;
}

export interface AccessTokenPayload {
  uid: string;
  role: UserRole;
  email_verified: boolean;
}

export interface ServerActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
