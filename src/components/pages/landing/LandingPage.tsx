"use client";

import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import type { Gem } from "@/types/firestore";
import { GemCardSkeleton } from "@/components/shared/Skeleton";
import { useGemList, useGemStats } from "@/features/gems/hooks";
import { useRouter } from "next/navigation";

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { data: gemsResponse, isLoading } = useGemList(
    { status: "approved", sortBy: "ratingAvg", sortOrder: "desc" },
    { pageSize: 6 }
  );

  const { data: statsResponse } = useGemStats();

  const featuredGems = useMemo(() => {
    if (!gemsResponse?.success || !gemsResponse.data) return [];
    return gemsResponse.data.data;
  }, [gemsResponse]);

  const stats = useMemo(() => {
    if (!statsResponse?.success || !statsResponse.data) {
      return { total: 0, approved: 0, avgRating: 0 };
    }
    return statsResponse.data;
  }, [statsResponse]);

  const avgRating = useMemo(() => {
    if (!gemsResponse?.success || !gemsResponse.data?.data) return 0;
    const gems = gemsResponse.data.data;
    if (gems.length === 0) return 0;

    // Filter out gems with 0 rating
    const gemsWithRating = gems.filter((gem) => gem.ratingAvg > 0);
    if (gemsWithRating.length === 0) return 0;

    const sum = gemsWithRating.reduce((acc, gem) => acc + gem.ratingAvg, 0);
    return (sum / gemsWithRating.length).toFixed(1);
  }, [gemsResponse]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/gems?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center px-4">
          {/* Animated Background with Floating Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated Blobs */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 80, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -60, 0],
                y: [0, 60, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
            />

            {/* Floating Icons */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 360],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="absolute"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
              >
                <MapPin
                  className="w-6 h-6 text-primary/30"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(var(--primary), 0.3))",
                  }}
                />
              </motion.div>
            ))}

            {/* Animated Stars */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="absolute"
                style={{
                  left: `${5 + i * 8}%`,
                  top: `${10 + (i % 4) * 20}%`,
                }}
              >
                <Star
                  className="w-4 h-4 text-amber-400/40 fill-amber-400/40"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))",
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Background Image with Enhanced Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90 backdrop-blur-[2px]"></div>

          <div className="relative max-w-6xl mx-auto text-center space-y-6 sm:space-y-8 w-full">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4 px-4 bg-gradient-to-br from-foreground via-primary to-foreground bg-clip-text text-transparent drop-shadow-sm"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Jelajahi Destinasi Wisata Terbaik di Indonesia
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4"
              >
                Temukan tempat-tempat tersembunyi yang menakjubkan di seluruh
                Nusantara dan bagikan petualanganmu
              </motion.p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari destinasi wisata..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg w-full shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="h-12 sm:h-14 px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  Cari
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto pt-6 sm:pt-8"
            >
              {[
                {
                  value: `${stats.approved}+`,
                  label: "Destinasi Terverifikasi",
                  delay: 0,
                },
                {
                  value: `${stats.total}+`,
                  label: "Total Destinasi",
                  delay: 0.1,
                },
                {
                  value: avgRating || "N/A",
                  label: "Rating Rata-rata",
                  delay: 0.2,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + stat.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/50"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{
                opacity: { delay: 1.2 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Gems Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                  Destinasi Unggulan
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Tempat-tempat terbaik yang direkomendasikan untuk Anda
                </p>
              </div>
              <Link href="/gems">
                <Button variant="secondary" className="gap-2">
                  Lihat Semua
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <GemCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredGems.map((gem) => (
                  <GemCard key={gem.id} gem={gem} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700">
          <div className="max-w-4xl mx-auto text-center text-white space-y-4 sm:space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-4 text-white">
                Punya Destinasi Wisata Tersembunyi?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/95 px-4 mt-4">
                Bagikan destinasi favoritmu dan bantu wisatawan menemukan tempat
                baru
              </p>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-white/90"
                >
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full sm:w-auto text-white border-white hover:bg-white/20"
                >
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Mengapa Memilih Himtara?
              </h2>
              <p className="text-muted-foreground text-lg">
                Platform terpercaya untuk menemukan destinasi wisata tersembunyi
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Award,
                  title: "Terverifikasi",
                  desc: "Semua destinasi telah diverifikasi oleh tim kami",
                },
                {
                  icon: Users,
                  title: "Komunitas",
                  desc: "Bergabung dengan ribuan traveler lainnya",
                },
                {
                  icon: Shield,
                  title: "Terpercaya",
                  desc: "Review asli dari pengguna nyata",
                },
                {
                  icon: Sparkles,
                  title: "Terkurasi",
                  desc: "Destinasi pilihan dengan kualitas terbaik",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="text-center p-6 h-full hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
      <Footer />
    </div>
  );
}

function GemCard({ gem }: { gem: Gem }) {
  const imageUrl =
    gem.images && gem.images.length > 0
      ? gem.images[0]
      : `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop`;

  return (
    <Link href={`/gems/${gem.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full group">
        <div className="relative h-44 sm:h-48 bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={gem.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-background/95 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-xs sm:text-sm">
              {gem.ratingAvg.toFixed(1)}
            </span>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 line-clamp-1">
            {gem.name}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
            {gem.description}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{gem.reviewCount} ulasan</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
