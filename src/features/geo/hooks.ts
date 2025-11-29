"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/lib/geo";

export interface UseUserLocationOptions {
  /** Whether to automatically request location on mount */
  autoRequest?: boolean;
  /** Enable high accuracy mode */
  enableHighAccuracy?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Maximum age of cached position in milliseconds */
  maximumAge?: number;
}

export interface UseUserLocationReturn {
  /** User's current location coordinates */
  location: Coordinates | null;
  /** Whether location is currently being fetched */
  isLoading: boolean;
  /** Error message if location request failed */
  error: string | null;
  /** Function to request location */
  requestLocation: () => void;
  /** Whether geolocation is supported */
  isSupported: boolean;
}

const DEFAULT_OPTIONS: Required<UseUserLocationOptions> = {
  autoRequest: false,
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};

/**
 * Custom hook for managing user geolocation
 */
export function useUserLocation(
  options: UseUserLocationOptions = {}
): UseUserLocationReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => 
    typeof window !== "undefined" && "geolocation" in navigator
  );

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Izin lokasi ditolak");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Informasi lokasi tidak tersedia");
            break;
          case err.TIMEOUT:
            setError("Permintaan lokasi timeout");
            break;
          default:
            setError("Terjadi kesalahan saat mengambil lokasi");
        }
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    );
  }, [isSupported, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

  // Auto-request location on mount if enabled
  useEffect(() => {
    if (opts.autoRequest && isSupported && !location && !isLoading) {
      requestLocation();
    }
  }, [opts.autoRequest, isSupported, location, isLoading, requestLocation]);

  return {
    location,
    isLoading,
    error,
    requestLocation,
    isSupported,
  };
}

/**
 * Hook to get distance from user's location to a target
 * Automatically requests location if not available
 */
export function useDistanceToTarget(
  targetCoordinates: Coordinates | null | undefined
): {
  distance: number | null;
  isLoading: boolean;
  error: string | null;
} {
  const { location, isLoading, error, requestLocation, isSupported } = useUserLocation();
  const [distance, setDistance] = useState<number | null>(null);

  // Request location when target coordinates are available
  useEffect(() => {
    if (targetCoordinates && isSupported && !location && !isLoading && !error) {
      requestLocation();
    }
  }, [targetCoordinates, isSupported, location, isLoading, error, requestLocation]);

  // Calculate distance when both coordinates are available
  useEffect(() => {
    if (location && targetCoordinates) {
      // Import dynamically to avoid circular dependency
      import("@/lib/geo").then(({ calculateDistance }) => {
        const dist = calculateDistance(location, targetCoordinates);
        setDistance(dist);
      });
    }
  }, [location, targetCoordinates]);

  return {
    distance,
    isLoading,
    error,
  };
}

/**
 * Fetches address from coordinates using Google Maps Geocoding API
 */
async function fetchAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API key not configured");
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=id`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch address");
  }

  const data = await response.json();
  if (data.status === "OK" && data.results?.[0]) {
    return data.results[0].formatted_address;
  }

  return null;
}

export interface UseReverseGeocodeReturn {
  /** The formatted address string */
  address: string | null;
  /** Whether the address is currently being fetched */
  isLoading: boolean;
  /** Error message if geocoding failed */
  error: Error | null;
}

/**
 * Hook to perform reverse geocoding (coordinates to address)
 * Uses TanStack Query for caching and deduplication
 */
export function useReverseGeocode(
  coordinates: Coordinates | null | undefined
): UseReverseGeocodeReturn {
  const { data: address, isLoading, error } = useQuery({
    queryKey: ["reverse-geocode", coordinates?.lat, coordinates?.lng],
    queryFn: () => {
      if (!coordinates?.lat || !coordinates?.lng) {
        return null;
      }
      return fetchAddressFromCoordinates(coordinates.lat, coordinates.lng);
    },
    enabled: Boolean(coordinates?.lat && coordinates?.lng),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - addresses don't change often
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days garbage collection time
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    address: address ?? null,
    isLoading,
    error: error as Error | null,
  };
}
