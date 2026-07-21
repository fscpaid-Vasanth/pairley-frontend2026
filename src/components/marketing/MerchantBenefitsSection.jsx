import { motion } from 'framer-motion';
import { TrendingUp, Target, Repeat, XCircle, Calendar, BarChart3 } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';
import BenefitCard from './BenefitCard';

const BENEFITS = [
  { icon: TrendingUp, title: 'More Customers', description: 'Reach nearby customers actively looking for deals like yours.' },
  { icon: Target, title: 'Qualified Leads', description: 'Only hear from customers who already showed real interest.' },
  { icon: Repeat, title: 'Existing Offers Work', description: 'List the discounts you already run — no new inventory needed.' },
  { icon: XCircle, title: 'No Commission', description: "Pairley never takes a cut of your sales." },
  { icon: Calendar, title: 'Monthly Subscription', description: 'One predictable flat fee — no per-lead or per-click charges.' },
  { icon: BarChart3, title: 'Better ROI Than Advertising', description: 'Pay for qualified interest, not impressions that never convert.' },
];

export default function MerchantBenefitsSection() {
  return (
    <section id="merchant-benefits" className="py-20 lg:py-28 bg-ink-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Merchants
          </h2>
          <p className="mt-3 text-white/50 max-w-lg mx-auto">
            Grow your business without paying for every click.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.title} {...b} accent="green" index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
