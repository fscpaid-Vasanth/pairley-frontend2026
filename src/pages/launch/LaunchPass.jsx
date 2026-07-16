import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LaunchLayout from './LaunchLayout';
import LaunchPassCard from './LaunchPassCard';
import WelcomeCelebration from './WelcomeCelebration';
import { useLaunchPassMember } from './useLaunchPassMember';
import { ROUTES } from '../../utils/constants';

export default function LaunchPass() {
  const { member, loading } = useLaunchPassMember();
  const location = useLocation();
  const navigate = useNavigate();
  const [celebrating, setCelebrating] = useState(Boolean(location.state?.justRegistered));

  // A fresh Firestore listener can report "not found" for a brief moment
  // right after this same session just wrote the doc (cache/listener
  // propagation lag), before the real snapshot arrives. Debounce the
  // redirect so that doesn't bounce a just-registered member back to /launch.
  useEffect(() => {
    if (loading || member) return;
    const timer = setTimeout(() => navigate(ROUTES.LAUNCH, { replace: true }), 1500);
    return () => clearTimeout(timer);
  }, [loading, member, navigate]);

  if (loading || !member) {
    return (
      <LaunchLayout>
        <div className="launch-loading-spinner" />
      </LaunchLayout>
    );
  }

  return (
    <LaunchLayout>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span className="launch-eyebrow">Your Launch Pass</span>
        <h1 className="launch-title" style={{ fontSize: 30 }}>
          You're In, <span className="accent">{member.name?.split(' ')[0] || 'Member'}</span>
        </h1>
      </div>

      <LaunchPassCard member={member} />

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button
          className="launch-btn launch-btn--primary"
          type="button"
          onClick={() => navigate(ROUTES.LAUNCH_DASHBOARD)}
        >
          Go to My Launch Dashboard <ArrowRight size={17} />
        </button>
      </div>

      <AnimatePresence>
        {celebrating && <WelcomeCelebration onDismiss={() => setCelebrating(false)} />}
      </AnimatePresence>
    </LaunchLayout>
  );
}
