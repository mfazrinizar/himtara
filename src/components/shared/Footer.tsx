"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Github, Twitter, Linkedin } from "lucide-react"; // Example social icons

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground border-t border-border py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground">Himtara</span>
          </Link>
          <p className="text-muted-foreground text-sm">
            Jelajahi destinasi wisata tersembunyi di seluruh Nusantara.
          </p>
          <div className="flex space-x-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2">
          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">Navigasi</h3>
            <nav className="space-y-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Beranda
              </Link>
              <Link href="/gems" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Destinasi
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Tentang Kami
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Kontak
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-foreground text-lg font-semibold mb-4">Legal</h3>
            <nav className="space-y-2">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors block text-sm">
                Syarat & Ketentuan
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center text-muted-foreground text-sm">
        &copy; {currentYear} Himtara. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
