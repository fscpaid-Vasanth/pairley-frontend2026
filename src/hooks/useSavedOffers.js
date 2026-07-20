import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// Single source of truth for "is this offer saved" across a page — fetches
// the customer's saved-offer ids once (not per-card), and exposes an
// optimistic toggle that calls the real backend and rolls back on failure.
// Anonymous visitors get an empty set and a no-op toggle (DealCard already
// falls back to its own local-only behavior when no onToggleSave is passed
// through, but pages can also just not use this hook when logged out).
export function useSavedOffers() {
  const [savedIds, setSavedIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pairley_token');
    if (!token) {
      setLoaded(true);
      return;
    }
    api.get('/customers/saved-offers')
      .then((data) => {
        setSavedIds(new Set((data || []).map((o) => o.id)));
      })
      .catch((err) => console.error('Failed to load saved offers:', err))
      .finally(() => setLoaded(true));
  }, []);

  const toggleSave = useCallback((offerId, currentlySaved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(offerId);
      else next.add(offerId);
      return next;
    });

    const request = currentlySaved
      ? api.delete(`/customers/save-offer?offerId=${offerId}`)
      : api.post('/customers/save-offer', { offerId });

    request.catch((err) => {
      console.error('Failed to update saved offer:', err);
      // Roll back the optimistic update on failure.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.add(offerId);
        else next.delete(offerId);
        return next;
      });
    });
  }, []);

  return { savedIds, loaded, toggleSave };
}

export default useSavedOffers;
