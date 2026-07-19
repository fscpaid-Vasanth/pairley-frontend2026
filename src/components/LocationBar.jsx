import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Navigation, X, Search } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import './LocationBar.css';

const CITY_SUGGESTIONS = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore',
  'Thane', 'Bhopal', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Coimbatore', 'Kochi', 'Chandigarh', 'Mysuru', 'Noida',
  'Gurgaon', 'Navi Mumbai', 'Amritsar', 'Agra', 'Nashik',
];

export default function LocationBar() {
  const { location, permissionStatus, isLoading, refreshLocation, setManualLocation } = useLocationContext();
  // LocationContext exposes { permissionStatus, isLoading, location }, not a
  // single combined status — derive the state this component actually
  // renders against from those.
  const status = isLoading
    ? 'loading'
    : permissionStatus === 'denied'
    ? 'denied'
    : location?.lat != null
    ? 'success'
    : location?.city
    ? 'manual'
    : 'idle';
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      setFilteredCities(
        CITY_SUGGESTIONS.filter((c) => c.toLowerCase().startsWith(q)).slice(0, 6)
      );
    } else {
      setFilteredCities(CITY_SUGGESTIONS.slice(0, 6));
    }
  }, [query]);

  useEffect(() => {
    if (modalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [modalOpen]);

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalOpen(false);
      }
    };
    if (modalOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modalOpen]);

  const handleCitySelect = (city) => {
    setManualLocation({ area: '', city });
    setModalOpen(false);
    setQuery('');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleCitySelect(query.trim());
    }
  };

  const displayArea = location?.area || '';
  const displayCity = location?.city || '';

  return (
    <>
      <motion.div
        className="location-bar"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Left: Icon + Text */}
        <div className="location-bar__left">
          <span className="location-bar__pin">
            <MapPin size={16} strokeWidth={2.5} />
          </span>

          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div
                key="loading"
                className="location-bar__loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="location-bar__spinner" />
                <span className="location-bar__loading-text">Detecting location...</span>
              </motion.div>
            )}

            {status === 'denied' && (
              <motion.button
                key="denied"
                className="location-bar__enable-btn"
                onClick={refreshLocation}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
              >
                <Navigation size={13} />
                Enable Location
              </motion.button>
            )}

            {(status === 'success' || status === 'manual') && (
              <motion.div
                key="location"
                className="location-bar__text"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {displayArea && (
                  <span className="location-bar__area">{displayArea}</span>
                )}
                {displayArea && displayCity && (
                  <span className="location-bar__separator">,&nbsp;</span>
                )}
                {displayCity && (
                  <span className="location-bar__city">{displayCity}</span>
                )}
                {!displayArea && !displayCity && (
                  <span className="location-bar__city">Select Location</span>
                )}
              </motion.div>
            )}

            {status === 'idle' && (
              <motion.div
                key="idle"
                className="location-bar__text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="location-bar__city">Select Location</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Change link */}
        <button
          className="location-bar__change"
          onClick={() => setModalOpen(true)}
          aria-label="Change location"
        >
          Change
          <ChevronDown size={13} className="location-bar__chevron" />
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="location-bar__modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="location-bar__modal"
              ref={modalRef}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Modal Header */}
              <div className="location-bar__modal-header">
                <h3 className="location-bar__modal-title">
                  <MapPin size={16} /> Choose Your City
                </h3>
                <button
                  className="location-bar__modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Input */}
              <form onSubmit={handleManualSubmit} className="location-bar__modal-form">
                <div className="location-bar__modal-input-wrap">
                  <Search size={15} className="location-bar__modal-search-icon" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="location-bar__modal-input"
                    placeholder="Type a city name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      className="location-bar__modal-clear"
                      onClick={() => setQuery('')}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </form>

              {/* Use GPS Button */}
              <button
                className="location-bar__modal-gps-btn"
                onClick={() => {
                  refreshLocation();
                  setModalOpen(false);
                }}
              >
                <Navigation size={14} />
                Use My Current Location
              </button>

              {/* City Suggestions */}
              <div className="location-bar__modal-suggestions">
                <p className="location-bar__modal-suggestions-label">
                  {query.trim() ? 'Matching Cities' : 'Popular Cities'}
                </p>
                <div className="location-bar__modal-city-grid">
                  {filteredCities.map((city) => (
                    <motion.button
                      key={city}
                      className={`location-bar__modal-city-btn${
                        displayCity === city ? ' location-bar__modal-city-btn--active' : ''
                      }`}
                      onClick={() => handleCitySelect(city)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {city}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

