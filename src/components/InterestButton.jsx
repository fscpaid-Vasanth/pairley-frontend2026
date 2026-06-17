import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Users, PartyPopper } from 'lucide-react';
import './InterestButton.css';

export default function InterestButton({ deal, onInterest }) {
  const [interestState, setInterestState] = useState('none'); // 'none', 'loading', 'interested', 'paired'

  const handleShowInterest = () => {
    if (interestState !== 'none') return;
    setInterestState('loading');
    setTimeout(() => {
      setInterestState('interested');
      if (onInterest) onInterest();
      
      // If it is a pair deal, let's simulate a pairing after a few seconds
      if (deal.mode === 'pair') {
        setTimeout(() => {
          setInterestState('paired');
        }, 4000);
      }
    }, 1500);
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
