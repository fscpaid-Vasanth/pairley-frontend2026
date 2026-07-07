import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Search, Heart, ChevronRight, Menu, X,
  Clock, Flame, ArrowRight, Sparkles, Smartphone, Download,
  LogOut, LayoutDashboard
} from 'lucide-react';

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
      <path fill="#22C55E" fillRule="evenodd" d="M 198.86 58.97 Q 198.86 56.57 196.46 56.65 L 168.11 57.63 Q 165.71 57.63 163.42 58.40 L 110.87 74.17 Q 108.57 74.86 107.32 76.91 L 97.25 93.38 Q 96.00 95.43 97.81 97.00 L 102.76 101.29 Q 104.57 102.86 106.53 101.47 L 116.33 94.53 Q 118.29 93.14 120.65 92.73 L 161.64 85.56 Q 164.00 85.14 166.26 85.95 L 169.74 87.19 Q 172.00 88.00 171.39 90.32 L 159.46 135.96 Q 158.86 138.29 156.47 138.55 L 135.53 140.88 Q 133.14 141.14 131.81 143.14 L 121.90 158.00 Q 120.57 160.00 122.97 159.87 L 170.75 157.27 Q 173.14 157.14 173.85 154.85 L 198.15 76.58 Q 198.86 74.29 198.86 71.89 L 198.86 58.97 Z M 172.68 8.94 Q 170.29 9.14 168.14 10.22 L 166.72 10.93 Q 164.57 12.00 163.05 13.86 L 160.95 16.43 Q 159.43 18.29 158.80 20.60 L 158.35 22.26 Q 157.71 24.57 157.93 26.96 L 158.07 28.47 Q 158.29 30.86 159.36 33.00 L 160.07 34.42 Q 161.14 36.57 162.84 38.27 L 163.45 38.87 Q 165.14 40.57 167.36 41.49 L 169.78 42.51 Q 172.00 43.43 174.39 43.27 L 178.25 43.01 Q 180.57 42.86 182.65 41.82 L 183.06 41.61 Q 185.14 40.57 186.71 38.85 L 189.24 36.06 Q 190.86 34.29 191.62 32.01 L 191.81 31.42 Q 192.57 29.14 192.57 26.74 L 192.57 25.26 Q 192.57 22.86 191.65 20.64 L 190.64 18.22 Q 189.71 16.00 187.93 14.39 L 185.78 12.46 Q 184.00 10.86 181.72 10.10 L 179.42 9.33 Q 177.14 8.57 174.75 8.77 L 172.68 8.94 Z M 150.96 165.93 Q 148.57 165.71 146.32 166.53 L 144.54 167.18 Q 142.29 168.00 140.49 169.59 L 138.94 170.98 Q 137.14 172.57 136.22 174.79 L 135.18 177.27 Q 134.29 179.43 134.29 181.77 L 134.29 182.23 Q 134.29 184.57 135.08 186.77 L 135.75 188.60 Q 136.57 190.86 138.27 192.55 L 140.02 194.30 Q 141.71 196.00 143.97 196.82 L 145.80 197.49 Q 148.00 198.29 150.34 198.29 L 150.81 198.29 Q 153.14 198.29 155.30 197.39 L 157.78 196.35 Q 160.00 195.43 161.70 193.73 L 162.36 193.07 Q 164.00 191.43 165.04 189.35 L 165.25 188.94 Q 166.29 186.86 166.48 184.54 L 166.66 182.39 Q 166.86 180.00 166.00 177.76 L 164.79 174.63 Q 164.00 172.57 162.44 171.01 L 162.13 170.70 Q 160.57 169.14 158.60 168.16 L 157.00 167.36 Q 154.86 166.29 152.47 166.07 L 150.96 165.93 Z M 148.88 175.69 Q 149.14 175.43 149.51 175.43 L 151.06 175.43 Q 151.43 175.43 151.69 175.69 L 151.74 175.74 Q 152.00 176.00 152.37 176.00 L 152.62 176.00 Q 153.14 176.00 153.61 176.23 L 153.77 176.31 Q 154.29 176.57 154.70 176.98 L 155.22 177.51 Q 156.00 178.29 156.49 179.27 L 156.62 179.53 Q 157.14 180.57 157.14 181.73 L 157.14 182.27 Q 157.14 183.43 156.62 184.47 L 156.49 184.73 Q 156.00 185.71 156.49 186.49 L 155.06 186.65 Q 154.29 187.43 153.30 187.92 L 153.04 188.05 Q 152.00 188.57 150.84 188.57 L 150.30 188.57 Q 149.14 188.57 148.10 188.05 L 147.84 187.92 Q 146.86 187.43 146.08 186.65 L 145.92 186.49 Q 145.14 185.71 144.65 184.73 L 144.52 184.47 Q 144.00 183.43 144.00 182.27 L 144.00 180.58 Q 144.00 180.00 144.26 179.48 L 144.31 179.38 Q 144.57 178.86 144.98 178.45 L 147.06 176.37 Q 147.43 176.00 147.95 176.00 L 148.20 176.00 Q 148.57 176.00 148.83 175.74 L 148.88 175.69 Z" />
    </g>
  </svg>
);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────


