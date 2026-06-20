import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Wallet, MapPin } from 'lucide-react';
import { ROUTES, MALLS } from '../utils/constants';
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
                <MapPin size={18} className="search-console__icon text-primary" />
                <select
                  value={selectedMall || ''}
                  onChange={(e) => onMallChange?.(e.target.value || null)}
                  className="search-console__select"
                  aria-label="Select Mall"
                >
                  <option value="">All Malls (Bangalore)</option>
                  {MALLS.map((mall) => (
                    <option key={mall} value={mall}>{mall}</option>
                  ))}
                </select>
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

          {/* Right Column (col-span-4): Category Quick Links */}
          <div className="hero__right">
            <div className="category-quick-card">
              {/* Card header */}
              <div className="category-quick-header">
                <span className="category-quick-header-title">Browse Categories</span>
                <Link to={ROUTES.DEALS} className="category-quick-header-sub">View All →</Link>
              </div>

              {/* Category grid */}
              <div className="category-quick-body">
                <div className="category-quick-grid">
                  <Link to={`${ROUTES.DEALS}?category=dining`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#FFF1F0' }}>🍕</div>
                    <span className="category-quick-label">Food</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=fitness`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#F5F0FF' }}>💪</div>
                    <span className="category-quick-label">Fitness</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=beauty`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#FFF0F7' }}>💆</div>
                    <span className="category-quick-label">Salon</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=shopping`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#FFF7ED' }}>🛍️</div>
                    <span className="category-quick-label">Retail</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=tours`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#EFF6FF' }}>✈️</div>
                    <span className="category-quick-label">Travel</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=education`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#F0FDF4' }}>📚</div>
                    <span className="category-quick-label">Education</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=healthcare`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#FFF1F0' }}>🏥</div>
                    <span className="category-quick-label">Healthcare</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=home-services`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#EEF2FF' }}>🏠</div>
                    <span className="category-quick-label">Home</span>
                  </Link>
                  <Link to={`${ROUTES.DEALS}?category=electronics`} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#F5F0FF' }}>📺</div>
                    <span className="category-quick-label">Electronics</span>
                  </Link>
                  <Link to={ROUTES.DEALS} className="category-quick-item">
                    <div className="category-quick-icon" style={{ background: '#F9FAFB' }}>🔖</div>
                    <span className="category-quick-label">More</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

