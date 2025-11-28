/**
 * Google Maps utilities for loading and managing the Google Maps API
 */

// Global tracking for Google Maps script loading
let googleMapsPromise: Promise<void> | null = null;

/**
 * Check if Google Maps API is loaded and available
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== "undefined" && !!window.google?.maps;
}

/**
 * Load Google Maps API script
 * Uses singleton pattern to avoid loading the script multiple times
 */
export function loadGoogleMaps(): Promise<void> {
  // Already loaded
  if (isGoogleMapsLoaded()) {
    return Promise.resolve();
  }

  // Already loading
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if script tag already exists (e.g., loaded by another component)
  const existingScript = document.querySelector(
    'script[src*="maps.googleapis.com"]'
  );
  if (existingScript) {
    googleMapsPromise = new Promise((resolve) => {
      if (window.google?.maps) {
        resolve();
      } else {
        existingScript.addEventListener("load", () => resolve());
      }
    });
    return googleMapsPromise;
  }

  // Load new script
  googleMapsPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("Google Maps API key is not configured"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Geocode an address to coordinates using Google Maps Geocoder
 */
export async function geocodeAddress(
  address: string
): Promise<google.maps.GeocoderResult | null> {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMaps();
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<google.maps.GeocoderResult | null> {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMaps();
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Default map options for Indonesia-centered maps
 */
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  center: { lat: -2.5489, lng: 118.0149 }, // Indonesia center
  zoom: 5,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: false,
  mapTypeId: "roadmap",
};

/**
 * Default center coordinates for Indonesia
 */
export const INDONESIA_CENTER = {
  lat: -2.5489,
  lng: 118.0149,
};
