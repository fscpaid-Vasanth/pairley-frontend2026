import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Users, PartyPopper, Lock } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import './InterestButton.css';

export default function InterestButton({ deal, onInterest }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { orders, refreshOrders } = useCart();
  const [interestState, setInterestState] = useState('none'); // 'none', 'loading', 'interested', 'paired'

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
        
        const reqPeople = deal.maxParticipants || deal.required_people || 2;
        if (deal.mode === 'pair' || reqPeople <= displayCount) {
          setTimeout(() => {
            setInterestState('paired');
            showToast('Pairley Match! A partner has been found for your deal.', 'success');
            refreshOrders();
          }, 3000);
        }
      })
      .catch((err) => {
        console.error('Failed to express interest:', err);
        showToast(err.message || 'Failed to register interest. Please try again.', 'error');
        setInterestState('none');
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
