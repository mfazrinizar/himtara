import { z } from "zod";

const islandValues = [
  "sumatera",
  "jawa", 
  "kalimantan",
  "sulawesi",
  "bali-nusa-tenggara",
  "papua-maluku",
] as const;

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export const registerSchema = z.object({
  displayName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const createGemSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  island: z.enum(islandValues, {
    errorMap: () => ({ message: "Pilih pulau lokasi destinasi" }),
  }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  images: z.array(z.string()).min(1, "Minimal 1 gambar"),
});

export const createReviewSchema = z.object({
  gemId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Komentar minimal 10 karakter"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  subject: z.string().min(5, "Subjek minimal 5 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type CreateGemInput = z.infer<typeof createGemSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
