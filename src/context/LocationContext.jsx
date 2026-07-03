import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { getUserLocation, reverseGeocode, haversineDistance } from '../utils/geo';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pairley_location';

const DEFAULT_LOCATION = {
  lat: null,
  lng: null,
  city: '',
  area: '',
  locality: '',
  pincode: '',
  formattedAddress: '',
};

// ─── Context ──────────────────────────────────────────────────────────────────

const LocationContext = createContext(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic sanity check — must at least have lat/lng
    if (parsed && parsed.lat != null && parsed.lng != null) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(locationObj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locationObj));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = loadFromStorage();
    return saved || DEFAULT_LOCATION;
  });

  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prevent double auto-detect on strict-mode double-mount
  const hasAutoDetected = useRef(false);

  // ── Persist location whenever it changes ──────────────────────────────────
  useEffect(() => {
    if (location.lat != null && location.lng != null) {
      saveToStorage(location);
    }
  }, [location]);

  // ── Request permission ────────────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    setError(null);
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await Geolocation.requestPermissions();
        const status =
          result.location === 'granted' ? 'granted' : 'denied';
        setPermissionStatus(status);
        return status;
      } else {
        // Web: trigger the browser permission dialog by requesting position
        const granted = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 10000 }
          );
        });
        const status = granted ? 'granted' : 'denied';
        setPermissionStatus(status);
        return status;
      }
    } catch (err) {
      setPermissionStatus('denied');
      setError('Permission request failed.');
      return 'denied';
    }
  }, []);

  // ── Refresh / detect location ─────────────────────────────────────────────
  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { lat, lng } = await getUserLocation();
      const geoData = await reverseGeocode(lat, lng);

      const updated = {
        lat,
        lng,
        city: geoData.city,
        area: geoData.area,
        locality: geoData.locality,
        pincode: geoData.pincode,
        formattedAddress: geoData.formattedAddress,
      };

      setLocation(updated);
      setPermissionStatus('granted');
      return updated;
    } catch (err) {
      const message =
        err?.message || 'Could not detect location. Please try again.';
      setError(message);

      // If the error is a permission denial, update the status
      if (
        err?.code === 1 || // GeolocationPositionError.PERMISSION_DENIED
        message.toLowerCase().includes('denied') ||
        message.toLowerCase().includes('permission')
      ) {
        setPermissionStatus('denied');
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Manual location override ──────────────────────────────────────────────
  const setManualLocation = useCallback((locationObj) => {
    setError(null);
    setLocation((prev) => ({
      ...prev,
      ...locationObj,
    }));
  }, []);

  // ── Silent auto-detect on mount ───────────────────────────────────────────
  useEffect(() => {
    if (hasAutoDetected.current) return;
    hasAutoDetected.current = true;

    const silentDetect = async () => {
      try {
        // Check existing permission without prompting
        let alreadyGranted = false;

        if (Capacitor.isNativePlatform()) {
          const result = await Geolocation.checkPermissions();
          alreadyGranted = result.location === 'granted';
        } else if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: 'geolocation',
          });
          alreadyGranted = result.state === 'granted';
        }

        if (alreadyGranted) {
          setPermissionStatus('granted');

          // Only auto-refresh if we have no existing location or it's stale
          const saved = loadFromStorage();
          if (!saved) {
            await refreshLocation();
          }
        } else if (!alreadyGranted && navigator.permissions) {
          const result = await navigator.permissions.query({
            name: 'geolocation',
          });
          if (result.state === 'denied') {
            setPermissionStatus('denied');
          }
        }
      } catch {
        // Silently ignore — user hasn't interacted yet
      }
    };

    silentDetect();
  }, [refreshLocation]);

  // ─── Context Value ──────────────────────────────────────────────────────────
  const value = {
    location,
    permissionStatus,
    isLoading,
    error,
    requestPermission,
    refreshLocation,
    setManualLocation,
    // Convenience accessors
    city: location.city,
    area: location.area,
    hasLocation: location.lat != null && location.lng != null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error(
      'useLocationContext must be used within a <LocationProvider>.'
    );
  }
  return ctx;
}

// ─── Default export (the raw context, for advanced use-cases) ─────────────────

export default LocationContext;
