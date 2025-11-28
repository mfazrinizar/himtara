"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { loadGoogleMaps, INDONESIA_CENTER } from "@/lib/google-maps";
import type { Coordinates } from "@/lib/geo";

interface MapPickerProps {
  value?: Coordinates;
  onChange: (coordinates: Coordinates) => void;
  className?: string;
}

export function MapPicker({ value, onChange, className }: MapPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [tempCoordinates, setTempCoordinates] = useState<Coordinates | null>(
    value || null
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const initialCoordsRef = useRef<Coordinates | null>(null);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isOpen) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const initializeMap = async () => {
      try {
        await loadGoogleMaps();

        if (cancelled || !mapRef.current) return;

        const defaultCenter = initialCoordsRef.current || INDONESIA_CENTER;

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: initialCoordsRef.current ? 15 : 5,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeId: "roadmap",
        });

        markerRef.current = new window.google.maps.Marker({
          position: defaultCenter,
          map: mapInstanceRef.current,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        markerRef.current.addListener("dragend", () => {
          const position = markerRef.current?.getPosition();
          if (position) {
            setTempCoordinates({
              lat: position.lat(),
              lng: position.lng(),
            });
          }
        });

        mapInstanceRef.current.addListener(
          "click",
          (e: google.maps.MapMouseEvent) => {
            if (e.latLng && markerRef.current) {
              markerRef.current.setPosition(e.latLng);
              setTempCoordinates({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
          }
        );

        if (!cancelled) {
          setMapReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
        if (!cancelled) {
          setMapError("Gagal memuat peta. Periksa koneksi internet Anda.");
        }
      }
    };

    const timer = setTimeout(initializeMap, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Update marker position helper
  const updateMarkerPosition = (coords: Coordinates) => {
    if (mapInstanceRef.current && markerRef.current) {
      const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);
      mapInstanceRef.current.setCenter(latLng);
      mapInstanceRef.current.setZoom(15);
      markerRef.current.setPosition(latLng);
    }
  };

  // Search location
  const handleSearch = () => {
    if (!searchQuery.trim() || !window.google?.maps) return;

    setIsSearching(true);
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { address: searchQuery },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        setIsSearching(false);

        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const newCoords = {
            lat: location.lat(),
            lng: location.lng(),
          };

          setTempCoordinates(newCoords);
          updateMarkerPosition(newCoords);
          toast.success(`Lokasi ditemukan: ${results[0].formatted_address}`);
        } else {
          toast.error("Lokasi tidak ditemukan");
        }
      }
    );
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setTempCoordinates(newCoords);
        updateMarkerPosition(newCoords);
        toast.success("Lokasi saat ini berhasil didapatkan");
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = "Gagal mendapatkan lokasi";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Izin lokasi ditolak";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Informasi lokasi tidak tersedia";
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (tempCoordinates) {
      onChange(tempCoordinates);
      setIsOpen(false);
      toast.success(
        `Koordinat dipilih: ${tempCoordinates.lat.toFixed(
          6
        )}, ${tempCoordinates.lng.toFixed(6)}`
      );
    } else {
      toast.error("Pilih lokasi terlebih dahulu");
    }
  };

  // Open dialog
  const handleOpen = () => {
    setTempCoordinates(value || null);
    initialCoordsRef.current = value || null;
    setMapReady(false);
    setMapError(null);
    setIsOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className={`gap-2 ${className}`}
      >
        <MapPin className="w-4 h-4" />
        Pilih dari Peta
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Pilih Lokasi di Peta
            </DialogTitle>
            <DialogDescription>
              Klik pada peta atau drag marker untuk memilih lokasi. Anda juga
              bisa mencari lokasi atau gunakan lokasi saat ini.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari lokasi... (contoh: Pantai Kuta, Bali)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                  disabled={!mapReady}
                />
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim() || !mapReady}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Cari"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isLoading || !mapReady}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Lokasi Saya</span>
              </Button>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[400px] rounded-lg border-2 border-border bg-muted overflow-hidden">
              <div ref={mapRef} className="w-full h-full" />
              {!mapReady && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Memuat peta...
                    </span>
                  </div>
                </div>
              )}
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="flex flex-col items-center gap-2 text-destructive">
                    <X className="w-8 h-8" />
                    <span className="text-sm">{mapError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Coordinates */}
            {tempCoordinates && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Koordinat Terpilih:
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tempCoordinates.lat.toFixed(6)},{" "}
                    {tempCoordinates.lng.toFixed(6)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempCoordinates(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!tempCoordinates}
                className="gap-2"
              >
                <MapPin className="w-4 h-4" />
                Pilih Lokasi Ini
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
