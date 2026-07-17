import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Star,
  Check,
  ChevronRight,
  ArrowRight,
  Users,
  Store,
  TrendingUp,
  Heart,
  Sparkles,
  ShoppingBag,
  Tag,
  BadgeCheck,
  LogOut,
  LayoutDashboard,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../utils/api';
import { ROUTES, formatPrice, MALLS } from '../../utils/constants';
import { categories } from '../../data/categories';
import ImageWithFallback from '../../components/ImageWithFallback';

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

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─────────────────────────────────────────
   LANDING PAGE COMPONENT
───────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Offers lists & filtering states
  const [offers, setOffers] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMall, setSelectedMall] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');



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
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });

    // Fetch active offers
    api.get('/offers/list?status=ACTIVE')
      .then((data) => {
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || 0);
          const dateB = new Date(b.created_at || b.createdAt || 0);
          return dateB - dateA;
        });
        setOffers(sorted);
        setLoadingDeals(false);
      })
      .catch((err) => {
        console.error('Failed to load live deals:', err);
        setLoadingDeals(false);
      });



    // Inject Google Font Inter dynamically
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link2);

    document.title = "Pairley — India's Hyperlocal Group Buying Platform";

    return () => {
      window.removeEventListener('scroll', onScroll);
      try {
        document.head.removeChild(link);
        document.head.removeChild(link2);
      } catch (_) { }
    };
  }, []);

  const getMappedDeal = (deal) => {
    if (deal.original_price !== undefined) {
      const discountPct = Math.round(((deal.original_price - deal.offer_price) / deal.original_price) * 100);
      const categoryName = deal.category ? deal.category.toLowerCase() : 'shopping';
      return {
        id: deal.id || deal._id,
        title: deal.title,
        merchant: deal.business?.business_name || 'Local Seller',
        category: categoryName,
        originalPrice: deal.original_price,
        pairleyPrice: deal.offer_price,
        discount: `${discountPct}% OFF`,
        progress: Math.min(100, Math.round(((deal.joined_people || 0) / (deal.required_people || 2)) * 100)),
        joined: `${deal.joined_people || 0}/${deal.required_people || 2} Joined`,
        image: deal.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=350&fit=crop',
        mallName: deal.business?.mall_name || ''
      };
    }
    return deal;
  };

  const filteredDeals = React.useMemo(() => {
    let result = offers.map(getMappedDeal);
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((d) => d.category === selectedCategory);
    }
    if (selectedMall) {
      result = result.filter((d) => d.mallName === selectedMall);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.merchant.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
      );
    }
    return result;
  }, [offers, selectedCategory, selectedMall, searchQuery]);

  const navLinks = [
    { label: 'Explore Deals', href: '#deals' },
    { label: 'For Merchants', href: '/merchant' },
    { label: 'For Customers', href: '/customer' },
  ];

  const handleNav = (href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  const getDashboardPath = () => {
    if (!authUser) return '/';
    const role = authUser.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business' || role === 'merchant') return '/business/dashboard';
    return '/customer/dashboard';
  };

  // Helper to map category emoji to custom color tokens
  const getCategoryColors = (catId) => {
    const tokens = {
      dining: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
      fitness: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E' },
      beauty: { bg: 'rgba(236, 72, 153, 0.15)', text: '#EC4899' },
      tours: { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' },
      shopping: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06B6D4' },
    };
    return tokens[catId] || { bg: 'rgba(255,255,255,0.1)', text: '#FFFFFF' };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─────────────────────────────────────────
         MARKETING NAVBAR (Dynamic Session Integration)
      ───────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/10 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo connecting figures formation */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 focus:outline-none"
            >
              <LogoMark className="w-10 h-10" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-white to-brand-green bg-clip-text text-transparent">
                Pairley
              </span>
            </motion.button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.button
                  key={link.label}
                  whileHover={{ y: -1 }}
                  onClick={() => handleNav(link.href)}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors tracking-wide"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>

            {/* Dynamic Auth / Dashboard Actions */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/launch')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold tracking-wide"
                style={{ background: 'linear-gradient(90deg, #6D28D9, #22C55E)' }}
              >
                ✨ Launch Pass
              </motion.button>
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
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login?role=customer')}
                    className="px-4 py-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Log In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(91,18,214,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/signup?role=customer')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all"
                  >
                    Get Started
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-white/80 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-gray-950/95 backdrop-blur-2xl border-t border-white/10"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <motion.button
                    key={link.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(link.href)}
                    className="text-left text-white/80 hover:text-white py-2 text-base font-medium border-b border-white/5 last:border-0 transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}

                {authUser ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { navigate(getDashboardPath()); setMobileOpen(false); }}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={16} className="text-brand-green" />
                      Dashboard
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} />
                      Log Out
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { navigate('/login?role=customer'); setMobileOpen(false); }}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-center font-semibold text-sm"
                    >
                      Log In
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { navigate('/signup?role=customer'); setMobileOpen(false); }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-center font-semibold text-sm text-white"
                    >
                      Get Started
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─────────────────────────────────────────
         HERO SECTION (Matching exact brand vector theme)
      ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Animated gradient background matching logo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0118] via-[#120524] to-[#052318]">
          <div
            className="absolute inset-0 bg-gradient-to-tr from-brand-purple/40 via-[#430bb0]/25 to-brand-green/20"
            style={{ animation: 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite' }}
          />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Floating Orbs aligned to Logo colors */}
        <FloatingOrb className="w-96 h-96 bg-brand-purple/20 -top-20 -left-20" delay={0} duration={7} />
        <FloatingOrb className="w-80 h-80 bg-brand-green/15 top-1/3 -right-24" delay={1.5} duration={9} />
        <FloatingOrb className="w-64 h-64 bg-violet-500/20 bottom-10 left-1/4" delay={3} duration={8} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6"
          >
            {/* Logo placement inside Hero */}
            <motion.div variants={fadeInUp} custom={0} className="flex items-center space-x-2 mb-2">
              <LogoMark className="w-16 h-16 animate-float" />
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeInUp} custom={1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl text-white/90 text-sm font-medium shadow-lg">
                <span className="text-base">🚀</span>
                <span>India's Hyperlocal Group Buying Platform</span>
                <Sparkles size={14} className="text-brand-green" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              custom={2}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tight"
            >
              <span className="block text-white">One Platform.</span>
              <span className="block bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-green bg-clip-text text-transparent">
                Save More. Grow More.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              custom={3}
              className="max-w-2xl text-lg sm:text-xl text-white/65 leading-relaxed font-light"
            >
              Pairley connects nearby customers with local businesses. Customers discover
              exclusive local deals. Businesses attract more nearby customers.{' '}
              <span className="text-brand-green font-medium">Everyone wins.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              custom={4}
              className="flex flex-col sm:flex-row gap-4 mt-2"
            >
              <motion.button
                whileHover={{ scale: 1.06, boxShadow: '0 0 32px rgba(34,197,94,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNav('#deals')}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-green to-brand-green-dark text-white font-bold text-base shadow-2xl shadow-brand-green/30 transition-all"
              >
                Explore Deals
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/merchant')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white font-bold text-base hover:border-white/50 transition-all"
              >
                Grow My Business
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-white/40" />
          </div>
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────
         EXPLORE LIVE DEALS SECTION (HomePage logic merged)
      ───────────────────────────────────────── */}
      <section id="deals" className="py-24 bg-gray-900 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={12} />
                Live Hub
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Live Local Deals Near You
              </h2>
              <p className="mt-2 text-white/50 text-sm max-w-md">
                Browse real-time active offers in your area. Join a deal together to unlock discounts!
              </p>
            </div>

            {/* Live Search & Mall Filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search deals, shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-purple transition-all"
                />
              </div>

              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" />
                <select
                  value={selectedMall}
                  onChange={(e) => setSelectedMall(e.target.value)}
                  className="w-full pl-11 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-brand-purple cursor-pointer transition-all"
                >
                  <option value="" className="bg-gray-900 text-white">All Locations / Malls</option>
                  {MALLS.map((mall) => (
                    <option key={mall} value={mall} className="bg-gray-900 text-white">
                      {mall.split(',')[0]}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Category Chips Scroll strip */}
          <div className="flex overflow-x-auto pb-4 mb-10 gap-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${selectedCategory === 'all'
                  ? 'bg-[#5B12D6] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white'
                }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat.id
                    ? 'bg-white text-gray-900 border-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/70 hover:text-white'
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Deals Grid list */}
          {loadingDeals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col p-4 justify-between">
                  <div className="h-44 bg-white/10 rounded-xl" />
                  <div className="h-4 bg-white/10 rounded w-2/3 my-2" />
                  <div className="h-6 bg-white/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white/5 border border-white/5">
              <ShoppingBag size={48} className="mx-auto text-white/30 mb-4 animate-bounce" />
              <p className="text-white/60 font-semibold text-lg">No active deals found</p>
              <p className="text-white/40 text-sm mt-1 max-w-xs mx-auto">
                No matching offers run in this category or mall at the moment. Try updating your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDeals.map((deal) => {
                const colors = getCategoryColors(deal.category);
                return (
                  <motion.div
                    key={deal.id}
                    layout
                    whileHover={{ y: -6 }}
                    className="flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
                  >
                    {/* Cover image area */}
                    <div className="relative h-44 overflow-hidden bg-gray-800">
                      <ImageWithFallback
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackType="deal"
                        category={deal.category}
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-purple text-white text-[10px] font-black uppercase tracking-wider">
                        {deal.discount}
                      </div>
                    </div>

                    {/* Deal Details body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category Chip */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {deal.category}
                          </span>
                          {deal.mallName && (
                            <span className="text-[10px] text-white/40 truncate max-w-[120px] flex items-center gap-0.5">
                              📍 {deal.mallName.split(',')[0]}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-1">
                          {deal.title}
                        </h3>
                        <p className="text-white/40 text-[11px] font-medium mb-3">
                          {deal.merchant}
                        </p>
                      </div>

                      <div>
                        {/* Pricing row */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-brand-green font-black text-lg">
                            {formatPrice(deal.pairleyPrice)}
                          </span>
                          {deal.originalPrice && (
                            <span className="text-white/35 text-xs line-through">
                              {formatPrice(deal.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Progress Joined indicators */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between items-center text-[10px] text-white/50">
                            <span className="flex items-center gap-1">
                              <Users size={11} className="text-brand-purple-light" />
                              {deal.joined}
                            </span>
                            <span>{deal.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-purple to-brand-green transition-all duration-500"
                              style={{ width: `${deal.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Join Deal CTA */}
                        <Link
                          to={`${ROUTES.DEALS}/${deal.id}`}
                          className="block w-full py-2.5 text-center text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
                        >
                          Join Deal →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────
         LAUNCH PASS PROMO
      ───────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0533, #0d0f1a 60%, #062015)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-4">
            🚀 Pairley Launch Pass
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Registration is <span className="bg-gradient-to-r from-brand-purple-light to-brand-green bg-clip-text text-transparent">FREE.</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Become one of Bangalore's First 100,000 Launch Members. The more we join, the more we unlock — before the Diwali launch.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/launch')}
            className="px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, #6D28D9, #22C55E)' }}
          >
            Generate My Launch Pass
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         JOURNEY CARDS SECTION
      ───────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-purple/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple-light text-sm font-semibold tracking-widest uppercase mb-4">
              Get Started
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-brand-purple-light to-brand-green bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
              Whether you're shopping for deals or growing a business — Pairley has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* CUSTOMER CARD */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer"
              onClick={() => navigate('/customer')}
            >
              <div className="h-2 w-full bg-gradient-to-r from-brand-purple via-[#7C3AED] to-brand-purple-light" />
              <div className="p-8">
                <div className="w-full h-48 mb-6">
                  <CustomerIllustration />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 mb-4">
                  <ShoppingBag size={13} className="text-brand-purple-light" />
                  <span className="text-brand-purple-light text-xs font-bold uppercase tracking-wider">For Customers</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-2">I'm a Customer</h3>
                <p className="text-white/50 text-base mb-6">
                  Looking for nearby deals to save money
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  {['Discover nearby offers', 'Save money every time', 'Restaurants · Gyms · Salons', 'Supermarkets · Retail Stores'].map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-green/20 flex items-center justify-center">
                        <Check size={11} className="text-brand-green" strokeWidth={3} />
                      </div>
                      <span className="text-white/70 text-sm font-medium">{b}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-green to-brand-green-dark text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
                >
                  Explore Deals
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>

            {/* MERCHANT CARD */}
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer"
              onClick={() => navigate('/merchant')}
            >
              <div className="h-2 w-full bg-gradient-to-r from-brand-green via-brand-green-light to-brand-green-dark" />
              <div className="p-8">
                <div className="w-full h-48 mb-6">
                  <MerchantIllustration />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 mb-4">
                  <Store size={13} className="text-brand-green" />
                  <span className="text-brand-green text-xs font-bold uppercase tracking-wider">For Shop Owners</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-2">I'm a Shop Owner</h3>
                <p className="text-white/50 text-base mb-6">
                  I want more customers with Zero Onboarding Fees
                </p>
                <ul className="space-y-3 mb-8 text-left">
                  {['Publish unlimited offers', 'Reach nearby customers', 'Get instant customer enquiries', 'Grow your business'].map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-purple/20 flex items-center justify-center">
                        <Check size={11} className="text-brand-purple-light" strokeWidth={3} />
                      </div>
                      <span className="text-white/70 text-sm font-medium">{b}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
                >
                  Grow My Business
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* ─────────────────────────────────────────
         HOW IT WORKS
      ───────────────────────────────────────── */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a001a 0%, #0d0f1a 50%, #001a10 100%)' }}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm font-semibold tracking-widest uppercase mb-4">
              Simple and Fast
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              How It{' '}
              <span className="bg-gradient-to-r from-brand-purple-light to-brand-green bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-4 text-lg text-white/50 max-w-lg mx-auto">
              Three simple steps between you and incredible local savings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {[
              { step: '01', icon: MapPin, title: 'Find Nearby Deals', desc: 'Browse exclusive offers from local businesses in your area — restaurants, gyms, salons, supermarkets and more.', color: 'from-brand-purple to-brand-purple-light' },
              { step: '02', icon: Heart, title: 'Show Interest', desc: "Tap 'I'm Interested' on a deal. The merchant gets notified and you receive deal confirmation instantly.", color: 'from-brand-purple-light to-brand-green' },
              { step: '03', icon: BadgeCheck, title: 'Visit & Save', desc: "Walk in, flash your confirmation, enjoy your deal. It's that simple — no coupons, no hassle.", color: 'from-brand-green to-brand-green-dark' },
            ].map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-2xl mb-6 z-10`}>
                  <s.icon size={32} className="text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-950 border-2 border-white/10 flex items-center justify-center">
                    <span className="text-white/60 text-xs font-black">{s.step}</span>
                  </div>
                </div>
                <div className="w-full rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(91,18,214,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNav('#deals')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-green text-white font-bold text-base shadow-2xl"
            >
              <Sparkles size={20} />
              Start Saving Today — It's Free
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         FOOTER
      ───────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center gap-8 text-center">

            {/* Logo Connecting figures in footer */}
            <div className="flex items-center gap-2">
              <LogoMark className="w-12 h-12" />
              <span className="text-2xl font-black bg-gradient-to-r from-brand-purple-light to-brand-green bg-clip-text text-transparent">
                Pairley
              </span>
            </div>

            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              India's hyperlocal group buying platform — connecting customers and local businesses for mutual growth.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { label: 'For Customers', href: '/customer' },
                { label: 'For Merchants', href: '/merchant' },
                { label: 'About Us', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className="text-white/40 hover:text-white text-sm font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-xs text-white/25">
              <span>© 2026 Pairley. All rights reserved.</span>
              <span>Made with ❤️ for local businesses in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─────────────────────────────────────────
   FLOATING ORB
───────────────────────────────────────── */
const FloatingOrb = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    animate={{ y: [0, -28, 0], x: [0, 12, 0], scale: [1, 1.06, 1] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
  />
);

/* ─────────────────────────────────────────
   SVG ILLUSTRATIONS
───────────────────────────────────────── */
const CustomerIllustration = () => (
  <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="140" cy="110" r="90" fill="url(#custBg)" opacity="0.15" />
    <ellipse cx="140" cy="168" rx="34" ry="12" fill="#5B12D6" opacity="0.18" />
    <rect x="118" y="120" width="44" height="52" rx="10" fill="#7C3AED" />
    <circle cx="140" cy="102" r="26" fill="#FBBF24" />
    <ellipse cx="140" cy="78" rx="26" ry="10" fill="#92400E" />
    <circle cx="132" cy="100" r="3" fill="#1F2937" />
    <circle cx="148" cy="100" r="3" fill="#1F2937" />
    <path d="M132 108 Q140 116 148 108" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
    <rect x="94" y="126" width="26" height="10" rx="5" fill="#7C3AED" />
    <rect x="72" y="112" width="32" height="36" rx="6" fill="#22C55E" />
    <path d="M80 112 Q80 100 88 100 Q96 100 96 112" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" fill="none" />
    <text x="79" y="134" fill="white" fontSize="11" fontWeight="bold">Rs</text>
    <rect x="160" y="126" width="26" height="10" rx="5" fill="#7C3AED" />
    <rect x="176" y="112" width="32" height="36" rx="6" fill="#8B5CF6" />
    <path d="M184 112 Q184 100 192 100 Q200 100 200 112" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
    <text x="179" y="134" fill="white" fontSize="9" fontWeight="bold">50%</text>
    <circle cx="140" cy="52" r="12" fill="#EC4899" />
    <path d="M140 44 C134 44 130 48 130 53 C130 60 140 68 140 68 C140 68 150 60 150 53 C150 48 146 44 140 44Z" fill="#EC4899" />
    <circle cx="140" cy="53" r="4" fill="white" />
    <circle cx="56" cy="90" r="10" fill="#FCD34D" opacity="0.6" />
    <defs>
      <radialGradient id="custBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#5B12D6" />
        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

const MerchantIllustration = () => (
  <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="140" cy="110" r="90" fill="url(#merchBg)" opacity="0.15" />
    <rect x="60" y="148" width="160" height="48" rx="8" fill="#1E293B" />
    <rect x="60" y="140" width="160" height="16" rx="4" fill="#334155" />
    <rect x="70" y="80" width="140" height="64" rx="8" fill="#0F172A" />
    <rect x="78" y="88" width="55" height="48" rx="4" fill="#1E3A5F" />
    <rect x="147" y="88" width="55" height="48" rx="4" fill="#1E3A5F" />
    <rect x="85" y="62" width="110" height="24" rx="6" fill="#22C55E" />
    <text x="99" y="78" fill="white" fontSize="11" fontWeight="bold">PAIRLEY SHOP</text>
    <circle cx="140" cy="122" r="18" fill="#FBBF24" />
    <ellipse cx="140" cy="106" rx="18" ry="7" fill="#92400E" />
    <circle cx="135" cy="121" r="2.5" fill="#1F2937" />
    <circle cx="145" cy="121" r="2.5" fill="#1F2937" />
    <path d="M135 128 Q140 133 145 128" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <rect x="188" y="56" width="58" height="58" rx="8" fill="#0F172A" opacity="0.9" />
    <polyline points="200,100 212,88 224,92 236,72 240,76" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="240" cy="72" r="4" fill="#22C55E" />
    <defs>
      <radialGradient id="merchBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22C55E" />
        <stop offset="100%" stopColor="#5B12D6" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export default LandingPage;

