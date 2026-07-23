import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store, MapPin, Handshake, Check, Sparkles } from 'lucide-react';
import LandingButton from './LandingButton';
import { fadeInUp, stagger } from './animations';

const CITIES = ['Bangalore', 'Hubli', 'Hyderabad', 'Chennai', 'Pune'];

// Small floating "live interest" chip on the example card. It sits inside
// the card explicitly labeled "GROUP DEAL EXAMPLE", so the ticking count
// reads as a demo of the live-interest feature, not a real global stat.
function LiveInterestChip() {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = useState(23);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setCount((n) => (n < 41 ? n + 1 : n)), 5200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -bottom-5 -left-3 sm:-left-5 z-20"
    >
      <div className="flex items-center gap-2.5 rounded-2xl bg-white border border-slate-200 shadow-[0_12px_30px_-8px_rgba(17,24,39,0.25)] px-3.5 py-2.5">
        <div className="flex -space-x-2">
          {[
            { i: 'R', c: 'from-pairley-purple to-pairley-purple-light' },
            { i: 'A', c: 'from-pairley-green to-pairley-green-dark' },
            { i: 'M', c: 'from-pairley-orange to-amber-500' },
          ].map((a) => (
            <span key={a.i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${a.c} border-2 border-white text-white text-[10px] font-bold flex items-center justify-center`}>
              {a.i}
            </span>
          ))}
        </div>
        <div>
          <p className="text-sm font-extrabold text-pairley-ink font-outfit leading-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pairley-green animate-pulse motion-reduce:animate-none" />
            {count} interested
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">joining this deal now</p>
        </div>
      </div>
    </motion.div>
  );
}

// The group-deal illustration — the brief's core "explain Pairley in one
// glance" visual. Two customers join the same BOGO offer, each pays half,
// each walks away with one product, the merchant gets two confirmed buyers.
function GroupDealCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-pairley-purple/20 via-transparent to-pairley-green/20 blur-2xl rounded-[2.5rem]" />
      <div className="relative rounded-[2rem] border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_24px_70px_-20px_rgba(109,40,217,0.35)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pairley-purple/10 text-pairley-purple text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Group Deal Example
          </span>
          <span className="text-[11px] font-bold text-pairley-green">● Live</span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl shrink-0">📱</div>
          <div>
            <h3 className="text-lg font-extrabold text-pairley-ink font-outfit leading-tight">iPhone 15 — Buy One Get One</h3>
            <p className="text-sm text-slate-500 font-semibold">Worth ₹70,000</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 relative">
          {[
            { name: 'Customer A', share: '50%', pay: '₹35,000' },
            { name: 'Customer B', share: '50%', pay: '₹35,000' },
          ].map((c) => (
            <div key={c.name} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-pairley-purple to-pairley-purple-light text-white text-xs font-bold flex items-center justify-center">
                {c.name.split(' ')[1]}
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-500">{c.name}</p>
              <p className="text-[11px] text-slate-400">pays {c.share}</p>
              <p className="text-base font-extrabold text-pairley-purple font-outfit">{c.pay}</p>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center">
            <Handshake size={16} className="text-pairley-green" />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-pairley-purple to-pairley-purple-light p-4 text-center">
          <p className="text-sm font-bold text-white font-outfit">
            Both meet the merchant, pay ₹35,000 each, and take one iPhone each.
          </p>
          <p className="text-xs text-white/80 font-semibold mt-1">Win–Win for everyone 🎉</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {['Customers save money', 'Merchant gains two confirmed buyers', 'Everyone wins'].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
              <span className="w-4 h-4 rounded-full bg-pairley-green/15 flex items-center justify-center">
                <Check size={11} className="text-pairley-green-dark" />
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>

      <LiveInterestChip />
    </motion.div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 bg-white" />
      <div className="absolute -top-40 -right-32 w-[36rem] h-[36rem] rounded-full bg-pairley-purple/10 blur-[120px] -z-10" />
      <div className="absolute top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-pairley-green/10 blur-[120px] -z-10" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(17,24,39,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.div variants={fadeInUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pairley-purple/15 bg-pairley-purple/[0.06] text-pairley-purple text-xs font-bold tracking-wide">
                <Sparkles size={13} /> India's Smart Local Deals Marketplace
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="mt-6 font-outfit text-4xl sm:text-5xl lg:text-[3.75rem] font-black leading-[1.05] tracking-tight text-pairley-ink"
            >
              Discover Better Local Deals{' '}
              <span className="bg-gradient-to-r from-pairley-purple via-pairley-purple-light to-pairley-green bg-clip-text text-transparent">
                Together
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-inter"
            >
              Pairley connects customers with local businesses through smart offers and shared
              buying interest. Customers save more. Merchants learn what people will actually pay.
              Everyone wins.
            </motion.p>

            <motion.p variants={fadeInUp} custom={3} className="mt-5">
              <span className="inline-block font-outfit font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pairley-purple to-pairley-green text-lg">
                The More We Join. The More We Unlock.
              </span>
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={4}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
            >
              <LandingButton variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/deals')}>
                Explore Deals <ArrowRight size={17} />
              </LandingButton>
              <LandingButton variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/signup?role=business')}>
                <Store size={17} /> Become a Merchant
              </LandingButton>
            </motion.div>

            <motion.div variants={fadeInUp} custom={5} className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center justify-center lg:justify-start gap-1.5">
                <MapPin size={12} /> Popular near you
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {CITIES.map((city) => (
                  <span
                    key={city}
                    className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:border-pairley-purple/40 hover:text-pairley-purple transition-colors cursor-default"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <div className="flex justify-center lg:justify-end">
            <GroupDealCard />
          </div>
        </div>
      </div>
    </section>
  );
}
