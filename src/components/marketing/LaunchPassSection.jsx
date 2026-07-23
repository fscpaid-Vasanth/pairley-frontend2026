import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingBag, Store, ArrowRight, Rocket } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';
import { ROUTES, LAUNCH_DATE } from '../../utils/constants';

// Kept identical to JourneyChooser.jsx's real benefit copy (the actual
// /launch registration flow) rather than inventing new marketing claims —
// this section is a preview of that real flow, not a separate pitch.
const CUSTOMER_BENEFITS = ['FREE Registration', 'Early Access to Deals', 'Community Reward Unlocks', 'Launch Badge'];
const MERCHANT_BENEFITS = ['Zero Onboarding Fee', 'Unlimited Offers', 'WhatsApp Leads', 'Business Dashboard'];

const launchDateLabel = new Date(LAUNCH_DATE).toLocaleDateString('en-IN', {
  month: 'long',
  year: 'numeric',
});

function BenefitCard({ icon: Icon, eyebrow, title, blurb, benefits, cta, onClick, accent }) {
  const isPurple = accent === 'purple';
  const arc = isPurple ? '#6D28D9' : '#22C55E';
  return (
    <motion.div
      variants={fadeInUp}
      className="relative flex-1 overflow-hidden rounded-3xl p-[2px] bg-slate-200/70 shadow-[0_8px_40px_rgba(17,24,39,0.05)]"
    >
      {/* Rotating conic-gradient light that sweeps around the card border —
          two opposite arcs so a glow crosses the edge twice per turn. */}
      <span
        aria-hidden
        className="absolute inset-[-60%] animate-border-spin motion-reduce:hidden"
        style={{ background: `conic-gradient(from 0deg, transparent 0deg, ${arc} 55deg, transparent 120deg, transparent 180deg, ${arc} 235deg, transparent 300deg, transparent 360deg)` }}
      />
      <div className="relative h-full rounded-[calc(1.5rem-2px)] bg-white p-7 sm:p-8">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
          isPurple ? 'bg-gradient-to-br from-pairley-purple to-pairley-purple-light' : 'bg-gradient-to-br from-pairley-green to-pairley-green-dark'
        }`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <p className={`mt-5 text-[11px] font-bold uppercase tracking-[0.18em] ${isPurple ? 'text-pairley-purple' : 'text-pairley-green-dark'}`}>{eyebrow}</p>
      <h3 className="mt-1 font-outfit text-xl font-extrabold text-pairley-ink">{title}</h3>
      <p className="mt-2 text-[14px] text-slate-500 font-inter leading-relaxed">{blurb}</p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {benefits.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-[14px] font-semibold text-slate-600">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPurple ? 'bg-pairley-purple/12' : 'bg-pairley-green/15'}`}>
              <Check size={12} className={isPurple ? 'text-pairley-purple' : 'text-pairley-green-dark'} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className={`mt-7 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold font-outfit border-2 transition-all duration-200 ${
          isPurple
            ? 'border-transparent bg-gradient-to-br from-pairley-purple to-pairley-purple-light text-white shadow-lg shadow-pairley-purple/25 hover:shadow-xl hover:-translate-y-0.5'
            : 'border-pairley-green/50 bg-pairley-green/[0.07] text-pairley-green-dark hover:border-pairley-green hover:bg-pairley-green/[0.12] hover:-translate-y-0.5'
        }`}
      >
        {cta} <ArrowRight size={15} />
      </button>
      </div>
    </motion.div>
  );
}

// The on-page preview of the real /launch founding-member flow
// (JourneyChooser.jsx) — same benefit copy, same destinations. Placed in
// the second half of the page (after the main value props) so it reads as
// "one more reason to join now," not a competitor to the primary hero CTAs.
export default function LaunchPassSection() {
  const navigate = useNavigate();

  return (
    <section id="launch-pass" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pairley-purple/15 bg-pairley-purple/[0.06] text-pairley-purple text-xs font-bold tracking-wide">
            <motion.span
              className="inline-flex"
              animate={{ y: [0, -2.5, 0], rotate: [0, -14, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.8 }}
            >
              <Rocket size={13} />
            </motion.span>
            Founding Members · Launching {launchDateLabel}
          </span>
          <h2 className="mt-5 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            Get your free Launch Pass
          </h2>
          <p className="mt-4 text-lg text-slate-500 font-inter leading-relaxed">
            Pairley is launching soon, starting in Bangalore. Register free today and lock in
            founding-member perks before the city goes live.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={stagger}
          className="mt-14 flex flex-col md:flex-row gap-6"
        >
          <BenefitCard
            icon={ShoppingBag}
            eyebrow="For Customers"
            title="I'm a Customer"
            blurb="I want my FREE Pairley Launch Pass."
            benefits={CUSTOMER_BENEFITS}
            cta="Get My Launch Pass"
            accent="purple"
            onClick={() => navigate(ROUTES.LAUNCH)}
          />
          <BenefitCard
            icon={Store}
            eyebrow="For Merchants"
            title="I'm a Business Owner"
            blurb="I want more nearby customers."
            benefits={MERCHANT_BENEFITS}
            cta="Grow My Business"
            accent="green"
            onClick={() => navigate('/merchant')}
          />
        </motion.div>
      </div>
    </section>
  );
}
