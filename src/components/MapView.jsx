import React, { useState, useCallback, useMemo } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from '@react-google-maps/api';
import './MapView.css';

/* ── Dark/premium map style ── */
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1035' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1035' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a78bfa' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c4b5fd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b5cf6' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e1250' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6d28d9' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d1b6b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3b2a7a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#5B12D6' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#6d28d9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ddd6fe' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2d1b6b' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a78bfa' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f0a2a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5B12D6' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1035' }],
  },
];

/* ── Map container style (inline, required by @react-google-maps/api) ── */
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

/* ── Default center: India ── */
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

/* ── Placeholder when no API key ── */
function MapPlaceholder() {
  return (
    <div className="map-placeholder">
      <div className="map-placeholder__icon">🗺️</div>
      <div className="map-placeholder__text">
        <strong>Map View</strong>
        <br />
        Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>.env</code> to
        enable interactive map
      </div>
    </div>
  );
}

/* ── Format distance for InfoWindow ── */
function formatDistKm(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/* ── Haversine (inline copy so MapView is self-contained) ── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Inner map (rendered only when API is loaded) ── */
function InnerMap({ deals, userLat, userLng, onDealClick }) {
  const [activeId, setActiveId] = useState(null);

  const center = useMemo(
    () =>
      userLat != null && userLng != null
        ? { lat: Number(userLat), lng: Number(userLng) }
        : INDIA_CENTER,
    [userLat, userLng]
  );

  const zoom = userLat != null ? 13 : 5;

  const handleMarkerClick = useCallback(
    (deal) => {
      setActiveId((prev) => (prev === deal._id ? null : deal._id));
    },
    []
  );

  const handleInfoClose = useCallback(() => setActiveId(null), []);

  const activeDeal = useMemo(
    () => deals.find((d) => d._id === activeId) ?? null,
    [deals, activeId]
  );

  /* Purple SVG marker icon for deals */
  const dealIcon = useMemo(
    () => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#5B12D6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 1.5,
      scale: 1.8,
      anchor:
        typeof window !== 'undefined' && window.google
          ? new window.google.maps.Point(12, 22)
          : undefined,
    }),
    []
  );

  /* Blue SVG marker icon for user */
  const userIcon = useMemo(
    () => ({
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#2563eb',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 2,
      anchor:
        typeof window !== 'undefined' && window.google
          ? new window.google.maps.Point(12, 22)
          : undefined,
    }),
    []
  );

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={zoom}
      options={{
        styles: DARK_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      }}
      onClick={handleInfoClose}
    >
      {/* User location marker */}
      {userLat != null && userLng != null && (
        <Marker
          position={{ lat: Number(userLat), lng: Number(userLng) }}
          icon={userIcon}
          label={{
            text: 'You',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
          }}
          title="Your Location"
          zIndex={999}
        />
      )}

      {/* Deal markers */}
      {deals.map((deal) => {
        const lat = deal.lat ?? deal.latitude ?? deal.location?.lat;
        const lng = deal.lng ?? deal.longitude ?? deal.location?.lng;
        if (lat == null || lng == null) return null;

        return (
          <Marker
            key={deal._id}
            position={{ lat: Number(lat), lng: Number(lng) }}
            icon={dealIcon}
            title={deal.title}
            onClick={() => handleMarkerClick(deal)}
            zIndex={activeId === deal._id ? 100 : 1}
          />
        );
      })}

      {/* InfoWindow for active deal */}
      {activeDeal && (() => {
        const lat = activeDeal.lat ?? activeDeal.latitude ?? activeDeal.location?.lat;
        const lng = activeDeal.lng ?? activeDeal.longitude ?? activeDeal.location?.lng;
        if (lat == null || lng == null) return null;

        const originalPrice = activeDeal.originalPrice ?? activeDeal.price ?? activeDeal.mrp ?? 0;
        const pairleyPrice = activeDeal.pairleyPrice ?? activeDeal.discountedPrice ?? originalPrice;
        const distKm =
          userLat != null && userLng != null
            ? haversine(Number(userLat), Number(userLng), Number(lat), Number(lng))
            : null;
        const distLabel = formatDistKm(distKm);

        return (
          <InfoWindow
            position={{ lat: Number(lat), lng: Number(lng) }}
            onCloseClick={handleInfoClose}
            options={{ pixelOffset: typeof window !== 'undefined' && window.google ? new window.google.maps.Size(0, -36) : undefined }}
          >
            <div
              style={{
                minWidth: 160,
                maxWidth: 200,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              onClick={() => onDealClick && onDealClick(activeDeal)}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#1e1b4b',
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {activeDeal.title ?? 'Deal'}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#6b7280',
                  marginBottom: 4,
                }}
              >
                {activeDeal.merchantName ?? activeDeal.merchant?.name ?? ''}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: '#5B12D6',
                  }}
                >
                  ₹{pairleyPrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > pairleyPrice && (
                  <span
                    style={{
                      textDecoration: 'line-through',
                      fontSize: 11,
                      color: '#9ca3af',
                    }}
                  >
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {distLabel && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: '#6d28d9',
                    fontWeight: 700,
                  }}
                >
                  📍 {distLabel} away
                </div>
              )}
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: '#5B12D6',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                View Deal →
              </div>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}

/* ── Main export ── */
export default function MapView({ deals = [], userLat, userLng, onDealClick }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    id: 'pairley-google-map',
  });

  if (!apiKey) {
    return (
      <div className="map-view">
        <MapPlaceholder />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="map-view">
        <div className="map-placeholder">
          <div className="map-placeholder__icon">⚠️</div>
          <div className="map-placeholder__text">
            Failed to load Google Maps.
            <br />
            Check your API key and network.
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-view">
        <div className="map-placeholder">
          <div className="map-placeholder__icon" style={{ fontSize: 32 }}>
            ⏳
          </div>
          <div className="map-placeholder__text">Loading map…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view">
      <InnerMap
        deals={deals}
        userLat={userLat}
        userLng={userLng}
        onDealClick={onDealClick}
      />
    </div>
  );
}

