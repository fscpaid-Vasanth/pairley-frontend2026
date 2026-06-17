import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Users, Zap } from 'lucide-react';
import { formatPrice, calculateSavings } from '../utils/constants';
import { getCategoryById } from '../data/categories';
import ImageWithFallback from './ImageWithFallback';
import './DealCard.css';

export default function DealCard({ deal, onClick }) {
  const [wishlisted, setWishlisted] = useState(false);

  const category = getCategoryById(deal.category);
  const { saved, percentage } = calculateSavings(deal.originalPrice, deal.pairleyPrice);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const isPair = deal.mode === 'pair';
  const maxSlots  = isPair ? 2 : (deal.maxParticipants || 10);
  const joinedNum = Math.min(deal.interestCount || 0, maxSlots);
  const joinedText = `${joinedNum}/${maxSlots} Joined`;
  const progressPct = Math.round((joinedNum / maxSlots) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/deals/${deal.id}`} className="deal-card" onClick={onClick}>

        {/* ── Image ── */}
        <div className="deal-card__image-wrap">
          <ImageWithFallback
            src={deal.images?.[0]}
            alt={deal.title}
            className="deal-card__image"
            fallbackType="deal"
            category={deal.category}
          />

          {/* BOGO / GROUP badge */}
          <span className={`deal-card__type-tag ${!isPair ? 'deal-card__type-tag--group' : ''}`}>
            {isPair ? '🤝 BOGO' : '👥 GROUP'}
          </span>

          {/* Category tag */}
          {category && (
            <span className="deal-card__cat-tag">
              {category.icon} {category.name}
            </span>
          )}

          {/* Wishlist */}
          <button
            className={`deal-card__wishlist ${wishlisted ? 'deal-card__wishlist--active' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={15} fill={wishlisted ? '#EF4444' : 'none'} strokeWidth={2} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="deal-card__content">
          <h3 className="deal-card__title">{deal.title}</h3>

          <div className="deal-card__merchant">
            <span className="deal-card__merchant-name">{deal.businessOwner?.name || 'Local Seller'}</span>
            <span className="deal-card__location">
              <MapPin size={10} /> {deal.location}
            </span>
          </div>

          {/* Joined badge */}
          <div className="deal-card__joined-badge">
            <Users size={12} color="#4E2BC4" />
            <span className="deal-card__joined-text">{joinedText}</span>
          </div>

          {/* Progress bar */}
          <div className="deal-card__progress-wrap">
            <div className="deal-card__progress-label">
              <span>Group filling up</span>
              <span style={{ color: '#4E2BC4', fontWeight: 800 }}>{progressPct}%</span>
            </div>
            <div className="deal-card__progress-bar">
              <div
                className="deal-card__progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Bottom: price + savings */}
          <div className="deal-card__bottom">
            <div>
              <span className="deal-card__price-pairley">{formatPrice(deal.pairleyPrice)}</span>
              <span className="deal-card__price-original">{formatPrice(deal.originalPrice)}</span>
            </div>
            <div className="deal-card__savings-badge">
              <Zap size={10} style={{ marginRight: 3 }} />
              {percentage}% OFF
            </div>
          </div>

          {/* Hover CTA */}
          <div className="deal-card__join-cta">Join This Deal →</div>
        </div>
      </Link>
    </motion.div>
  );
}
