import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, Users, Gift, ArrowRight, Check, TrendingUp, Sparkles, BarChart2, Target, PieChart, Store } from 'lucide-react';
import { api } from '../utils/api';
import HeroSection from '../components/HeroSection';
import ImageWithFallback from '../components/ImageWithFallback';
import { ROUTES, formatPrice } from '../utils/constants';
import { categories } from '../data/categories';
import './HomePage.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Popular Offers Mock Data matching original HTML
const POPULAR_OFFERS = [
  {
    id: 'deal-004',
    title: 'Pizza BOGO Offer',
    merchant: "Domino's Pizza",
    category: 'dining',
    originalPrice: 1000,
    pairleyPrice: 600,
    discount: '40% OFF',
    progress: 33,
    joined: '1/3 Joined',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=350&fit=crop'
  },
  {
    id: 'deal-005',
    title: 'Gym Membership',
    merchant: 'Cult Fit',
    category: 'fitness',
    originalPrice: 3000,
    pairleyPrice: 1950,
    discount: '35% OFF',
    progress: 33,
    joined: '1/3 Joined',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=350&fit=crop'
  },
  {
    id: 'deal-003',
    title: 'Hair Spa Package',
    merchant: 'Naturals Salon',
    category: 'beauty',
    originalPrice: 1500,
    pairleyPrice: 1050,
    discount: '30% OFF',
    progress: 33,
    joined: '1/3 Joined',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&h=350&fit=crop'
  },
  {
    id: 'deal-102',
    title: 'Goa Trip Package',
    merchant: 'MakeMyTrip',
    category: 'tours',
    originalPrice: 12000,
    pairleyPrice: 9000,
    discount: '25% OFF',
    progress: 33,
    joined: '1/3 Joined',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&h=350&fit=crop'
  }
];

const getShortLabel = (cat) => {
  if (cat.id === 'dining') return 'Food';
  if (cat.id === 'beauty') return 'Salon';
  if (cat.id === 'shopping') return 'Retail';
  if (cat.id === 'tours') return 'Travel';
  if (cat.id === 'home-services') return 'Home';
  if (cat.id === 'subscriptions') return 'Electronics';
  return cat.name.split(' & ')[0].split(' ')[0];
};

