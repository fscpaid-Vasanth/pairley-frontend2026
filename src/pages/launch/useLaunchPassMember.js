import { useEffect, useState } from 'react';
import { ensureAnonymousAuth } from '../../firebase';
import {
  subscribeToMember,
  subscribeToGlobalCounters,
  subscribeToDailyCounter,
} from '../../utils/launchFirestore';

const EMPTY_COUNTERS = { verifiedMembers: 0, merchantsJoined: 0, offersReady: 0, totalReferrals: 0 };
const EMPTY_TODAY = { registrations: 0, businessesAdded: 0 };

/**
 * Central Launch Pass data hook: signs the visitor in anonymously, then
 * live-subscribes to their member doc + the global/day counters. `member`
 * is `undefined` while loading, `null` once we know there's no pass yet,
 * or the member object once registered.
 */
export function useLaunchPassMember() {
  const [uid, setUid] = useState(null);
  const [member, setMember] = useState(undefined);
  const [counters, setCounters] = useState(EMPTY_COUNTERS);
  const [today, setToday] = useState(EMPTY_TODAY);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubMember, unsubCounters, unsubDaily;
    let cancelled = false;

    ensureAnonymousAuth()
      .then((user) => {
        if (cancelled) return;
        setUid(user.uid);
        unsubMember = subscribeToMember(user.uid, setMember);
        unsubCounters = subscribeToGlobalCounters(setCounters);
        unsubDaily = subscribeToDailyCounter(setToday);
      })
      .catch((err) => {
        console.error('Launch Pass auth error:', err);
        if (!cancelled) {
          setAuthError(err);
          setMember(null);
        }
      });

    return () => {
      cancelled = true;
      unsubMember?.();
      unsubCounters?.();
      unsubDaily?.();
    };
  }, []);

  return { uid, member, counters, today, loading: member === undefined, authError };
}
