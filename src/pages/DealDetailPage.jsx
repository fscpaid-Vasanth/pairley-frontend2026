import { useState, useEffect } from 'react';
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
import { useToast } from '../context/ToastContext';
import ImageWithFallback from '../components/ImageWithFallback';
import { getDealById } from '../data/mockDeals';
import { useSavedOffers } from '../hooks/useSavedOffers';
import { api } from '../utils/api';
import {
  formatPrice,
  calculateSavings,
  getDaysRemaining,
} from '../utils/constants';
import { getDealMode, getOfferTypeIcon, getOfferTypeMeta } from '../utils/offerTypes';
import { getOfferBadgeMeta } from '../utils/offerBadges';
import { getCategoryById } from '../data/categories';
import { getStaticCode } from './customer/CustomerDealChatPage';
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

/* Interested-user avatars — null triggers initials-based fallback
   from ImageWithFallback rather than cartoon dicebear avatars. */
const MOCK_INTERESTED_AVATARS = [
  null,
  null,
  null,
  null,
  null,
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const DealDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarDeals, setSimilarDeals] = useState([]);
  const { savedIds, toggleSave } = useSavedOffers();
  const [openTermIndex, setOpenTermIndex] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [conversionRatio, setConversionRatio] = useState(0);
  const [storeTotalInterests, setStoreTotalInterests] = useState(0);
  const [storeCompletedInterests, setStoreCompletedInterests] = useState(0);
  const [verifyCodes, setVerifyCodes] = useState({});

  const fetchStoreConversionRatio = (interestsList) => {
    const list = interestsList || [];
    const total = list.length;
    const completed = list.filter(i => i.status === 'COMPLETED').length;
    setStoreTotalInterests(total);
    setStoreCompletedInterests(completed);
    const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
    setConversionRatio(ratio);
  };

  /* Real, category-matched similar offers — replaces the old mock-data
     lookup (src/data/mockDeals.js ships with an empty catalog, so that
     version always rendered nothing). */
  const fetchSimilarDeals = (category, excludeId) => {
    if (!category) {
      setSimilarDeals([]);
      return;
    }
    api.get(`/offers/list?category=${encodeURIComponent(category)}&status=ACTIVE`)
      .then((data) => {
        const mapped = data
          .filter((d) => d.id !== excludeId)
          .slice(0, 3)
          .map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category ? d.category.toLowerCase() : 'shopping',
            offer_type: d.offer_type,
            mode: getDealMode(d.offer_type),
            badge: d.badge || null,
            originalPrice: d.original_price,
            pairleyPrice: d.offer_price,
            images: [d.offer_image || d.cover_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
            businessOwner: {
              id: d.business_id,
              name: d.business?.business_name || 'Local Seller',
              avatar: d.business?.shop_photo || null,
              rating: 4.5
            },
            interestCount: d.joined_people || 0,
            maxParticipants: d.required_people || 2,
            location: d.business?.city || 'Select Location',
            validUntil: d.end_date || '2026-12-31',
          }));
        setSimilarDeals(mapped);
      })
      .catch((err) => {
        console.error('Failed to load similar deals:', err);
        setSimilarDeals([]);
      });
  };

  const fetchDealDetails = () => {
    api.get(`/offers/details/${id}`)
      .then((data) => {
        const mapped = {
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category ? data.category.toLowerCase() : 'shopping',
          offer_type: data.offer_type,
          mode: getDealMode(data.offer_type),
          badge: data.badge || null,
          originalPrice: data.original_price,
          pairleyPrice: data.offer_price,
          images: [data.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
          businessOwner: {
            id: data.business?.id || data.business_id,
            name: data.business?.business_name || 'Local Seller',
            avatar: data.business?.shop_photo || data.business?.profile_photo || null,
            rating: 4.5
          },
          interestCount: data.joined_people || 0,
          maxParticipants: data.required_people || 2,
          location: data.business?.city || data.business?.address || 'Select Location',
          validUntil: data.end_date || '2026-12-31',
          status: data.status ? data.status.toLowerCase() : 'active',
          createdAt: data.created_at || data.createdAt || '2026-06-01',
          interests: data.interests || [],
          facilityImages: data.facility_images || [],
          facilityDetails: data.facility_details || null
        };
        setDeal(mapped);
        setLoading(false);

        const currentUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
        if (mapped.businessOwner.id === currentUser?.id) {
          fetchStoreConversionRatio(mapped.interests);
        }

        fetchSimilarDeals(mapped.category, mapped.id);
      })
      .catch((err) => {
        console.error('Failed to load deal details from backend, falling back to mock:', err);
        const mock = getDealById(id);
        setDeal(mock);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchDealDetails();
  }, [id]);

  const handleStatusChange = (interestId, newStatus) => {
    api.put(`/offers/interest/${interestId}/status`, { status: newStatus })
      .then(() => {
        showToast('Closure status updated successfully!', 'success');
        fetchDealDetails();
      })
      .catch((err) => {
        console.error('Failed to update interest status:', err);
        showToast('Failed to update status: ' + (err.message || 'Request failed'), 'error');
      });
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="page-wrapper py-24 flex items-center justify-center min-h-[70vh]">
        <div className="container max-w-xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200/80 p-10 md:p-14 rounded-3xl shadow-xl text-center flex flex-col items-center gap-8">
            {/* Beautiful Dual-Ring Loader */}
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Outer Spin Ring (Primary Violet color) */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#5B12D6] animate-spin"></div>
              {/* Inner Reverse-Spin Ring (Secondary Green color) */}
              <div className="absolute w-16 h-16 rounded-full border-4 border-slate-100 border-b-[#22C55E] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
              {/* Center bouncing element (Accent orange) */}
              <div className="w-5 h-5 bg-[#F97316] rounded-full animate-bounce"></div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
                ⚡ Loading Deal Details...
              </h2>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm mx-auto mt-4 leading-relaxed">
                Finding the best matching discount, checking group pricing tiers, and loading partner information to pair you up!
              </p>
            </div>

            {/* Glowing progress slider bar */}
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5B12D6] via-[#22C55E] to-[#F97316] rounded-full animate-pulse w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const currentUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
  const isBusiness = currentUser?.role?.toLowerCase() === 'business' || !!currentUser?.business_name || !!currentUser?.businessName;
  const { saved, percentage } = calculateSavings(deal.originalPrice, deal.pairleyPrice);
  const daysLeft = getDaysRemaining(deal.validUntil);
  const dealMode = getDealMode(deal);
  const isPair = dealMode === 'pair';
  const isStandardOffer = dealMode === 'standard';
  const badgeMeta = getOfferBadgeMeta(deal.badge);
  const userHasJoined = currentUser && deal?.interests?.some(
    (i) => i.customer_id === currentUser.id ||
      i.customer_id === currentUser.sub ||
      i.customer?.id === currentUser.id ||
      i.customer?.id === currentUser.sub ||
      (currentUser.mobile && i.customer?.mobile === currentUser.mobile) ||
      (currentUser.email && i.customer?.email === currentUser.email)
  );
  const userInterest = currentUser && deal?.interests?.find(
    (i) => i.customer_id === currentUser.id ||
      i.customer_id === currentUser.sub ||
      i.customer?.id === currentUser.id ||
      i.customer?.id === currentUser.sub
  );
  const isCompleted = userInterest?.status === 'COMPLETED';

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
    navigator.clipboard.writeText(window.location.href).catch(() => { });
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

  /* Handle user join interest reactively */
  const handleInterestExpressed = () => {
    if (!currentUser) return;
    setDeal((prev) => {
      if (!prev) return prev;

      const userHasJoined = prev.interests?.some(
        (i) => i.customer_id === currentUser.id ||
          i.customer_id === currentUser.sub ||
          i.customer?.id === currentUser.id ||
          i.customer?.id === currentUser.sub ||
          (currentUser.mobile && i.customer?.mobile === currentUser.mobile) ||
          (currentUser.email && i.customer?.email === currentUser.email)
      );
      if (userHasJoined) return prev;

      const newInterest = {
        customer_id: currentUser.id,
        customer: {
          id: currentUser.id,
          name: currentUser.name || 'You',
          mobile: currentUser.mobile,
          city: currentUser.city || 'Your City',
        },
        status: 'INTERESTED',
      };

      return {
        ...prev,
        interestCount: prev.interestCount + 1,
        interests: [...(prev.interests || []), newInterest],
      };
    });
  };

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
                      {isStandardOffer
                        ? `${getOfferTypeIcon(deal.offer_type)} ${getOfferTypeMeta(deal.offer_type).label}`
                        : isPair ? '🤝 BOGO Pair' : '👥 Group Deal'}
                    </span>
                    {category && (
                      <span className="deal-hero-badge deal-hero-badge--cat">
                        {category.icon} {category.name}
                      </span>
                    )}
                    {badgeMeta && (
                      <span className="deal-hero-badge deal-hero-badge--origin">
                        {badgeMeta.icon} {badgeMeta.label}
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

              {/* Facility Showcase Gallery */}
              {deal.facilityImages && deal.facilityImages.length > 0 && (
                <div className="deal-facilities-gallery mt-8 border-t border-slate-100 pt-6 text-left">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    🏢 Facility &amp; Equipment Showcase
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {deal.facilityImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer aspect-video border border-slate-100 bg-slate-50">
                        <img src={img} alt={`Facility ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meet the Staff / Trainers / Stylists */}
              {(() => {
                let staff = [];
                if (deal.facilityDetails) {
                  try {
                    staff = JSON.parse(deal.facilityDetails);
                  } catch (e) {
                    console.error('Failed to parse facility details:', e);
                  }
                }
                if (staff.length === 0) return null;
                return (
                  <div className="deal-staff-section mt-8 border-t border-slate-100 pt-6 text-left">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      👤 Meet the Team &amp; Specialists
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {staff.map((s, idx) => (
                        <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {s.name ? s.name.charAt(0).toUpperCase() : '👤'}
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-extrabold text-slate-800">{s.name || 'Specialist'}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{s.role || 'Team Member'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

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
                    {isStandardOffer ? 'Offer Price' : isPair ? 'Pair Deal Price' : 'Group Deal — Starting From'}
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
                        {formatPrice(Math.round(deal.pairleyPrice))}
                      </div>
                    </div>
                  )}

                  {!isPair && deal.pricingTiers && (
                    <div className="deal-group-pricing">
                      <div className="deal-group-pricing-title">Group Pricing Tiers</div>
                      <PricingTierCard
                        tiers={deal.pricingTiers}
                        currentCount={deal.interestCount}
                        maxParticipants={deal.maxParticipants}
                      />
                    </div>
                  )}

                  {/* Interest button */}
                  <div className="deal-interest-area">
                    {isBusiness ? (
                      <div className="flex flex-col gap-3">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold">
                          🏪 Merchant Account View
                        </div>
                        {deal.businessOwner.id === currentUser?.id && (
                          <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-200/50 backdrop-blur-md rounded-2xl p-4 shadow-md text-left relative overflow-hidden">
                            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl"></div>
                            <h4 className="text-xs font-extrabold text-[#5B12D6] mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[#5B12D6] animate-pulse" style={{ fontSize: 18 }}>analytics</span>
                              Deal Performance
                            </h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-2xl font-black text-slate-800 flex items-baseline gap-0.5">
                                  {conversionRatio}
                                  <span className="text-xs font-bold text-slate-500">%</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Conversion Ratio</p>
                              </div>
                              <div className="text-right text-[10px] text-slate-500 font-bold leading-normal">
                                <div className="flex justify-between gap-3">
                                  <span>Completed:</span>
                                  <span className="text-emerald-600 font-extrabold">{storeCompletedInterests}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                  <span>Total Interests:</span>
                                  <span className="text-indigo-600 font-extrabold">{storeTotalInterests}</span>
                                </div>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100/80 rounded-full overflow-hidden mt-3 border border-slate-200/40">
                              <div
                                className="h-full bg-gradient-to-r from-[#5B12D6] to-[#22C55E] rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${conversionRatio}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {deal.businessOwner.id === currentUser?.id && (
                          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm text-left">
                            <h4 className="text-xs font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[#5B12D6]" style={{ fontSize: 16 }}>group</span>
                              Interested Customers ({deal.interests?.length || 0})
                            </h4>
                            {deal.interests && deal.interests.length > 0 ? (
                              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {deal.interests.map((interest, idx) => (
                                  <div key={idx} className="flex flex-col gap-1 text-[11px] border-b border-slate-100 last:border-0 pb-2.5 mb-2.5 last:pb-0 last:mb-0">
                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span>{interest.customer?.name || 'Buyer'}</span>
                                      <span className="text-[9px] text-slate-400 font-semibold px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">{interest.customer?.city || 'No City'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 mt-1">
                                      <a href={`tel:${interest.customer?.mobile}`} className="hover:underline text-[#5B12D6] flex items-center gap-0.5 font-bold">
                                        📞 {interest.customer?.mobile}
                                      </a>
                                      {interest.status === 'COMPLETED' ? (
                                        <span className="text-[9px] font-extrabold rounded-lg px-2.5 py-1 border bg-emerald-50 border-emerald-200 text-emerald-700">
                                          Completed ✓
                                        </span>
                                      ) : interest.status === 'CANCELLED' ? (
                                        <span className="text-[9px] font-extrabold rounded-lg px-2.5 py-1 border bg-rose-50 border-rose-200 text-rose-700">
                                          Cancelled ✗
                                        </span>
                                      ) : (
                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                          <input
                                            type="text"
                                            placeholder="Enter Code (e.g. 711-A84)"
                                            value={verifyCodes[interest.id] || ''}
                                            onChange={(e) => setVerifyCodes({ ...verifyCodes, [interest.id]: e.target.value })}
                                            className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#5B12D6] font-bold text-slate-800 w-28"
                                          />
                                          <button
                                            onClick={() => {
                                              const typed = (verifyCodes[interest.id] || '').trim();
                                              const correct = getStaticCode(deal.id);
                                              if (typed === correct) {
                                                handleStatusChange(interest.id, 'COMPLETED');
                                              } else {
                                                showToast('Invalid verification code!', 'error');
                                              }
                                            }}
                                            className="bg-[#5B12D6] hover:bg-[#430bb0] text-white text-[10px] font-bold rounded-lg px-2.5 py-1 transition flex-shrink-0"
                                          >
                                            Verify & Close
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (window.confirm('Are you sure you want to cancel this deal for this customer?')) {
                                                handleStatusChange(interest.id, 'CANCELLED');
                                              }
                                            }}
                                            className="border border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg px-2 py-1 transition flex-shrink-0"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {interest.customer?.address && (
                                      <div className="text-[10px] text-slate-400 mt-1 bg-slate-50/50 p-2 rounded-lg border border-slate-100/60 leading-normal">
                                        📍 {interest.customer.address}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-slate-400 text-[11px]">No active interests yet.</div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <InterestButton deal={deal} onInterest={handleInterestExpressed} />
                    )}
                  </div>

                  {userHasJoined && !isBusiness && (
                    <div className="co-buy-chat-card p-4 rounded-2xl bg-indigo-50/50 border border-[#5B12D6]/20 mt-4 text-left shadow-sm">
                      <h4 className="text-xs font-extrabold text-[#5B12D6] flex items-center gap-1.5 mb-1.5">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
                        Anonymous Co-Buy Chat Room
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal mb-3 font-semibold">
                        Coordinate with other interested buyers for this deal. Message templates are predefined to protect your identity.
                      </p>
                      {isCompleted ? (
                        <div className="text-[10px] text-rose-600 font-extrabold bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center leading-normal">
                          🔒 This deal has been completed. Chat is closed.
                        </div>
                      ) : (
                        <Link
                          to={`/customer/deal-chat/${id}`}
                          className="w-full btn btn-primary bg-[#5B12D6] hover:bg-[#430bb0] text-white py-2.5 rounded-xl text-[11px] font-bold text-center block transition shadow-sm"
                        >
                          Enter Anonymous Chat Room
                        </Link>
                      )}
                    </div>
                  )}

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
                    <strong>{deal.interestCount}/{deal.maxParticipants} Joined</strong>
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
                  <DealCard
                    key={d.id}
                    deal={d}
                    isSaved={savedIds.has(d.id)}
                    onToggleSave={toggleSave}
                  />
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

