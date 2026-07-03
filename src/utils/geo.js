import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the straight-line distance between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometres
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Formats a distance in kilometres to a human-readable string.
 * @param {number} km - Distance in kilometres
 * @returns {string} Formatted distance string
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)} KM away`;
}

/**
 * Reverse geocodes a lat/lng pair using the Google Maps Geocoding API.
 * Falls back gracefully when no API key is present or the request fails.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{ city: string, area: string, locality: string, pincode: string, formattedAddress: string }>}
 */
export async function reverseGeocode(lat, lng) {
  const fallback = {
    city: 'Your City',
    area: '',
    locality: '',
    pincode: '',
    formattedAddress: 'Location detected',
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return fallback;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return fallback;
    }

    const result = data.results[0];
    const components = result.address_components || [];
    const formattedAddress = result.formatted_address || 'Location detected';

    let city = '';
    let area = '';
    let locality = '';
    let pincode = '';

    components.forEach((component) => {
      const types = component.types || [];

      if (types.includes('locality')) {
        city = component.long_name;
      }

      if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        area = component.long_name;
      }

      if (types.includes('administrative_area_level_2')) {
        locality = component.long_name;
      }

      if (types.includes('postal_code')) {
        pincode = component.long_name;
      }
    });

    // Fallback: if city wasn't found via 'locality', try administrative_area_level_1
    if (!city) {
      const adminLevel1 = components.find((c) =>
        c.types.includes('administrative_area_level_1')
      );
      city = adminLevel1 ? adminLevel1.long_name : 'Your City';
    }

    return { city, area, locality, pincode, formattedAddress };
  } catch {
    return fallback;
  }
}

/**
 * Retrieves the user's current GPS position.
 * Uses @capacitor/geolocation on native platforms, navigator.geolocation on web.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export async function getUserLocation() {
  if (Capacitor.isNativePlatform()) {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
