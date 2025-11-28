"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export function TermsPage() {
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Syarat & Ketentuan
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
                1. Penerimaan Syarat
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dengan mengakses atau menggunakan platform Himtara (Hidden Gems
                Nusantara), Anda menyetujui untuk terikat dengan Syarat &
                Ketentuan ini. Jika Anda tidak menyetujui syarat-syarat ini,
                mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                2. Deskripsi Layanan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Himtara adalah platform yang memungkinkan pengguna untuk:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Menemukan destinasi wisata tersembunyi di seluruh Indonesia
                </li>
                <li>Berbagi pengalaman dan rekomendasi destinasi</li>
                <li>Memberikan ulasan dan penilaian untuk destinasi</li>
                <li>Menyimpan destinasi favorit</li>
                <li>Mencari destinasi terdekat berdasarkan lokasi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                3. Pendaftaran Akun
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Untuk menggunakan fitur tertentu, Anda perlu membuat akun.
                Dengan mendaftar, Anda menyatakan bahwa:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Anda berusia minimal 13 tahun</li>
                <li>Informasi yang Anda berikan adalah akurat dan lengkap</li>
                <li>
                  Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi
                  Anda
                </li>
                <li>
                  Anda bertanggung jawab atas semua aktivitas yang terjadi di
                  akun Anda
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                4. Konten Pengguna
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Anda dapat mengirimkan konten seperti ulasan, foto, dan
                rekomendasi destinasi. Dengan mengirimkan konten, Anda:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Memberikan kami lisensi non-eksklusif untuk menggunakan,
                  menampilkan, dan mendistribusikan konten tersebut
                </li>
                <li>
                  Menjamin bahwa Anda memiliki hak untuk membagikan konten
                  tersebut
                </li>
                <li>Bertanggung jawab atas konten yang Anda kirimkan</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Konten yang dilarang meliputi:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Konten yang melanggar hukum atau hak pihak lain</li>
                <li>
                  Konten yang mengandung kebencian, kekerasan, atau diskriminasi
                </li>
                <li>Konten yang menyesatkan atau palsu</li>
                <li>Spam atau konten promosi yang tidak diminta</li>
                <li>Konten yang mengandung malware atau kode berbahaya</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Pedoman Komunitas
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Untuk menjaga komunitas yang positif, pengguna diharapkan untuk:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Bersikap sopan dan menghormati pengguna lain</li>
                <li>
                  Memberikan ulasan yang jujur dan berdasarkan pengalaman nyata
                </li>
                <li>Tidak menyalahgunakan sistem penilaian</li>
                <li>Melaporkan konten yang melanggar ketentuan</li>
                <li>
                  Tidak menggunakan platform untuk tujuan komersial tanpa izin
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Hak Kekayaan Intelektual
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Platform Himtara, termasuk desain, logo, dan kode sumber,
                dilindungi oleh hak kekayaan intelektual. Anda tidak diizinkan
                untuk:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Menyalin atau memodifikasi platform tanpa izin</li>
                <li>Menggunakan merek dagang kami tanpa izin tertulis</li>
                <li>Melakukan reverse engineering pada kode sumber platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Batasan Tanggung Jawab
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Himtara menyediakan platform &quot;sebagaimana adanya&quot;.
                Kami tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  Keakuratan informasi destinasi yang dikirimkan oleh pengguna
                </li>
                <li>
                  Pengalaman Anda saat mengunjungi destinasi yang tercantum
                </li>
                <li>Kerugian yang timbul dari penggunaan platform</li>
                <li>Gangguan atau kesalahan teknis pada layanan</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Kami menyarankan Anda untuk selalu memverifikasi informasi
                destinasi sebelum berkunjung dan mengambil langkah keselamatan
                yang diperlukan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Penghentian Akun
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami berhak untuk menangguhkan atau menghentikan akun Anda jika:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Anda melanggar Syarat & Ketentuan ini</li>
                <li>
                  Anda terlibat dalam aktivitas yang merugikan platform atau
                  pengguna lain
                </li>
                <li>Akun Anda tidak aktif dalam waktu yang lama</li>
                <li>Diperlukan untuk kepatuhan hukum</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Anda juga dapat menghapus akun Anda kapan saja melalui
                pengaturan akun.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. Perubahan Layanan dan Ketentuan
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kami dapat mengubah layanan atau Syarat & Ketentuan ini kapan
                saja. Perubahan signifikan akan diberitahukan melalui email atau
                pemberitahuan di platform. Penggunaan berkelanjutan setelah
                perubahan menunjukkan penerimaan Anda terhadap ketentuan baru.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Hukum yang Berlaku
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia.
                Segala perselisihan yang timbul akan diselesaikan melalui
                musyawarah atau melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                11. Hubungi Kami
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini,
                silakan hubungi kami melalui:
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
                {/* <li>Email: legal@himtara.mfazrinizar.com</li> */}
              </ul>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
