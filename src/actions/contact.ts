"use server";

import type { ContactInput } from "@/schemas";

export async function sendContactAction(data: ContactInput) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Gagal mengirim pesan",
      };
    }

    return {
      success: true,
      message: "Pesan berhasil dikirim!",
    };
  } catch (error) {
    console.error("Contact action error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
    };
  }
}
