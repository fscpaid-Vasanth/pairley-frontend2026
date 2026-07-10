import React from 'react';
import { motion } from 'framer-motion';
import './RadiusSelector.css';

const RADIUS_OPTIONS = [
  { label: '2 KM', value: 2 },
  { label: '5 KM', value: 5 },
  { label: '10 KM', value: 10 },
  { label: '25 KM', value: 25 },
  { label: 'Entire City', value: 999 },
];

export default function RadiusSelector({ value = 5, onChange }) {
  return (
    <div className="radius-selector">
      <span className="radius-selector__label">Search Radius:</span>
      <div className="radius-selector__pills">
        {RADIUS_OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <motion.button
              key={opt.value}
              className={`radius-selector__pill${isActive ? ' radius-selector__pill--active' : ''}`}
              onClick={() => onChange && onChange(opt.value)}
              whileTap={{ scale: 0.93 }}
              whileHover={!isActive ? { scale: 1.03 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              aria-pressed={isActive}
            >
              {isActive && (
                <motion.span
                  className="radius-selector__pill-bg"
                  layoutId="radius-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <span className="radius-selector__pill-label">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

