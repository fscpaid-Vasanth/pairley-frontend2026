import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistance } from '../utils/geo';
import { useNearbyDeals } from '../hooks/useNearbyDeals';
import './NearbyDealsSection.css';

const CATEGORY_EMOJIS = {
  food: '🍔',
  restaurant: '🍽️',
  fashion: '👗',
  electronics: '📱',
  beauty: '💄',
  grocery: '🛒',
  fitness: '💪',
  travel: '✈️',
  entertainment: '🎬',
  health: '🏥',
  default: '🏷️',
};

function getCategoryEmoji(category = '') {
  const key = category.toLowerCase();
  return CATEGORY_EMOJIS[key] || CATEGORY_EMOJIS.default;
}

function getDiscountPercent(original, pairley) {
  if (!original || !pairley || original <= 0) return 0;
  return Math.round(((original - pairley) / original) * 100);
}

function getProgressPercent(deal) {
  const joined = deal.joinedCount ?? deal.currentParticipants ?? 0;
  const target = deal.targetParticipants ?? deal.minGroupSize ?? 1;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((joined / target) * 100));
}

function sortDeals(deals, sortBy) {
  const arr = [...deals];
  switch (sortBy) {
    case 'popularity':
      return arr.sort(
        (a, b) =>
          (b.joinedCount ?? b.currentParticipants ?? 0) -
          (a.joinedCount ?? a.currentParticipants ?? 0)
      );
    case 'discount':
      return arr.sort(
        (a, b) =>
          getDiscountPercent(b.originalPrice, b.pairleyPrice) -
          getDiscountPercent(a.originalPrice, a.pairleyPrice)
      );
    case 'expiry':
      return arr.sort(
        (a, b) =>
          new Date(a.expiresAt ?? a.endDate ?? 0) -
          new Date(b.expiresAt ?? b.endDate ?? 0)
      );
    case 'distance':
    default:
      return arr.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
}

export default function NearbyDealsSection({
  deals = [],
  userLat,
  userLng,
  title = 'Deals Near You',
  emoji = '🔥',
  maxDistance = 10,
  sortBy = 'distance',
}) {
  const navigate = useNavigate();

  // Single source of truth for distance computation/radius filtering — see
  // src/hooks/useNearbyDeals.js. This section's own popularity/discount/
  // expiry sort modes apply on top of the hook's within-radius result.
  const { withinRadius } = useNearbyDeals({
    deals,
    userLat,
    userLng,
    radiusKm: maxDistance,
  });

  const filteredDeals = useMemo(
    () => sortDeals(withinRadius, sortBy),
    [withinRadius, sortBy]
  );

  const headerLabel = `${emoji} ${title} (Within ${maxDistance} KM)`;

  return (
    <section className="nearby-section">
      <div className="nearby-section__header">
        <div className="nearby-section__title">
          <span>{headerLabel}</span>
          {filteredDeals.length > 0 && (
            <span className="nearby-section__badge">
              {filteredDeals.length} deals
            </span>
          )}
        </div>
        {filteredDeals.length > 0 && (
          <button
            className="nearby-section__see-all"
            onClick={() => navigate('/deals')}
          >
            See All →
          </button>
        )}
      </div>

      {filteredDeals.length === 0 ? (
        <div className="nearby-section__empty">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏙️</div>
          <div>No deals near you right now.</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
            Check back soon or expand your search area.
          </div>
        </div>
      ) : (
        <div className="nearby-scroll">
          {filteredDeals.map((deal, index) => {
            const originalPrice =
              deal.originalPrice ?? deal.price ?? deal.mrp ?? 0;
            const pairleyPrice =
              deal.pairleyPrice ?? deal.discountedPrice ?? originalPrice;
            const discountPct = getDiscountPercent(originalPrice, pairleyPrice);
            const progress = getProgressPercent(deal);
            const category = deal.category ?? deal.categoryName ?? '';
            const catEmoji = getCategoryEmoji(category);
            const imageUrl =
              deal.imageUrl ??
              deal.image ??
              deal.coverImage ??
              `https://picsum.photos/seed/${deal.id ?? index}/300/200`;
            const distLabel =
              deal.distance != null ? formatDistance(deal.distance) : null;

            return (
              <motion.div
                key={deal.id ?? index}
                className="nearby-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/deals/${deal.id}`)}
              >
                <div className="nearby-card__img-wrap">
                  <img
                    className="nearby-card__img"
                    src={imageUrl}
                    alt={deal.title ?? 'Deal'}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `https://picsum.photos/seed/fallback${index}/300/200`;
                    }}
                  />
                  {discountPct > 0 && (
                    <span className="nearby-card__discount-badge">
                      {discountPct}% OFF
                    </span>
                  )}
                  {distLabel && (
                    <span className="nearby-card__distance">
                      📍 {distLabel}
                    </span>
                  )}
                  <span className="nearby-card__cat-emoji">{catEmoji}</span>
                </div>

                <div className="nearby-card__body">
                  <div className="nearby-card__title">
                    {deal.title ?? 'Unnamed Deal'}
                  </div>
                  <div className="nearby-card__merchant">
                    {deal.merchantName ?? deal.merchant?.name ?? ''}
                  </div>

                  <div className="nearby-card__price-row">
                    {originalPrice > pairleyPrice && (
                      <span className="nearby-card__original">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="nearby-card__pairley">
                      ₹{pairleyPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="nearby-card__mini-bar">
                    <div
                      className="nearby-card__mini-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

