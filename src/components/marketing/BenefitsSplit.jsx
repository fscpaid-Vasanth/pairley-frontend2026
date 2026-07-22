import { motion } from 'framer-motion';
import { Check, ShoppingBag, Store } from 'lucide-react';
import { fadeInUp, stagger, revealViewport } from './animations';

const CUSTOMER = [
  'Find nearby offers',
  'Save money together',
  'Show your buying interest',
  'Better group pricing',
  'Hyperlocal shopping',
  'Trusted local merchants',
  'Instant notifications',
  'Community buying power',
];

const MERCHANT = [
  'Understand customer price expectations',
  'Generate qualified leads',
  'Increase footfall',
  'Close more sales',
  'Publish offers in minutes',
  'Real-time demand insights',
  'Affordable subscription',
  'Zero commission per sale',
];

function BenefitCard({ id, eyebrow, title, icon: Icon, items, accent }) {
  const isPurple = accent === 'purple';
  return (
    <motion.div
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      variants={fadeInUp}
      className="scroll-mt-24 rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_8px_40px_rgba(17,24,39,0.05)]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            isPurple ? 'bg-gradient-to-br from-pairley-purple to-pairley-purple-light' : 'bg-gradient-to-br from-pairley-green to-pairley-green-dark'
          }`}
        >
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isPurple ? 'text-pairley-purple' : 'text-pairley-green-dark'}`}>{eyebrow}</p>
          <h3 className="font-outfit text-xl font-extrabold text-pairley-ink">{title}</h3>
        </div>
      </div>

      <motion.ul variants={stagger} initial="hidden" whileInView="visible" viewport={revealViewport} className="mt-6 grid sm:grid-cols-2 gap-x-5 gap-y-3.5">
        {items.map((item) => (
          <motion.li key={item} variants={fadeInUp} className="flex items-start gap-2.5 text-[14px] font-medium text-slate-600">
            <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPurple ? 'bg-pairley-purple/12' : 'bg-pairley-green/15'}`}>
              <Check size={12} className={isPurple ? 'text-pairley-purple' : 'text-pairley-green-dark'} />
            </span>
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export default function BenefitsSplit() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeInUp} className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pairley-purple">Built for both sides</span>
          <h2 className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-pairley-ink text-balance">
            Everyone gets more out of Pairley
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <BenefitCard id="customer-benefits" eyebrow="For Customers" title="Shop smarter, save together" icon={ShoppingBag} items={CUSTOMER} accent="purple" />
          <BenefitCard id="merchant-benefits" eyebrow="For Merchants" title="Sell smarter, grow faster" icon={Store} items={MERCHANT} accent="green" />
        </div>
      </div>
    </section>
  );
}
