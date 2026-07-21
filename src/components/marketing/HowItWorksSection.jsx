import { motion } from 'framer-motion';
import { fadeInUp, revealViewport } from './animations';
import ProcessFlowCard from './ProcessFlowCard';
import GroupOfferAnimation from './GroupOfferAnimation';
import SmartDiscountAnimation from './SmartDiscountAnimation';
import ExplainFlowAnimation from './ExplainFlowAnimation';
import AmbientBackground from './AmbientBackground';

const GROUP_OFFER_STEPS = [
  'Merchant creates an offer',
  'Customers show interest',
  'More people join in',
  'Everyone saves more',
];

const SMART_DISCOUNT_STEPS = [
  'Merchant lists a product',
  'Pairley creates multiple discount options',
  'Customer selects their preferred discount',
  'Merchant receives a qualified lead',
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-ink overflow-hidden">
      <AmbientBackground variant="subtle" accent="green" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Pairley Works
          </h2>
          <p className="mt-3 text-white/50 max-w-lg mx-auto">
            Understandable in five seconds — watch it happen.
          </p>
        </motion.div>

        <ExplainFlowAnimation />

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <ProcessFlowCard title="Group Offers" tagline="More interested people, better discount." steps={GROUP_OFFER_STEPS} accent="purple" delay={0}>
            <GroupOfferAnimation />
          </ProcessFlowCard>
          <ProcessFlowCard title="Smart Discounts" tagline="Customers pick the price that works for them." steps={SMART_DISCOUNT_STEPS} accent="green" delay={1}>
            <SmartDiscountAnimation />
          </ProcessFlowCard>
        </div>
      </div>
    </section>
  );
}
