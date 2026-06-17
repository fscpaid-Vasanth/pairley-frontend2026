import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Star,
  MapPin,
  Calendar,
  Clock,
  Share2,
  Link2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  PackageSearch,
  ArrowLeft,
  TrendingDown,
} from 'lucide-react';
import DealCard from '../components/DealCard';
import InterestButton from '../components/InterestButton';
import PricingTierCard from '../components/PricingTierCard';
import ImageWithFallback from '../components/ImageWithFallback';
import { getDealById, mockDeals } from '../data/mockDeals';
import {
  formatPrice,
  calculateSavings,
  getDaysRemaining,
} from '../utils/constants';
import { getCategoryById } from '../data/categories';
import './DealDetailPage.css';

/* Mock terms for the accordion */
const MOCK_TERMS = [
  {
    question: 'How does the pairing process work?',
    answer:
      'Once you show interest, you\'ll be matched with another interested person. Both participants must confirm the pairing to lock in the deal price. You\'ll be notified via app and email.',
  },
  {
    question: 'What is the refund / cancellation policy?',
    answer:
      'Full refund available up to 48 hours before deal expiry if your pair/group doesn\'t fill. Once paired, the deal is binding and refunds follow the business\'s standard policy.',
  },
  {
    question: 'Can I choose my pair partner?',
    answer:
      'Pairing is automatic to ensure fairness. However, you can invite a friend via the "Invite a Friend" link and they\'ll be matched with you directly.',
  },
  {
    question: 'Are there any payments in the app?',
    answer:
      'No. Pairley has deactivated online payments. All transactions and checkouts are handled offline directly with the shop owner once they contact you.',
  },
];

