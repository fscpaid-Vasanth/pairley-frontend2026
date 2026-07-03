import { useMemo } from 'react';
import { haversineDistance } from '../utils/geo';

/**
 * Filters and sorts deals by proximity to the user.
 *
 * @param {object} params
 * @param {Array}  params.deals     - Raw deal objects from the data source
 * @param {number} params.userLat   - User's current latitude
 * @param {number} params.userLng   - User's current longitude
 * @param {number} [params.radiusKm=5] - Radius threshold in kilometres
 * @param {string} [params.userCity]   - User's city name (used for city-based fallback matching)
 *
 * @returns {{
 *   nearbyDeals: Array,
 *   sortedByDistance: Array,
 *   withinRadius: Array
 * }}
 */
export function useNearbyDeals({
  deals = [],
  userLat,
  userLng,
  radiusKm = 5,
  userCity = '',
}) {
  const hasUserLocation = userLat != null && userLng != null;

  const dealsWithDistance = useMemo(() => {
    if (!hasUserLocation) {
      return deals.map((deal) => ({ ...deal, distance: null }));
    }

    return deals.map((deal) => {
      const hasCoords =
        deal.latitude != null && deal.longitude != null;

      if (hasCoords) {
        const distance = haversineDistance(
          userLat,
          userLng,
          deal.latitude,
          deal.longitude
        );
        return { ...deal, distance };
      }

      // City-based fallback: treat same-city deals as nearby (0 km offset)
      if (
        deal.city &&
        userCity &&
        deal.city.trim().toLowerCase() === userCity.trim().toLowerCase()
      ) {
        return { ...deal, distance: 0 };
      }

      // No location data — push to the end
      return { ...deal, distance: null };
    });
  }, [deals, userLat, userLng, userCity, hasUserLocation]);

  const sortedByDistance = useMemo(() => {
    const copy = [...dealsWithDistance];
    copy.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    return copy;
  }, [dealsWithDistance]);

  const withinRadius = useMemo(() => {
    return sortedByDistance.filter(
      (deal) => deal.distance !== null && deal.distance <= radiusKm
    );
  }, [sortedByDistance, radiusKm]);

  // nearbyDeals = sortedByDistance for convenience (alias used in most UI contexts)
  const nearbyDeals = sortedByDistance;

  return { nearbyDeals, sortedByDistance, withinRadius };
}

export default useNearbyDeals;
