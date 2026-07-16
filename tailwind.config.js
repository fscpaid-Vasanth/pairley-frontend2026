/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/marketing/**/*.{js,jsx}",
    "./src/components/marketing/**/*.{js,jsx}",
    "./src/pages/customer/**/*.{js,jsx}",
    "./src/pages/launch/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
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
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(91,18,214,0.4)',
        'glow-green': '0 0 40px rgba(34,197,94,0.3)',
        'glow-xl': '0 0 80px rgba(91,18,214,0.3)',
        'card': '0 8px 32px rgba(0,0,0,0.08)',
        'card-hover': '0 20px 60px rgba(91,18,214,0.2)',
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
