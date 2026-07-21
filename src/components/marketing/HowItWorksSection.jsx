import { motion } from 'framer-motion';
import { fadeInUp, revealViewport } from './animations';
import ProcessFlowCard from './ProcessFlowCard';

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
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Pairley Works
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Two simple mechanics — group offers and smart discounts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <ProcessFlowCard
            title="Group Offers"
            tagline="More interested people, better discount."
            steps={GROUP_OFFER_STEPS}
            accent="purple"
            delay={0}
          />
          <ProcessFlowCard
            title="Smart Discounts"
            tagline="Customers pick the price that works for them."
            steps={SMART_DISCOUNT_STEPS}
            accent="green"
            delay={1}
          />
        </div>
      </div>
    </section>
  );
}
