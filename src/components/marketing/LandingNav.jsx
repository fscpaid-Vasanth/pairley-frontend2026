import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';
import LogoMark from './LogoMark';
import LandingButton from './LandingButton';

// In-page anchors scroll to their section; "Explore Deals" and "Become a
// Merchant" route into the real app. Kept in one list so the desktop and
// mobile menus never drift apart.
const NAV_LINKS = [
  { label: 'Home', id: 'top' },
  { label: 'Explore Deals', to: '/deals' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'For Customers', id: 'customer-benefits' },
  { label: 'For Merchants', id: 'merchant-benefits' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
];

const SPY_IDS = ['how-it-works', 'customer-benefits', 'merchant-benefits', 'faq', 'contact'];

export default function LandingNav() {
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((s) => observerRef.current.observe(s));
    return () => observerRef.current?.disconnect();
  }, []);

  const go = (link) => {
    setMobileOpen(false);
    if (link.to) return navigate(link.to);
    if (link.id === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = () => {
    localStorage.removeItem('pairley_token');
    localStorage.removeItem('pairley_user');
    navigate(0);
  };

  const dashboardPath = () => {
    const role = authUser?.role?.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'business' || role === 'merchant') return '/business/dashboard';
    return '/customer/dashboard';
  };

  return (
    <motion.nav
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <button
            onClick={() => go({ id: 'top' })}
            className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pairley-purple"
          >
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-black tracking-tight text-pairley-ink font-outfit">PAIRLEY</span>
          </button>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => go(link)}
                className={`relative px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                  activeSection === link.id ? 'text-pairley-purple' : 'text-slate-600 hover:text-pairley-ink'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="landing-nav-underline"
                    className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-pairley-purple to-pairley-green"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2.5">
            {authUser ? (
              <>
                <button
                  onClick={() => navigate(dashboardPath())}
                  className="flex items-center gap-1.5 px-4 py-2 text-slate-700 hover:text-pairley-ink text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors"
                >
                  <LogOut size={15} /> Log Out
                </button>
              </>
            ) : (
              <>
                <LandingButton variant="secondary" size="md" onClick={() => navigate('/deals')}>
                  Explore Deals
                </LandingButton>
                <LandingButton variant="primary" size="md" onClick={() => navigate('/signup?role=business')}>
                  Become a Merchant <ArrowRight size={15} />
                </LandingButton>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
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
            className="lg:hidden overflow-hidden bg-white/97 backdrop-blur-xl border-t border-slate-200"
          >
            <div className="px-5 py-5 flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => go(link)}
                  className="text-left text-slate-700 hover:text-pairley-purple py-2.5 text-base font-semibold transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="h-px bg-slate-200 my-3" />
              {authUser ? (
                <>
                  <button
                    onClick={() => { navigate(dashboardPath()); setMobileOpen(false); }}
                    className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-pairley-ink text-center font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full py-3 mt-2 text-slate-400 text-center font-semibold text-sm"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <LandingButton variant="secondary" size="lg" className="w-full" onClick={() => { navigate('/deals'); setMobileOpen(false); }}>
                    Explore Deals
                  </LandingButton>
                  <LandingButton variant="primary" size="lg" className="w-full mt-2" onClick={() => { navigate('/signup?role=business'); setMobileOpen(false); }}>
                    Become a Merchant
                  </LandingButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
