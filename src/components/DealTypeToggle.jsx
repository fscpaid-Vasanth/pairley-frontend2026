import { motion } from 'framer-motion';
import './DealTypeToggle.css';

const TOGGLE_OPTIONS = [
  { id: 'all', label: 'All Deals 🏷️' },
  { id: 'pair', label: 'Pair Deals 🤝' },
  { id: 'group', label: 'Group Deals 👥' },
];

export default function DealTypeToggle({ selected, onChange }) {
  return (
    <div className="deal-type-toggle tabs">
      {TOGGLE_OPTIONS.map((option) => {
        const isActive = selected === option.id;
        return (
          <button
            key={option.id}
            className={`tab ${isActive ? 'active' : ''} deal-type-toggle__btn`}
            onClick={() => onChange(option.id)}
            style={{ position: 'relative', background: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="activeToggleBackground"
                className="deal-type-toggle__active-bg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="deal-type-toggle__text">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
