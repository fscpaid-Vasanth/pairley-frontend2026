import { useEffect, useState } from 'react';
import { Users, Store, Tag, TrendingUp, ExternalLink } from 'lucide-react';
import {
  subscribeToGlobalCounters,
  subscribeToDailyCounter,
  subscribeToLeaderboard,
} from '../../utils/launchFirestore';
import { getAvatarById } from '../../data/launchAvatars';

/**
 * Read-only view of the Launch Pass campaign, sourced directly from
 * Firestore (this data doesn't live on the main REST backend — see the
 * Launch Pass plan notes). Same trust-the-client model as the rest of this
 * admin panel, which is fine for internal campaign monitoring.
 */
export default function LaunchPassAdminPanel() {
  const [counters, setCounters] = useState({ verifiedMembers: 0, merchantsJoined: 0, offersReady: 0, totalReferrals: 0 });
  const [today, setToday] = useState({ registrations: 0, businessesAdded: 0 });
  const [topReferrers, setTopReferrers] = useState([]);

  useEffect(() => {
    const unsubCounters = subscribeToGlobalCounters(setCounters);
    const unsubDaily = subscribeToDailyCounter(setToday);
    const unsubLeaderboard = subscribeToLeaderboard(setTopReferrers, 10);
    return () => {
      unsubCounters();
      unsubDaily();
      unsubLeaderboard();
    };
  }, []);

  const statCards = [
    { label: 'Verified Members', value: counters.verifiedMembers || 0, icon: Users, color: '#5B12D6' },
    { label: "Today's Registrations", value: today.registrations || 0, icon: TrendingUp, color: '#22C55E' },
    { label: 'Merchants Joined', value: counters.merchantsJoined || 0, icon: Store, color: '#F59E0B' },
    { label: 'Merchant Leads Today', value: today.businessesAdded || 0, icon: Store, color: '#F59E0B' },
    { label: 'Total Referrals', value: counters.totalReferrals || 0, icon: Tag, color: '#0EA5E9' },
  ];

  return (
    <div>
      <div className="flex items-start gap-2 mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <ExternalLink size={14} className="shrink-0 mt-0.5" />
        <span>
          Merchant lead contact details (shop name, mobile, WhatsApp) aren't shown here for privacy —
          the Firestore <code className="font-mono">launchPassMerchants</code> collection isn't publicly
          readable. View and follow up on individual leads via the{' '}
          <strong>Firebase Console → Firestore Database → Data</strong> tab.
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/80 border border-slate-200/50 rounded-2xl p-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}1a` }}
            >
              <Icon size={16} color={color} />
            </div>
            <div className="text-2xl font-black text-slate-800">{value.toLocaleString('en-IN')}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white/80 border border-slate-200/50 rounded-2xl p-5">
        <h3 className="text-sm font-black text-slate-800 mb-4">Top Referrers</h3>
        {topReferrers.length === 0 ? (
          <p className="text-xs text-slate-400">No referral activity yet.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {topReferrers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <span className="text-lg">{getAvatarById(m.avatarId).emoji}</span>
                <span className="flex-1 text-xs font-bold text-slate-700">{m.name}</span>
                <span className="text-[10px] font-bold text-slate-400">{m.passNumber}</span>
                <span className="text-xs font-black text-emerald-600">{m.referralCount || 0} referrals</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