const DEAL_CARDS = [
  {
    id: 1,
    business: 'Zest Kitchen',
    category: '🍕',
    categoryName: 'Restaurant',
    offer: 'BOGO Main Course',
    tag: '50% OFF',
    price: null,
    original: null,
    distance: '1.2km',
    interested: 15,
    expiry: '6h',
    gradient: 'from-orange-400 to-red-500',
    color: 'bg-red-50',
  },
  {
    id: 2,
    business: 'FitZone Gym',
    category: '🏋️',
    categoryName: 'Gym',
    offer: '3-Month Membership',
    tag: '60% OFF',
    price: '₹999',
    original: '₹2,499',
    distance: '0.8km',
    interested: 23,
    expiry: '2d',
    gradient: 'from-blue-400 to-indigo-600',
    color: 'bg-blue-50',
  },
  {
    id: 3,
    business: 'Glam Studio',
    category: '💇',
    categoryName: 'Salon',
    offer: 'Haircut + Color',
    tag: '47% OFF',
    price: '₹799',
    original: '₹1,500',
    distance: '2.1km',
    interested: 8,
    expiry: '1d',
    gradient: 'from-pink-400 to-rose-500',
    color: 'bg-pink-50',
  },
  {
    id: 4,
    business: 'Fresh Mart',
    category: '🛒',
    categoryName: 'Supermarket',
    offer: 'Buy 2 Get 1 Free',
    tag: 'Groceries',
    price: null,
    original: null,
    distance: '0.5km',
    interested: 45,
    expiry: '4h',
    gradient: 'from-emerald-400 to-teal-500',
    color: 'bg-emerald-50',
  },
  {
    id: 5,
    business: 'Urban Cafe',
    category: '☕',
    categoryName: 'Cafe',
    offer: 'Free Dessert with Any Main',
    tag: 'Combo Deal',
    price: null,
    original: null,
    distance: '1.8km',
    interested: 12,
    expiry: '3d',
    gradient: 'from-amber-400 to-orange-500',
    color: 'bg-amber-50',
  },
  {
    id: 6,
    business: 'The Fitness Hub',
    category: '🏃',
    categoryName: 'Fitness',
    offer: 'Personal Training Session',
    tag: '63% OFF',
    price: '₹299',
    original: '₹800',
    distance: '1.5km',
    interested: 19,
    expiry: '5d',
    gradient: 'from-violet-400 to-purple-600',
    color: 'bg-violet-50',
  },
];

