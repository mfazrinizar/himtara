"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Navigation,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GemDetailSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Header } from "@/components/shared/Header";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  useGemDetail,
  useGemReviews,
  useCreateReview,
} from "@/features/gems/hooks";
import { toDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/auth";
import { useDistanceToTarget, useReverseGeocode } from "@/features/geo/hooks";
import { formatDistance } from "@/lib/geo";

interface GemDetailPageProps {
  gemId: string;
}

export function GemDetailPage({ gemId }: GemDetailPageProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { data: userResult, isLoading: userLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUserAction,
    staleTime: 1000 * 60 * 5,
  });

  const user = userResult?.data?.user;

  const {
    data: gemResult,
    isLoading: gemLoading,
    refetch: refetchGem,
  } = useGemDetail(gemId, user?.uid, user?.role);
  const { data: reviewsResult, isLoading: reviewsLoading } =
    useGemReviews(gemId);

  // Mutation for creating review
  const createReviewMutation = useCreateReview();

  const gem = gemResult?.success ? gemResult.data : null;
  const reviews = reviewsResult?.success ? reviewsResult.data : [];

  // Get distance to gem using the custom hook
  const { distance: distanceToGem } = useDistanceToTarget(
    gem ? { lat: gem.coordinates.lat, lng: gem.coordinates.lng } : null
  );

  // Get location address using reverse geocoding hook
  const { address: locationAddress } = useReverseGeocode(
    gem ? { lat: gem.coordinates.lat, lng: gem.coordinates.lng } : null
  );

  // Check if user has already reviewed this gem
  const hasUserReviewed =
    reviews?.some((review) => review.userId === user?.uid) || false;

  // Show loading while checking auth or fetching gem
  if (userLoading || gemLoading || reviewsLoading) {
    return (
      <>
        <Header />
        <GemDetailSkeleton />
      </>
    );
  }

  // Handle access denied (different from not found)
  if (gemResult && !gemResult.success) {
    const isAccessDenied = gemResult.message?.includes("tidak memiliki akses");
    return (
      <>
        <Header />
        <EmptyState
          title={isAccessDenied ? "Akses Ditolak" : "Destinasi Tidak Ditemukan"}
          description={
            gemResult.message || "Destinasi yang Anda cari tidak ditemukan."
          }
        />
      </>
    );
  }

  if (!gem) {
    return (
      <>
        <Header />
        <EmptyState
          title="Destinasi Tidak Ditemukan"
          description="Destinasi yang Anda cari tidak ditemukan."
        />
      </>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gem.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + gem.images.length) % gem.images.length
    );
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
    setZoomLevel(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomLevel(1);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % gem.images.length);
    setZoomLevel(1);
  };

  const prevModalImage = () => {
    setModalImageIndex(
      (prev) => (prev - 1 + gem.images.length) % gem.images.length
    );
    setZoomLevel(1);
  };

  // const zoomIn = () => {
  //   setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  // };

  // const zoomOut = () => {
  //   setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  // };

  // const resetZoom = () => {
  //   setZoomLevel(1);
  // };

  const handleSubmitReview = async () => {
    if (!user || !user.uid) {
      toast.error("Anda harus login untuk memberi ulasan");
      router.push("/login");
      return;
    }

    if (!rating || !comment.trim()) {
      toast.error("Mohon isi rating dan komentar");
      return;
    }

    try {
      const result = await createReviewMutation.mutateAsync({
        gemId,
        userId: user.uid,
        rating,
        comment: comment.trim(),
      });

      if (result.success) {
        toast.success(result.message);
        setRating(0);
        setComment("");
        // Refetch gem data to get updated rating
        refetchGem();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal mengirim ulasan");
    }
  };

  return (
    <>
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background py-12 px-4"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Image Gallery */}
          <div className="relative rounded-xl overflow-hidden">
            <div
              className="aspect-video bg-muted cursor-pointer overflow-hidden relative"
              onClick={() => openModal(currentImageIndex)}
            >
              <Image
                src={gem.images[currentImageIndex]}
                alt={gem.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
                priority
                quality={85}
              />
              <div
                className="absolute top-4 right-4 bg-black/35 text-white/80 hover:text-white hover:bg-black/80  px-3 py-2 rounded-full transition-colors flex items-center gap-2"
                style={{
                  WebkitBackdropFilter: "blur(6px)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm font-medium">Lihat Galeri</span>
              </div>
            </div>
            {gem.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-black/80 p-2 rounded-full transition-colors"
                  style={{
                    WebkitBackdropFilter: "blur(6px)",
                    backdropFilter: "blur(6px)",
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-black/80 p-2 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {gem.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Gem Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2 space-y-6 min-w-0">
              <div>
                <h1 className="text-4xl font-bold text-text-primary mb-4">
                  {gem.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-text-secondary mb-4">
                  {gem.ratingAvg > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-text-primary">
                        {gem.ratingAvg.toFixed(2)}
                      </span>
                      <span className="whitespace-nowrap">
                        ({gem.reviewCount} ulasan)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 min-w-0 max-w-full sm:max-w-md">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span
                      className="truncate hover:overflow-visible hover:whitespace-normal hover:break-words transition-all cursor-help"
                      title={locationAddress || "Memuat lokasi..."}
                    >
                      {locationAddress || "Memuat lokasi..."}
                    </span>
                  </div>
                  {distanceToGem !== null && (
                    <div className="flex items-center gap-1 flex-shrink-0 text-primary">
                      <Navigation className="w-5 h-5" />
                      <span className="font-semibold">
                        {formatDistance(distanceToGem)} dari lokasi Anda
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-text-secondary leading-relaxed">
                  {gem.description}
                </p>
              </div>

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Ulasan Pengunjung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-border pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {review.userName || "Pengguna"}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {review.createdAt
                                ? formatDistanceToNow(
                                    toDate(review.createdAt),
                                    {
                                      addSuffix: true,
                                      locale: localeId,
                                    }
                                  )
                                : "Baru saja"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-text-secondary">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Belum ada ulasan. Jadilah yang pertama!
                    </p>
                  )}

                  {/* Add Review Form */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <h3 className="font-semibold">Tulis Ulasan Anda</h3>
                    {!user ? (
                      <div className="text-center py-6 space-y-4">
                        <p className="text-muted-foreground">
                          Anda harus login untuk memberi ulasan
                        </p>
                        <Button onClick={() => router.push("/login")}>
                          Login untuk Memberi Ulasan
                        </Button>
                      </div>
                    ) : hasUserReviewed ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">
                          Anda sudah memberi ulasan untuk destinasi ini.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              disabled={createReviewMutation.isPending}
                              className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-text-secondary"
                                }`}
                              />
                            </button>
                          ))}
                          {rating > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {rating} bintang
                            </span>
                          )}
                        </div>
                        <Textarea
                          placeholder="Bagikan pengalaman Anda di tempat ini..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          disabled={createReviewMutation.isPending}
                        />
                        <Button
                          onClick={handleSubmitReview}
                          disabled={
                            createReviewMutation.isPending ||
                            !rating ||
                            !comment.trim()
                          }
                        >
                          {createReviewMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Mengirim...
                            </>
                          ) : (
                            "Kirim Ulasan"
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <div className="space-y-4 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${gem.coordinates.lat},${gem.coordinates.lng}&zoom=16`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
            onClick={closeModal}
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute top-4 right-4 bg-white hover:bg-white/90 p-3 rounded-full transition-all hover:scale-110 z-[10000] shadow-2xl"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-black" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Zoom Controls */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute top-4 left-4 flex flex-col gap-2 z-[10000]"
              >
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    zoomIn();
                  }}
                  disabled={zoomLevel >= 3}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-6 h-6 text-white" />
                </button> */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    zoomOut();
                  }}
                  disabled={zoomLevel <= 1}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-6 h-6 text-white" />
                </button> */}
                {/* {zoomLevel > 1 && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      resetZoom();
                    }}
                    className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all hover:scale-110 text-white text-sm font-medium backdrop-blur-sm"
                  >
                    Reset
                  </motion.button>
                )} */}
                <div className="bg-white/10 px-3 py-2 rounded-full text-white text-sm font-medium text-center backdrop-blur-sm">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </motion.div>

              {/* Image Counter */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-sm z-[10000]"
              >
                {modalImageIndex + 1} / {gem.images.length}
              </motion.div>

              {/* Navigation Buttons */}
              {gem.images.length > 1 && (
                <>
                  <motion.button
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      prevModalImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-[10000]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </motion.button>
                  <motion.button
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      nextModalImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm z-[10000]"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </motion.button>
                </>
              )}

              {/* Image */}
              <div
                className="overflow-auto max-w-full max-h-full flex items-center justify-center"
                style={{
                  maxHeight: "calc(100vh - 8rem)",
                  cursor: zoomLevel > 1 ? "move" : "default",
                }}
              >
                <motion.img
                  key={modalImageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  src={gem.images[modalImageIndex]}
                  alt={`${gem.name} - Image ${modalImageIndex + 1}`}
                  className="max-w-full h-auto"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center center",
                    transition: "transform 0.2s ease-out",
                  }}
                />
              </div>

              {/* Thumbnail Gallery */}
              {gem.images.length > 1 && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2 z-[10000]"
                >
                  {gem.images.map((image, index) => (
                    <motion.button
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: 0.3 + index * 0.05,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex(index);
                        setZoomLevel(1);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                        index === modalImageIndex
                          ? "border-white scale-110"
                          : "border-white/30 hover:border-white/60 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        quality={60}
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
