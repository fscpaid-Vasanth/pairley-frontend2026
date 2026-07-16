import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from 'framer-motion';
import {
  Menu,
  X,
  Zap,
  MapPin,
  Check,
  ChevronRight,
  ArrowRight,
  Users,
  Store,
  TrendingUp,
  Sparkles,
  MessageCircle,
  BarChart3,
  ChevronDown,
  Clock,
  ShieldCheck,
  Percent,
  Calendar,
  Smartphone,
  Eye,
  Settings,
  Bell,
  Map,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import WhyJoinBeforeDiwali from './WhyJoinBeforeDiwali';

/* ─────────────────────────────────────────
   PAIRLEY INLINE SVG LOGO MARK
   Exact vector match of figures connecting to form a shopping cart shape
───────────────────────────────────────── */
const LogoMark = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 240 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(20,20)">
      {/* Purple Connecting Figure */}
      <path fill="#5B12D6" fillRule="evenodd" d="M 13.82 54.99 Q 11.43 54.86 10.89 57.20 L 10.25 59.95 Q 9.71 62.29 10.47 64.56 L 40.39 154.86 Q 41.14 157.14 43.54 157.24 L 108.46 159.90 Q 110.86 160.00 112.15 157.98 L 121.57 143.17 Q 122.86 141.14 120.46 141.02 L 57.25 137.84 Q 54.86 137.71 54.18 135.41 L 41.25 91.45 Q 40.57 89.14 41.46 86.91 L 41.97 85.66 Q 42.86 83.43 45.23 83.79 L 78.20 88.78 Q 80.57 89.14 82.46 90.63 L 86.68 93.95 Q 88.57 95.43 89.83 93.38 L 101.03 75.19 Q 102.29 73.14 100.00 72.42 L 53.72 57.86 Q 51.43 57.14 49.03 57.01 L 13.82 54.99 Z M 32.11 8.94 Q 29.71 9.14 27.61 10.29 L 25.53 11.42 Q 23.43 12.57 21.87 14.39 L 21.56 14.75 Q 20.00 16.57 19.03 18.76 L 18.69 19.52 Q 17.71 21.71 17.71 24.11 L 17.71 28.46 Q 17.71 30.86 18.79 33.00 L 19.50 34.42 Q 20.57 36.57 22.36 38.18 L 24.64 40.23 Q 26.29 41.71 28.36 42.49 L 28.78 42.65 Q 30.86 43.43 33.08 43.43 L 35.89 43.43 Q 38.29 43.43 40.51 42.54 L 41.77 42.03 Q 44.00 41.14 45.70 39.45 L 48.02 37.13 Q 49.71 35.43 50.61 33.20 L 51.11 31.94 Q 52.00 29.71 52.00 27.31 L 52.00 24.69 Q 52.00 22.29 51.01 20.10 L 50.14 18.18 Q 49.14 16.00 47.45 14.30 L 46.27 13.13 Q 44.57 11.43 42.31 10.62 L 38.83 9.38 Q 36.57 8.57 34.18 8.77 L 32.11 8.94 Z M 64.10 165.93 Q 61.71 165.71 59.42 166.40 L 58.30 166.74 Q 56.00 167.43 54.22 169.04 L 51.49 171.53 Q 49.71 173.14 48.74 175.34 L 48.40 176.09 Q 47.43 178.29 47.43 180.69 L 47.43 183.50 Q 47.43 185.71 48.21 187.79 L 48.36 188.21 Q 49.14 190.29 50.60 191.96 L 51.56 193.05 Q 53.14 194.86 55.32 195.86 L 58.45 197.31 Q 60.57 198.29 62.91 198.29 L 63.38 198.29 Q 65.71 198.29 67.91 197.49 L 69.74 196.82 Q 72.00 196.00 73.81 194.42 L 75.00 193.38 Q 76.57 192.00 77.61 190.18 L 77.82 189.82 Q 78.86 188.00 79.23 185.94 L 79.57 184.08 Q 80.00 181.71 79.53 179.36 L 79.33 178.35 Q 78.86 176.00 77.42 174.08 L 75.15 171.06 Q 73.71 169.14 71.57 168.07 L 70.15 167.36 Q 68.00 166.29 65.61 166.07 L 64.10 165.93 Z M 62.03 175.69 Q 62.29 175.43 62.65 175.43 L 64.20 175.43 Q 64.57 175.43 64.83 175.69 L 64.88 175.74 Q 65.14 176.00 65.51 176.00 L 65.77 176.00 Q 66.29 176.00 66.65 176.37 L 68.96 178.67 Q 69.14 178.86 69.14 179.12 L 69.14 179.17 Q 69.14 179.43 69.33 179.61 L 69.45 179.74 Q 69.71 180.00 69.71 180.37 L 69.71 183.63 Q 69.71 184.00 69.45 184.26 L 69.33 184.39 Q 69.14 184.57 69.14 184.83 L 69.14 184.88 Q 69.14 184.83 68.96 185.33 L 66.65 187.63 Q 66.29 188.00 65.77 188.00 L 65.51 188.00 Q 65.14 188.00 64.88 188.26 L 64.83 188.31 Q 64.57 188.57 64.20 188.57 L 62.65 188.57 Q 62.29 188.57 62.03 188.31 L 61.97 188.26 Q 61.71 188.00 61.35 188.00 L 61.09 188.00 Q 60.57 188.00 60.20 187.63 L 57.90 185.33 Q 57.71 185.14 57.71 184.88 L 57.71 184.83 Q 57.71 184.57 57.53 184.39 L 57.40 184.26 Q 57.14 184.00 57.14 183.63 L 57.14 180.37 Q 57.14 180.00 57.40 179.74 L 57.53 179.61 Q 57.71 179.43 57.71 179.17 L 57.71 179.12 Q 57.71 178.86 57.90 178.67 L 60.20 176.37 Q 60.57 176.00 61.09 176.00 L 61.35 176.00 Q 61.71 176.00 61.97 175.74 L 62.03 175.69 Z" />
      {/* Green Connecting Figure */}
      <path fill="#22C55E" fillRule="evenodd" d="M 198.86 58.97 Q 198.86 56.57 196.46 56.65 L 168.11 57.63 Q 165.71 57.63 163.42 58.40 L 110.87 74.17 Q 108.57 74.86 107.32 76.91 L 97.25 93.38 Q 96.00 95.43 97.81 97.00 L 102.76 101.29 Q 104.57 102.86 106.53 101.47 L 116.33 94.53 Q 118.29 93.14 120.65 92.73 L 161.64 85.56 Q 164.00 85.14 166.26 85.95 L 169.74 87.19 Q 172.00 88.00 171.39 90.32 L 159.46 135.96 Q 158.86 138.29 156.47 138.55 L 135.53 140.88 Q 133.14 141.14 131.81 143.14 L 121.90 158.00 Q 120.57 160.00 122.97 159.87 L 170.75 157.27 Q 173.14 157.14 173.85 154.85 L 198.15 76.58 Q 198.86 74.29 198.86 71.89 L 198.86 58.97 Z M 172.68 8.94 Q 170.29 9.14 168.14 10.22 L 166.72 10.93 Q 164.57 12.00 163.05 13.86 L 160.95 16.43 Q 159.43 8.29 158.80 20.60 L 158.35 22.26 Q 157.71 24.57 157.93 26.96 L 158.07 28.47 Q 158.29 30.86 159.36 33.00 L 160.07 34.42 Q 161.14 36.57 162.84 38.27 L 163.45 38.87 Q 165.14 40.57 167.36 41.49 L 169.78 42.51 Q 172.00 43.43 174.39 43.27 L 178.25 43.01 Q 180.57 42.86 182.65 41.82 L 183.06 41.61 Q 185.14 40.57 186.71 38.85 L 189.24 36.06 Q 190.86 34.29 191.62 32.01 L 191.81 31.42 Q 192.57 29.14 192.57 26.74 L 192.57 25.26 Q 192.57 22.86 191.65 20.64 L 190.64 18.22 Q 189.71 16.00 187.93 14.39 L 185.78 12.46 Q 184.00 10.86 181.72 10.10 L 179.42 9.33 Q 177.14 8.57 174.75 8.77 L 172.68 8.94 Z M 150.96 165.93 Q 148.57 165.71 146.32 166.53 L 144.54 167.18 Q 142.29 168.00 140.49 169.59 L 138.94 170.98 Q 137.14 172.57 136.22 174.79 L 135.18 177.27 Q 134.29 179.43 134.29 181.77 L 134.29 182.23 Q 134.29 184.57 135.08 186.77 L 135.75 188.60 Q 136.57 190.86 138.27 192.55 L 140.02 194.30 Q 141.71 196.00 143.97 196.82 L 145.80 197.49 Q 148.00 198.29 150.34 198.29 L 150.81 198.29 Q 153.14 198.29 155.30 197.39 L 157.78 196.35 Q 160.00 195.43 161.70 193.73 L 162.36 193.07 Q 164.00 191.43 165.04 189.35 L 165.25 188.94 Q 166.29 186.86 166.48 184.54 L 166.66 182.39 Q 166.86 180.00 166.00 177.76 L 164.79 174.63 Q 164.00 172.57 162.44 171.01 L 162.13 170.70 Q 160.57 169.14 158.60 168.16 L 157.00 167.36 Q 154.86 166.29 152.47 166.07 L 150.96 165.93 Z M 148.88 175.69 Q 149.14 175.43 149.51 175.43 L 151.06 175.43 Q 151.43 175.43 151.69 175.69 L 151.74 175.74 Q 152.00 176.00 152.37 176.00 L 152.62 176.00 Q 153.14 176.00 153.61 176.23 L 153.77 176.31 Q 154.29 176.57 154.70 176.98 L 155.22 177.51 Q 156.00 178.29 156.49 179.27 L 156.62 179.53 Q 157.14 180.57 157.14 181.73 L 157.14 182.27 Q 157.14 183.43 156.62 184.47 L 156.49 184.73 Q 156.00 185.71 156.49 186.49 L 155.06 186.65 Q 154.29 187.43 153.30 187.92 L 153.04 188.05 Q 152.00 188.57 150.84 188.57 L 150.30 188.57 Q 149.14 188.57 148.10 188.05 L 147.84 187.92 Q 146.86 187.43 146.08 186.65 L 145.92 186.49 Q 145.14 185.71 144.65 184.73 L 144.52 184.47 Q 144.00 183.43 144.00 182.27 L 144.00 180.58 Q 144.00 180.00 144.26 179.48 L 144.31 179.38 Q 144.57 178.86 144.98 178.45 L 147.06 176.37 Q 147.43 176.00 147.95 176.00 L 148.20 176.00 Q 148.57 176.00 148.83 175.74 L 148.88 175.69 Z" />
    </g>
  </svg>
);

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
   Designed for professional presentation
