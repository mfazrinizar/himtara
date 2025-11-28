"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Navigation, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Gem, Island } from "@/types/firestore";
import { ISLANDS } from "@/types/firestore";
import { GemCardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Pagination } from "@/components/shared/Pagination";
import { useGemList } from "@/features/gems/hooks";
import { useUserLocation } from "@/features/geo/hooks";
import { sortByDistance, formatDistance } from "@/lib/geo";

type SortMode = "rating" | "nearest";

// Island banner colors, patterns, and background images
const ISLAND_BANNERS: Record<
  Island,
  { gradient: string; buttonGradient: string; bgImage: string }
> = {
  nusantara: {
    gradient: "from-emerald-600/80 via-teal-500/80 to-cyan-500/80",
    buttonGradient: "from-emerald-600 via-teal-500 to-cyan-500",
    bgImage: "/islands/nusantara.jpeg",
  },
  sumatera: {
    gradient: "from-green-600/80 via-emerald-500/80 to-teal-500/80",
    buttonGradient: "from-green-600 via-emerald-500 to-teal-500",
    bgImage: "/islands/sumatera.jpeg",
  },
  jawa: {
    gradient: "from-amber-600/80 via-orange-500/80 to-yellow-500/80",
    buttonGradient: "from-amber-600 via-orange-500 to-yellow-500",
    bgImage: "/islands/jawa.jpeg",
  },
  kalimantan: {
    gradient: "from-green-700/80 via-green-600/80 to-emerald-500/80",
    buttonGradient: "from-green-700 via-green-600 to-emerald-500",
    bgImage: "/islands/kalimantan.jpeg",
  },
  sulawesi: {
    gradient: "from-blue-600/80 via-indigo-500/80 to-purple-500/80",
    buttonGradient: "from-blue-600 via-indigo-500 to-purple-500",
    bgImage: "/islands/sulawesi.jpeg",
  },
  "bali-nusa-tenggara": {
    gradient: "from-orange-500/80 via-red-500/80 to-pink-500/80",
    buttonGradient: "from-orange-500 via-red-500 to-pink-500",
    bgImage: "/islands/bali-nusa-tenggara.jpeg",
  },
  "papua-maluku": {
    gradient: "from-teal-600/80 via-cyan-500/80 to-blue-500/80",
    buttonGradient: "from-teal-600 via-cyan-500 to-blue-500",
    bgImage: "/islands/papua-maluku.jpeg",
  },
};

