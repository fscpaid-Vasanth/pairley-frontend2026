import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

// Single source of truth for "is this offer saved" across a page — fetches
// the customer's saved offers once (not per-card), and exposes both the raw
// offer list (for SavedOffersPage, which needs full offer data) and an id
// Set (for DealsPage/DealDetailPage, which only need membership checks).
// Anonymous visitors get an empty set and a no-op toggle (DealCard already
// falls back to its own local-only behavior when no onToggleSave is passed
// through, but pages can also just not use this hook when logged out).
export function useSavedOffers() {
  const [savedOffers, setSavedOffers] = useState([]);
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
        setSavedOffers(data || []);
        setSavedIds(new Set((data || []).map((o) => o.id)));
      })
      .catch((err) => console.error('Failed to load saved offers:', err))
      .finally(() => setLoaded(true));
  }, []);

  // Only ever called with currentlySaved=false from a page that doesn't
  // render from `savedOffers` (DealsPage/DealDetailPage) — SavedOffersPage
  // only ever unsaves, since every card it renders already came from
  // savedOffers. So the "add" branch doesn't need to synthesize a full
  // offer object into savedOffers; only the "remove" branch touches it.
  const toggleSave = useCallback((offerId, currentlySaved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(offerId);
      else next.add(offerId);
      return next;
    });
    if (currentlySaved) {
      setSavedOffers((prev) => prev.filter((o) => o.id !== offerId));
    }

    const request = currentlySaved
      ? api.delete(`/customers/save-offer?offerId=${offerId}`)
      : api.post('/customers/save-offer', { offerId });

    request.catch((err) => {
      console.error('Failed to update saved offer:', err);
      // Roll back the optimistic update on failure. (Re-adding a removed
      // offer's full data back into savedOffers isn't attempted here — a
      // failed unsave on the Saved Offers page is rare enough that a
      // manual refresh is an acceptable fallback rather than caching the
      // removed object just for this edge case.)
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.add(offerId);
        else next.delete(offerId);
        return next;
      });
    });
  }, []);

  return { savedOffers, savedIds, loaded, toggleSave };
}

export default useSavedOffers;
