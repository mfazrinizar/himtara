"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  MapPin,
  Upload,
  Image as ImageIcon,
  Send,
  Loader2,
} from "lucide-react";
import { createGemSchema, type CreateGemInput } from "@/schemas";
import { useCreateGem } from "@/features/gems/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/shared/Header";
import { MapPicker } from "@/components/shared/MapPicker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserAction } from "@/actions/auth";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function GemSubmitPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const createGem = useCreateGem();

  const { data: userResult } = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUserAction,
    staleTime: 1000 * 60 * 5,
  });

  const user = userResult?.data?.user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateGemInput>({
    resolver: zodResolver(createGemSchema),
    defaultValues: {
      images: [],
    },
  });

  const images = watch("images");

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setValue("coordinates.lat", lat);
        setValue("coordinates.lng", lng);
        toast.success(
          `Lokasi terdeteksi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Gagal mendapatkan lokasi";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Izin lokasi ditolak. Silakan aktifkan di pengaturan browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Informasi lokasi tidak tersedia";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Waktu permintaan lokasi habis";
        }
        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user?.uid) {
      toast.error("Anda harus login untuk mengunggah gambar");
      return;
    }

    setIsUploading(true);
    try {
      const imageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} bukan file gambar`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} terlalu besar (maksimal 5MB)`);
          continue;
        }

        // Create unique filename
        const timestamp = Date.now();
        const filename = `gems/${user.uid}/${timestamp}_${i}_${file.name}`;
        const storageRef = ref(storage, filename);

        // Upload to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      if (imageUrls.length > 0) {
        setValue("images", [...(images || []), ...imageUrls]);
        toast.success(`${imageUrls.length} gambar berhasil diunggah`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CreateGemInput) => {
    if (!user?.uid) {
      toast.error("Anda harus login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      const result = await createGem.mutateAsync({
        ...data,
        submittedBy: user.uid,
      });
      if (result.success) {
        toast.success("Hidden Gem berhasil diajukan!");
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal mengajukan Hidden Gem");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent mb-2">
              Ajukan Hidden Gem
            </h1>
            <p className="text-lg text-muted-foreground">
              Bagikan destinasi wisata tersembunyi favorit Anda dengan komunitas
            </p>
          </div>

          <Card className="border-2 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MapPin className="w-6 h-6 text-emerald-600" />
                Informasi Destinasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nama Destinasi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Contoh: Pantai Tersembunyi Nusa Penida"
                    className="h-12"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Ceritakan tentang destinasi ini, apa yang membuatnya istimewa..."
                    className="min-h-[150px]"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Coordinates */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <label className="text-sm font-medium">
                      Koordinat Lokasi <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <MapPicker
                        value={
                          watch("coordinates.lat") && watch("coordinates.lng")
                            ? {
                                lat: watch("coordinates.lat"),
                                lng: watch("coordinates.lng"),
                              }
                            : undefined
                        }
                        onChange={(coords) => {
                          setValue("coordinates.lat", coords.lat);
                          setValue("coordinates.lng", coords.lng);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="gap-2"
                      >
                        {isGettingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        {isGettingLocation ? "Mengambil..." : "Lokasi Saat Ini"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="lat"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Latitude
                      </label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        placeholder="-8.5069"
                        {...register("coordinates.lat", {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.coordinates?.lat && (
                        <p className="text-sm text-red-500">
                          {errors.coordinates.lat.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="lng"
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Longitude
                      </label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        placeholder="115.2625"
                        {...register("coordinates.lng", {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.coordinates?.lng && (
                        <p className="text-sm text-red-500">
                          {errors.coordinates.lng.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div className="mt-4">
                    {watch("coordinates.lat") &&
                    watch("coordinates.lng") &&
                    !isNaN(watch("coordinates.lat")) &&
                    !isNaN(watch("coordinates.lng")) ? (
                      <>
                        <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-border">
                          <iframe
                            src={`https://www.google.com/maps/embed/v1/view?key=${
                              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                            }&center=${watch("coordinates.lat")},${watch(
                              "coordinates.lng"
                            )}&zoom=15&maptype=satellite`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Pratinjau lokasi:{" "}
                          {watch("coordinates.lat")?.toFixed(6)},{" "}
                          {watch("coordinates.lng")?.toFixed(6)}
                        </p>
                      </>
                    ) : (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          Masukkan koordinat untuk melihat pratinjau lokasi
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Foto Destinasi <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      id="images"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      {isUploading ? (
                        <div className="text-muted-foreground">
                          Mengunggah gambar...
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Klik untuk mengunggah foto
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG hingga 10MB (minimal 1 foto)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Image Preview */}
                  {images && images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {images.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = images.filter(
                                (_, i) => i !== index
                              );
                              setValue("images", newImages);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.images && (
                    <p className="text-sm text-red-500">
                      {errors.images.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    disabled={createGem.isPending || isUploading}
                  >
                    <Send className="w-4 h-4" />
                    {createGem.isPending ? "Mengirim..." : "Ajukan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Tips Pengajuan
                  </h3>
                  <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1 list-disc list-inside">
                    <li>
                      Pastikan foto yang diunggah jelas dan berkualitas baik
                    </li>
                    <li>Berikan deskripsi yang detail dan informatif</li>
                    <li>
                      Koordinat GPS harus akurat untuk memudahkan pengunjung
                    </li>
                    <li>
                      Pengajuan akan direview oleh admin dalam 1-3 hari kerja
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
