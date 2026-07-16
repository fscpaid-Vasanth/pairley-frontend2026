import { lazy, Suspense, useEffect, useState } from 'react';
import { shouldSkipHeavyIntro } from './useShouldSkipHeavyIntro';
import LaunchIntroFallback from './LaunchIntroFallback';
import './intro.css';

const ParticleLogoIntro = lazy(() => import('./ParticleLogoIntro'));

const SEEN_KEY = 'pairley_launch_intro_seen';

/**
 * Gate + orchestrator for the cinematic opening. Plays once per device
 * (localStorage flag), is always skippable, and picks the lightweight
 * fallback on reduced-motion/low-end devices instead of the WebGL version.
 * Returning visitors skip straight past this (onComplete fires immediately).
 */
export default function LaunchIntro({ onComplete }) {
  const [alreadySeen] = useState(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [useHeavy] = useState(() => !shouldSkipHeavyIntro());

  const finish = () => {
    try {
      localStorage.setItem(SEEN_KEY, 'true');
    } catch {
      /* ignore storage errors (private browsing, etc.) */
    }
    onComplete?.();
  };

  // Returning visitor: finish on mount rather than during render — calling a
  // parent state setter mid-render (even indirectly) trips React's "cannot
  // update a component while rendering a different component" warning.
  useEffect(() => {
    if (alreadySeen) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (alreadySeen) {
    return null;
  }

  return (
    <div className="launch-intro-overlay">
      <button className="launch-intro-skip" onClick={finish} type="button">
        Skip
      </button>
      {useHeavy ? (
        <Suspense fallback={<div className="launch-intro-loading"><img src="/logo.svg" alt="" /></div>}>
          <ParticleLogoIntro onComplete={finish} />
        </Suspense>
      ) : (
        <LaunchIntroFallback onComplete={finish} />
      )}
    </div>
  );
}
