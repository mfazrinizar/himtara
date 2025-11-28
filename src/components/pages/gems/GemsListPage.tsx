"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Star, Navigation, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Gem } from "@/types/firestore";
import { GemCardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { useGemList } from "@/features/gems/hooks";
import { useUserLocation } from "@/features/geo/useUserLocation";
import { sortByDistance, formatDistance } from "@/lib/geo";

type SortMode = "rating" | "nearest";

export function GemsListPage() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState<number | undefined>();
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const pageSize = 12;

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            Jelajahi Destinasi Wisata
          </h1>

          <div className="flex flex-col gap-3 sm:gap-4">
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

            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
              {/* Rating Filters */}
              <div className="flex gap-2">
                <Button
                  variant={minRating === undefined ? "default" : "outline"}
                  size="sm"
                  className="h-9 sm:h-10"
                  onClick={() => handleFilterRating(undefined)}
                >
                  Semua
                </Button>
                <Button
                  variant={minRating === 4 ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 sm:h-10"
                  onClick={() => handleFilterRating(4)}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  4+
                </Button>
              </div>

              {/* Divider */}
              <div className="w-px bg-border mx-1 hidden sm:block" />

              {/* Sort Options */}
              <div className="flex gap-2">
                <Button
                  variant={sortMode === "rating" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 sm:h-10"
                  onClick={() => handleSortModeChange("rating")}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Rating Tertinggi</span>
                  <span className="xs:hidden">Rating</span>
                </Button>
                <Button
                  variant={sortMode === "nearest" ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 h-9 sm:h-10"
                  onClick={() => handleSortModeChange("nearest")}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden xs:inline">Terdekat</span>
                  <span className="xs:hidden">Dekat</span>
                </Button>
              </div>
            </div>

            {/* Location Status */}
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
            {(page > 1 || pagination.hasMore) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasMore}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gem.images[0]}
              alt={gem.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/30 dark:bg-black/30 backdrop-blur-sm backdrop-saturate-150 px-2.5 py-1.5 sm:px-3 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md border border-white/20 dark:border-black/20"
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
