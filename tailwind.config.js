/** @type {import('tailwindcss').Config} */
export default {
  // Scanning individual subfolders here has repeatedly bitten this project:
  // every time a new page directory used Tailwind classes without also
  // being added to this list, those classes got silently purged in
  // production (most recently: the entire admin, business, cart, and auth
  // page directories — ~550 class occurrences across 20+ files were being
  // dropped). One glob over all of src/ makes that whole bug class
  // impossible instead of relying on this list staying in sync by hand.
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#5B12D6',
          'purple-light': '#7C3AED',
          'purple-dark': '#430bb0',
          green: '#22C55E',
          'green-light': '#4ade80',
          'green-dark': '#16a34a',
          yellow: '#FFD84D',
        },
        // Premium semi-dark marketing-page palette — distinct from the
        // app's own light glassmorphic theme (index.css), used only on the
        // public landing page per the approved dark redesign.
        ink: {
          DEFAULT: '#0F1117', // page background
          section: '#171A23', // alternating section background
        },
        // Light landing-page redesign palette (2026-07 investor-ready
        // rebuild). Deliberately its own token group so it can use the
        // brief's exact #6D28D9 purple without disturbing the app-wide
        // brand.purple (#5B12D6) every other page depends on.
        pairley: {
          purple: '#6D28D9',
          'purple-light': '#7C3AED',
          'purple-dark': '#5B21B6',
          green: '#22C55E',
          'green-dark': '#16A34A',
          orange: '#F97316',
          ink: '#111827',
          mist: '#FAF9FF', // faint tinted section background
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'Inter', 'sans-serif'],
        syne: ['Syne', 'Space Grotesk', 'sans-serif'],
        outfit: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5B12D6 0%, #7C3AED 40%, #22C55E 100%)',
        'brand-gradient-r': 'linear-gradient(135deg, #22C55E 0%, #5B12D6 100%)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(91,18,214,0.3) 0%, transparent 70%)',
        'green-glow': 'radial-gradient(ellipse at center, rgba(34,197,94,0.2) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'ping-slow': 'ping 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'counter-up': 'counterUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        // Landing-page ambient background blobs — large, slow, organic
        // drift so the white space feels alive without distracting.
        'drift-slow': 'drift 16s ease-in-out infinite',
        'drift-slow-2': 'drift2 20s ease-in-out infinite',
        'drift-slow-3': 'drift3 24s ease-in-out infinite',
        // Periodic light sweep across primary CTA buttons — draws the eye
        // without being constant; sweeps then rests for a few seconds.
        'cta-shine': 'ctaShine 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(140px, -100px) scale(1.25)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-160px, 90px) scale(1.3)' },
        },
        drift3: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(120px, 80px) scale(1.15)' },
          '66%': { transform: 'translate(-100px, -60px) scale(0.9)' },
        },
        ctaShine: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '35%, 100%': { transform: 'translateX(320%) skewX(-20deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(28)', opacity: '0' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(91,18,214,0.4)',
        'glow-green': '0 0 40px rgba(34,197,94,0.3)',
        'glow-yellow': '0 0 40px rgba(255,216,77,0.25)',
        'glow-xl': '0 0 80px rgba(91,18,214,0.3)',
        'card': '0 8px 32px rgba(0,0,0,0.08)',
        'card-hover': '0 20px 60px rgba(91,18,214,0.2)',
        'card-dark': '0 8px 32px rgba(0,0,0,0.35)',
        'card-dark-hover': '0 24px 64px rgba(91,18,214,0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  corePlugins: {
    preflight: false, // prevents resetting existing app CSS
  },
  plugins: [],
}
