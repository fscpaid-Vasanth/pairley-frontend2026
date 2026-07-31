import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Users, PartyPopper, Lock, CheckCircle2, Phone, MessageCircleMore, MapPin, Navigation } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { getDealMode } from '../utils/offerTypes';
import { isDuplicateInterestError, formatLeadStatusLabel } from '../utils/leadInterest';
import { buildWaLink, buildCustomerInquiryMessage } from '../utils/whatsapp';
import './InterestButton.css';

/** Standard Google Maps URL API — no API key needed for a search/directions deep link. */
function mapsSearchUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
function mapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Lead-generation revision — LEAD_FOLLOWUP_MODE. Under the default
 * ADMIN_MANAGED mode, `business.mobile` is never present (see
 * offerVisibility.ts), so this renders nothing and the "Thank you" card is
 * all a customer sees. If the platform is later switched to
 * MERCHANT_MANAGED, the backend starts including contact fields once
 * interest is expressed on a CLAIMED business, and this block activates
 * automatically — no frontend redeploy needed, which is the whole point of
 * making the mode configurable rather than hard-removing this capability.
 */
function ContactRevealBlock({ business, offerName }) {
  if (!business?.mobile) return null;
  const waLink = buildWaLink(
    business.whatsapp || business.mobile,
    buildCustomerInquiryMessage({ offerName, shopName: business.business_name }),
  );
  const hasGeo = business.geo_lat != null && business.geo_lng != null;

  return (
    <div className="interest-confirmation-card__contact">
      <a className="interest-confirmation-card__contact-btn" href={`tel:${business.mobile}`}>
        <Phone size={16} />
        Call {business.mobile}
      </a>
      <a
        className="interest-confirmation-card__contact-btn interest-confirmation-card__contact-btn--whatsapp"
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircleMore size={16} />
        WhatsApp
      </a>
      {business.address && (
        <div className="interest-confirmation-card__address">
          <MapPin size={14} />
          {business.address}
        </div>
      )}
      {hasGeo && (
        <div className="interest-confirmation-card__contact-row">
          <a
            className="interest-confirmation-card__contact-link"
            href={mapsSearchUrl(business.geo_lat, business.geo_lng)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={14} /> View on Map
          </a>
          <a
            className="interest-confirmation-card__contact-link"
            href={mapsDirectionsUrl(business.geo_lat, business.geo_lng)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={14} /> Get Directions
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Module 13 — the standard (non-legacy) interest confirmation card. Shown
 * once deal.myLead exists, i.e. driven entirely by the backend response
 * rather than local component state — it renders identically whether the
 * lead was just created this session or the customer is revisiting after a
 * refresh/logout/re-login, except for the headline copy (`justSubmitted`
 * distinguishes the first-submission message from a revisit).
 *
 * Lead-generation revision: under the default ADMIN_MANAGED mode, Pairley
 * is a lead-capture marketplace, not a contact broker — the card confirms
 * the interest was recorded and sets the expectation that the merchant/
 * admin follows up manually. ContactRevealBlock renders nothing in that
 * mode (business.mobile is absent from the API response entirely), so the
 * "Thank you" message is genuinely all that shows; it only appears for
 * real once MERCHANT_MANAGED mode is switched on.
 */
function InterestConfirmationCard({ lead, justSubmitted, business, offerName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="interest-confirmation-card"
    >
      <div className="interest-confirmation-card__head">
        <CheckCircle2 size={22} className="interest-confirmation-card__check" />
        <h4 className="interest-confirmation-card__title">
          {business?.mobile
            ? (justSubmitted ? 'Interest Sent Successfully' : 'Interest Already Sent')
            : (justSubmitted ? 'Thank you for your interest!' : 'Interest Already Sent')}
        </h4>
      </div>
      <p className="interest-confirmation-card__body">
        {business?.mobile
          ? 'The merchant has been notified. Reach out directly using the details below.'
          : 'Your request has been recorded successfully. Our team or the merchant will contact you shortly.'}
      </p>
      <ContactRevealBlock business={business} offerName={offerName} />
      <div className="interest-confirmation-card__status">
        <span className="interest-confirmation-card__status-dot" />
        Status: {formatLeadStatusLabel(lead.status)}
      </div>
    </motion.div>
  );
}

export default function InterestButton({ deal, onInterest, onRefresh }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { orders, refreshOrders } = useCart();
  const [interestState, setInterestState] = useState('none'); // legacy pair/group state machine — 'none', 'loading', 'interested', 'paired'
  const [posting, setPosting] = useState(false); // standard-flow submit state
  const [justSubmitted, setJustSubmitted] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
  const userHasJoinedInDb = deal?.interests?.some(i =>
    i.customer_id === currentUser?.id ||
    i.customer_id === currentUser?.sub ||
    i.customer?.id === currentUser?.id ||
    i.customer?.id === currentUser?.sub ||
    (currentUser?.mobile && i.customer?.mobile === currentUser.mobile) ||
    (currentUser?.email && i.customer?.email === currentUser.email)
  );
  const displayCount = (deal?.interestCount || 0) + (interestState === 'interested' && !userHasJoinedInDb ? 1 : 0);
  const isBusiness = currentUser?.role?.toLowerCase() === 'business' || !!currentUser?.business_name || !!currentUser?.businessName;

  const mode = getDealMode(deal);
  const isPair = mode === 'pair';
  const isStandard = mode === 'standard';

  // Always call hooks before any conditional return (React rules of hooks) —
  // this legacy history-polling effect only matters for pair/group offers
  // now; standard offers get their interest state from deal.myLead instead
  // (populated by GET /offers/details/:id, not this /customers/history call,
  // which only ever sees OfferInterest rows — see Module 13 investigation).
  useEffect(() => {
    if (isBusiness || isStandard) return;
    const token = localStorage.getItem('pairley_token');
    if (token && deal && deal.id) {
      api.get('/customers/history')
        .then((history) => {
          const match = history.find(h => h.offer_id === deal.id || h.offer?.id === deal.id);
          if (match) {
            if (match.status === 'INTERESTED') {
              setInterestState('interested');
            } else if (match.status === 'COMPLETED') {
              setInterestState('completed');
            } else if (['READY_TO_BUY', 'CONTACTED'].includes(match.status)) {
              setInterestState('paired');
            }
          }
        })
        .catch((err) => {
          console.error('Failed to resolve interest history:', err);
        });
    }
  }, [deal?.id, isBusiness, isStandard]);

  useEffect(() => {
    if (isBusiness || isStandard) return;
    if (userHasJoinedInDb && interestState === 'none') {
      setInterestState('interested');
    }
  }, [userHasJoinedInDb, isBusiness, isStandard, interestState]);

  // Show merchant view AFTER hooks
  if (isBusiness) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold w-full">
        🏪 Merchant Account View
      </div>
    );
  }

  // ── Standard (non-legacy) flow — Module 13 ──────────────────────────────
  // No WhatsApp redirect, no local-only "already interested" guess: driven
  // entirely by deal.myLead, which the backend returns from a single source
  // of truth (Lead), so it's correct on first load, after refresh, after
  // logout/login, and on another device.
  if (isStandard) {
    const handleShowInterest = () => {
      const token = localStorage.getItem('pairley_token');
      if (!token) {
        showToast('Please sign up or log in to join this deal!', 'error');
        navigate('/login');
        return;
      }
      if (posting || deal?.myLead) return;
      setPosting(true);
      api.post('/offers/lead', {
        offerId: deal.id,
        source: Capacitor.isNativePlatform() ? 'MOBILE_APP' : 'WEBSITE',
      })
        .then((res) => {
          setJustSubmitted(true);
          if (onInterest) onInterest(res.lead);
          // Lead-generation revision — under MERCHANT_MANAGED mode, this
          // Lead row is exactly what satisfies offerVisibility.ts's
          // "expressed interest" check, but the contact fields themselves
          // only arrive on a fresh GET, never from this POST response.
          // Under the default ADMIN_MANAGED mode this is a harmless
          // no-op refresh (business.mobile still won't be present).
          if (onRefresh) onRefresh();
        })
        .catch((err) => {
          console.error('Failed to express interest:', err);
          const msg = err.message || 'Failed to send interest. Please try again.';
          if (isDuplicateInterestError(msg)) {
            // Local state and backend disagreed (e.g. a second tab already
            // sent it) — resync from the authoritative source instead of
            // fabricating a lead we don't have the real id for.
            showToast('You have already shown interest in this deal.', 'info');
            if (onRefresh) onRefresh();
          } else {
            showToast(msg, 'error');
          }
        })
        .finally(() => setPosting(false));
    };

    if (deal?.myLead) {
      return (
        <div className="interest-btn-container">
          <InterestConfirmationCard
            lead={deal.myLead}
            justSubmitted={justSubmitted}
            business={deal.business}
            offerName={deal.title}
          />
        </div>
      );
    }

    return (
      <div className="interest-btn-container">
        <motion.button
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: posting ? 1 : 1.02 }}
          whileTap={{ scale: posting ? 1 : 0.98 }}
          className={`btn btn-primary btn-lg w-full interest-btn interest-btn--default ${posting ? 'interest-btn--loading animate-pulse' : ''}`}
          onClick={handleShowInterest}
          disabled={posting}
        >
          {posting ? (
            <>
              <div className="interest-btn__spinner" />
              Sending Interest...
            </>
          ) : (
            <>
              <Sparkles size={20} className="interest-btn__icon" />
              Show Interest
            </>
          )}
        </motion.button>
      </div>
    );
  }

  // ── Legacy pair/group matching flow — unchanged by Module 13 ───────────
  const handleShowInterest = () => {
    const token = localStorage.getItem('pairley_token');
    if (!token) {
      showToast('Please sign up or log in to join this deal!', 'error');
      navigate('/login');
      return;
    }

    if (interestState !== 'none') return;
    setInterestState('loading');

    api.post('/offers/lead', { offerId: deal.id })
      .then(() => {
        showToast('You have successfully joined the deal!', 'success');
        setInterestState('interested');
        if (onInterest) onInterest();
      })
      .catch((err) => {
        console.error('Failed to express interest:', err);
        let errorMsg = err.message || 'Failed to join deal. Please try again.';
        if (
          errorMsg.toLowerCase().includes('expressed interest') ||
          errorMsg.toLowerCase().includes('already joined') ||
          errorMsg.toLowerCase().includes('already registered')
        ) {
          errorMsg = 'You have already joined this deal.';
          setInterestState('interested');
        } else {
          setInterestState('none');
        }
        showToast(errorMsg, 'error');
      });
  };

  const handleCheckChat = () => {
    const matchingOrder = orders.find(o => o.dealId === deal.id && o.status === 'matched');
    const fallbackOrder = orders.find(o => o.dealId === deal.id);
    const selectedOrder = matchingOrder || fallbackOrder;

    if (selectedOrder) {
      navigate(`/customer/chat/${selectedOrder.id}`);
    } else {
      // Force refresh match orders first
      refreshOrders().then((updatedOrders) => {
        const found = updatedOrders.find(o => o.dealId === deal.id);
        if (found) {
          navigate(`/customer/chat/${found.id}`);
        } else {
          // If still not loaded or match is offline mock, redirect to orders list where they see their matches
          navigate('/customer/orders');
        }
      });
    }
  };

  return (
    <div className="interest-btn-container">
      <AnimatePresence mode="wait">
        {interestState === 'none' && (
          <motion.button
            key="none"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary btn-lg w-full interest-btn interest-btn--default"
            onClick={handleShowInterest}
          >
            <Sparkles size={20} className="interest-btn__icon" />
            Show Interest & Get Split Pricing
          </motion.button>
        )}

        {interestState === 'loading' && (
          <motion.button
            key="loading"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="btn btn-primary btn-lg w-full interest-btn interest-btn--loading animate-pulse"
            disabled
          >
            <div className="interest-btn__spinner" />
            Expressing Interest...
          </motion.button>
        )}

        {interestState === 'interested' && (
          <motion.button
            key="interested"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn btn-outline btn-lg w-full interest-btn interest-btn--interested ${
              isPair ? 'interest-btn--searching' : 'interest-btn--joined'
            }`}
            onClick={() => setInterestState('none')} // Toggle off
          >
            {isPair ? (
              <>
                <Clock size={20} className="interest-btn__icon animate-spin" />
                Searching for Pair Partner... (Tap to Cancel)
              </>
            ) : (
              <>
                <Users size={20} className="interest-btn__icon" />
                Joined Group! ({displayCount}/{deal.maxParticipants || deal.required_people || 2} Joined)
              </>
            )}
          </motion.button>
        )}

        {interestState === 'paired' && (
          <motion.button
            key="paired"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-secondary btn-lg w-full interest-btn interest-btn--paired"
            onClick={handleCheckChat}
          >
            <PartyPopper size={20} className="interest-btn__icon" />
            You're Paired! Check Chat 🎉
          </motion.button>
        )}

        {interestState === 'completed' && (
          <motion.button
            key="completed"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            disabled
            className="btn btn-lg w-full interest-btn cursor-not-allowed opacity-75 bg-slate-100 border-slate-200 text-slate-400 flex items-center justify-center gap-1.5"
          >
            <Lock size={20} className="interest-btn__icon" />
            Deal Completed 🎉
          </motion.button>
        )}
      </AnimatePresence>

      {interestState === 'interested' && isPair && (
        <p className="interest-btn-hint animate-pulse">
          ⚡ We are currently matching you with other interested buyers. Sit tight!
        </p>
      )}
      {interestState === 'paired' && (
        <p className="interest-btn-hint interest-btn-hint--paired">
          🤝 A pair has been found! Chat is now enabled with your co-buyer.
        </p>
      )}
    </div>
  );
}
