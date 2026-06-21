import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingDown, Sparkles, CheckCircle2 } from 'lucide-react';
import './InteractiveDealSimulator.css';

export default function InteractiveDealSimulator() {
  const [simMode, setSimMode] = useState('bogo'); // 'bogo' | 'group'
  const [bogoStep, setBogoStep] = useState(0);
  const [groupPeople, setGroupPeople] = useState(1);

  // Auto-progress BOGO simulation
  useEffect(() => {
    if (simMode !== 'bogo') return;
    const timer = setInterval(() => {
      setBogoStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [simMode]);

  // Auto-progress Group simulation
  useEffect(() => {
    if (simMode !== 'group') return;
    const timer = setInterval(() => {
      setGroupPeople((prev) => {
        if (prev >= 10) return 1;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [simMode]);

  // Pricing calculation helper for Group Simulation
  const getGroupPrice = (people) => {
    if (people >= 8) return 900;
    if (people >= 4) return 1200;
    return 1500;
  };

  return (
    <div className="sim-card">
      <div className="sim-card__header">
        <h3 className="sim-card__title">
          <Sparkles className="text-purple-600 animate-pulse" size={16} />
          Power of Pairley
        </h3>
        <p className="sim-card__subtitle">See how Pairley matches buyers and drops prices.</p>
      </div>

      {/* Mode Switcher */}
      <div className="sim-mode-switcher">
        <button
          onClick={() => setSimMode('bogo')}
          className={`sim-mode-btn ${simMode === 'bogo' ? 'sim-mode-btn--active' : ''}`}
        >
          <Users size={13} />
          BOGO Split
        </button>
        <button
          onClick={() => setSimMode('group')}
          className={`sim-mode-btn ${simMode === 'group' ? 'sim-mode-btn--active' : ''}`}
        >
          <TrendingDown size={13} />
          Group Tiers
        </button>
      </div>

      {/* Simulation Viewport */}
      <div className="sim-viewport">
        {simMode === 'bogo' ? (
          /* BOGO Simulation */
          <div className="bogo-sim">
            <div className="sim-meta-row">
              <span className="sim-deal-tag">BOGO DEAL: BUY 1 GET 1 FREE SHOES</span>
              <span className="sim-live-badge">
                <span className="sim-live-dot" />
                Live Matching
              </span>
            </div>

            <div className="bogo-matchmaker">
              {/* Connector Line */}
              <div className="bogo-connector-bg">
                <motion.div 
                  className="bogo-connector-fill"
                  initial={{ width: 0 }}
                  animate={{ width: bogoStep >= 2 ? '100%' : '0%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              {/* Buyer 1: Arjun */}
              <div className="bogo-user">
                <div className="bogo-avatar bogo-avatar--user">
                  🧑🏽
                  {bogoStep >= 0 && (
                    <span className="bogo-check">
                      <CheckCircle2 size={10} />
                    </span>
                  )}
                </div>
                <span className="bogo-name">Arjun (You)</span>
                <span className="bogo-status">Searching</span>
              </div>

              {/* Match Indicator */}
              <div className="bogo-indicator">
                {bogoStep === 0 && <span className="text-slate-300 font-bold text-sm">?</span>}
                {bogoStep === 1 && <span className="text-purple-600 font-bold text-[10px] animate-pulse">Matching</span>}
                {bogoStep >= 2 && <span className="text-emerald-500 font-bold text-sm">🤝</span>}
              </div>

              {/* Buyer 2: Priya */}
              <div className="bogo-user">
                <div className={`bogo-avatar bogo-avatar--partner ${bogoStep >= 2 ? 'bogo-avatar--matched' : 'bogo-avatar--waiting'}`}>
                  👩🏻
                  {bogoStep >= 2 && (
                    <span className="bogo-check">
                      <CheckCircle2 size={10} />
                    </span>
                  )}
                </div>
                <span className="bogo-name">Priya</span>
                <span className="bogo-status">{bogoStep >= 2 ? 'Matched!' : 'Waiting...'}</span>
              </div>
            </div>

            {/* Status Message */}
            <div className="sim-status-box">
              <AnimatePresence mode="wait">
                {bogoStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="sim-status-text"
                  >
                    🛍️ You show interest in the BOGO deal. Price is ₹2,000. You pay <strong>₹1,000</strong> if a partner is found.
                  </motion.div>
                )}
                {bogoStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="sim-status-text text-purple-600 font-semibold"
                  >
                    🔍 scanning for other buyers interested in this deal in your city...
                  </motion.div>
                )}
                {bogoStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="sim-status-text text-emerald-600 font-semibold"
                  >
                    ✨ Matched! Priya is paired with you. You both unlock the 50% BOGO split.
                  </motion.div>
                )}
                {bogoStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="sim-status-text text-slate-800"
                  >
                    🎉 <strong>BOGO Unlocked!</strong> You pay ₹1,000, Priya pays ₹1,000. You saved 50%!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sim-dots">
              {[0, 1, 2, 3].map((step) => (
                <button
                  key={step}
                  onClick={() => setBogoStep(step)}
                  className={`sim-dot ${bogoStep === step ? 'sim-dot--active' : ''}`}
                  aria-label={`Go to step ${step}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Group Simulation */
          <div className="group-sim">
            <div className="sim-meta-row">
              <span className="sim-deal-tag">Group Booking: Kerala Resort Tour</span>
              <span className="sim-joined-count">{groupPeople} Joined</span>
            </div>

            {/* Price block */}
            <div className="group-price-row">
              <div className="group-price-block">
                <span className="group-price-label">Price per head</span>
                <span className="group-price-value">
                  ₹{getGroupPrice(groupPeople)}
                </span>
              </div>
              <div className="group-price-block text-right">
                <span className="group-price-label">Discount Tier</span>
                <span className="group-price-discount text-primary">
                  {groupPeople >= 8 ? '40% Off Unlocked! 🔥' : groupPeople >= 4 ? '20% Off Unlocked!' : 'Base Price'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="group-progress-bar">
              <motion.div 
                className="group-progress-fill"
                animate={{ width: `${(groupPeople / 10) * 100}%` }}
                transition={{ type: 'spring', stiffness: 60 }}
              />
              <div className="group-progress-marker" style={{ left: '40%' }} />
              <div className="group-progress-marker" style={{ left: '80%' }} />
            </div>

            {/* Progress Tiers */}
            <div className="group-tiers">
              <div className={`group-tier ${groupPeople < 4 ? 'group-tier--active' : ''}`}>
                Base: ₹1,500<br/>(1-3 people)
              </div>
              <div className={`group-tier ${groupPeople >= 4 && groupPeople < 8 ? 'group-tier--active' : ''}`}>
                Tier 1: ₹1,200<br/>(4-7 people)
              </div>
              <div className={`group-tier ${groupPeople >= 8 ? 'group-tier--active' : ''}`}>
                Tier 2: ₹900<br/>(8+ people)
              </div>
            </div>

            {/* Avatars List */}
            <div className="group-avatars">
              {Array.from({ length: groupPeople }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: -15, opacity: 0 }}
                  animate={{ scale: 1, x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="group-avatar"
                >
                  {['🧑🏽', '👩🏻', '👨🏼', '👧🏾', '👦🏻', '👱‍♀️', '👨🏽', '👵🏼', '👴🏾', '👩🏽'][i % 10]}
                </motion.div>
              ))}
              {groupPeople < 10 && (
                <div className="group-avatar group-avatar--add">
                  +
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
