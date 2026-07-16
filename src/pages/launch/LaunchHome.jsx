import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LaunchIntro from './intro/LaunchIntro';
import LaunchLayout from './LaunchLayout';
import JourneyChooser from './JourneyChooser';
import { useLaunchPassMember } from './useLaunchPassMember';
import { ROUTES } from '../../utils/constants';

const REF_KEY = 'pairley_launch_ref';

export default function LaunchHome() {
  const [showIntro, setShowIntro] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { member, loading } = useLaunchPassMember();

  // Capture a referral code from a shared link (?ref=CODE) so it survives
  // the trip through the intro/registration flow.
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      try {
        localStorage.setItem(REF_KEY, ref);
      } catch {
        /* ignore storage errors */
      }
    }
  }, [searchParams]);

  // Returning member: skip the chooser entirely and go straight to their
  // dashboard — this is the "daily return" experience.
  useEffect(() => {
    if (!showIntro && !loading && member) {
      navigate(ROUTES.LAUNCH_DASHBOARD, { replace: true });
    }
  }, [showIntro, loading, member, navigate]);

  if (showIntro) {
    return <LaunchIntro onComplete={() => setShowIntro(false)} />;
  }

  if (loading || member) {
    return (
      <LaunchLayout fixed>
        <div className="launch-loading-spinner" />
      </LaunchLayout>
    );
  }

  return (
    <LaunchLayout fixed>
      <JourneyChooser />
    </LaunchLayout>
  );
}