export default function HomePage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMall, setSelectedMall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/offers/list?status=ACTIVE')
      .then((data) => {
        // Sort by createdAt / created_at descending so newly uploaded deals show first (high priority)
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || 0);
          const dateB = new Date(b.created_at || b.createdAt || 0);
          return dateB - dateA;
        });
        setOffers(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load live deals, falling back to mock data:', err);
        const mappedMock = POPULAR_OFFERS.map((o, i) => ({
          ...o,
          business: {
            business_name: o.merchant,
            mall_name: i % 2 === 0 ? 'Orion Mall, Rajajinagar' : 'Phoenix Marketcity, Whitefield'
          }
        }));
        setOffers(mappedMock);
        setLoading(false);
      });
  }, []);

  const getMappedDeal = (deal) => {
    if (deal.original_price !== undefined) {
      const discountPct = Math.round(((deal.original_price - deal.offer_price) / deal.original_price) * 100);
      const categoryName = deal.category ? deal.category.toLowerCase() : 'shopping';
      return {
        id: deal.id,
        title: deal.title,
        merchant: deal.business?.business_name || 'Local Seller',
        category: categoryName,
        originalPrice: deal.original_price,
        pairleyPrice: deal.offer_price,
        discount: `${discountPct}% OFF`,
        progress: Math.min(100, Math.round(((deal.joined_people || 0) / (deal.required_people || 2)) * 100)),
        joined: `${deal.joined_people || 0}/${deal.required_people || 2} Joined`,
        image: deal.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=350&fit=crop'
      };
    }
    return deal;
  };

  const filteredDeals = useMemo(() => {
    let result = offers.map(getMappedDeal);
    if (selectedMall) {
      result = result.filter((d) => d.location === selectedMall || d.business?.mall_name === selectedMall);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.merchant.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
      );
    }
    return result;
  }, [offers, selectedMall, searchQuery]);

  return (
    <div className="homepage page-wrapper">
      {/* Viewport 1: Hero Section */}
      <HeroSection 
        selectedMall={selectedMall} 
        onMallChange={setSelectedMall} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Viewport 1.5: Horizontal Categories Layer */}
      <section className="homepage-categories-section">
        <div className="container">
          <div className="categories-horizontal-card">
            <div className="categories-horizontal-header">
              <h3 className="categories-horizontal-title">Browse Categories</h3>
              <Link to={ROUTES.DEALS} className="categories-horizontal-view-all">View All →</Link>
            </div>
            <div className="categories-horizontal-grid">
              {categories.slice(0, 9).map((cat) => (
                <Link to={`${ROUTES.DEALS}?category=${cat.id}`} className="categories-horizontal-item" key={cat.id}>
                  <span className="categories-horizontal-icon">
                    <img src={cat.imageUrl} alt={cat.name} className="categories-horizontal-icon-img" />
                  </span>
                  <span className="categories-horizontal-label">{getShortLabel(cat)}</span>
                </Link>
              ))}
              <Link to={ROUTES.DEALS} className="categories-horizontal-item">
                <span className="categories-horizontal-icon">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&auto=format&fit=crop&q=60" alt="More" className="categories-horizontal-icon-img" />
                </span>
                <span className="categories-horizontal-label">More</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Viewport 2: Popular Offers, How It Works, Business Banner & Trust Bar */}
      <section className="homepage-bottom-section">
        <div className="container">
          <div className="homepage-bottom-grid">
            
            {/* LEFT COLUMN: Popular Offers & Trust Bar */}
            <div className="homepage-left-column">
              {/* Popular Offers */}
              <motion.div 
                className="popular-offers-box"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeInUp}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-dark">
                    {selectedMall && searchQuery 
                      ? `${selectedMall.split(',')[0]}: "${searchQuery}"`
                      : selectedMall
                      ? `Offers at ${selectedMall.split(',')[0]}`
                      : searchQuery
                      ? `Offers matching "${searchQuery}"`
                      : 'Popular Offers'}
                  </h2>
                  <Link 
                    to={
                      selectedMall || searchQuery
                        ? `${ROUTES.DEALS}?${selectedMall ? `mall=${encodeURIComponent(selectedMall)}` : ''}${selectedMall && searchQuery ? '&' : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}` : ''}`
                        : ROUTES.DEALS
                    } 
                    className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="popular-offers-grid">
                  {loading ? (
                    <div className="col-span-full py-8 text-center text-slate-400 font-semibold animate-pulse">
                      ⚡ Loading live matching deals...
                    </div>
                  ) : offers.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-400 font-semibold">
                      🛍️ No active deals currently running. Check back soon!
                    </div>
                  ) : (
                    (() => {
                      let filtered = offers;
                      if (selectedMall) {
                        filtered = filtered.filter(o => o.business?.mall_name === selectedMall);
                      }
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        filtered = filtered.filter(o => 
                          o.title?.toLowerCase().includes(q) || 
                          o.description?.toLowerCase().includes(q) || 
                          o.category?.toLowerCase().includes(q) || 
                          (o.business?.business_name && o.business.business_name.toLowerCase().includes(q))
                        );
                      }
                      if (filtered.length === 0) {
                        return (
                          <div className="col-span-full py-8 text-center text-slate-400 font-semibold">
                            🛍️ No matching deals found in your selected filters.
                          </div>
                        );
                      }
                      return filtered.slice(0, 4).map(getMappedDeal).map((deal) => {
                        const catColors = {
                          dining:  { bg: '#FFF1F0', accent: '#EF4444', bar: '#EF4444' },
                          fitness: { bg: '#F5F0FF', accent: '#8B5CF6', bar: '#8B5CF6' },
                          beauty:  { bg: '#FFF0F7', accent: '#EC4899', bar: '#EC4899' },
                          tours:   { bg: '#F0FDF4', accent: '#10B981', bar: '#10B981' },
                        };
                        const colors = catColors[deal.category] || { bg: '#EEF2FF', accent: '#4E2BC4', bar: '#4E2BC4' };
                        return (
                          <div key={deal.id} className="popular-deal-card">
                            {/* Colored top accent bar */}
                            <div style={{ height: 4, background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}aa)`, borderRadius: '12px 12px 0 0' }} />

                            <div className="popular-deal-image-wrap">
                              <ImageWithFallback
                                src={deal.image}
                                alt={deal.title}
                                className="popular-deal-image"
                                fallbackType="deal"
                                category={deal.category}
                              />
                              {/* Discount badge */}
                              <div className="popular-deal-badge">{deal.discount}</div>
                              {/* Wishlist */}
                              <button className="popular-deal-wishlist" aria-label="Add to wishlist">
                                <Heart size={13} className="text-white" />
                              </button>
                            </div>

                            <div className="popular-deal-body">
                              {/* Category chip */}
                              <span className="popular-deal-chip" style={{ background: colors.bg, color: colors.accent }}>
                                {deal.category}
                              </span>

                              <h3 className="popular-deal-title">{deal.title}</h3>
                              <p className="popular-deal-merchant">{deal.merchant}</p>

                              {/* Pricing */}
                              <div className="popular-deal-pricing">
                                <span className="popular-deal-price">{formatPrice(deal.pairleyPrice)}</span>
                                <span className="popular-deal-original">{formatPrice(deal.originalPrice)}</span>
                              </div>

                              {/* Progress */}
                              <div className="popular-deal-progress-row">
                                <Users size={11} style={{ color: colors.accent, flexShrink: 0 }} />
                                <span className="popular-deal-progress-label">{deal.joined}</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${deal.progress}%`, background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}bb)` }} />
                              </div>

                              {/* CTA */}
                              <Link to={`${ROUTES.DEALS}/${deal.id}`} className="popular-deal-cta" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)` }}>
                                Join Deal
                              </Link>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </motion.div>

              {/* Trust Bar Section */}
              <motion.div 
                className="trust-bar mt-8 border-t border-gray-200 py-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100">
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-primary text-3xl"><Users size={26} /></div>
                    <h4 className="font-bold text-dark text-sm leading-tight">More Customers</h4>
                    <p className="text-xs text-gray-500">Boost visibility and reach</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-success text-3xl"><BarChart2 size={26} /></div>
                    <h4 className="font-bold text-dark text-sm leading-tight">Higher Engagement</h4>
                    <p className="text-xs text-gray-500">Drive participation</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-blue-500 text-3xl"><Target size={26} /></div>
                    <h4 className="font-bold text-dark text-sm leading-tight">Better Conversions</h4>
                    <p className="text-xs text-gray-500">Convert interest into sales</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-4">
                    <div className="text-purple-500 text-3xl"><PieChart size={26} /></div>
                    <h4 className="font-bold text-dark text-sm leading-tight">Data Insights</h4>
                    <p className="text-xs text-gray-500">Track and optimize offers</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: How It Works & Business Banner */}
            <div className="homepage-right-column">
              {/* How It Works */}
              <motion.div
                className="how-works-box card-glass p-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <div className="how-works-header">
                  <h2 className="how-works-title">How It Works</h2>
                  <Link to={ROUTES.HOW_IT_WORKS} className="how-works-view-all">
                    View All →
                  </Link>
                </div>

                <div className="how-works-horizontal relative">
                  <div className="how-works-line" />

                  {[
                    { icon: <Search size={17} />, label: 'Discover', sub: 'deals', color: '#10B981', bg: 'linear-gradient(135deg,#10B981,#059669)' },
                    { icon: <Users size={17} />, label: 'Join', sub: 'offers', color: '#F97316', bg: 'linear-gradient(135deg,#F97316,#EA580C)' },
                    { icon: <BarChart2 size={17} />, label: 'Watch', sub: 'growth', color: '#3B82F6', bg: 'linear-gradient(135deg,#3B82F6,#2563EB)' },
                    { icon: <Gift size={17} />, label: 'Unlock', sub: 'discounts', color: '#EC4899', bg: 'linear-gradient(135deg,#EC4899,#DB2777)' },
                    { icon: <Sparkles size={17} />, label: 'Enjoy', sub: 'savings', color: '#8B5CF6', bg: 'linear-gradient(135deg,#8B5CF6,#7C3AED)' },
                  ].map((step, i) => (
                    <div key={i} className="how-works-step-wrap">
                      <div className="step-circle-grad" style={{ background: step.bg }}>
                        <span style={{ color: 'white' }}>{step.icon}</span>
                      </div>
                      <span className="step-num" style={{ color: step.color }}>{i + 1}</span>
                      <span className="step-label">{step.label}<br />{step.sub}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Business Banner Card */}
              <motion.div
                className="biz-banner"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                {/* Decorative blobs */}
                <div className="biz-banner__blob biz-banner__blob--1" />
                <div className="biz-banner__blob biz-banner__blob--2" />

                <div className="biz-banner__content">
                  {/* Icon badge */}
                  <div className="biz-banner__icon-wrap">
                    <TrendingUp size={22} color="white" />
                  </div>

                  <span className="biz-banner__eyebrow">For Shop Owners</span>
                  <h3 className="biz-banner__title">
                    Turn Every Offer Into a Customer Engine.
                  </h3>
                  <p className="biz-banner__desc">
                    Reach thousands of group buyers, boost sales and grow revenue — all from one dashboard.
                  </p>

                  <div className="biz-banner__stats">
                    <div className="biz-banner__stat">
                      <span className="biz-banner__stat-val">50K+</span>
                      <span className="biz-banner__stat-lbl">Active buyers</span>
                    </div>
                    <div className="biz-banner__stat-divider" />
                    <div className="biz-banner__stat">
                      <span className="biz-banner__stat-val">3×</span>
                      <span className="biz-banner__stat-lbl">Sales growth</span>
                    </div>
                    <div className="biz-banner__stat-divider" />
                    <div className="biz-banner__stat">
                      <span className="biz-banner__stat-val">Free</span>
                      <span className="biz-banner__stat-lbl">To get started</span>
                    </div>
                  </div>

                  <Link to={ROUTES.SIGNUP} className="biz-banner__cta">
                    Get Started Free <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Decorative emoji */}
                <div className="biz-banner__emoji">🏪</div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
