import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Users,
  Bell,
  MessageCircle,
  CalendarClock,
  MapPin,
  ListChecks,
  TrendingUp,
  Gift,
  Lock,
  ShieldOff,
  MessagesSquare,
  BellRing,
  Star,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Store,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { fadeInUp, stagger, revealViewport } from './animations';

// The 10-step Pairley journey. Only step 1 and step 10 carry a real CTA —
// both to ROUTES.DEALS ('/deals'), never a fabricated '/deals/:id': this is
// a marketing page with no live sample offer to deep-link to, and must
// never link to a record that doesn't exist. Every other step is an
// illustration-only card with static example content — never wired to a
// live API call, never backed by a fake database row.
const STEPS = [
  {
    num: '01',
    title: 'Discover Offer',
    icon: Search,
    desc: 'Find exciting offers from nearby shops and brands.',
    cta: { label: 'Explore Deals', to: ROUTES.DEALS },
  },
  {
    num: '02',
    title: 'Show Interest',
    icon: Sparkles,
    desc: "Tap “Show Interest” on any deal to join other customers interested in the same offer.",
  },
  {
    num: '03',
    title: 'Join Group Chat',
    icon: Users,
    desc: 'You’re added to the anonymous customer group for this offer — opens automatically once you show interest.',
  },
  {
    num: '04',
    title: 'See Others Join',
    icon: Bell,
    desc: 'Get notified when other customers show interest — without ever learning who they are.',
  },
  {
    num: '05',
    title: 'Anonymous Chat',
    icon: MessageCircle,
    desc: 'Chat freely with other customers interested in the same offer, never the merchant.',
  },
  {
    num: '06',
    title: 'Share Date & Time',
    icon: CalendarClock,
    desc: 'Propose a date and time so everyone in the group can coordinate better.',
  },
  {
    num: '07',
    title: 'Share Location',
    icon: MapPin,
    desc: 'Share a meeting point — your current location or a pin you choose — so everyone can plan easily.',
  },
  {
    num: '08',
    title: 'Create Poll',
    icon: ListChecks,
    desc: 'Create a quick poll so the group can decide plans together.',
  },
  {
    num: '09',
    title: 'Group Demand Grows',
    icon: TrendingUp,
    desc: 'More people join, increasing the chance to unlock the deal.',
  },
  {
    num: '10',
    title: 'Deal / Redemption',
    icon: Gift,
    desc: 'Once the group is strong enough, the deal is ready to redeem.',
    cta: { label: 'View Offer', to: ROUTES.DEALS },
  },
];

const PRIVACY_ITEMS = [
  { icon: Lock, title: 'Anonymous identities', desc: 'You’re "Pairley Member 184" — never your real name.' },
  { icon: ShieldOff, title: 'No phone numbers or personal details', desc: 'Nothing that identifies you is ever shared with other members.' },
  { icon: MessagesSquare, title: 'Chat only with interested customers', desc: 'You can only join groups for offers you’ve actually shown interest in.' },
  { icon: BellRing, title: 'Get notified when others join', desc: 'A gentle nudge — never who they are, just that the group is growing.' },
  { icon: Star, title: 'Better chance to unlock deals', desc: 'The bigger the group, the stronger the case for the merchant to say yes.' },
];

const WHY_PAIRLEY = [
  { icon: ShoppingBag, title: 'Shop Together, Save More', desc: 'Group buying power helps everyone get better deals.' },
  { icon: ShieldCheck, title: '100% Private', desc: 'Your identity stays private. You chat anonymously.' },
  { icon: Clock, title: 'Easy Coordination', desc: 'Share time, location and plans effortlessly.' },
  { icon: TrendingUp, title: 'Stronger Groups, Better Deals', desc: 'More people can create stronger demand.' },
  { icon: Gift, title: 'Unlock & Enjoy', desc: 'When the group is ready, enjoy the offer together.' },
];

const LOOP_STAGES = [
  'Discover Offer',
  'Show Interest',
  'Join Customer Group',
  'See Others Join',
  'Anonymous Chat',
  'Group Demand Grows',
  'Deal / Redemption',
];

function StepCard({ step, index }) {
  const Icon = step.icon;
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      className="relative bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-[#5B12D6]/50 tracking-widest">{step.num}</span>
        <div className="w-9 h-9 rounded-2xl bg-[#5B12D6]/10 text-[#5B12D6] flex items-center justify-center flex-shrink-0">
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-slate-800">{step.title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
      </div>
      {step.cta && (
        <Link
          to={step.cta.to}
          className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#5B12D6] hover:text-[#430bb0] transition"
        >
          {step.cta.label} &rarr;
        </Link>
      )}
    </motion.div>
  );
}

function StepsTimeline() {
  return (
    <section className="container max-w-6xl mx-auto px-4 mb-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="text-center mb-10"
      >
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#5B12D6] bg-[#5B12D6]/10 border border-[#5B12D6]/20 inline-block mb-3">
          The journey
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">From discovery to deal, in 10 steps</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">Every step below reflects how Pairley actually works today — not a mockup.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {STEPS.map((step, i) => (
          <StepCard key={step.num} step={step} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

function PrivacySection() {
  return (
    <section className="bg-slate-50/70 border-y border-slate-100 py-14 mb-16">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeInUp}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
            <Lock className="text-[#22C55E]" size={26} />
            Your privacy is always protected
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {PRIVACY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                custom={i}
                variants={fadeInUp}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center flex flex-col items-center gap-2 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h4 className="text-xs font-extrabold text-slate-800">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function WhyPairleySection() {
  return (
    <section className="container max-w-6xl mx-auto px-4 mb-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Why Pairley?</h2>
      </motion.div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {WHY_PAIRLEY.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              custom={i}
              variants={fadeInUp}
              className="bg-gradient-to-br from-[#5B12D6]/5 to-[#22C55E]/5 border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-2 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#5B12D6] flex items-center justify-center shadow-sm">
                <Icon size={18} />
              </div>
              <h4 className="text-xs font-extrabold text-slate-800">{item.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

function ProductLoopDiagram() {
  return (
    <section className="container max-w-6xl mx-auto px-4 mb-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm overflow-hidden"
      >
        <div className="relative">
          {/* Connector line — same visual technique as the previous
              simulator's connector line, simplified to a static scroll
              reveal instead of interval-driven state. */}
          <div className="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={revealViewport}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-gradient-to-r from-[#5B12D6] to-[#22C55E]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-y-6 gap-x-2 relative">
            {LOOP_STAGES.map((stage, i) => (
              <div key={stage} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#5B12D6] text-[#5B12D6] flex items-center justify-center text-xs font-extrabold shadow-sm z-10">
                  {i + 1}
                </div>
                <span className="text-[10px] font-bold text-slate-600 leading-tight max-w-[90px]">{stage}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-xs md:text-sm text-slate-500 font-semibold mt-8">
          Pairley brings customers together, helps groups grow and makes every deal better for everyone.
        </p>
      </motion.div>
    </section>
  );
}

function MerchantVisibilityCallout() {
  return (
    <section className="container max-w-4xl mx-auto px-4 mb-16">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeInUp}
        className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-200/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 text-center md:text-left"
      >
        <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Store size={22} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">What does the merchant see?</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            The merchant sees <strong>aggregated demand</strong> — how many customers are interested and how many are active in the group chat — never your name, number, or the private conversation itself.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default function HowPairleyWorksSection() {
  return (
    <>
      <StepsTimeline />
      <PrivacySection />
      <WhyPairleySection />
      <ProductLoopDiagram />
      <MerchantVisibilityCallout />
    </>
  );
}
