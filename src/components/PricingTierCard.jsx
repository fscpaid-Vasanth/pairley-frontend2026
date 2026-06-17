import { Users, TrendingDown, Lock } from 'lucide-react';
import { formatPrice } from '../utils/constants';
import './PricingTierCard.css';

export default function PricingTierCard({ tiers, currentCount, maxParticipants }) {
  // Find which tier is currently active
  // Sort tiers ascending by minPeople
  const sortedTiers = [...tiers].sort((a, b) => a.minPeople - b.minPeople);
  
  let activeTierIndex = -1;
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (currentCount >= sortedTiers[i].minPeople) {
      activeTierIndex = i;
      break;
    }
  }

  const activeTier = activeTierIndex !== -1 ? sortedTiers[activeTierIndex] : null;
  const nextTier = activeTierIndex < sortedTiers.length - 1 ? sortedTiers[activeTierIndex + 1] : null;
  
  // Calculate completion percentage towards maximum capacity
  const progressPercent = Math.min(100, Math.round((currentCount / maxParticipants) * 100));

  return (
    <div className="pricing-tier-card glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <TrendingDown className="text-primary-light" size={20} />
          Group Pricing Tiers
        </h3>
        <span className="badge badge-primary flex items-center gap-1">
          <Users size={12} />
          {currentCount} Joined
        </span>
      </div>

      <div className="pricing-tier-card__tiers">
        {sortedTiers.map((tier, index) => {
          const isActive = index === activeTierIndex;
          const isLocked = index > activeTierIndex;
          const isFirst = index === 0;

          return (
            <div
              key={index}
              className={`pricing-tier-card__row ${
                isActive ? 'pricing-tier-card__row--active' : ''
              } ${isLocked ? 'pricing-tier-card__row--locked' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className={`pricing-tier-card__dot ${isActive ? 'pricing-tier-card__dot--active' : ''}`} />
                <span className="font-semibold">{tier.minPeople}+ people</span>
              </div>
              <div className="flex items-center gap-3">
                {isLocked && <Lock size={12} className="text-muted" />}
                <span className={`pricing-tier-card__price ${isActive ? 'text-success-light' : ''}`}>
                  {formatPrice(tier.pricePerHead)}
                </span>
                <span className="text-xs text-muted">/head</span>
              </div>
            </div>
          );
        })}
      </div>

      {nextTier && (
        <div className="pricing-tier-card__next mt-4 p-3 glass-subtle text-center text-sm">
          💡 Need <strong>{nextTier.minPeople - currentCount} more</strong> to unlock the{' '}
          <strong className="text-primary-light">{formatPrice(nextTier.pricePerHead)}</strong> price tier!
        </div>
      )}

      <div className="mt-5">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>Capacity progress</span>
          <span>{currentCount} / {maxParticipants} max</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
