import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { X, MapPin, Check } from 'lucide-react';
import { reverseGeocode } from '../utils/geo';
import './GroupChatMapPicker.css';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

/**
 * Click-to-drop-a-pin location picker for structured LOCATION group chat
 * messages. Copies MapView.jsx's useJsApiLoader/GoogleMap scaffolding
 * (same API key, same installed library) stripped of the deals/markers
 * logic — real click-to-pin, not a mock. Never auto-shares a location;
 * the user must explicitly click a point and confirm before anything is
 * sent (see onConfirm, only invoked by the "Share this location" button).
 */
export default function GroupChatMapPicker({ initialCenter, onConfirm, onCancel }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    id: 'pairley-google-map',
  });

  const [pin, setPin] = useState(null);
  const [resolving, setResolving] = useState(false);

  const center = useMemo(
    () => (initialCenter?.lat != null ? initialCenter : INDIA_CENTER),
    [initialCenter]
  );

  const handleMapClick = useCallback((e) => {
    setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const handleConfirm = async () => {
    if (!pin) return;
    setResolving(true);
    try {
      const geo = await reverseGeocode(pin.lat, pin.lng);
      const label = geo.formattedAddress || 'Pinned location';
      onConfirm({ lat: pin.lat, lng: pin.lng, label, source: 'MAP_PICK' });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="group-chat-map-picker__overlay">
      <div className="group-chat-map-picker__panel">
        <div className="group-chat-map-picker__header">
          <span>
            <MapPin size={14} /> Pick a location
          </span>
          <button type="button" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="group-chat-map-picker__map">
          {!apiKey || loadError ? (
            <div className="group-chat-map-picker__placeholder">
              Map is unavailable right now.
            </div>
          ) : !isLoaded ? (
            <div className="group-chat-map-picker__placeholder">Loading map…</div>
          ) : (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={pin ?? center}
              zoom={pin ? 15 : 5}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
              onClick={handleMapClick}
            >
              {pin && <Marker position={pin} />}
            </GoogleMap>
          )}
        </div>

        <div className="group-chat-map-picker__footer">
          <p>{pin ? 'Tap confirm to share this pin with the group.' : 'Tap anywhere on the map to drop a pin.'}</p>
          <button
            type="button"
            className="group-chat-map-picker__confirm"
            disabled={!pin || resolving}
            onClick={handleConfirm}
          >
            <Check size={14} /> {resolving ? 'Sharing…' : 'Share this location'}
          </button>
        </div>
      </div>
    </div>
  );
}
