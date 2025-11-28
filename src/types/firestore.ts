import { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "banned";
export type GemStatus = "pending" | "approved" | "rejected";

// Major islands of Indonesia
export type Island = 
  | "nusantara"  // All islands (default filter)
  | "sumatera" 
  | "jawa" 
  | "kalimantan" 
  | "sulawesi" 
  | "bali-nusa-tenggara" 
  | "papua-maluku";

export const ISLANDS: { value: Island; label: string; description: string }[] = [
  { value: "nusantara", label: "Nusantara", description: "Dari Sabang sampai Merauke" },
  { value: "sumatera", label: "Sumatera", description: "Pulau emas dengan hutan tropis dan budaya kuat" },
  { value: "jawa", label: "Jawa", description: "Pusat budaya, sejarah, dan dinamika Nusantara" },
  { value: "kalimantan", label: "Kalimantan", description: "Rimba luas dan sungai-sungai megah" },
  { value: "sulawesi", label: "Sulawesi", description: "Tanah eksotis dengan garis pantai berkelok" },
  { value: "bali-nusa-tenggara", label: "Bali & Nusa Tenggara", description: "Surga tropis dengan pantai dan pesona budaya" },
  { value: "papua-maluku", label: "Papua & Maluku", description: "Keelokan timur dengan alam perawan nan menawan" },
];

export const ISLAND_OPTIONS = ISLANDS.filter(i => i.value !== "nusantara");

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
  island: Island;
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
