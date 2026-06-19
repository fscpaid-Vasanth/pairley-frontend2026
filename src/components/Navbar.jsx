import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, LogIn, UserPlus, ShoppingBag, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'How It Works', path: ROUTES.HOW_IT_WORKS },
  { label: 'For Shops', path: ROUTES.SIGNUP },
  { label: 'About Us', path: ROUTES.ABOUT },
];

// Motion Variants for Staggered Drawer sweep
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 150, 
      damping: 16 
    } 
  }
};

export default function Navbar({ onSearchClick }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Reactive auth state — re-read on every route change so Login/Signup
  // buttons disappear immediately after login without a full page reload.
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pairley_user') || 'null'); } catch { return null; }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('pairley_token'));

  // Re-sync auth state whenever the URL changes (after navigate()) or another
  // tab writes to storage.
  useEffect(() => {
    const sync = () => {
      try { setAuthUser(JSON.parse(localStorage.getItem('pairley_user') || 'null')); } catch { setAuthUser(null); }
      setAuthToken(localStorage.getItem('pairley_token'));
    };
    sync(); // run immediately on mount / location change
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [location.pathname]); // re-run whenever the route changes

  const user = authUser;
  const token = authToken;

  const handleLogout = () => {
    localStorage.removeItem('pairley_token');
    localStorage.removeItem('pairley_user');
    setAuthUser(null);
    setAuthToken(null);
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <Link to={ROUTES.HOME} className="navbar__logo">
            <img src="/logo.png" alt="Pairley Logo" className="navbar__logo-img" />
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="navbar__links">
            {/* Explore Deals — pill style */}
            <Link
              to={ROUTES.DEALS}
              className={`navbar__link navbar__link--pill ${isActive(ROUTES.DEALS) ? 'navbar__link--active' : ''}`}
            >
              <Tag size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              Explore Deals
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${isActive(link.path) ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar__actions">
            <button
              className="navbar__search-btn"
              onClick={onSearchClick}
              aria-label="Search deals"
            >
              <Search size={19} />
            </button>

            {token && user ? (
              <>
                <Link
                  to={user.role?.toLowerCase() === 'customer' ? ROUTES.CUSTOMER_DASHBOARD : ROUTES.BUSINESS_DASHBOARD}
                  className="navbar__dashboard-btn"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: '#FFF',
                    border: '1px solid #E2E8F0',
                    color: '#4E2BC4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar__logout-btn"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    background: '#4E2BC4',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="navbar__login-btn">
                  <LogIn size={15} />
                  Log In
                </Link>

                <Link to={ROUTES.SIGNUP} className="navbar__signup-btn">
                  <UserPlus size={15} />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="navbar__hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div className="navbar__spacer" />

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              className="navbar__drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Dark glassmorphic drawer */}
            <motion.div
              className="navbar__drawer navbar__drawer--dark"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              {/* Drawer Header */}
              <div className="navbar__drawer-header">
                <Link
                  to={ROUTES.HOME}
                  className="navbar__logo"
                  onClick={() => setDrawerOpen(false)}
                >
                  <div className="navbar__logo-badge">
                    <ShoppingBag size={16} strokeWidth={2.5} color="white" />
                  </div>
                  <span className="navbar__logo-text navbar__logo-text--drawer">Pairley</span>
                </Link>
                <button
                  className="navbar__drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Links Staggered */}
              <motion.div 
                className="navbar__drawer-nav"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    to={ROUTES.DEALS}
                    className={`navbar__drawer-link ${isActive(ROUTES.DEALS) ? 'navbar__drawer-link--active' : ''}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Tag size={17} /> Explore Deals
                  </Link>
                </motion.div>
                {NAV_LINKS.map((link) => (
                  <motion.div variants={itemVariants} key={link.path}>
                    <Link
                      to={link.path}
                      className={`navbar__drawer-link ${isActive(link.path) ? 'navbar__drawer-link--active' : ''}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div variants={itemVariants}>
                  <button
                    className="navbar__drawer-link w-full text-left"
                    onClick={() => { setDrawerOpen(false); onSearchClick?.(); }}
                  >
                    <Search size={17} /> Search
                  </button>
                </motion.div>
              </motion.div>

              <div className="navbar__drawer-actions">
                {token && user ? (
                  <>
                    <Link
                      to={user.role?.toLowerCase() === 'customer' ? ROUTES.CUSTOMER_DASHBOARD : ROUTES.BUSINESS_DASHBOARD}
                      className="navbar__signup-btn"
                      onClick={() => setDrawerOpen(false)}
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      Dashboard
                    </Link>
                    <button
                      className="navbar__login-btn w-full justify-center"
                      onClick={() => { setDrawerOpen(false); handleLogout(); }}
                      style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '14px', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.SIGNUP}
                      className="navbar__signup-btn"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <UserPlus size={15} /> Sign Up
                    </Link>
                    <Link
                      to={ROUTES.LOGIN}
                      className="navbar__login-btn"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <LogIn size={15} /> Log In
                    </Link>
                  </>
                )}
              </div>

              {/* Brand Socials at Bottom */}
              <div className="navbar__drawer-socials flex justify-center gap-4 py-4 border-t border-white/5">
                <a href="#instagram" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition">
                  <svg size={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram" viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#twitter" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition">
                  <svg size={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter" viewBox="0 0 24 24" width="16" height="16"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#linkedin" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition">
                  <svg size={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin" viewBox="0 0 24 24" width="16" height="16"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
