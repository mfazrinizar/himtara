import type { Metadata } from "next";
import "./global.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Himtara - Hidden Gems Nusantara",
  description: "Jelajahi destinasi wisata tersembunyi di seluruh Nusantara.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