/* Generate mock interested-user avatars */
const MOCK_INTERESTED_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=User1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=User2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=User3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=User4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=User5',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const DealDetailPage = () => {
  const { id } = useParams();
  const deal = getDealById(id);
  const [openTermIndex, setOpenTermIndex] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  /* ---- 404 ---- */
  if (!deal) {
    return (
      <div className="page-wrapper">
        <div className="deal-detail-page">
          <div className="container">
            <motion.div
              className="deal-not-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <div className="deal-not-found-icon">
                <PackageSearch />
              </div>
              <h2>Deal Not Found</h2>
              <p>The deal you're looking for doesn't exist or has been removed.</p>
              <Link to="/deals" className="btn btn-primary btn-lg">
                <ArrowLeft size={18} />
                Browse All Deals
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Helpers ---- */
  const category = getCategoryById(deal.category);
  const { saved, percentage } = calculateSavings(deal.originalPrice, deal.pairleyPrice);
  const daysLeft = getDaysRemaining(deal.validUntil);
  const isPair = deal.mode === 'pair';

  /* Similar deals: same category, exclude current, max 3 */
  const similarDeals = mockDeals
    .filter((d) => d.category === deal.category && d.id !== deal.id)
    .slice(0, 3);

  /* Stars helper */
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <span className="deal-owner-rating">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < full || (i === full && half) ? 'currentColor' : 'none'}
            strokeWidth={i < full ? 0 : 1.5}
          />
        ))}
        <span style={{ marginLeft: 4, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          {rating}
        </span>
      </span>
    );
  };

  /* Date formatter */
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  /* Copy link handler */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  /* WhatsApp share */
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out this deal on Pairley: ${deal.title} — ${window.location.href}`
  )}`;

  /* Twitter share */
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Just found an amazing deal on @Pairley: ${deal.title}`
  )}&url=${encodeURIComponent(window.location.href)}`;

  /* Interested avatars (show up to 4, then +N) */
  const shownAvatars = MOCK_INTERESTED_AVATARS.slice(0, Math.min(deal.interestCount, 4));
  const extraCount = Math.max(0, deal.interestCount - 4);

  return (
    <div className="page-wrapper">
      <div className="deal-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <motion.nav
            className="deal-breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Link to="/">Home</Link>
            <ChevronRight size={14} className="separator" />
            <Link to="/deals">Deals</Link>
            <ChevronRight size={14} className="separator" />
            <span className="current">{deal.title}</span>
          </motion.nav>

          {/* Two-column layout */}
          <div className="deal-detail-layout">
            {/* ===== LEFT COLUMN ===== */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">

              {/* Full-width hero image banner */}
              <div className="deal-hero-banner">
                <ImageWithFallback
                  className="deal-hero-image"
                  src={deal.images?.[0]}
                  alt={deal.title}
                  fallbackType="deal"
                  category={deal.category}
                />
                <div className="deal-hero-overlay" />
                <div className="deal-hero-bottom">
                  <div className="deal-hero-badges">
                    <span className={`deal-hero-badge ${isPair ? 'deal-hero-badge--type' : 'deal-hero-badge--group'}`}>
                      {isPair ? '🤝 BOGO Pair' : '👥 Group Deal'}
                    </span>
                    {category && (
                      <span className="deal-hero-badge deal-hero-badge--cat">
                        {category.icon} {category.name}
                      </span>
                    )}
                  </div>
                  <h1 className="deal-hero-title">{deal.title}</h1>
                </div>
              </div>

              {/* Business owner */}
              <div className="deal-owner-card">
                <ImageWithFallback
                  className="deal-owner-avatar"
                  src={deal.businessOwner.avatar}
                  alt={deal.businessOwner.name}
                  fallbackType="avatar"
                  name={deal.businessOwner.name}
                />
                <div className="deal-owner-info">
                  <div className="deal-owner-name">{deal.businessOwner.name}</div>
                  <div className="deal-owner-meta">
                    {renderStars(deal.businessOwner.rating)}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {deal.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="deal-description">{deal.description}</p>

              {/* Info cards */}
              <div className="deal-info-cards">
                <div className="deal-info-card">
                  <div className="deal-info-card-icon">
                    <Calendar />
                  </div>
                  <div className="deal-info-card-label">Valid Until</div>
                  <div className="deal-info-card-value">{formatDate(deal.validUntil)}</div>
                </div>
                <div className="deal-info-card">
                  <div className="deal-info-card-icon">
                    <MapPin />
                  </div>
                  <div className="deal-info-card-label">Location</div>
                  <div className="deal-info-card-value">{deal.location}</div>
                </div>
                <div className="deal-info-card">
                  <div className="deal-info-card-icon">
                    <Clock />
                  </div>
                  <div className="deal-info-card-label">Created On</div>
                  <div className="deal-info-card-value">{formatDate(deal.createdAt)}</div>
                </div>
              </div>

              {/* Share buttons */}
              <div className="deal-share-row">
                <button
                  className={`deal-share-btn ${linkCopied ? 'copied' : ''}`}
                  onClick={handleCopyLink}
                >
                  <Link2 size={15} />
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  className="deal-share-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </a>
                <a
                  className="deal-share-btn"
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 size={15} />
                  Twitter
                </a>
              </div>

              {/* Terms accordion */}
              <div className="deal-terms-section">
                <h3 className="deal-terms-title">Terms &amp; Conditions</h3>
                <div className="deal-terms-accordion">
                  {MOCK_TERMS.map((term, idx) => (
                    <div
                      key={idx}
                      className={`deal-terms-item ${openTermIndex === idx ? 'open' : ''}`}
                    >
                      <button
                        className="deal-terms-question"
                        onClick={() =>
                          setOpenTermIndex(openTermIndex === idx ? null : idx)
                        }
                      >
                        {term.question}
                        {openTermIndex === idx ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      <AnimatePresence>
                        {openTermIndex === idx && (
                          <motion.div
                            className="deal-terms-answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}
                          >
                            {term.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ===== RIGHT COLUMN (Sidebar) ===== */}
            <motion.aside
              className="deal-sidebar"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Premium Pricing Card */}
              <div className="deal-pricing-card">
                {/* Gradient header */}
                <div className="deal-pricing-card__header">
                  <div className="deal-pricing-card__label">
                    {isPair ? 'Pair Deal Price' : 'Group Deal — Starting From'}
                  </div>
                  <div className="deal-pricing-card__price-row">
                    <span className="deal-pricing-card__price-current">
                      {formatPrice(deal.pairleyPrice)}
                    </span>
                    <span className="deal-pricing-card__price-original">
                      {formatPrice(deal.originalPrice)}
                    </span>
                  </div>
                  <span className="deal-pricing-card__savings-pill">
                    <TrendingDown size={11} /> Save {percentage}% — ₹{saved} off
                  </span>
                </div>

                {/* Card body */}
                <div className="deal-pricing-card__body">
                  {/* Pair: per-person price */}
                  {isPair && (
                    <div className="deal-per-person">
                      <div className="deal-per-person-label">Each person pays</div>
                      <div className="deal-per-person-price">
                        {formatPrice(Math.round(deal.pairleyPrice / 2))}
                      </div>
                    </div>
                  )}

                  {/* Group: pricing tiers */}
                  {!isPair && deal.pricingTiers && (
                    <div className="deal-group-pricing">
                      <div className="deal-group-pricing-title">Group Pricing Tiers</div>
                      <PricingTierCard
                        tiers={deal.pricingTiers}
                        interestCount={deal.interestCount}
                      />
                    </div>
                  )}

                  {/* Interest button */}
                  <div className="deal-interest-area">
                    <InterestButton deal={deal} />
                  </div>

                  {/* Days remaining */}
                  {daysLeft > 0 && (
                    <div className={`deal-days-left ${daysLeft <= 7 ? 'deal-days-left--urgent' : 'deal-days-left--normal'}`}>
                      ⏰ {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                    </div>
                  )}
                </div>
              </div>

              {/* Interested people */}
              {deal.interestCount > 0 && (
                <div className="deal-interested-section">
                  <div className="deal-interested-avatars">
                    {shownAvatars.map((src, i) => (
                      <ImageWithFallback
                        key={i}
                        src={src}
                        alt="Interested user"
                        fallbackType="avatar"
                        name={`User ${i}`}
                      />
                    ))}
                    {extraCount > 0 && (
                      <div className="more-circle">+{extraCount}</div>
                    )}
                  </div>
                  <span className="deal-interested-text">
                    <strong>{deal.interestCount}</strong> people interested
                  </span>
                </div>
              )}
            </motion.aside>
          </div>

          {/* ===== Similar Deals ===== */}
          {similarDeals.length > 0 && (
            <motion.section
              className="deal-similar-section"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="deal-similar-header">Similar Deals</h2>
              <div className="deal-similar-grid">
                {similarDeals.map((d) => (
                  <DealCard key={d.id} deal={d} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetailPage;
