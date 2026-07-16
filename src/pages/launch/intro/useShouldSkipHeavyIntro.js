// Decides whether a visitor should get the full Three.js particle intro or a
// lightweight CSS fallback: respects prefers-reduced-motion and skips the
// heavy path on devices that are unlikely to hold 60fps for a WebGL scene.
export const shouldSkipHeavyIntro = () => {
  if (typeof window === 'undefined') return true;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reducedMotion) return true;

  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory; // undefined on many browsers — only used when present
  if (cores <= 4) return true;
  if (memory && memory <= 4) return true;

  return false;
};
