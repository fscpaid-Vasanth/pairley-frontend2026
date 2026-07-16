// Firestore access layer for the Launch Pass campaign. Kept separate from
// src/utils/api.js (the existing REST client) because this data lives in
// Firestore, not the external backend — see the Launch Pass plan for why.
import {
  doc,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  getDocs,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { LAUNCH_POINTS } from '../data/launchLevels';

const COUNTERS_DOC = () => doc(db, 'launchPassCounters', 'global');
const SEQUENCE_DOC = () => doc(db, 'launchPassCounters', 'passSequence');
const MERCHANT_SEQUENCE_DOC = () => doc(db, 'launchPassCounters', 'merchantSequence');
const MEMBER_DOC = (uid) => doc(db, 'launchPassMembers', uid);
const todayId = () => new Date().toISOString().slice(0, 10);
const DAILY_DOC = (dayId = todayId()) => doc(db, 'launchPassDaily', dayId);

const formatPassNumber = (n) => `LP-${String(n).padStart(6, '0')}`;
const formatMerchantBadgeNumber = (n) => `LM-${String(n).padStart(6, '0')}`;

/**
 * Registers a Launch Pass member. Idempotent: if a member doc already
 * exists for this uid it's returned as-is (no duplicate pass number minted).
 * Mints a sequential pass number and bumps the global + daily counters in
 * one transaction so the community counter and the pass number never drift.
 */
export const registerLaunchPassMember = async (uid, profile, referredBy) => {
  const memberRef = MEMBER_DOC(uid);
  const existing = await getDoc(memberRef);
  if (existing.exists()) return existing.data();

  const referralCode = uid.slice(0, 8).toUpperCase();

  const member = await runTransaction(db, async (tx) => {
    const seqSnap = await tx.get(SEQUENCE_DOC());
    const nextSeq = (seqSnap.exists() ? seqSnap.data().value : 0) + 1;

    const memberData = {
      backendUserId: profile.backendUserId || null,
      passNumber: formatPassNumber(nextSeq),
      name: profile.name,
      avatarId: profile.avatarId,
      city: profile.city || 'Bangalore',
      area: profile.area || '',
      interests: profile.interests || [],
      email: profile.email || '',
      referralCode,
      referredBy: referredBy || null,
      referralCount: 0,
      points: LAUNCH_POINTS.JOIN_BONUS,
      lastVisitDate: todayId(),
      joinDate: serverTimestamp(),
    };

    tx.set(SEQUENCE_DOC(), { value: nextSeq }, { merge: true });
    tx.set(memberRef, memberData);
    tx.set(
      COUNTERS_DOC(),
      { verifiedMembers: increment(1), updatedAt: serverTimestamp() },
      { merge: true }
    );
    tx.set(
      DAILY_DOC(),
      { registrations: increment(1) },
      { merge: true }
    );

    return { id: uid, ...memberData };
  });

  if (referredBy) {
    await creditReferralByCode(referredBy);
  }

  return member;
};

/**
 * Finds the member whose referralCode matches and increments their
 * referral count + points. Best-effort — if the code doesn't resolve
 * (typo'd link, expired), registration still succeeds without a referral.
 */
export const creditReferralByCode = async (code) => {
  const q = query(collection(db, 'launchPassMembers'), where('referralCode', '==', code), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return;

  await updateDoc(doc(db, 'launchPassMembers', snap.docs[0].id), {
    referralCount: increment(1),
    points: increment(LAUNCH_POINTS.REFERRAL_BONUS),
  });
  await updateDoc(COUNTERS_DOC(), { totalReferrals: increment(1) });
};

/** Marks today as visited for streak tracking; awards a small daily bonus once per day. */
export const recordDailyVisit = async (uid) => {
  const memberRef = MEMBER_DOC(uid);
  const snap = await getDoc(memberRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const today = todayId();
  if (data.lastVisitDate === today) return; // already recorded today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = data.lastVisitDate === yesterday ? (data.loginStreak || 1) + 1 : 1;

  await updateDoc(memberRef, {
    lastVisitDate: today,
    loginStreak: streak,
    points: increment(LAUNCH_POINTS.DAILY_VISIT_BONUS),
  });
};

/**
 * Captures a merchant lead from the fast "/merchant/join" flow (mall
 * walk-ups, QR scans). Mints a sequential Launch Merchant badge number and
 * bumps the global + daily merchant counters in one transaction, same
 * pattern as registerLaunchPassMember. Doc id is a random auto-id, not the
 * uid — a merchant lead isn't a "user session" the way a customer pass is.
 */
export const registerMerchantLead = async (profile) => {
  const leadRef = doc(collection(db, 'launchPassMerchants'));

  const badgeNumber = await runTransaction(db, async (tx) => {
    const seqSnap = await tx.get(MERCHANT_SEQUENCE_DOC());
    const nextSeq = (seqSnap.exists() ? seqSnap.data().value : 0) + 1;
    const badge = formatMerchantBadgeNumber(nextSeq);

    const leadData = {
      shopName: profile.shopName,
      ownerName: profile.ownerName,
      category: profile.category,
      mobile: profile.mobile,
      whatsapp: profile.whatsapp || profile.mobile,
      area: profile.area || '',
      city: profile.city || 'Bangalore',
      source: profile.source || 'website',
      badgeNumber: badge,
      createdAt: serverTimestamp(),
    };

    tx.set(MERCHANT_SEQUENCE_DOC(), { value: nextSeq }, { merge: true });
    tx.set(leadRef, leadData);
    tx.set(
      COUNTERS_DOC(),
      { merchantsJoined: increment(1), updatedAt: serverTimestamp() },
      { merge: true }
    );
    tx.set(DAILY_DOC(), { businessesAdded: increment(1) }, { merge: true });

    return badge;
  });

  return badgeNumber;
};

export const updateMemberAvatar = async (uid, avatarId) => {
  await updateDoc(MEMBER_DOC(uid), { avatarId });
};

export const subscribeToMember = (uid, callback) => {
  return onSnapshot(MEMBER_DOC(uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
};

export const subscribeToGlobalCounters = (callback) => {
  return onSnapshot(COUNTERS_DOC(), (snap) => {
    callback(
      snap.exists()
        ? snap.data()
        : { verifiedMembers: 0, merchantsJoined: 0, offersReady: 0, totalReferrals: 0 }
    );
  });
};

export const subscribeToDailyCounter = (callback, dayId = todayId()) => {
  return onSnapshot(DAILY_DOC(dayId), (snap) => {
    callback(snap.exists() ? snap.data() : { registrations: 0, businessesAdded: 0 });
  });
};

export const subscribeToLeaderboard = (callback, topN = 10) => {
  const q = query(collection(db, 'launchPassMembers'), orderBy('points', 'desc'), limit(topN));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export { todayId };
