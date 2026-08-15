import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, ArrowRight, Users, Sparkles,
  TrendingUp, Compass, Store,
} from 'lucide-react';
import { api } from '../../utils/api';
import DealCard from '../../components/DealCard';
import LogoMark from '../../components/marketing/LogoMark';
import { ROUTES } from '../../utils/constants';
import { fadeInUp, revealViewport } from '../../components/marketing/animations';

// Customer-acquisition homepage ("/"). Own layout, no shared AppLayout/Navbar
// — matches how every other marketing-style page in this app (LandingPage,
// CustomerMarketingPage, MerchantPage) already works, so this doesn't touch
// the shared Navbar used by /deals, /deals/:id, /how-it-works, or any
// authenticated route.
//
// Every number on this page is either fetched live from GET /offers/list or
// omitted. No fabricated counts, ratings, or "X people joined today"
// copy — see the two live sections below, which honestly reflect what
// calculateSavings-safe data actually supports: recency and real
// joined_people counts. There is no view/click-tracking data anywhere in
// the backend (confirmed against the schema) to build a genuine "trending"
// or "most viewed" section, so those labels are deliberately not used here.

const HOW_IT_WORKS_STEPS = [
  { icon: Compass, label: 'Discover', desc: 'Find an offer you like' },
  { icon: Sparkles, label: 'Show Interest', desc: 'Tell Pairley you’re in' },
  { icon: Users, label: 'Join Others', desc: 'More people can join the same offer' },
  { icon: TrendingUp, label: 'Bigger Opportunity', desc: 'More participation, better group savings' },
];

// Same cover_image-first fallback used across DealsPage/CustomerDashboard/
// BusinessDashboard this session — cover_image is the current media model
// (what Offer Publisher and offer-media upload write); offer_image is
// legacy-only. Kept local rather than importing DealsPage's internal
// mapper, which isn't exported.
function mapOffer(d) {
  return {
    id: d.id,
    title: d.title,
    category: d.category ? d.category.toLowerCase() : 'shopping',
    offer_type: d.offer_type,
    originalPrice: d.original_price,
    pairleyPrice: d.offer_price,
    images: [d.cover_image || d.gallery_images?.[0] || d.offer_image],
    businessOwner: { name: d.business?.business_name || 'Local Seller' },
    interestCount: d.joined_people || 0,
    maxParticipants: d.required_people || 2,
    location: d.business?.city || '',
    createdAt: d.created_at || d.createdAt,
    joined_people: d.joined_people || 0,
  };
}

function LandingNavbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Explore Deals', to: ROUTES.DEALS },
    { label: 'How It Works', to: ROUTES.HOW_IT_WORKS },
    // /for-shops isn't a route in this app — the closest real page is the
    // merchant marketing page. Pointing here rather than inventing a new
    // route keeps this a frontend-only, additive change.
    { label: 'For Shops', to: '/merchant' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="w-9 h-9" />
            <span className="font-outfit text-lg font-black text-pairley-ink">Pairley</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-semibold text-slate-600 hover:text-pairley-purple transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-slate-600 hover:text-pairley-purple transition-colors px-4 py-2">
              Login
            </Link>
            <Link
              to={ROUTES.DEALS}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-pairley-purple text-white text-sm font-bold shadow-md hover:shadow-lg hover:bg-pairley-purple-dark transition-all"
            >
              Explore Deals
            </Link>
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-slate-700"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </motion.header>
      <div className="h-16" />

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[80%] max-w-xs bg-white shadow-2xl flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-outfit text-lg font-black text-pairley-ink">Pairley</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1 text-slate-500">
                  <X size={22} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                    className="py-3 text-base font-semibold text-slate-700 border-b border-slate-100"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <Link to={ROUTES.LOGIN} onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-xl border border-slate-200 font-bold text-slate-700">
                  Login
                </Link>
                <Link to={ROUTES.DEALS} onClick={() => setMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-pairley-purple text-white font-bold">
                  Explore Deals
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero({ liveCount, loadingCount }) {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0b3d] via-[#2d1166] to-[#0f3d2e] pt-16 pb-24 sm:pb-28">
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at 18% 30%, rgba(124,58,237,0.45) 0%, transparent 55%),
                            radial-gradient(circle at 82% 15%, rgba(34,197,94,0.35) 0%, transparent 55%),
                            radial-gradient(circle at 50% 90%, rgba(91,18,214,0.3) 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        {/* Only rendered once we actually know the real count — never a
            placeholder number while loading. */}
        {!loadingCount && liveCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold mb-7"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {liveCount} offer{liveCount === 1 ? '' : 's'} live on Pairley right now
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-outfit text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] text-white mb-5 text-balance"
        >
          Don&rsquo;t Buy Alone.
          <br />
          <span className="bg-gradient-to-r from-violet-300 via-purple-200 to-emerald-300 bg-clip-text text-transparent">
            Buy Together. Save More.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="text-lg text-white/75 max-w-xl mx-auto mb-9 leading-relaxed"
        >
          Discover exciting offers, join with others and unlock better saving opportunities together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate(ROUTES.DEALS)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:scale-[1.02] transition-all"
          >
            Explore Today&rsquo;s Offers
          </button>
          <button
            onClick={() => navigate(ROUTES.HOW_IT_WORKS)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all"
          >
            How Pairley Works
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function OfferGridSection({ eyebrow, title, offers, emptyMessage, accent = 'purple' }) {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"
        >
          <div>
            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${accent === 'green' ? 'text-pairley-green-dark' : 'text-pairley-purple'}`}>
              {eyebrow}
            </span>
            <h2 className="mt-2 font-outfit text-2xl sm:text-3xl font-black tracking-tight text-pairley-ink">
              {title}
            </h2>
          </div>
          {offers.length > 0 && (
            <Link to={ROUTES.DEALS} className="inline-flex items-center gap-1.5 text-sm font-bold text-pairley-purple hover:gap-2.5 transition-all self-start sm:self-auto">
              See all deals <ArrowRight size={15} />
            </Link>
          )}
        </motion.div>

        {offers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
            <p className="text-slate-500 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorksStrip() {
  return (
    <section className="py-16 bg-pairley-mist">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="text-center mb-12">
          <h2 className="font-outfit text-2xl sm:text-3xl font-black text-pairley-ink">There&rsquo;s something happening on Pairley</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Here&rsquo;s how buying together works.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {HOW_IT_WORKS_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                custom={i} initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center"
              >
                <div className="w-11 h-11 mx-auto rounded-xl bg-pairley-purple/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-pairley-purple" />
                </div>
                <h3 className="font-bold text-sm text-pairley-ink">{step.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="text-center mt-8">
          <Link to={ROUTES.HOW_IT_WORKS} className="inline-flex items-center gap-1.5 text-sm font-bold text-pairley-purple hover:gap-2.5 transition-all">
            See the full journey <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function ForShopsStrip() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pairley-ink to-[#1f2937] px-8 py-12 sm:px-14 sm:py-14 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8"
        >
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Store size={13} /> For Shop Owners
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-black text-white mt-3 mb-3">
              Turn interest into customers.
            </h2>
            <p className="text-white/70 max-w-md">
              List an offer, and let people discover it, join it, and bring their friends along.
            </p>
          </div>
          <Link
            to="/merchant"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-pairley-ink font-bold text-sm shadow-xl hover:scale-[1.02] transition-all"
          >
            List Your Business <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-pairley-ink py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LogoMark className="w-8 h-8" />
          <span className="font-outfit text-base font-black text-white">Pairley</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <Link to={ROUTES.DEALS} className="hover:text-white transition-colors">Explore Deals</Link>
          <Link to={ROUTES.HOW_IT_WORKS} className="hover:text-white transition-colors">How It Works</Link>
          <Link to="/merchant" className="hover:text-white transition-colors">For Shops</Link>
          <Link to={ROUTES.PRIVACY_POLICY} className="hover:text-white transition-colors">Privacy</Link>
        </div>
        <p className="text-xs text-white/40">© 2026 Pairley</p>
      </div>
    </footer>
  );
}

export default function CustomerLandingPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Pairley — Buy Together. Save Together.';
    api.get('/offers/list?status=ACTIVE')
      .then((data) => setOffers(Array.isArray(data) ? data.map(mapOffer) : []))
      .catch((err) => {
        console.error('Failed to load live offers for homepage:', err);
        setOffers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // "Just Added" — genuinely real: newest ACTIVE offers by created_at.
  const justAdded = useMemo(
    () => [...offers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6),
    [offers]
  );

  // "Group Saving Opportunities" — offers with real, non-zero participation,
  // ranked by actual joined_people. Deliberately excludes offers with zero
  // interest rather than padding the section with them — an empty state is
  // more honest than implying activity that hasn't happened yet.
  const gainingInterest = useMemo(
    () => [...offers].filter((o) => o.joined_people > 0).sort((a, b) => b.joined_people - a.joined_people).slice(0, 6),
    [offers]
  );

  return (
    <div className="bg-white antialiased overflow-x-hidden">
      <LandingNavbar />
      <Hero liveCount={offers.length} loadingCount={loading} />

      <OfferGridSection
        eyebrow="Just Added"
        title="Fresh offers on Pairley"
        offers={justAdded}
        emptyMessage="No offers are live right now — check back soon."
        accent="purple"
      />

      <OfferGridSection
        eyebrow="Group Saving Opportunities"
        title="Offers people are joining"
        offers={gainingInterest}
        emptyMessage="No group activity yet — be the first to show interest in an offer!"
        accent="green"
      />

      <HowItWorksStrip />
      <ForShopsStrip />
      <LandingFooter />
    </div>
  );
}
