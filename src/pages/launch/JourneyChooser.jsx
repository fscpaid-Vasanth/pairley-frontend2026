import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingBag, Store, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../utils/constants';

const customerBenefits = [
  'FREE Registration',
  'Early Access to Deals',
  'Community Reward Unlocks',
  'Launch Badge',
];

const businessBenefits = [
  'Zero Onboarding Fee',
  'Unlimited Offers',
  'WhatsApp Leads',
  'Business Dashboard',
];

export default function JourneyChooser() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center' }}
    >
      <span className="launch-eyebrow">Welcome to Pairley</span>
      <h1 className="launch-title">
        Bangalore's Pass to <span className="accent">Bigger Savings</span>
      </h1>
      <p className="launch-subtitle">
        Join Bangalore's largest community-driven local discovery platform. Choose your journey.
      </p>

      <div className="launch-journey-grid">
        <motion.div
          whileHover={{ y: -8 }}
          className="launch-glass launch-journey-card"
          onClick={() => navigate(ROUTES.LAUNCH_REGISTER)}
        >
          <div className="launch-journey-card__icon" style={{ background: 'rgba(109, 40, 217, 0.2)' }}>
            <ShoppingBag size={26} color="#C4B5FD" />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>I'm a Customer</h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>I want my FREE Pairley Launch Pass.</p>
          <ul className="launch-journey-card__benefits">
            {customerBenefits.map((b) => (
              <li key={b}>
                <Check size={14} color="#22C55E" strokeWidth={3} />
                {b}
              </li>
            ))}
          </ul>
          <button className="launch-btn launch-btn--primary launch-btn--block" type="button">
            Get My Launch Pass
            <ArrowRight size={17} />
          </button>
        </motion.div>

        <motion.div
          whileHover={{ y: -8 }}
          className="launch-glass launch-journey-card"
          onClick={() => navigate('/merchant')}
        >
          <div className="launch-journey-card__icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
            <Store size={26} color="#22C55E" />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>I'm a Business Owner</h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>I want more nearby customers.</p>
          <ul className="launch-journey-card__benefits">
            {businessBenefits.map((b) => (
              <li key={b}>
                <Check size={14} color="#22C55E" strokeWidth={3} />
                {b}
              </li>
            ))}
          </ul>
          <button className="launch-btn launch-btn--outline launch-btn--block" type="button">
            Grow My Business
            <ArrowRight size={17} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
