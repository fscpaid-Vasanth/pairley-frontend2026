import { motion } from 'framer-motion';
import { Wallet, MapPin, ShieldCheck, UserPlus, Users, Eye } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';
import BenefitCard from './BenefitCard';

const BENEFITS = [
  { icon: Wallet, title: 'Save More', description: 'Group discounts mean lower prices than shopping alone.' },
  { icon: MapPin, title: 'Local Deals', description: 'Offers from businesses actually near where you live.' },
  { icon: ShieldCheck, title: 'Verified Merchants', description: 'Every business is checked before their offers go live.' },
  { icon: UserPlus, title: 'Free to Join', description: 'No membership fee, no subscription — ever.' },
  { icon: Users, title: 'Community Savings', description: 'The more neighbors who join in, the better the deal.' },
  { icon: Eye, title: 'No Hidden Charges', description: 'The price you see is the price you pay.' },
];

export default function CustomerBenefitsSection() {
  return (
    <section id="customer-benefits" className="py-20 lg:py-28 bg-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Customers
          </h2>
          <p className="mt-3 text-white/50 max-w-lg mx-auto">
            Real savings, real businesses, zero cost to join.
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
            <BenefitCard key={b.title} {...b} accent="purple" index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
