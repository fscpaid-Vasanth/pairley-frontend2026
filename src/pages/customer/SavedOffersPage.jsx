import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { getDealMode } from '../../utils/offerTypes';
import { useSavedOffers } from '../../hooks/useSavedOffers';
import DealCard from '../../components/DealCard';
import CustomerNav from '../../components/CustomerNav';
import './SavedOffersPage.css';

// Terminal statuses a saved offer can end up in after being saved — kept
// visible per the approved UX decision, badged rather than hidden.
const UNAVAILABLE_LABEL = {
  EXPIRED: 'Expired',
  ARCHIVED: 'No Longer Available',
  PAUSED: 'Paused',
  CLOSED: 'No Longer Available',
  REJECTED: 'No Longer Available',
  DRAFT: 'No Longer Available',
  PENDING_APPROVAL: 'No Longer Available',
};

export default function SavedOffersPage() {
  // Single fetch, shared with DealCard's own save/unsave action on this
  // page — no separate GET /customers/saved-offers call here.
  const { savedOffers, savedIds, loaded, toggleSave } = useSavedOffers();

  const deals = useMemo(
    () =>
      savedOffers.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category ? d.category.toLowerCase() : 'shopping',
        offer_type: d.offer_type,
        mode: getDealMode(d.offer_type),
        badge: d.badge || null,
        status: d.status,
        unavailableLabel: UNAVAILABLE_LABEL[d.status] || null,
        originalPrice: d.original_price,
        pairleyPrice: d.offer_price,
        images: [d.offer_image || d.cover_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
        businessOwner: { name: d.business?.business_name || 'Local Seller' },
        interestCount: d.joined_people || 0,
        maxParticipants: d.required_people || 2,
        location: d.business?.city || 'Select Location',
        validUntil: d.end_date || '2026-12-31',
      })),
    [savedOffers]
  );

  return (
    <div className="saved-offers-page page-wrapper py-6 text-left">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 p-6 rounded-3xl shadow-sm mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Saved Offers ❤️
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Offers you've saved for later — including ones that are no longer active.
            </p>
          </div>
        </div>

        <CustomerNav />

        <AnimatePresence mode="wait">
          {!loaded ? (
            <motion.div
              key="loading"
              className="bg-white border border-slate-200 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-4 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 border-4 border-[#5B12D6] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading saved offers...</p>
            </motion.div>
          ) : deals.length > 0 ? (
            <motion.div
              key="grid"
              className="saved-offers-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {deals.map((deal) => (
                <div key={deal.id} className="saved-offer-card-wrap">
                  {deal.unavailableLabel && (
                    <span className="saved-offer-card-wrap__badge">
                      {deal.unavailableLabel}
                    </span>
                  )}
                  <div className={deal.unavailableLabel ? 'saved-offer-card-wrap__dimmed' : ''}>
                    <DealCard
                      deal={deal}
                      isSaved={savedIds.has(deal.id)}
                      onToggleSave={toggleSave}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="bg-white border border-slate-200 p-12 text-center rounded-2xl flex flex-col items-center gap-4 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Heart size={32} className="text-slate-300" />
              <h4 className="font-bold text-slate-800">No Saved Offers Yet</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Tap the heart on any deal to save it here for later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
