"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { loadGoogleMaps, INDONESIA_CENTER } from "@/lib/google-maps";
import { Coordinates } from "@/lib/geo";

interface UseMapPickerOptions {
  initialCoordinates?: Coordinates | null;
  onCoordinatesChange?: (coordinates: Coordinates) => void;
}

interface UseMapPickerReturn {
  // State
  mapReady: boolean;
  mapError: string | null;
  tempCoordinates: Coordinates | null;
  isSearching: boolean;
  isGettingLocation: boolean;
  searchQuery: string;

  // Refs
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.MutableRefObject<google.maps.Map | null>;
  markerRef: React.MutableRefObject<google.maps.Marker | null>;

  // Actions
  setSearchQuery: (query: string) => void;
  setTempCoordinates: (coords: Coordinates | null) => void;
  handleSearch: () => Promise<void>;
  getCurrentLocation: () => void;
  initializeMap: (container: HTMLDivElement) => Promise<void>;
  cleanupMap: () => void;
  updateMarkerPosition: (coords: Coordinates) => void;
}

/**
 * Custom hook for managing map picker state and logic
 */
export function useMapPicker(
  options: UseMapPickerOptions = {}
): UseMapPickerReturn {
  const { initialCoordinates, onCoordinatesChange } = options;

  // State
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tempCoordinates, setTempCoordinates] = useState<Coordinates | null>(
    initialCoordinates || null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const initialCoordsRef = useRef<Coordinates | null>(initialCoordinates || null);

  // Update initial coords ref when prop changes
  useEffect(() => {
    initialCoordsRef.current = initialCoordinates || null;
  }, [initialCoordinates]);

  // Notify parent of coordinate changes
  useEffect(() => {
    if (tempCoordinates && onCoordinatesChange) {
      onCoordinatesChange(tempCoordinates);
    }
  }, [tempCoordinates, onCoordinatesChange]);

  /**
   * Initialize the Google Map instance
   */
  const initializeMap = useCallback(
    async (container: HTMLDivElement): Promise<void> => {
      try {
        setMapReady(false);
        setMapError(null);

        await loadGoogleMaps();

        const defaultCenter = initialCoordsRef.current || INDONESIA_CENTER;

        mapInstanceRef.current = new window.google.maps.Map(container, {
          center: defaultCenter,
          zoom: initialCoordsRef.current ? 15 : 5,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeId: "roadmap",
        });

        // Add draggable marker
        markerRef.current = new window.google.maps.Marker({
          position: defaultCenter,
          map: mapInstanceRef.current,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        // Update coordinates when marker is dragged
        markerRef.current.addListener("dragend", () => {
          const position = markerRef.current?.getPosition();
          if (position) {
            setTempCoordinates({
              lat: position.lat(),
              lng: position.lng(),
            });
          }
        });

        // Click on map to move marker
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

        setMapReady(true);
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setMapError("Gagal memuat peta. Periksa koneksi internet Anda.");
      }
    },
    []
  );

  /**
   * Cleanup map instance and marker
   */
  const cleanupMap = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    mapInstanceRef.current = null;
    setMapReady(false);
  }, []);

  /**
   * Update marker position on the map
   */
  const updateMarkerPosition = useCallback((coords: Coordinates) => {
    if (mapInstanceRef.current && markerRef.current) {
      const latLng = new window.google.maps.LatLng(coords.lat, coords.lng);
      mapInstanceRef.current.setCenter(latLng);
      mapInstanceRef.current.setZoom(15);
      markerRef.current.setPosition(latLng);
    }
  }, []);

  /**
   * Search for a location by address
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !window.google?.maps) return;

    setIsSearching(true);

    try {
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

            return results[0].formatted_address;
          }
          return null;
        }
      );
    } catch {
      setIsSearching(false);
    }
  }, [searchQuery, updateMarkerPosition]);

  /**
   * Get user's current location
   */
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setTempCoordinates(newCoords);
        updateMarkerPosition(newCoords);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [updateMarkerPosition]);

  return {
    // State
    mapReady,
    mapError,
    tempCoordinates,
    isSearching,
    isGettingLocation,
    searchQuery,

    // Refs
    mapRef,
    mapInstanceRef,
    markerRef,

    // Actions
    setSearchQuery,
    setTempCoordinates,
    handleSearch,
    getCurrentLocation,
    initializeMap,
    cleanupMap,
    updateMarkerPosition,
  };
}