export function GemsListPage() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [selectedIsland, setSelectedIsland] = useState<Island>("nusantara");
  const pageSize = 10;

  // User location hook
  const {
    location: userLocation,
    isLoading: locationLoading,
    error: locationError,
    requestLocation,
  } = useUserLocation();

  const { data: response, isLoading } = useGemList(
    {
      status: "approved",
      searchQuery: searchQuery || undefined,
      minRating,
      island: selectedIsland !== "nusantara" ? selectedIsland : undefined,
      sortBy: "ratingAvg",
      sortOrder: "desc",
    },
    { page, pageSize }
  );

  // Process and sort gems
  const gems = useMemo(() => {
    if (!response?.success || !response.data) return [];

    const gemsList = response.data.data;

    // If sorting by nearest and we have user location, calculate distances and sort
    if (sortMode === "nearest" && userLocation) {
      return sortByDistance(gemsList, userLocation, (gem) => gem.coordinates);
    }

    return gemsList;
  }, [response, sortMode, userLocation]);

  const pagination = useMemo(() => {
    if (!response?.success || !response.data) {
      return { page: 1, pageSize, totalCount: 0, hasMore: false };
    }
    return response.data.pagination;
  }, [response, pageSize]);

  const handleFilterRating = (rating: number | undefined) => {
    setMinRating(rating);
    setPage(1);
  };

  const handleSortModeChange = (mode: SortMode) => {
    setSortMode(mode);
    // Request location if switching to nearest and don't have location yet
    if (mode === "nearest" && !userLocation && !locationLoading) {
      requestLocation();
    }
  };

  const handleIslandChange = (island: Island) => {
    setSelectedIsland(island);
    setPage(1);
  };

  const currentIslandData = ISLANDS.find((i) => i.value === selectedIsland)!;
  const currentBanner = ISLAND_BANNERS[selectedIsland];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Island Banner */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIsland}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative py-16 sm:py-24 lg:py-32"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={currentBanner.bgImage}
                alt={currentIslandData.label}
                fill
                className="object-cover"
                priority
                sizes="100vw"
                quality={85}
              />
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient} opacity-40`}
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center text-white"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {currentIslandData.label}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl opacity-100 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                  {currentIslandData.description}
                </p>
              </motion.div>
            </div>

            {/* Wave Decoration */}
            {/* <div className="absolute bottom-0 left-0 right-0">
              <svg
                viewBox="0 0 1440 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,69.3C960,85,1056,107,1152,101.3C1248,96,1344,64,1392,48L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                  className="fill-background"
                />
              </svg>
            </div> */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Island Selector */}
      <div className="bg-background py-4 border-b">
        <div
          className="mx-auto"
          style={{
            maxWidth: "80rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="scrollbar-hide"
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              justifyContent: "flex-start",
              width: "max-content",
            }}
          >
            {ISLANDS.map((island) => (
              <button
                key={island.value}
                onClick={() => handleIslandChange(island.value)}
                style={{ flexShrink: 0 }}
                className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                    ${
                      selectedIsland === island.value
                        ? `bg-gradient-to-r ${
                            ISLAND_BANNERS[island.value].buttonGradient
                          } text-white shadow-md`
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }
                      `}
              >
                {island.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
            {selectedIsland === "nusantara"
              ? "Jelajahi Destinasi Wisata"
              : `Destinasi di ${currentIslandData.label}`}
          </h2>

          {/* Desktop: Side by side layout */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari destinasi..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 sm:pl-12 h-11 sm:h-12"
              />
            </div>

            {/* Filters - Inline on desktop */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
              {/* Rating Filters */}
              <div className="flex gap-2">
                <Button
                  variant={minRating === undefined ? "default" : "outline"}
                  size="sm"
                  className="h-11 sm:h-12 px-4"
                  onClick={() => handleFilterRating(undefined)}
                >
                  Semua
                </Button>
                <Button
                  variant={minRating === 4 ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-11 sm:h-12 px-4"
                  onClick={() => handleFilterRating(4)}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  4+
                </Button>
              </div>

              {/* Divider - Only on desktop */}
              <div className="w-px h-8 bg-border mx-1 hidden lg:block" />

              {/* Sort Options */}
              <div className="flex gap-2">
                <Button
                  variant={sortMode === "rating" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-11 sm:h-12 px-4"
                  onClick={() => handleSortModeChange("rating")}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rating Tertinggi</span>
                  <span className="sm:hidden">Rating</span>
                </Button>
                <Button
                  variant={sortMode === "nearest" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-11 sm:h-12 px-4"
                  onClick={() => handleSortModeChange("nearest")}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Terdekat</span>
                  <span className="sm:hidden">Dekat</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Location Status */}
          <div className="mt-3">
            {locationError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {locationError}
              </motion.p>
            )}
            {sortMode === "nearest" && locationLoading && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Mendapatkan lokasi Anda...
              </motion.p>
            )}
            {userLocation && sortMode === "nearest" && !locationLoading && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-primary" />
                Menampilkan berdasarkan jarak dari lokasi Anda
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
          >
            Menampilkan {gems.length} destinasi
          </motion.p>
        )}

        {/* Gems Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(9)].map((_, i) => (
              <GemCardSkeleton key={i} />
            ))}
          </div>
        ) : gems.length === 0 ? (
          <EmptyState
            title="Tidak Ada Destinasi"
            description="Tidak ada destinasi yang sesuai dengan pencarian Anda."
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {gems.map((gem, index) => (
                <motion.div
                  key={gem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GemCard
                    gem={gem}
                    distance={
                      sortMode === "nearest" && userLocation
                        ? (gem as Gem & { distance?: number }).distance
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <Pagination
              page={page}
              hasMore={pagination.hasMore}
              onPageChange={setPage}
              isLoading={isLoading}
              className="mt-8"
            />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

interface GemCardProps {
  gem: Gem;
  distance?: number;
}

function GemCard({ gem, distance }: GemCardProps) {
  return (
    <Link href={`/gems/${gem.id}`} className="block h-full">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full group flex flex-col">
        <div className="relative h-48 sm:h-56 bg-muted overflow-hidden flex-shrink-0">
          {gem.images && gem.images.length > 0 ? (
            <Image
              src={gem.images[0]}
              alt={gem.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={75}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
            </div>
          )}
          {/* Rating Badge */}
          {gem.ratingAvg > 0 && (
            <div
              className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-background/95 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md"
              style={{
                WebkitBackdropFilter: "blur(6px)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-xs sm:text-sm text-white">
                {gem.ratingAvg.toFixed(1)}
              </span>
            </div>
          )}
          {/* Distance Badge */}
          {distance !== undefined && (
            <div
              className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/30 backdrop-blur-sm backdrop-saturate-150 px-2.5 py-1.5 sm:px-3 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md border border-white/20 dark:border-black/20"
              style={{
                WebkitBackdropFilter: "blur(6px)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-300" />
              <span className="font-semibold text-xs sm:text-sm text-green-100">
                {formatDistance(distance)}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4 sm:p-5 flex flex-col flex-grow">
          <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 line-clamp-1">
            {gem.name}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-grow">
            {gem.description}
          </p>
          <div className="flex items-center justify-between text-xs sm:text-sm mt-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{gem.reviewCount} ulasan</span>
            </div>
            <span className="text-primary font-medium group-hover:gap-2 transition-all">
              Lihat Detail →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
