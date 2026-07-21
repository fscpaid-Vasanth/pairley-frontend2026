import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import LogoMark from './LogoMark';

const SECTION_LINKS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'For Merchants', id: 'merchant-benefits' },
  { label: 'FAQ', id: 'faq' },
];

export default function MarketingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const observerRef = useRef(null);

  const [authUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pairley_user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active-section highlight — whichever section currently occupies the
  // middle band of the viewport wins, rather than reacting to every pixel
  // of scroll.
  useEffect(() => {
    const sections = SECTION_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (sections.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((s) => observerRef.current.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = () => {
    localStorage.removeItem('pairley_token');
    localStorage.removeItem('pairley_user');
    navigate(0);
  };

  const getDashboardPath = () => {
    if (!authUser) return '/';
    const role = authUser.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business' || role === 'merchant') return '/business/dashboard';
    return '/customer/dashboard';
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-lg"
          >
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-black tracking-tight text-slate-900">Pairley</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {SECTION_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeSection === link.id
                    ? 'text-brand-purple bg-brand-purple/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {authUser ? (
              <>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center gap-1.5 px-4 py-2 text-slate-700 hover:text-slate-900 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login?role=customer')}
                  className="px-4 py-2 text-slate-700 hover:text-slate-900 text-sm font-semibold transition-colors"
                >
                  Log In
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/signup?role=customer')}
                  className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-dark text-white text-sm font-bold shadow-lg shadow-brand-purple/20 transition-colors"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-slate-200"
          >
            <div className="px-4 py-5 flex flex-col gap-1">
              {SECTION_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left text-slate-700 hover:text-brand-purple py-2.5 text-base font-semibold transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              {authUser ? (
                <>
                  <button
                    onClick={() => { navigate(getDashboardPath()); setMobileOpen(false); }}
                    className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full py-3 mt-2 text-slate-500 text-center font-semibold text-sm"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/login?role=customer'); setMobileOpen(false); }}
                    className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-semibold text-sm"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { navigate('/signup?role=customer'); setMobileOpen(false); }}
                    className="w-full py-3 mt-2 rounded-xl bg-brand-purple text-center font-bold text-sm text-white"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
