// Shared CTA button for the light landing-page redesign. Three variants
// map to the brief's button hierarchy: primary (purple gradient, the main
// "Explore Deals" action), secondary (outlined, "Become a Merchant"), and
// ghost (quiet text link, e.g. "Log In").
const VARIANTS = {
  primary:
    'bg-gradient-to-br from-pairley-purple to-pairley-purple-light text-white shadow-lg shadow-pairley-purple/25 hover:shadow-xl hover:shadow-pairley-purple/35 hover:-translate-y-0.5',
  secondary:
    'bg-white text-pairley-purple border border-pairley-purple/25 hover:border-pairley-purple/50 hover:bg-pairley-purple/[0.04] hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-slate-600 hover:text-pairley-ink',
};

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
};

// A trailing arrow icon (svg:last-child) nudges right on hover; the periodic
// light sweep is reserved for the large primary CTAs so it stays a highlight,
// not noise on every button. Both go still under reduced-motion.
const ARROW_NUDGE =
  '[&_svg:last-child]:transition-transform [&_svg:last-child]:duration-200 hover:[&_svg:last-child]:translate-x-1';

export default function LandingButton({
  variant = 'primary',
  size = 'lg',
  children,
  className = '',
  ...props
}) {
  const showShine = variant === 'primary' && size === 'lg';

  return (
    <button
      className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl font-bold font-outfit transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pairley-purple focus-visible:ring-offset-2 ${VARIANTS[variant]} ${SIZES[size]} ${ARROW_NUDGE} ${className}`}
      {...props}
    >
      {showShine && (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <span className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-cta-shine motion-reduce:hidden" />
        </span>
      )}
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
