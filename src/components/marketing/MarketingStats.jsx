import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import AnimatedCounter from './AnimatedCounter';

// Real numbers only (Decision 2) — sourced from GET /public/stats, never
// hardcoded. Labeled "Verified Merchants"/"Live Offers"/"Verified Members"
// rather than exaggerated marketing language, since current counts are
// still small and honesty matters more than looking bigger than we are.
export default function MarketingStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/public/stats')
      .then(setStats)
      .catch((err) => console.error('Failed to load public stats:', err));
  }, []);

  if (!stats) return null;

  const items = [
    { value: stats.usersPaired, label: 'Verified Members' },
    { value: stats.verifiedMerchants, label: 'Verified Merchants' },
    { value: stats.liveOffers, label: 'Live Offers' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            <AnimatedCounter value={item.value} />
          </div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