───────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 35 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/* ─────────────────────────────────────────
   MERCHANT PAGE COMPONENT
───────────────────────────────────────── */
export default function MerchantPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic user session check
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pairley_user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('pairley_token');
    localStorage.removeItem('pairley_user');
    setAuthUser(null);
    navigate('/merchant');
  };

  const getDashboardPath = () => {
    if (!authUser) return '/';
    const role = authUser.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business' || role === 'merchant') return '/business/dashboard';
    return '/customer/dashboard';
  };

  // Monitor scroll to update navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section references for scroll trigger animations
  const heroRef = useRef(null);
  const challengeRef = useRef(null);
  const worksRef = useRef(null);
  const compareRef = useRef(null);
  const previewRef = useRef(null);
  const aiRef = useRef(null);
  const whatsappRef = useRef(null);
  const locationRef = useRef(null);
  const benefitsRef = useRef(null);
  const successRef = useRef(null);
  const faqRef = useRef(null);
  const finalCtaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.15 });
  const challengeInView = useInView(challengeRef, { once: true, amount: 0.15 });
  const worksInView = useInView(worksRef, { once: true, amount: 0.15 });
  const compareInView = useInView(compareRef, { once: true, amount: 0.15 });
  const previewInView = useInView(previewRef, { once: true, amount: 0.15 });
  const aiInView = useInView(aiRef, { once: true, amount: 0.15 });
  const whatsappInView = useInView(whatsappRef, { once: true, amount: 0.15 });
  const locationInView = useInView(locationRef, { once: true, amount: 0.15 });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.15 });
  const successInView = useInView(successRef, { once: true, amount: 0.15 });
  const faqInView = useInView(faqRef, { once: true, amount: 0.15 });
  const finalCtaInView = useInView(finalCtaRef, { once: true, amount: 0.15 });

  return (
    <div className="bg-[#0b0314] text-white font-sans overflow-x-hidden min-h-screen">
      {/* Google Fonts Preloaded locally inside component */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* ─────────────────────────────────────────
         1. MARKETING NAVBAR
      ───────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0f071b]/85 backdrop-blur-xl border-b border-white/5 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <LogoMark className="w-10 h-10" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-brand-green bg-clip-text text-transparent">
              Pairley
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">How It Works</a>
            <a href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <button
              onClick={() => navigate('/customer')}
              className="text-brand-green hover:text-brand-green-light transition-colors text-sm font-medium"
            >
              For Customers
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {authUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center gap-1.5 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <LayoutDashboard size={14} className="text-brand-green" />
                  Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-all"
                >
                  <LogOut size={14} />
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/launch')}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all text-white"
                  style={{ background: 'linear-gradient(90deg, #6D28D9, #22C55E)' }}
                  title="Show customers the Launch Pass they can join today"
                >
                  ✨ Launch Pass
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Book Demo
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-purple to-brand-purple-light hover:shadow-glow-purple text-sm font-semibold rounded-xl transition-all"
                >
                  Become Merchant
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0f071b] border-b border-white/5 px-6 pb-6 overflow-hidden"
            >
              <div className="flex flex-col space-y-4 pt-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white text-sm font-medium"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white text-sm font-medium"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/70 hover:text-white text-sm font-medium"
                >
                  Pricing
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/customer');
                  }}
                  className="text-left text-brand-green hover:text-brand-green-light text-sm font-medium"
                >
                  For Customers
                </button>
                <div className="h-px bg-white/5 my-2" />
                {authUser ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(getDashboardPath());
                      }}
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-center text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={14} className="text-brand-green" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="w-full py-2.5 border border-white/10 text-center text-sm font-medium rounded-xl hover:bg-white/5"
                    >
                      Book Demo
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/signup');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-brand-purple to-brand-purple-light text-center text-sm font-semibold rounded-xl"
                    >
                      Become Merchant
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─────────────────────────────────────────
         2. HERO SECTION
      ───────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-24 md:pt-44 md:pb-36 min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Gradient Background and floating glowing orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0314] via-[#120524] to-[#0b0314] z-0" />
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-brand-purple/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-brand-green/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow z-0" />
        
        {/* Fine grid background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <motion.div
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light text-xs font-semibold uppercase tracking-wider"
            >
              <Store className="w-3.5 h-3.5 text-brand-green" />
              <span>🏪 For Local Businesses</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Turn Nearby Customers Into{' '}
              <span className="bg-gradient-to-r from-brand-purple-light via-[#9333EA] to-[#4ade80] bg-clip-text text-transparent">
                Paying Customers.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
            >
              Pairley helps local businesses publish offers in minutes, attract nearby customers, receive customer interest instantly, and increase walk-ins without expensive advertising.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                onClick={() => navigate('/merchant/join')}
                className="group px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-green hover:shadow-glow-purple text-white font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Register in 2 Minutes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all"
              >
                Full Setup / Book Demo
              </button>
            </motion.div>

            {/* Feature Bullet Strip */}
            <motion.div
              variants={fadeInUp}
              custom={4}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/5"
            >
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-xs font-semibold text-white/80">2 Minute Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-xs font-semibold text-white/80">Zero Onboarding Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-xs font-semibold text-white/80">Unlimited Offers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                <span className="text-xs font-semibold text-white/80">WhatsApp Alerts</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Right Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={heroInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Soft backdrop glow behind mock */}
            <div className="absolute inset-0 bg-brand-purple/10 rounded-3xl blur-[40px] z-0" />

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
              className="relative z-10 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-semibold text-white/40 tracking-wider uppercase">
                  Live Dashboard
                </span>
                <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green text-[10px] font-bold uppercase">
                  Demo
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/40 text-[10px] font-bold uppercase block tracking-wider">
                    Today's Views
                  </span>
                  <span className="text-2xl font-bold block mt-1 text-white">142</span>
                  <span className="text-brand-green text-xs font-semibold block mt-0.5">
                    ▲ 18% vs yesterday
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/40 text-[10px] font-bold uppercase block tracking-wider">
                    Interested Customers
                  </span>
                  <span className="text-2xl font-bold block mt-1 text-brand-green">23</span>
                  <span className="text-brand-purple-light text-xs font-semibold block mt-0.5">
                    9 joined group deals
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/40 text-[10px] font-bold uppercase block tracking-wider">
                    Live Offers
                  </span>
                  <span className="text-2xl font-bold block mt-1 text-white">8</span>
                  <span className="text-white/40 text-xs block mt-0.5">3 expiring soon</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-white/40 text-[10px] font-bold uppercase block tracking-wider">
                    Nearby Reach
                  </span>
                  <span className="text-2xl font-bold block mt-1 text-white">1.2 km</span>
                  <span className="text-white/40 text-xs block mt-0.5">Around Whitefield</span>
                </div>
              </div>

              {/* Simple SVG Chart */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-white/40 text-[10px] font-bold uppercase block tracking-wider">
                  Weekly Footfall Trend
                </span>
                <div className="h-16 flex items-end justify-between pt-4">
                  <div className="w-[12%] bg-brand-purple/20 rounded-t-sm h-1/4" />
                  <div className="w-[12%] bg-brand-purple/35 rounded-t-sm h-2/5" />
                  <div className="w-[12%] bg-brand-purple/50 rounded-t-sm h-3/5" />
                  <div className="w-[12%] bg-brand-purple/65 rounded-t-sm h-2/3" />
                  <div className="w-[12%] bg-brand-purple/80 rounded-t-sm h-4/5" />
                  <div className="w-[12%] bg-brand-green rounded-t-sm h-full" />
                  <div className="w-[12%] bg-brand-green/70 rounded-t-sm h-5/6" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <WhyJoinBeforeDiwali />

      {/* ─────────────────────────────────────────
         3. PROMINENT ANNOUNCEMENT BAR
      ───────────────────────────────────────── */}
      <section className="relative z-20 py-1 bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-green overflow-hidden shadow-glow-purple">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[size:40px_40px] animate-shimmer" />
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-2xl font-extrabold tracking-wide text-white block">
              🎉 ZERO ONBOARDING FEES
            </span>
            <p className="text-white/80 text-sm max-w-xl font-medium">
              No setup charges. No hidden costs. Start publishing offers immediately. Pay only when you're ready to subscribe.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-3.5 py-1.5 bg-black/35 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
              ⏱️ 2 Min Setup
            </span>
            <span className="px-3.5 py-1.5 bg-black/35 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
              🏷️ Unlimited Offers
            </span>
            <span className="px-3.5 py-1.5 bg-black/35 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
              📍 Discovery Radius
            </span>
            <span className="px-3.5 py-1.5 bg-black/35 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
              💬 Instant Alerts
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         4. MERCHANT CHALLENGES
      ───────────────────────────────────────── */}
      <section
        ref={challengeRef}
        className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden"
      >
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-purple/10 rounded-full blur-[100px] z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Sound Familiar?
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Traditional local advertising is expensive, hard to track, and often reaches the wrong audience.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView={challengeInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'Low Walk-ins',
                desc: 'Fewer customers walking through the door during off-peak hours.',
                icon: '📉',
              },
              {
                title: 'Expensive Advertising',
                desc: 'Social media ads drain budget with little to no trackable ROI.',
                icon: '💰',
              },
              {
                title: 'Poor Offer Visibility',
                desc: 'Your best deals go completely unnoticed by nearby customers.',
                icon: '👁️',
              },
              {
                title: 'No Repeat Customers',
                desc: 'Hard to build a database and bring back one-time visitors.',
                icon: '🔄',
              },
              {
                title: 'No Customer Insights',
                desc: 'You do not know who is interested in your offers or why they drop off.',
                icon: '📊',
              },
              {
                title: 'Limited Marketing Time',
                desc: 'Running the business daily leaves no time for complex ad campaigns.',
                icon: '⏰',
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-purple/50 hover:shadow-glow-purple/20 transition-all text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-2xl">
                  {c.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{c.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-gradient-to-r from-brand-purple/20 to-brand-green/20 border border-brand-purple/30 max-w-3xl mx-auto shadow-glow-purple/10"
          >
            <p className="text-lg font-semibold text-white">
              🚀 Pairley solves all these challenges from one simple dashboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         5. HOW PAIRLEY WORKS
      ───────────────────────────────────────── */}
      <section
        ref={worksRef}
        id="how-it-works"
        className="py-24 md:py-32 relative bg-[#0b0314]"
      >
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-brand-purple/10 rounded-full blur-[120px] z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How Pairley Works
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              A complete, automated marketing loop designed for local shop owners.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto pl-8 md:pl-0">
            {/* Center connector line on desktop, side line on mobile */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-purple to-brand-green transform md:-translate-x-1/2 z-0 opacity-40" />

            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Register Profile',
                  desc: 'Create your merchant profile in less than 2 minutes. Enter shop details and location.',
                  icon: '🏪',
                },
                {
                  step: '02',
                  title: 'Create Your Offer',
                  desc: 'Publish any type of offer: BOGO, direct percentage discount, or product bundles.',
                  icon: '📝',
                },
                {
                  step: '03',
                  title: 'Customers Discover Nearby',
                  desc: 'Pairley automatically displays your offers to active users within a 2-5km radius.',
                  icon: '📍',
                },
                {
                  step: '04',
                  title: 'Customers Show Interest',
                  desc: 'Interested local customers tap to join the deal. No upfront payment commitment required.',
                  icon: '❤️',
                },
                {
                  step: '05',
                  title: 'WhatsApp Notification',
                  desc: 'You receive an instant WhatsApp alert containing customer interest details.',
                  icon: '📱',
                },
                {
                  step: '06',
                  title: 'Customer Visits Store',
                  desc: 'The customer walks into your store to verify and redeem the active group deal.',
                  icon: '🚶',
                },
                {
                  step: '07',
                  title: 'Business Grows',
                  desc: 'Enjoy increased footfall, higher revenues, and build a local repeat customer base.',
                  icon: '📈',
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`flex flex-col md:flex-row relative z-10 ${
                    i % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Badge */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-brand-purple to-brand-green p-[2px] z-20">
                    <div className="w-full h-full bg-[#0b0314] rounded-full flex items-center justify-center font-bold text-sm text-brand-green">
                      {s.step}
                    </div>
                  </div>

                  {/* Left spacer for desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Content Card */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8 text-left">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{s.icon}</span>
                        <h3 className="text-lg font-bold text-white">{s.title}</h3>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         6. WHY PAIRLEY COMPARISON TABLE
      ───────────────────────────────────────── */}
      <section
        ref={compareRef}
        id="pricing"
        className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(109,40,217,0.1),transparent_60%)] z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Why Choose Pairley?
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              A factual feature comparison showing how Pairley compares with existing tools.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-sm font-bold text-white uppercase tracking-wider">Capabilities</th>
                  <th className="p-6 text-sm font-bold text-brand-green uppercase tracking-wider bg-brand-purple/10 border-x border-white/5">Pairley</th>
                  <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-wider">Instagram</th>
                  <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-wider">Google Maps</th>
                  <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-wider">Magicpin</th>
                  <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-wider">WhatsApp Biz</th>
                  <th className="p-6 text-sm font-bold text-white/50 uppercase tracking-wider">Justdial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-medium">
                {[
                  { name: 'Nearby Discovery', p: '✅ Yes', inst: '⚠️ Partial', gm: '⚠️ Partial', mp: '✅ Yes', wa: '❌ No', jd: '⚠️ Partial' },
                  { name: 'Dedicated Offer Grid', p: '✅ Yes', inst: '❌ No', gm: '❌ No', mp: '✅ Yes', wa: '⚠️ Partial', jd: '❌ No' },
                  { name: 'Offer Analytics', p: '✅ Yes', inst: '⚠️ Partial', gm: '❌ No', mp: '✅ Yes', wa: '❌ No', jd: '❌ No' },
                  { name: 'Interest Tracking', p: '✅ Yes', inst: '❌ No', gm: '❌ No', mp: '⚠️ Partial', wa: '❌ No', jd: '❌ No' },
                  { name: 'WhatsApp Notifications', p: '✅ Yes', inst: '❌ No', gm: '❌ No', mp: '❌ No', wa: '✅ Yes', jd: '⚠️ Partial' },
                  { name: 'AI Offer Suggestions', p: '✅ Yes', inst: '❌ No', gm: '❌ No', mp: '❌ No', wa: '❌ No', jd: '❌ No' },
                  { name: 'Location intelligence', p: '✅ Yes', inst: '❌ No', gm: '✅ Yes', mp: '⚠️ Partial', wa: '❌ No', jd: '❌ No' },
                  { name: 'Customer Database Growth', p: '✅ Yes', inst: '❌ No', gm: '❌ No', mp: '❌ No', wa: '⚠️ Partial', jd: '❌ No' },
                  { name: 'Setup Duration', p: '⚡ 2 Min', inst: '⏰ Long', gm: '⏰ Long', mp: '⏰ Long', wa: '⏰ Long', jd: '⏰ Long' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 text-white/95">{row.name}</td>
                    <td className="p-6 text-brand-green bg-brand-purple/5 font-bold border-x border-white/5">{row.p}</td>
                    <td className="p-6 text-white/60">{row.inst}</td>
                    <td className="p-6 text-white/60">{row.gm}</td>
                    <td className="p-6 text-white/60">{row.mp}</td>
                    <td className="p-6 text-white/60">{row.wa}</td>
                    <td className="p-6 text-white/60">{row.jd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         7. DASHBOARD PREVIEW
      ───────────────────────────────────────── */}
      <section
        ref={previewRef}
        className="py-24 md:py-32 relative bg-[#0b0314]"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Everything in One Dashboard
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Manage views, coordinate customer interest, and review AI suggestions with ease.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-glow-purple/20 space-y-8 text-left"
          >
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Good morning, Royal Cafe! 🌅</h3>
                <p className="text-white/40 text-xs">Here is what is happening with your offers today.</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80">
                  📅 Today, July 7
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-xs text-brand-purple-light font-semibold">
                  ⚙️ Active Plan: Free Trial
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Views", value: "142", icon: <Eye className="w-4 h-4 text-brand-green" /> },
                { label: "Interested Customers", value: "23", icon: <Users className="w-4 h-4 text-brand-purple-light" /> },
                { label: "Live Offers", value: "8", icon: <Percent className="w-4 h-4 text-brand-green" /> },
                { label: "Nearby Reach", value: "1.2 km", icon: <MapPin className="w-4 h-4 text-brand-purple-light" /> },
              ].map((m, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">{m.label}</span>
                    <span className="text-2xl font-bold text-white block">{m.value}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">{m.icon}</div>
                </div>
              ))}
            </div>

            {/* Detailed Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Chart Mockup */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Revenue Trend (INR)</span>
                  <span className="text-xs text-brand-green font-semibold">▲ 24% this week</span>
                </div>
                <div className="h-56 flex items-end justify-between pt-6">
                  {[24, 38, 45, 30, 60, 85, 70].map((val, idx) => (
                    <div key={idx} className="w-[10%] flex flex-col items-center gap-2">
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full bg-gradient-to-t from-brand-purple to-brand-green rounded-t-md relative group cursor-pointer"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {val * 100}
                        </div>
                      </div>
                      <span className="text-white/40 text-[10px]">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Live Feed Mockup */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <span className="text-sm font-bold text-white uppercase tracking-wider block">Live Enquiries</span>
                <div className="space-y-3">
                  {[
                    { name: 'Ravi Kumar', offer: 'BOGO Main Course', time: '2m ago', active: true },
                    { name: 'Priya Sharma', offer: 'Flat 30% Off Total Bill', time: '14m ago', active: false },
                    { name: 'Anil Mehta', offer: 'Weekend Special Combo', time: '1h ago', active: false },
                  ].map((e, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">{e.name}</span>
                        <span className="text-white/40 text-[10px] block">{e.offer}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/40 block">{e.time}</span>
                        {e.active && (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         8. AI FEATURES
      ───────────────────────────────────────── */}
      <section
        ref={aiRef}
        className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/4 w-[30rem] h-[30rem] bg-brand-green/5 rounded-full blur-[100px] z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>AI Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              🤖 Powered by AI Insights
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Maximize your deal conversions using automated local intelligence features.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView={aiInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: "AI Offer Generator", desc: "Instantly write high-converting copy tailored to your target locality.", icon: "✍️" },
              { title: "AI Pricing Suggestions", desc: "Predict the optimal discount points to maximize customer walk-ins.", icon: "🏷️" },
              { title: "AI Customer Insights", desc: "Identify which local customer demographic loves your offers.", icon: "👥" },
              { title: "AI Best Time to Publish", desc: "Discover when nearby users are checking deals to list your offers.", icon: "⏰" },
              { title: "AI Recommended Deals", desc: "Get suggestions for trending offers popular in nearby neighborhoods.", icon: "🔥" },
              { title: "AI Merchant Assistant", desc: "Get 24/7 business guidance on expanding customer retention.", icon: "💬" },
            ].map((f, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                custom={idx}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-green/50 hover:shadow-glow-green/20 transition-all text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         9. WHATSAPP AUTOMATION
      ───────────────────────────────────────── */}
      <section
        ref={whatsappRef}
        className="py-24 md:py-32 relative bg-[#0b0314]"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green text-xs font-semibold uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Instant WhatsApp Alerts</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Never Miss a Customer Enquiry
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              We send updates directly to your WhatsApp Business number. No complex app installs required to coordinate.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { title: "🟢 Customer Interested", desc: "Receive immediate notification: Ravi Kumar is interested in BOGO Meal." },
                { title: "📝 New Review", desc: "Get alert: Someone left a 5-star review on your published deal." },
                { title: "⏰ Offer Expiring", desc: "Reminder: Your weekend combo deal expires in 2 hours." },
                { title: "💳 Subscription Reminder", desc: "Simple renewal instructions sent to avoid deal interruptions." },
                { title: "📊 Daily Reports & Insights", desc: "Get weekly summary of views and customer engagement levels." },
              ].map((n, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-brand-green/10 flex items-center justify-center text-xs font-bold text-brand-green flex-shrink-0">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    <p className="text-white/50 text-xs">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="absolute inset-0 bg-brand-green/15 rounded-full blur-[80px] z-0" />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 w-80 h-[550px] bg-black border-[12px] border-zinc-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Camera Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-black/60" />
              </div>

              {/* Status Bar */}
              <div className="h-10 bg-[#075e54] pt-4 px-6 flex justify-between items-center text-[10px] text-white/80 z-10">
                <span>9:41</span>
                <span>📶 🔋</span>
              </div>

              {/* WhatsApp Header */}
              <div className="bg-[#075e54] px-4 py-3 flex items-center space-x-2 text-white z-10">
                <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                  P
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-green rounded-full border-2 border-[#075e54] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none">Pairley Alerts</h4>
                  <span className="text-[9px] text-white/60">Verified Business</span>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 bg-[#efeae2] p-4 space-y-4 overflow-y-auto">
                <div className="bg-[#e2f7cb] p-3 rounded-2xl shadow-sm text-left max-w-[85%] self-end ml-auto space-y-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-[#075e54]">New Deal Enquiry 🏪</span>
                  </div>
                  <p className="text-xs text-black leading-relaxed">
                    Customer <strong>Ravi Kumar</strong> is interested in your <strong>BOGO Burger Offer</strong>.
                  </p>
                  <span className="text-[9px] text-black/40 block text-right">9:41 AM</span>
                </div>

                <div className="bg-[#e2f7cb] p-3 rounded-2xl shadow-sm text-left max-w-[85%] self-end ml-auto space-y-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-bold text-[#075e54]">Group Reached Target 🎉</span>
                  </div>
                  <p className="text-xs text-black leading-relaxed">
                    Target group of 5 customers completed for <strong>Weekend Buffet</strong>. Total enquiries ready.
                  </p>
                  <span className="text-[9px] text-black/40 block text-right">9:45 AM</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         10. LOCATION INTELLIGENCE
      ───────────────────────────────────────── */}
      <section
        ref={locationRef}
        className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-12">
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-brand-green" />
              <span>Hyperlocal Matching</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Connect in the 2km Discovery Zone
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Concentric radius mapping displays your offers automatically to active buying customers nearby.
            </p>
          </div>

          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            {/* Map Mockup */}
            <div className="lg:col-span-8 relative flex justify-center">
              <div className="w-full max-w-lg aspect-square rounded-full border border-white/10 bg-white/5 relative flex items-center justify-center p-8 overflow-hidden">
                {/* Concentric rings */}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-white/5 animate-pulse-slow" />
                <div className="absolute w-[60%] h-[60%] rounded-full border border-brand-purple/20" />
                <div className="absolute w-[40%] h-[40%] rounded-full border border-brand-green/20" />

                {/* Central Merchant */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-brand-purple to-brand-green p-[2px] flex items-center justify-center shadow-xl">
                  <div className="w-full h-full bg-[#0b0314] rounded-full flex items-center justify-center text-xl">
                    🏪
                  </div>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded bg-brand-green text-[9px] font-extrabold">Shop</span>
                </div>

                {/* Nearby Customers */}
                {[
                  { emoji: "🍕", top: "15%", left: "30%", val: "300m" },
                  { emoji: "💇", top: "25%", left: "70%", val: "850m" },
                  { emoji: "🏋️", top: "70%", left: "20%", val: "500m" },
                  { emoji: "🛒", top: "80%", left: "65%", val: "1.1km" },
                  { emoji: "🚶", top: "50%", left: "85%", val: "900m" },
                ].map((cust, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                    style={{ top: cust.top, left: cust.left }}
                    className="absolute z-10 flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition-transform">
                      {cust.emoji}
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white/80 border border-white/5">
                      {cust.val}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map Info Panel */}
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-lg font-bold text-white">Interactive Matching</h4>
                <p className="text-white/60 text-xs leading-relaxed">
                  Active customer location pings automatically trigger nearby offer suggestions.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-white/40">Default Radius</span>
                    <span className="font-semibold text-white">2.0 Kilometers</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-white/40">Discovery Zone</span>
                    <span className="font-semibold text-brand-green">95% Match Rate</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Privacy Controls</span>
                    <span className="font-semibold text-brand-purple-light">100% Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         11. BENEFITS GRID
      ───────────────────────────────────────── */}
      <section
        ref={benefitsRef}
        className="py-24 md:py-32 relative bg-[#0b0314]"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Everything You Need to Grow
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              No commissions. Full transparency. Simple subscription to run unlimited local campaigns.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "Unlimited Offers", icon: "🏷️" },
              { title: "Zero Onboarding Fees", icon: "🚫" },
              { title: "No Commission Fees", icon: "💰" },
              { title: "Nearby Customer Focus", icon: "📍" },
              { title: "Dashboard Suite", icon: "📊" },
              { title: "Audience Analytics", icon: "📈" },
              { title: "WhatsApp Notifications", icon: "📱" },
              { title: "Location Intelligence", icon: "🗺️" },
              { title: "Transparent Pricing", icon: "📋" },
              { title: "AI Generated Ideas", icon: "🤖" },
            ].map((b, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/15 transition-all text-center space-y-3 relative group"
              >
                <span className="text-3xl block">{b.icon}</span>
                <span className="text-sm font-bold text-white block leading-tight">{b.title}</span>
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-[9px] text-brand-green font-bold">
                  ✓
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         12. SUCCESS STORIES (Illustrative Examples)
      ───────────────────────────────────────── */}
      <section
        ref={successRef}
        className="py-24 md:py-32 relative bg-[#0e041a] overflow-hidden"
      >
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-brand-purple/10 rounded-full blur-[100px] z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Real Results, Real Businesses
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Review typical performance metrics from local businesses using smart group deals.
            </p>
            <span className="inline-block px-3 py-1 rounded bg-brand-green/10 border border-brand-green/30 text-brand-green text-[10px] font-bold uppercase tracking-wider">
              * Illustrative Example
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                type: '🍽️ Restaurant',
                name: 'The Royal Bistro',
                before: 'Weekly walk-ins: 140',
                after: 'Weekly walk-ins: 215',
                percent: '+53% Growth',
                metrics: 'BOGO meal offer drew 75+ off-peak diners weekly.',
              },
              {
                type: '🏋️ Premium Gym',
                name: 'Core Fitness Hub',
                before: 'Weekly signups: 4',
                after: 'Weekly signups: 9',
                percent: '+125% Leads',
                metrics: 'Group membership trial deal filled empty morning slots.',
              },
              {
                type: '💇 Hair Salon',
                name: 'Glam Studio',
                before: 'Daily bookings: 8',
                after: 'Daily bookings: 13',
                percent: '+62% Bookings',
                metrics: 'Weekday combo discount package attracted new locality residents.',
              },
              {
                type: '🏪 Supermarket',
                name: 'Daily Fresh Mart',
                before: 'Average ticket: ₹450',
                after: 'Average ticket: ₹680',
                percent: '+51% Ticket Size',
                metrics: 'Volume bundle deal increased bulk grocery clearance.',
              },
            ].map((story, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50">{story.type}</span>
                    <span className="px-2 py-0.5 rounded bg-brand-green/20 text-brand-green text-[10px] font-bold">
                      {story.percent}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{story.name}</h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-white/40 line-through">{story.before}</p>
                    <p className="text-brand-green font-semibold">{story.after}</p>
                  </div>
                </div>
                <p className="text-white/60 text-xs border-t border-white/5 pt-4 leading-relaxed">
                  {story.metrics}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         13. FREQUENTLY ASKED QUESTIONS
      ───────────────────────────────────────── */}
      <section
        ref={faqRef}
        className="py-24 md:py-32 relative bg-[#0b0314]"
      >
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-16">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60 text-lg">
              Find answers to common merchant setup and deal listing queries.
            </p>
          </div>

          <div className="space-y-4">
            <FaqAccordion
              q="How does Pairley work?"
              a="Merchants publish offers on Pairley. Nearby customers see these offers based on their location. When interested, customers click Join — the merchant gets a WhatsApp notification instantly."
            />
            <FaqAccordion
              q="How do customers discover my business?"
              a="Pairley uses location technology to show your offers to customers within 2-5km. When they open the app or website, they see nearby deals first."
            />
            <FaqAccordion
              q="How do I receive customer enquiries?"
              a="Every time a customer shows interest in your offer, you receive an instant WhatsApp notification with their details."
            />
            <FaqAccordion
              q="Do I need technical knowledge?"
              a="Not at all. If you can use WhatsApp, you can use Pairley. Our onboarding takes less than 2 minutes."
            />
            <FaqAccordion
              q="How is Pairley different?"
              a="Pairley is specifically built for local offer discovery. Unlike social media, customers on Pairley are actively looking for nearby deals — they have buying intent."
            />
            <FaqAccordion
              q="How quickly can I publish my first offer?"
              a="Less than 2 minutes. Register, add your business details, create an offer — done."
            />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         14. FINAL CTA
      ───────────────────────────────────────── */}
      <section
        ref={finalCtaRef}
        className="py-24 md:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-green opacity-90 z-0" />
        <div className="absolute inset-0 bg-black/40 z-10" />

        <div className="max-w-4xl mx-auto px-6 relative z-20 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to Get More Customers?
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
            Join Pairley today and publish your first offer in less than 2 minutes.
          </p>

          {/* Banner inside CTA */}
          <div className="py-4 px-8 bg-black/35 rounded-2xl border border-white/10 max-w-lg mx-auto">
            <span className="text-xl font-extrabold text-white block">
              🚀 ZERO ONBOARDING FEES
            </span>
            <span className="text-xs text-white/60 block mt-1">
              Join today · Publish unlimited offers · Reach nearby customers
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-brand-purple hover:bg-white/95 font-bold rounded-2xl shadow-xl transition-all"
            >
              Become Merchant
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
            >
              Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         FOOTER
      ───────────────────────────────────────── */}
      <footer className="bg-[#07020d] border-t border-white/5 py-16 text-left relative z-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <LogoMark className="w-10 h-10" />
              <span className="text-xl font-bold tracking-tight text-white">Pairley</span>
            </div>
            <p className="text-white/40 text-xs max-w-sm leading-relaxed">
              Pairley connects local merchants with nearby customers to save money, increase footfall, and build stronger local commerce communities.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Merchants</h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Become Merchant</button></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Customers</h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li><button onClick={() => navigate('/customer')} className="hover:text-white transition-colors">Find Deals</button></li>
              <li><button onClick={() => navigate('/customer')} className="hover:text-white transition-colors">How It Works</button></li>
              <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Sign Up Free</button></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/refund-policy')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/support')} className="hover:text-white transition-colors">Support & Contact</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <span>© 2026 Pairley. All rights reserved.</span>
          <span>Made with ❤️ for local businesses in India</span>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────
   FAQ ACCORDION HELPER COMPONENT
───────────────────────────────────────── */
function FaqAccordion({ q, a }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-colors hover:border-white/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4 text-sm font-bold text-white focus:outline-none"
      >
        <span>{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 text-xs text-white/60 leading-relaxed border-t border-white/5 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