const CATEGORIES = [
  { emoji: '🍕', name: 'Restaurants', deals: '120+', gradient: 'from-orange-400 to-red-500', shadow: 'shadow-red-200' },
  { emoji: '🏋️', name: 'Gyms', deals: '45+', gradient: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-200' },
  { emoji: '💇', name: 'Salons', deals: '67+', gradient: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-200' },
  { emoji: '🛒', name: 'Supermarkets', deals: '38+', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
  { emoji: '🏪', name: 'Retail', deals: '92+', gradient: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-200' },
  { emoji: '✈️', name: 'Travel', deals: '29+', gradient: 'from-violet-400 to-purple-600', shadow: 'shadow-violet-200' },
];

const TRENDING = [
  { emoji: '🔥', name: 'FitZone Gym – 3 Month Deal', distance: '0.8km', interested: 23, category: 'Gym' },
  { emoji: '⚡', name: 'Fresh Mart – Grocery Bonanza', distance: '0.5km', interested: 45, category: 'Supermarket' },
  { emoji: '💥', name: 'Zest Kitchen – BOGO Offer', distance: '1.2km', interested: 15, category: 'Restaurant' },
];

const BENEFITS = [
  {
    icon: '📍',
    title: 'Location-Based',
    desc: 'Only see deals that are actually nearby. No irrelevant clutter — just savings within your reach.',
  },
  {
    icon: '💰',
    title: 'Real Savings',
    desc: 'Genuine discounts from verified local businesses. Every deal is vetted for authenticity.',
  },
  {
    icon: '🔔',
    title: 'Instant Alerts',
    desc: 'Get notified the moment new deals arrive near you. Never miss a limited-time offer again.',
  },
  {
    icon: '🤝',
    title: 'No Commitment',
    desc: 'Show interest for free. No upfront payment. Pay only when you visit the store.',
  },
];

const STEPS = [
  {
    step: '01',
    icon: '🔍',
    title: 'Find an Offer',
    desc: 'Browse nearby deals tailored to your location. Filter by category, distance, or discount.',
  },
  {
    step: '02',
    icon: '❤️',
    title: 'Show Interest',
    desc: 'Tap to join a deal — no payment needed upfront. Reserve your spot instantly.',
  },
  {
    step: '03',
    icon: '🏪',
    title: 'Visit & Save',
    desc: 'Walk into the store, show your Pairley confirmation, and enjoy your savings.',
  },
];

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: (i || 0) * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── DEAL CARD ────────────────────────────────────────────────────────────────

function DealCard({ deal, index }) {
  const [interestCount, setInterestCount] = useState(deal.interested);
  const [clicked, setClicked] = useState(false);

  const handleInterest = () => {
    if (!clicked) {
      setInterestCount((c) => c + 1);
      setClicked(true);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ y: -6, boxShadow: '0 25px 50px -12px rgba(109,40,217,0.18)' }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100 min-w-[280px] sm:min-w-0"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${deal.gradient}`} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl ${deal.color}`}>
            {deal.category}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${deal.gradient} text-white`}>
            {deal.tag}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{deal.business}</p>
          <h3 className="text-gray-900 font-bold text-base leading-snug mt-0.5">{deal.offer}</h3>
        </div>
        {deal.price && (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gray-900">{deal.price}</span>
            <span className="text-sm text-gray-400 line-through">{deal.original}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            <MapPin className="w-3 h-3" /> {deal.distance}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
            <Heart className="w-3 h-3" /> {interestCount} Interested
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> Expires {deal.expiry}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleInterest}
          className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
            clicked
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-200'
          }`}
        >
          {clicked ? '✓ Interest Shown!' : 'Show Interest'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function MarketingNavbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    navigate('/customer');
  };

  const getDashboardPath = () => {
    if (!authUser) return '/';
    const role = authUser.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business' || role === 'merchant') return '/business/dashboard';
    return '/customer/dashboard';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Connecting Figures vector */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <LogoMark className="w-10 h-10" />
            <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Pairley
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Deals', fn: () => scrollTo('#deals') },
              { label: 'How It Works', fn: () => scrollTo('#how-it-works') },
              { label: 'For Merchants', fn: () => navigate('/merchant') },
            ].map((link) => (
              <button
                key={link.label}
                onClick={link.fn}
                className={`text-sm font-semibold transition-colors ${
                  scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA / Dynamic Session */}
          <div className="hidden md:flex items-center gap-3">
            {authUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white/60 hover:bg-white text-gray-700 text-xs font-semibold rounded-full shadow-sm transition-all"
                >
                  <LayoutDashboard size={14} className="text-[#5B12D6]" />
                  Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-full shadow-sm transition-all"
                >
                  <LogOut size={14} />
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`text-sm font-semibold transition-colors ${
                    scrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
                >
                  Sign Up Free
                </motion.button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {[
                { label: 'Deals', fn: () => scrollTo('#deals') },
                { label: 'How It Works', fn: () => scrollTo('#how-it-works') },
                { label: 'For Merchants', fn: () => { setMenuOpen(false); navigate('/merchant'); } },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.fn}
                  className="text-left text-base font-semibold text-gray-700 py-2 hover:text-purple-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
                {authUser ? (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); navigate(getDashboardPath()); }}
                      className="py-2.5 text-center text-sm font-semibold text-gray-600 border border-gray-200 rounded-full flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={14} className="text-[#5B12D6]" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="py-2.5 text-center text-sm font-semibold text-red-500 border border-red-200 rounded-full flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/login'); }}
                      className="py-2.5 text-center text-sm font-semibold text-gray-600 border border-gray-200 rounded-full"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/signup'); }}
                      className="py-2.5 text-center text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-md"
                    >
                      Sign Up Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────

function HeroSection() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const categoryPills = [
    { emoji: '🍕', label: 'Restaurants' },
    { emoji: '🏋️', label: 'Gyms' },
    { emoji: '💇', label: 'Salons' },
    { emoji: '🛒', label: 'Supermarkets' },
    { emoji: '🏪', label: 'Retail' },
    { emoji: '✈️', label: 'Travel' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-emerald-900" />
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #6D28D9 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, #10B981 0%, transparent 50%),
                            radial-gradient(circle at 50% 80%, #4338CA 0%, transparent 50%)`,
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -24, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-[8%] w-72 h-72 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute bottom-1/4 right-[8%] w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full bg-teal-400/15 blur-3xl pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-6"
        >
          <span>📍</span>
          <span>Hyperlocal Deal Discovery</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6"
        >
          <span className="text-white">Discover </span>
          <span className="bg-gradient-to-r from-purple-300 via-violet-200 to-emerald-300 bg-clip-text text-transparent">
            Nearby Deals
          </span>
          <br />
          <span className="text-white">&amp; Save More</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Find exclusive offers from restaurants, gyms, salons, and local stores near you.
          Save money every time you step out.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-8"
        >
          <div className="flex-1 w-full flex items-center gap-3 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl px-4 py-3 shadow-xl">
            <Search className="w-5 h-5 text-white/60 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search deals near you..."
              className="flex-1 bg-transparent text-white placeholder-white/50 text-sm font-medium outline-none"
            />
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/80 text-xs font-semibold shrink-0">
              <MapPin className="w-3.5 h-3.5" />
              Whitefield, Bengaluru
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all whitespace-nowrap"
          >
            Search Deals
          </motion.button>
        </motion.div>

        {/* Mobile location */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="sm:hidden flex items-center justify-center gap-1.5 mb-6 text-white/70 text-sm"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Whitefield, Bengaluru</span>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap justify-center gap-2"
        >
          {categoryPills.map((pill) => (
            <motion.button
              key={pill.label}
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/85 text-sm font-medium transition-all"
            >
              <span>{pill.emoji}</span>
              <span>{pill.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
}

// ─── FEATURED DEALS SECTION ───────────────────────────────────────────────────

function FeaturedDealsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="deals" className="py-20 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            🔥 Deals Near You
          </h2>
          <p className="text-gray-500 font-medium flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Within 2km · Whitefield, Bengaluru
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex overflow-x-auto gap-5 pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible snap-x snap-mandatory sm:snap-none -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DEAL_CARDS.map((deal, i) => (
            <div key={deal.id} className="snap-start shrink-0 sm:shrink sm:snap-none w-[80vw] sm:w-auto">
              <DealCard deal={deal} index={i} />
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          custom={7}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mt-10 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-purple-600 text-purple-600 font-bold text-sm hover:bg-purple-600 hover:text-white transition-all"
          >
            View All Deals
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────

function CategorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Explore by Category
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Hundreds of deals across every lifestyle category, all within your neighbourhood.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              variants={fadeInUp}
              custom={i}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.gradient} p-6 sm:p-8 cursor-pointer shadow-xl ${cat.shadow} group`}
            >
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-3">{cat.emoji}</div>
                <h3 className="text-white font-black text-lg sm:text-xl">{cat.name}</h3>
                <p className="text-white/80 text-sm font-medium mt-1">{cat.deals} Deals Nearby</p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="how-it-works" className="py-20 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Save Money in 3 Simple Steps
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            No complicated checkout. No apps to install first. Just discover, click, and save.
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-6 items-stretch">
          {/* Connecting line (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-purple-300 via-violet-400 to-emerald-400 origin-left z-0"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeInUp}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex-1 relative z-10"
            >
              <div className="bg-white rounded-3xl shadow-lg shadow-purple-100/50 p-8 h-full border border-gray-100 hover:shadow-xl hover:shadow-purple-100/60 transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-200">
                    <span className="text-white font-black text-sm">{step.step}</span>
                  </div>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-purple-300 to-emerald-300 rounded-full" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY PAIRLEY ──────────────────────────────────────────────────────────────

function WhyPairleySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Why Customers Love Pairley
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Built specifically for savvy shoppers who want real local deals — not generic coupons.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {BENEFITS.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              variants={fadeInUp}
              custom={i}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(109,40,217,0.15)' }}
              className="bg-white rounded-3xl p-8 shadow-lg shadow-purple-100/40 border border-purple-100/50 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-2xl shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{benefit.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── TRENDING ─────────────────────────────────────────────────────────────────

function TrendingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 bg-gray-950" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Trending in Your Area
            </h2>
            <p className="text-gray-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Hot deals right now near Whitefield
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {TRENDING.map((item, i) => (
            <motion.div
              key={item.name}
              variants={fadeInUp}
              custom={i}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
              className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
                  {item.category}
                </span>
              </div>
              <h3 className="text-white font-bold text-base leading-snug mb-3 group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {item.distance}
                </span>
                <span className="text-xs text-orange-400 font-bold">
                  🔥 {item.interested} interested
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── PHONE SVG ────────────────────────────────────────────────────────────────

function PhoneMockupSVG() {
  return (
    <svg viewBox="0 0 280 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 sm:w-64 drop-shadow-2xl">
      <rect x="10" y="0" width="260" height="560" rx="40" fill="#1a1a2e" />
      <rect x="14" y="4" width="252" height="552" rx="37" fill="#16213e" />
      <rect x="20" y="20" width="240" height="520" rx="30" fill="#0f0f23" />
      <rect x="100" y="20" width="80" height="24" rx="12" fill="#1a1a2e" />
      <rect x="40" y="52" width="60" height="6" rx="3" fill="#374151" />
      <rect x="200" y="52" width="30" height="6" rx="3" fill="#374151" />
      <rect x="30" y="70" width="140" height="10" rx="5" fill="#6D28D9" opacity="0.8" />
      <rect x="30" y="85" width="100" height="7" rx="3.5" fill="#4B5563" opacity="0.6" />
      {/* Card 1 */}
      <rect x="24" y="105" width="232" height="80" rx="16" fill="#1e1b4b" />
      <rect x="24" y="105" width="232" height="4" rx="2" fill="url(#g1)" />
      <circle cx="50" cy="135" r="14" fill="#312e81" />
      <text x="50" y="140" textAnchor="middle" fontSize="14">🍕</text>
      <rect x="74" y="122" width="80" height="7" rx="3.5" fill="#e0e7ff" opacity="0.8" />
      <rect x="74" y="134" width="110" height="6" rx="3" fill="#a5b4fc" opacity="0.5" />
      <rect x="74" y="148" width="50" height="7" rx="3.5" fill="#10B981" opacity="0.7" />
      <rect x="24" y="167" width="232" height="14" rx="7" fill="#10B981" opacity="0.25" />
      <rect x="90" y="169" width="100" height="10" rx="5" fill="#10B981" opacity="0.6" />
      {/* Card 2 */}
      <rect x="24" y="197" width="232" height="80" rx="16" fill="#0f172a" />
      <rect x="24" y="197" width="232" height="4" rx="2" fill="url(#g2)" />
      <circle cx="50" cy="227" r="14" fill="#1e3a5f" />
      <text x="50" y="232" textAnchor="middle" fontSize="14">🏋️</text>
      <rect x="74" y="214" width="70" height="7" rx="3.5" fill="#e0e7ff" opacity="0.8" />
      <rect x="74" y="226" width="100" height="6" rx="3" fill="#93c5fd" opacity="0.5" />
      <rect x="74" y="240" width="50" height="7" rx="3.5" fill="#10B981" opacity="0.7" />
      <rect x="24" y="259" width="232" height="14" rx="7" fill="#10B981" opacity="0.25" />
      <rect x="90" y="261" width="100" height="10" rx="5" fill="#10B981" opacity="0.6" />
      {/* Card 3 */}
      <rect x="24" y="289" width="232" height="80" rx="16" fill="#1a0f2e" />
      <rect x="24" y="289" width="232" height="4" rx="2" fill="url(#g3)" />
      <circle cx="50" cy="319" r="14" fill="#3b0764" />
      <text x="50" y="324" textAnchor="middle" fontSize="14">💇</text>
      <rect x="74" y="306" width="90" height="7" rx="3.5" fill="#f0abfc" opacity="0.8" />
      <rect x="74" y="318" width="80" height="6" rx="3" fill="#e879f9" opacity="0.5" />
      <rect x="74" y="332" width="50" height="7" rx="3.5" fill="#10B981" opacity="0.7" />
      <rect x="24" y="351" width="232" height="14" rx="7" fill="#10B981" opacity="0.25" />
      <rect x="90" y="353" width="100" height="10" rx="5" fill="#10B981" opacity="0.6" />
      {/* Bottom bar */}
      <rect x="24" y="385" width="232" height="142" rx="20" fill="#111827" opacity="0.9" />
      <text x="140" y="415" textAnchor="middle" fontSize="13" fill="#6D28D9" fontWeight="bold">Pairley</text>
      <rect x="60" y="426" width="160" height="5" rx="2.5" fill="#374151" opacity="0.4" />
      <rect x="80" y="436" width="120" height="5" rx="2.5" fill="#374151" opacity="0.3" />
      <rect x="50" y="452" width="50" height="26" rx="8" fill="#10B981" opacity="0.3" />
      <rect x="115" y="452" width="50" height="26" rx="8" fill="#6D28D9" opacity="0.3" />
      <rect x="180" y="452" width="50" height="26" rx="8" fill="#1e40af" opacity="0.3" />
      <rect x="44" y="500" width="36" height="6" rx="3" fill="#6D28D9" opacity="0.8" />
      <rect x="122" y="500" width="36" height="6" rx="3" fill="#374151" />
      <rect x="200" y="500" width="36" height="6" rx="3" fill="#374151" />
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="232" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="232" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="232" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── CTA SECTION ──────────────────────────────────────────────────────────────

function CTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const stats = [
    { value: '10,000+', label: 'Customers' },
    { value: '500+', label: 'Merchants' },
    { value: '₹50L+', label: 'Saved' },
  ];

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-violet-600 to-emerald-600" />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%),
                            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-[5%] w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-10 right-[5%] w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Phone mockup */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex-shrink-0"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PhoneMockupSVG />
            </motion.div>
          </motion.div>

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              variants={fadeInUp}
              custom={0}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Join Smart Shoppers Today
              </div>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              custom={1}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
            >
              Start Saving Today
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              custom={2}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="text-white/80 text-lg mb-8 max-w-lg"
            >
              Join thousands of smart shoppers discovering nearby deals every day.
              Free forever — no catch, no credit card.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup')}
                className="px-8 py-4 rounded-2xl bg-white text-purple-700 font-black text-base shadow-2xl hover:shadow-white/30 transition-all"
              >
                Sign Up Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.querySelector('#deals')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-2xl border-2 border-white/50 text-white font-bold text-base hover:border-white transition-all"
              >
                Browse Deals
              </motion.button>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              custom={4}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="text-white/60 text-sm mb-10"
            >
              ✓ No Credit Card Required &nbsp;·&nbsp; ✓ Free Forever for Customers
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  custom={i + 5}
                  className="flex flex-col items-center lg:items-start"
                >
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-white/60 text-sm font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function MarketingFooter() {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Find Deals', action: () => document.querySelector('#deals')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'For Merchants', action: () => navigate('/merchant') },
    { label: 'About', action: () => navigate('/about') },
    { label: 'Privacy Policy', action: () => navigate('/privacy') },
    { label: 'Terms', action: () => navigate('/terms') },
  ];

  return (
    <footer className="bg-gray-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <LogoMark className="w-10 h-10" />
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Pairley
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
              Hyperlocal deal discovery for smart shoppers. Save more every time you step out.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Quick Links</p>
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-gray-500 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Get the App */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Get the App</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Coming Soon on App Store
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all"
            >
              <Download className="w-4 h-4 text-purple-400" />
              Coming Soon on Play Store
            </motion.button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">© 2026 Pairley. All rights reserved.</p>
          <p className="text-gray-600 text-sm">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ROOT ────────────────────────────────────────────────────────────────

export default function CustomerMarketingPage() {
  return (
    <div className="font-sans antialiased bg-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <MarketingNavbar />
      <HeroSection />
      <FeaturedDealsSection />
      <CategorySection />
      <HowItWorksSection />
      <WhyPairleySection />
      <TrendingSection />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
