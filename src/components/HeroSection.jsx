import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Wallet, MapPin } from 'lucide-react';
import { ROUTES, MALLS } from '../utils/constants';
import CustomDropdown from './CustomDropdown';
import './HeroSection.css';
import InteractiveDealSimulator from './InteractiveDealSimulator';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HeroSection({ selectedMall, onMallChange, searchQuery, onSearchChange }) {
  return (
    <section className="hero">
      <div className="container hero__container">
        <motion.div
          className="hero__grid"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column (col-span-5): Hero Text */}
          <div className="hero__left">
            <motion.h1 className="hero__title" variants={fadeUp}>
              More People.<br />
              <span className="text-primary">Better Deals.</span>
            </motion.h1>

            <motion.p className="hero__subtitle" variants={fadeUp}>
              India's Smart Group Buying Marketplace
            </motion.p>

            <motion.p className="hero__description" variants={fadeUp}>
              Shop, save and unlock amazing deals by buying together.
            </motion.p>

            {/* Unified Search & Mall Selector Console */}
            <motion.div className="hero__search-console" variants={fadeUp}>
              <div className="search-console__field search-console__field--mall">
                <CustomDropdown
                  value={selectedMall}
                  onChange={onMallChange}
                  options={MALLS}
                  placeholder="All Malls (Bangalore)"
                  icon={MapPin}
                />
              </div>

              <div className="search-console__divider" />

              <div className="search-console__field search-console__field--query">
                <Search size={18} className="search-console__icon text-slate-400" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search deals, products, stores..."
                  className="search-console__input"
                  aria-label="Search queries"
                />
              </div>

              <Link
                to={
                  selectedMall || searchQuery
                    ? `${ROUTES.DEALS}?${selectedMall ? `mall=${encodeURIComponent(selectedMall)}` : ''}${selectedMall && searchQuery ? '&' : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}` : ''}`
                    : ROUTES.DEALS
                }
                className="search-console__button"
              >
                <Search size={16} />
                <span>Search</span>
              </Link>
            </motion.div>
          </div>

          {/* Middle Column (col-span-3): Interactive Deal Simulator */}
          <div className="hero__middle">
            <InteractiveDealSimulator />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

