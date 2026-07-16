import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Store, Tag, Flame, Lock, Trophy, Pencil, LogOut } from 'lucide-react';
import LaunchLayout from './LaunchLayout';
import LaunchPassCard from './LaunchPassCard';
import RadialProgress from './RadialProgress';
import ShareCard from './ShareCard';
import AvatarPicker from './AvatarPicker';
import { useLaunchPassMember } from './useLaunchPassMember';
import { recordDailyVisit, subscribeToLeaderboard, updateMemberAvatar } from '../../utils/launchFirestore';
import { launchMilestones, getCurrentMilestoneIndex, getNextMilestone } from '../../data/launchMilestones';
import { getLevelForPoints, getNextLevel } from '../../data/launchLevels';
import { getTodaysMessage } from '../../data/launchDailyMessages';
import { launchMerchantPreviews } from '../../data/launchMerchantPreviews';
import { getCategoryById } from '../../data/categories';
import { getAvatarById } from '../../data/launchAvatars';
import { ROUTES, LAUNCH_DATE, formatNumber } from '../../utils/constants';
import CountdownTimer from '../../components/CountdownTimer';

export default function LaunchDashboard() {
  const { uid, member, counters, today, loading } = useLaunchPassMember();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [editingAvatar, setEditingAvatar] = useState(false);

  // See LaunchPass.jsx for why this is debounced rather than immediate —
  // a fresh listener can briefly report "not found" right after this same
  // session wrote the doc.
  useEffect(() => {
    if (loading || member) return;
    const timer = setTimeout(() => navigate(ROUTES.LAUNCH, { replace: true }), 1500);
    return () => clearTimeout(timer);
  }, [loading, member, navigate]);

  useEffect(() => {
    if (uid && member) recordDailyVisit(uid);
  }, [uid, member]);

  useEffect(() => {
    const unsub = subscribeToLeaderboard(setLeaderboard, 10);
    return unsub;
  }, []);

  const verifiedMembers = counters.verifiedMembers || 0;
  const milestoneIdx = getCurrentMilestoneIndex(verifiedMembers);
  const nextMilestone = getNextMilestone(verifiedMembers);
  const ring1Progress = nextMilestone ? verifiedMembers / nextMilestone.threshold : 1;

  const level = useMemo(() => getLevelForPoints(member?.points || 0), [member]);
  const nextLevel = useMemo(() => getNextLevel(member?.points || 0), [member]);
  const levelProgress = nextLevel ? (member?.points || 0) / nextLevel.minPoints : 1;

  const dailyMessage = useMemo(() => getTodaysMessage(), []);

  const handleAvatarChange = async (avatarId) => {
    if (!uid) return;
    await updateMemberAvatar(uid, avatarId);
    setEditingAvatar(false);
  };

  // Clears the real Pairley account session created during registration.
  // The Launch Pass itself stays tied to this browser's anonymous Firebase
  // session, so it's still here on return — this only logs out of the
  // backend account (matches Navbar.jsx's handleLogout behavior).
  const handleLogout = () => {
    localStorage.removeItem('pairley_token');
    localStorage.removeItem('pairley_user');
    navigate('/');
  };

  const logoutButton = (
    <button className="launch-shell__logout-btn" type="button" onClick={handleLogout}>
      <LogOut size={13} /> Log Out
    </button>
  );

  if (loading || !member) {
    return (
      <LaunchLayout>
        <div className="launch-loading-spinner" />
      </LaunchLayout>
    );
  }

  return (
    <LaunchLayout wide headerRight={logoutButton}>
      {/* Daily return banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="launch-glass"
        style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
      >
        <span style={{ fontSize: 22 }}>{dailyMessage.badge}</span>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{dailyMessage.text}</div>
        {today.registrations > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#22C55E', fontWeight: 700, whiteSpace: 'nowrap' }}>
            +{today.registrations} joined today
          </span>
        )}
      </motion.div>

      <div className="launch-dashboard-grid">
        {/* Center: identity + pass */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="launch-eyebrow">Member Level: {level.label}</span>
            <button className="launch-btn launch-btn--ghost" type="button" onClick={() => setEditingAvatar((v) => !v)}>
              <Pencil size={13} /> Avatar
            </button>
          </div>
          {editingAvatar && (
            <div className="launch-glass" style={{ padding: 16, marginBottom: 16 }}>
              <AvatarPicker value={member.avatarId} onChange={handleAvatarChange} />
            </div>
          )}
          <LaunchPassCard member={member} compact />

          {/* Ring 3: personal progress + level ring */}
          <div className="launch-section" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <RadialProgress progress={levelProgress} size={120} strokeWidth={9} color="#A78BFA">
              <div style={{ fontSize: 20, fontWeight: 900 }}>{member.points || 0}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>points</div>
            </RadialProgress>
            <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 180 }}>
              <div className="launch-glass launch-counter" style={{ flex: 1 }}>
                <div className="launch-counter__value">{member.referralCount || 0}</div>
                <div className="launch-counter__label">Referrals</div>
              </div>
              <div className="launch-glass launch-counter" style={{ flex: 1 }}>
                <div className="launch-counter__value">{member.loginStreak || 1}🔥</div>
                <div className="launch-counter__label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: community + milestones */}
        <div>
          {/* Ring 1: community progress */}
          <div className="launch-glass launch-section" style={{ padding: 24, textAlign: 'center' }}>
            <div className="launch-section__title" style={{ justifyContent: 'center' }}>
              <Users size={16} color="#22C55E" /> Community Progress
            </div>
            <RadialProgress
              progress={ring1Progress}
              size={170}
              strokeWidth={12}
              color="#22C55E"
            >
              <div style={{ fontSize: 26, fontWeight: 900 }}>{formatNumber(verifiedMembers)}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {nextMilestone ? `to ${nextMilestone.label}` : 'All unlocked!'}
              </div>
            </RadialProgress>

            <div className="launch-milestone-row">
              {launchMilestones.map((m, i) => (
                <div
                  key={m.threshold}
                  className={`launch-milestone-chip ${i <= milestoneIdx ? 'launch-milestone-chip--unlocked' : ''}`}
                >
                  <span className="launch-milestone-chip__icon">{m.icon}</span>
                  <span className="launch-milestone-chip__label">{m.label}</span>
                  {i > milestoneIdx && <Lock size={10} className="launch-milestone-chip__lock" />}
                </div>
              ))}
            </div>
          </div>

          {/* Live counters */}
          <div className="launch-section">
            <div className="launch-section__title"><Tag size={16} color="#A78BFA" /> Live Community Stats</div>
            <div className="launch-counter-strip">
              <div className="launch-glass launch-counter">
                <div className="launch-counter__value">{formatNumber(verifiedMembers)}</div>
                <div className="launch-counter__label">Verified Members</div>
              </div>
              <div className="launch-glass launch-counter">
                <div className="launch-counter__value">{formatNumber(counters.merchantsJoined || 0)}</div>
                <div className="launch-counter__label">Merchants Joined</div>
              </div>
              <div className="launch-glass launch-counter">
                <div className="launch-counter__value">{formatNumber(counters.offersReady || 0)}</div>
                <div className="launch-counter__label">Offers Ready</div>
              </div>
              <div className="launch-glass launch-counter">
                <div className="launch-counter__value">+{today.registrations || 0}</div>
                <div className="launch-counter__label">Joined Today</div>
              </div>
              <div className="launch-glass launch-counter">
                <div className="launch-counter__value">+{today.businessesAdded || 0}</div>
                <div className="launch-counter__label">Businesses Today</div>
              </div>
              <div className="launch-glass launch-counter">
                <CountdownTimer endDate={LAUNCH_DATE} />
                <div className="launch-counter__label" style={{ marginTop: 6 }}>To Diwali Launch</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward unlocks */}
      <div className="launch-section">
        <div className="launch-section__title"><Trophy size={16} color="#F59E0B" /> Reward Unlocks</div>
        <p className="launch-section__desc">The more Bangalore joins, the more categories unlock for everyone.</p>
        <div className="launch-dashboard-grid">
          {launchMilestones.map((m, i) => {
            const unlocked = i <= milestoneIdx;
            return (
              <div
                key={m.threshold}
                className={`launch-glass launch-merchant-card ${unlocked ? 'launch-milestone-chip--unlocked' : ''}`}
                style={{ gridColumn: 'span 1' }}
              >
                <span className="launch-merchant-card__badge">{m.label} Members</span>
                <div className="launch-merchant-card__name">{m.icon} {m.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {m.categoryIds.map((cid) => {
                    const cat = getCategoryById(cid);
                    return (
                      <span key={cid} className="launch-interest-chip" style={{ cursor: 'default' }}>
                        {cat?.icon} {cat?.name}
                      </span>
                    );
                  })}
                  {!unlocked && <Lock size={13} color="rgba(255,255,255,0.4)" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral / invite */}
      <div className="launch-section">
        <div className="launch-section__title"><Users size={16} color="#22C55E" /> Invite Friends & Climb the Leaderboard</div>
        <div className="launch-dashboard-grid">
          <ShareCard member={member} verifiedMembers={verifiedMembers} />
          <div className="launch-glass" style={{ padding: 18 }}>
            <div className="launch-section__title" style={{ marginBottom: 12 }}>Leaderboard</div>
            {leaderboard.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Be the first on the leaderboard!</p>
            )}
            {leaderboard.map((m, i) => (
              <div key={m.id} className="launch-leaderboard-row">
                <span className="launch-leaderboard-rank">{i + 1}</span>
                <span style={{ fontSize: 18 }}>{getAvatarById(m.avatarId).emoji}</span>
                <span className="launch-leaderboard-name">{m.name}{m.id === uid ? ' (You)' : ''}</span>
                <span className="launch-leaderboard-points">{m.points || 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Merchant preview */}
      <div className="launch-section">
        <div className="launch-section__title"><Store size={16} color="#A78BFA" /> Coming to Pairley</div>
        <p className="launch-section__desc">A preview of what's launching this Diwali.</p>
        <div className="launch-merchant-grid">
          {launchMerchantPreviews.map((p) => {
            const cat = getCategoryById(p.categoryId);
            return (
              <div key={p.id} className="launch-glass launch-merchant-card">
                <span className="launch-merchant-card__badge">Available on Launch Day</span>
                <div className="launch-merchant-card__name">{cat?.icon} {p.name}</div>
                <div className="launch-merchant-card__blurb">{p.blurb}</div>
              </div>
            );
          })}
        </div>
      </div>
    </LaunchLayout>
  );
}
