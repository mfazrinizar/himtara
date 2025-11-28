"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export function PrivacyPage() {
  const lastUpdated = "28 November 2025";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Kebijakan Privasi
                </h1>
                <p className="text-muted-foreground">
                  Terakhir diperbarui: {lastUpdated}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                1. Pendahuluan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Selamat datang di Himtara (Hidden Gems Nusantara). Kami
                menghargai privasi Anda dan berkomitmen untuk melindungi data
                pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami
                mengumpulkan, menggunakan, dan melindungi informasi Anda ketika
                Anda menggunakan platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan
                meningkatkan layanan kami:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Informasi Akun:</strong>{" "}
                  Nama, alamat email, dan kata sandi saat Anda mendaftar.
                </li>
                <li>
                  <strong className="text-foreground">Informasi Profil:</strong>{" "}
                  Foto profil dan informasi tambahan yang Anda pilih untuk
                  bagikan.
                </li>
                <li>
                  <strong className="text-foreground">Konten Pengguna:</strong>{" "}
                  Ulasan, foto, dan rekomendasi destinasi yang Anda kirimkan.
                </li>
                <li>
                  <strong className="text-foreground">Data Lokasi:</strong>{" "}
                  Informasi lokasi jika Anda mengizinkan akses lokasi untuk
                  fitur pencarian terdekat.
                </li>
                <li>
                  <strong className="text-foreground">Data Penggunaan:</strong>{" "}
                  Informasi tentang bagaimana Anda menggunakan platform kami.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Penggunaan Informasi
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami menggunakan informasi yang dikumpulkan untuk:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Menyediakan, memelihara, dan meningkatkan layanan kami</li>
                <li>Memproses dan mengelola akun Anda</li>
                <li>
                  Menampilkan destinasi terdekat berdasarkan lokasi Anda (jika
                  diizinkan)
                </li>
                <li>Mengirimkan pemberitahuan terkait aktivitas akun Anda</li>
                <li>Merespons pertanyaan dan permintaan dukungan</li>
                <li>
                  Mendeteksi dan mencegah aktivitas yang mencurigakan atau tidak
                  sah
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Berbagi Informasi
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami tidak menjual data pribadi Anda. Kami dapat membagikan
                informasi dalam situasi berikut:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Konten Publik:</strong>{" "}
                  Ulasan dan rekomendasi yang Anda kirimkan akan ditampilkan
                  secara publik.
                </li>
                <li>
                  <strong className="text-foreground">Penyedia Layanan:</strong>{" "}
                  Dengan pihak ketiga yang membantu kami mengoperasikan platform
                  (misalnya, hosting, analitik).
                </li>
                <li>
                  <strong className="text-foreground">Kepatuhan Hukum:</strong>{" "}
                  Jika diwajibkan oleh hukum atau untuk melindungi hak kami.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Keamanan Data
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami menerapkan langkah-langkah keamanan yang sesuai untuk
                melindungi data pribadi Anda dari akses tidak sah, perubahan,
                pengungkapan, atau penghancuran. Ini termasuk:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Enkripsi data dalam transit menggunakan HTTPS</li>
                <li>Penyimpanan kata sandi yang aman dengan hashing</li>
                <li>Pembatasan akses ke data pribadi</li>
                <li>Pemantauan keamanan secara berkala</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Hak Anda
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Anda memiliki hak terkait data pribadi Anda:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Akses:</strong> Meminta
                  salinan data pribadi Anda.
                </li>
                <li>
                  <strong className="text-foreground">Perbaikan:</strong>{" "}
                  Memperbarui atau memperbaiki data yang tidak akurat.
                </li>
                <li>
                  <strong className="text-foreground">Penghapusan:</strong>{" "}
                  Meminta penghapusan akun dan data Anda.
                </li>
                <li>
                  <strong className="text-foreground">Pembatasan:</strong>{" "}
                  Membatasi pemrosesan data Anda dalam kondisi tertentu.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Cookie dan Teknologi Pelacakan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami menggunakan cookie dan teknologi serupa untuk meningkatkan
                pengalaman pengguna, menganalisis penggunaan platform, dan
                menyimpan preferensi Anda. Anda dapat mengatur browser Anda
                untuk menolak cookie, namun beberapa fitur mungkin tidak
                berfungsi dengan baik.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Perubahan Kebijakan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke
                waktu. Perubahan akan diposting di halaman ini dengan tanggal
                pembaruan yang baru. Kami mendorong Anda untuk meninjau
                kebijakan ini secara berkala.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Hubungi Kami
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau
                praktik privasi kami, silakan hubungi kami melalui:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Halaman{" "}
                  <Link
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    Kontak
                  </Link>
                </li>
                {/* <li>Email: privacy@himtara.mfazrinizar.com</li> */}
              </ul>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
