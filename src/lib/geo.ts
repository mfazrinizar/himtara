/**
 * Geographic utility functions for distance calculations and geohash
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

// Geohash base32 characters
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/**
 * Encode coordinates to geohash string
 * @param lat - Latitude
 * @param lng - Longitude  
 * @param precision - Geohash precision (1-12), default 9
 * @returns Geohash string
 */
export function encodeGeohash(lat: number, lng: number, precision: number = 9): string {
  const latRange = { min: -90, max: 90 };
  const lngRange = { min: -180, max: 180 };
  let hash = "";
  let bit = 0;
  let ch = 0;
  let isLng = true;

  while (hash.length < precision) {
    if (isLng) {
      const mid = (lngRange.min + lngRange.max) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        lngRange.min = mid;
      } else {
        lngRange.max = mid;
      }
    } else {
      const mid = (latRange.min + latRange.max) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        latRange.min = mid;
      } else {
        latRange.max = mid;
      }
    }

    isLng = !isLng;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

/**
 * Get geohash bounds for a given geohash prefix
 * @param hash - Geohash prefix
 * @returns Bounding box { minLat, maxLat, minLng, maxLng }
 */
export function decodeGeohashBounds(hash: string): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latRange = { min: -90, max: 90 };
  const lngRange = { min: -180, max: 180 };
  let isLng = true;

  for (const char of hash) {
    const idx = BASE32.indexOf(char);
    if (idx === -1) continue;

    for (let bit = 4; bit >= 0; bit--) {
      const bitValue = (idx >> bit) & 1;
      if (isLng) {
        const mid = (lngRange.min + lngRange.max) / 2;
        if (bitValue === 1) {
          lngRange.min = mid;
        } else {
          lngRange.max = mid;
        }
      } else {
        const mid = (latRange.min + latRange.max) / 2;
        if (bitValue === 1) {
          latRange.min = mid;
        } else {
          latRange.max = mid;
        }
      }
      isLng = !isLng;
    }
  }

  return {
    minLat: latRange.min,
    maxLat: latRange.max,
    minLng: lngRange.min,
    maxLng: lngRange.max,
  };
}

/**
 * Get neighboring geohashes (8 directions + center)
 * @param hash - Center geohash
 * @returns Array of 9 geohashes (center + 8 neighbors)
 */
export function getGeohashNeighbors(hash: string): string[] {
  const bounds = decodeGeohashBounds(hash);
  const latCenter = (bounds.minLat + bounds.maxLat) / 2;
  const lngCenter = (bounds.minLng + bounds.maxLng) / 2;
  const latDelta = bounds.maxLat - bounds.minLat;
  const lngDelta = bounds.maxLng - bounds.minLng;
  const precision = hash.length;

  const neighbors: string[] = [hash]; // center

  // 8 directions
  const directions = [
    { lat: latDelta, lng: 0 },       // N
    { lat: latDelta, lng: lngDelta }, // NE
    { lat: 0, lng: lngDelta },        // E
    { lat: -latDelta, lng: lngDelta },// SE
    { lat: -latDelta, lng: 0 },       // S
    { lat: -latDelta, lng: -lngDelta },// SW
    { lat: 0, lng: -lngDelta },       // W
    { lat: latDelta, lng: -lngDelta }, // NW
  ];

  for (const dir of directions) {
    const newLat = latCenter + dir.lat;
    const newLng = lngCenter + dir.lng;
    
    // Skip if out of bounds
    if (newLat < -90 || newLat > 90 || newLng < -180 || newLng > 180) {
      continue;
    }
    
    neighbors.push(encodeGeohash(newLat, newLng, precision));
  }

  return [...new Set(neighbors)]; // Remove duplicates
}

/**
 * Get geohash precision for a given radius in km
 * Returns the precision that best covers the radius
 * @param radiusKm - Radius in kilometers
 * @returns Geohash precision (1-9)
 */
export function getGeohashPrecisionForRadius(radiusKm: number): number {
  // Approximate geohash precision vs cell size (at equator)
  // Precision 1: ~5000km, 2: ~1250km, 3: ~156km, 4: ~39km, 
  // 5: ~4.9km, 6: ~1.2km, 7: ~153m, 8: ~38m, 9: ~4.8m
  if (radiusKm > 1000) return 1;
  if (radiusKm > 250) return 2;
  if (radiusKm > 50) return 3;
  if (radiusKm > 15) return 4;
  if (radiusKm > 3) return 5;
  if (radiusKm > 0.5) return 6;
  return 7;
}

/**
 * Get geohash queries for a radius search
 * @param center - Center coordinates
 * @param radiusKm - Search radius in km
 * @returns Array of geohash prefixes to query
 */
export function getGeohashQueriesForRadius(
  center: Coordinates,
  radiusKm: number
): { start: string; end: string }[] {
  const precision = getGeohashPrecisionForRadius(radiusKm);
  const centerHash = encodeGeohash(center.lat, center.lng, precision);
  const neighbors = getGeohashNeighbors(centerHash);
  
  // Create range queries for each neighbor
  return neighbors.map(hash => ({
    start: hash,
    end: hash + "~", // ~ is after z in ASCII, so this covers all extensions
  }));
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 * @param km - Distance in kilometers
 * @returns Formatted string (e.g., "500 m" or "5.2 km")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Sort items by distance from a reference point
 * @param items - Array of items with coordinates
 * @param from - Reference coordinates
 * @param getCoordinates - Function to extract coordinates from item
 * @returns Sorted array with distance property added
 */
export function sortByDistance<T>(
  items: T[],
  from: Coordinates,
  getCoordinates: (item: T) => Coordinates
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(from, getCoordinates(item)),
    }))
    .sort((a, b) => a.distance - b.distance);
}
