import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Handshake, Users, Wallet } from 'lucide-react';
import { PLATFORM_STATS, formatNumber } from '../utils/constants';
import './StatsCounter.css';

function CounterItem({ target, prefix = '', suffix = '', label, icon: Icon, colorClass }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds
    const end = parseInt(target);
    if (start === end) return;

    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / 50), 10);
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      className="stats-counter__card glass p-6 flex items-center gap-4"
      whileHover={{ y: -5, borderColor: 'var(--primary)' }}
    >
      <div className={`stats-counter__icon-wrap ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stats-counter__number">
          {prefix}
          {formatNumber(count)}
          {suffix}
        </div>
        <div className="stats-counter__label">{label}</div>
      </div>
    </motion.div>
  );
}

export default function StatsCounter() {
  return (
    <section className="stats-counter section">
      <div className="container">
        <motion.div
          className="grid-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <CounterItem
            target={PLATFORM_STATS.totalDeals}
            suffix="+"
            label="Active Deals"
            icon={ShoppingBag}
            colorClass="stats-counter__icon-wrap--cyan"
          />
          <CounterItem
            target={PLATFORM_STATS.happyPairs}
            suffix="+"
            label="Happy Pairs Matched"
            icon={Handshake}
            colorClass="stats-counter__icon-wrap--orange"
          />
          <CounterItem
            target={PLATFORM_STATS.groupsFormed}
            suffix="+"
            label="Groups Formed"
            icon={Users}
            colorClass="stats-counter__icon-wrap--purple"
          />
          <CounterItem
            target={PLATFORM_STATS.moneySaved}
            prefix="₹"
            suffix="+"
            label="Total Money Saved"
            icon={Wallet}
            colorClass="stats-counter__icon-wrap--green"
          />
        </motion.div>
      </div>
    </section>
  );
}
