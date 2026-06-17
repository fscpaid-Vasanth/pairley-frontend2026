import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Store, Search, Users } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import ImageWithFallback from './ImageWithFallback';
import './HeroSection.css';

// Avatars around the dashed circle
const AVATAR_SEEDS = [
  { seed: 'Arjun', name: 'Arjun Mehta' },
  { seed: 'Priya', name: 'Priya Sharma' },
  { seed: 'Rahul', name: 'Rahul Krishnan' },
  { seed: 'Sneha', name: 'Sneha Patel' },
  { seed: 'Vikram', name: 'Vikram Singh' },
  { seed: 'Meera', name: 'Meera Nair' }
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const floatAnim = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function HeroSection() {
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

            <motion.div className="hero__cta-group" variants={fadeUp}>
              <Link to={ROUTES.DEALS} className="btn btn-primary btn-lg hero__btn--primary">
                <Search size={18} style={{ marginRight: 6 }} /> Explore Deals
              </Link>
              <Link to={ROUTES.SIGNUP} className="btn btn-outline btn-lg hero__btn--outline">
                <Store size={18} style={{ marginRight: 6 }} /> For Businesses
              </Link>
            </motion.div>
          </div>

          {/* Middle Column (col-span-3): Hero Graphic (Community Circle) */}
          <div className="hero__middle">
            <div className="hero__circle-container">
              {/* Pulse rings */}
              <div className="hero__pulse-ring hero__pulse-ring--1" />
              <div className="hero__pulse-ring hero__pulse-ring--2" />

              {/* Dashed Circle */}
              <div className="hero__dashed-circle" />

              {/* Central Shopping Bag Icon */}
              <motion.div 
                className="hero__central-bag shadow-xl"
                variants={floatAnim}
                animate="animate"
              >
                <div className="hero__central-bag-inner">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
              </motion.div>

              {/* Avatars arranged radially */}
              {AVATAR_SEEDS.map((item, idx) => {
                const angle = (idx * 360) / AVATAR_SEEDS.length;
                const radius = 130; // increased for larger container
                const x = radius * Math.cos((angle * Math.PI) / 180);
                const y = radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={idx}
                    className="hero__radial-avatar"
                    style={{
                      transform: `translate(${x}px, ${y}px)`
                    }}
                  >
                    <ImageWithFallback
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seed}`}
                      alt={item.name}
                      fallbackType="avatar"
                      name={item.name}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                  </div>
                );
              })}

              {/* Floating 40% OFF tag */}
              <div className="hero__floating-tag shadow-sm">
                <span className="text-[10px] font-extrabold uppercase flex items-center gap-1">
                  🔥 40% OFF
                </span>
              </div>
            </div>
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
