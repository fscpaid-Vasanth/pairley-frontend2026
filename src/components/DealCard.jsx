import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Users, Zap, Clock, Share2 } from 'lucide-react';
import { formatPrice, calculateSavings } from '../utils/constants';
import { getCategoryById } from '../data/categories';
import { getDealMode, getOfferTypeIcon, getOfferTypeMeta } from '../utils/offerTypes';
import { getOfferBadgeMeta } from '../utils/offerBadges';
import ImageWithFallback from './ImageWithFallback';
import './DealCard.css';

// ── Countdown Timer helper ──────────────────────────────────────────────────
function useCountdown(endDate) {
  const getRemaining = () => {
    if (!endDate) return null;
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { expired: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, expired: false, urgent: diff < 86400000 };
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (!endDate) return;
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return remaining;
}

// ── CountdownBadge component ─────────────────────────────────────────────────
function CountdownBadge({ endDate }) {
  const r = useCountdown(endDate);
  if (!r) return null;
  if (r.expired) return (
    <span className="deal-card__timer deal-card__timer--expired">❌ Expired</span>
  );
  if (r.urgent) return (
    <span className="deal-card__timer deal-card__timer--urgent">
      🔥 {String(r.h).padStart(2,'0')}:{String(r.m).padStart(2,'0')}:{String(r.s).padStart(2,'0')} left
    </span>
  );
  return (
    <span className="deal-card__timer">
      ⏳ {r.d}d {String(r.h).padStart(2,'0')}:{String(r.m).padStart(2,'0')}
    </span>
  );
}

// ── Main DealCard ─────────────────────────────────────────────────────────────
export default function DealCard({ deal, onClick, distance }) {
  const [wishlisted, setWishlisted] = useState(false);

  const category = getCategoryById(deal.category);
  const { saved, percentage } = calculateSavings(deal.originalPrice, deal.pairleyPrice);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: deal.title, url: `${window.location.origin}/deals/${deal.id || deal._id}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deals/${deal.id || deal._id}`).catch(() => {});
    }
  };

  const badgeMeta  = getOfferBadgeMeta(deal.badge);
  const mode       = getDealMode(deal);
  const isPair     = mode === 'pair';
  const isStandard = mode === 'standard';
  const maxSlots   = isPair ? 2 : (deal.maxParticipants || deal.required_people || 10);
  const joinedNum  = Math.min(deal.interestCount || deal.joined_people || 0, maxSlots);
  const joinedText = `${joinedNum}/${maxSlots} Joined`;
  const progressPct = Math.min(Math.round((joinedNum / maxSlots) * 100), 100);
  const remaining  = Math.max(0, maxSlots - joinedNum);

  const dealId    = deal.id || deal._id;
  const dealLink  = `/deals/${dealId}`;
  const endDate   = deal.endDate || deal.expires_at || deal.end_date;

  // Savings amount display
  const savingsAmt = saved > 0 ? formatPrice(saved) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={dealLink} className={`deal-card deal-card--${mode}`} onClick={onClick}>

        {/* ── Image ── */}
        <div className="deal-card__image-wrap">
          <ImageWithFallback
            src={deal.images?.[0] || deal.offer_image}
            alt={deal.title}
            className="deal-card__image"
            fallbackType="deal"
            category={deal.category}
          />

          {/* Offer type badge */}
          <span className={`deal-card__type-tag ${!isPair ? 'deal-card__type-tag--group' : ''}`}>
            {isStandard
              ? `${getOfferTypeIcon(deal.offer_type)} ${getOfferTypeMeta(deal.offer_type).shortLabel.toUpperCase()}`
              : isPair ? '🤝 BOGO' : '👥 GROUP'}
          </span>

          {/* Category tag */}
          {category && (
            <span className="deal-card__cat-tag">
              {category.icon} {category.name}
            </span>
          )}

          {/* Distance badge */}
          {distance !== null && distance !== undefined && (
            <span className="deal-card__distance-badge">
              📍 {typeof distance === 'number'
                ? distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)} KM`
                : distance}
            </span>
          )}

          {/* Countdown timer — overlaid bottom-right on image */}
          {endDate && (
            <div className="deal-card__timer-wrap">
              <CountdownBadge endDate={endDate} />
            </div>
          )}

          {/* Action buttons */}
          <div className="deal-card__actions">
            <button
              className={`deal-card__wishlist ${wishlisted ? 'deal-card__wishlist--active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={15} fill={wishlisted ? '#EF4444' : 'none'} strokeWidth={2} />
            </button>
            <button
              className="deal-card__share"
              onClick={handleShare}
              aria-label="Share deal"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="deal-card__content">
          <h3 className="deal-card__title">{deal.title}</h3>

          <div className="deal-card__merchant">
            <span className="deal-card__merchant-name">
              {deal.businessOwner?.name || deal.business_name || 'Local Seller'}
            </span>
            <span className="deal-card__location">
              <MapPin size={10} /> {deal.location || deal.city || ''}
            </span>
          </div>

          {badgeMeta && (
            <span className="deal-card__origin-badge">
              {badgeMeta.icon} {badgeMeta.label}
            </span>
          )}

          {/* Joined badge / progress — only applies to legacy pair/group
              matching, which is the only mechanic that tracks capacity. */}
          {!isStandard && (
            <>
              <div className="deal-card__joined-badge">
                <Users size={12} color="#5B12D6" />
                <span className="deal-card__joined-text">{joinedText}</span>
                {remaining > 0 && remaining <= 5 && (
                  <span className="deal-card__urgency">Only {remaining} left!</span>
                )}
              </div>

              <div className="deal-card__progress-wrap">
                <div className="deal-card__progress-label">
                  <span>Group filling up</span>
                  <span style={{ color: '#5B12D6', fontWeight: 800 }}>{progressPct}%</span>
                </div>
                <div className="deal-card__progress-bar">
                  <motion.div
                    className="deal-card__progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Bottom: price + savings */}
          <div className="deal-card__bottom">
            <div>
              <span className="deal-card__price-pairley">{formatPrice(deal.pairleyPrice || deal.offer_price)}</span>
              <span className="deal-card__price-original">{formatPrice(deal.originalPrice || deal.original_price)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div className="deal-card__savings-badge">
                <Zap size={10} style={{ marginRight: 3 }} />
                {percentage}% OFF
              </div>
              {savingsAmt && (
                <div className="deal-card__save-amount">💰 Save {savingsAmt}</div>
              )}
            </div>
          </div>

          {/* Hover CTA */}
          <div className="deal-card__join-cta">{isStandard ? 'Show Interest →' : 'Join This Deal →'}</div>
        </div>
      </Link>
    </motion.div>
  );
}

