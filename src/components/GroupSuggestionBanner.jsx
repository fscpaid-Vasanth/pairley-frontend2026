import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import './GroupSuggestionBanner.css';

export default function GroupSuggestionBanner({ count = 0, dealTitle = '', remaining = 0, onJoin }) {
  const shouldRender = count > 0 && remaining > 0;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          className="group-banner"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.9 }}
        >
          <div className="group-banner__content">
            {/* Left: Text content */}
            <div className="group-banner__text">
              <div className="group-banner__icon-row">
                <span className="group-banner__icon-wrap">
                  <Users size={14} strokeWidth={2.5} />
                </span>
                <span className="group-banner__count-badge">{count} nearby</span>
              </div>
              <p className="group-banner__headline">
                {count} {count === 1 ? 'Person' : 'People'} Near You Want This Deal!
              </p>
              {dealTitle && (
                <p className="group-banner__deal-title">"{dealTitle}"</p>
              )}
              <p className="group-banner__sub">
                Only <strong>{remaining}</strong> more {remaining === 1 ? 'person' : 'people'} needed to unlock group pricing
              </p>
            </div>

            {/* Right: CTA */}
            <motion.button
              className="group-banner__btn"
              onClick={onJoin}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <Zap size={13} strokeWidth={2.5} />
              Join Now
            </motion.button>
          </div>

          {/* Decorative pulse dot */}
          <span className="group-banner__pulse-dot" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

