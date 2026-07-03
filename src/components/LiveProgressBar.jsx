import React from 'react';
import { motion } from 'framer-motion';
import './LiveProgressBar.css';

export default function LiveProgressBar({ current = 0, total = 1, label }) {
  const safeCurrent = Math.max(0, Math.min(current, total));
  const percentage = total > 0 ? Math.min((safeCurrent / total) * 100, 100) : 0;
  const remaining = Math.max(0, total - safeCurrent);
  const isComplete = safeCurrent >= total;

  return (
    <div className={`progress-bar-wrap${isComplete ? ' progress-bar--complete' : ''}`}>
      {/* Header */}
      <div className="progress-bar-header">
        <span className="progress-bar-header__joined">
          👥 {safeCurrent}/{total} Joined
        </span>
        {label && <span className="progress-bar-header__label">{label}</span>}
        <span className="progress-bar-header__pct">{Math.round(percentage)}%</span>
      </div>

      {/* Track */}
      <div className="progress-bar-track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="progress-bar-fill"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 0.8 }}
        />
      </div>

      {/* Footer */}
      <div className="progress-bar-footer">
        {isComplete ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="progress-bar-footer__complete"
          >
            🎉 Target Reached! Group is now active.
          </motion.span>
        ) : (
          <span className="progress-bar-footer__remaining">
            🔥 Only <strong>{remaining}</strong> More {remaining === 1 ? 'Person' : 'People'} Needed!
          </span>
        )}
      </div>
    </div>
  );
}
