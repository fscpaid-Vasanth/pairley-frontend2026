import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Users, PartyPopper } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import './InterestButton.css';

export default function InterestButton({ deal, onInterest }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [interestState, setInterestState] = useState('none'); // 'none', 'loading', 'interested', 'paired'

  const currentUser = JSON.parse(localStorage.getItem('pairley_user') || 'null');
  const isBusiness = currentUser?.role?.toLowerCase() === 'business' || !!currentUser?.business_name || !!currentUser?.businessName;

  // Always call hooks before any conditional return (React rules of hooks)
  useEffect(() => {
    if (isBusiness) return; // Skip for business accounts
    const token = localStorage.getItem('pairley_token');
    if (token && deal && deal.id) {
      api.get('/customers/history')
        .then((history) => {
          const match = history.find(h => h.offer_id === deal.id || h.offer?.id === deal.id);
          if (match) {
            if (match.status === 'INTERESTED') {
              setInterestState('interested');
            } else if (['READY_TO_BUY', 'CONTACTED', 'COMPLETED'].includes(match.status)) {
              setInterestState('paired');
            }
          }
        })
        .catch((err) => {
          console.error('Failed to resolve interest history:', err);
        });
    }
  }, [deal?.id, isBusiness]);

  // Show merchant view AFTER hooks
  if (isBusiness) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold w-full">
        🏪 Merchant Account View
      </div>
    );
  }

  const handleShowInterest = () => {
    const token = localStorage.getItem('pairley_token');
    if (!token) {
      showToast('Please sign up or log in to express interest in this deal!', 'error');
      navigate('/login');
      return;
    }

    if (interestState !== 'none') return;
    setInterestState('loading');

    api.post('/offers/interest', { offerId: deal.id })
      .then((res) => {
        showToast('Successfully expressed interest in this deal!', 'success');
        setInterestState('interested');
        if (onInterest) onInterest();
        
        if (deal.mode === 'pair' || deal.required_people <= (deal.interestCount || 0) + 1) {
          setTimeout(() => {
            setInterestState('paired');
            showToast('Pairley Match! A partner has been found for your deal.', 'success');
          }, 3000);
        }
      })
      .catch((err) => {
        console.error('Failed to express interest:', err);
        showToast(err.message || 'Failed to register interest. Please try again.', 'error');
        setInterestState('none');
      });
  };

  const isPair = deal.mode === 'pair';

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
                Joined Group! ({deal.interestCount + 1}/{deal.maxParticipants} Joined)
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
            className="btn btn-secondary btn-lg w-full interest-btn interest-btn--paired"
            disabled
          >
            <PartyPopper size={20} className="interest-btn__icon" />
            You're Paired! Check Chat 🎉
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
