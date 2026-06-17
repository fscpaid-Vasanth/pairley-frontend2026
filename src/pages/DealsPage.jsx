import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import DealCard from '../components/DealCard';
import DealTypeToggle from '../components/DealTypeToggle';
import CategorySection from '../components/CategorySection';
import SearchOverlay from '../components/SearchOverlay';
import { mockDeals, getDealsByMode, getDealsByCategory } from '../data/mockDeals';
import './DealsPage.css';

/* Animation variants */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'savings', label: 'Biggest Savings' },
  { value: 'ending', label: 'Ending Soon' },
];

const DealsPage = () => {
  const [dealType, setDealType] = useState('all'); // 'all' | 'pair' | 'group'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  /* Filtered + sorted deals */
  const filteredDeals = useMemo(() => {
    let deals = [...mockDeals];

    /* Filter by mode */
    if (dealType === 'pair') {
      deals = deals.filter((d) => d.mode === 'pair');
    } else if (dealType === 'group') {
      deals = deals.filter((d) => d.mode === 'group');
    }

    /* Filter by category */
    if (selectedCategory) {
      deals = deals.filter((d) => d.category === selectedCategory);
    }

    /* Sort */
    switch (sortBy) {
      case 'newest':
        deals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        deals.sort((a, b) => b.interestCount - a.interestCount);
        break;
      case 'savings': {
        const savings = (d) =>
          Math.round(((d.originalPrice - d.pairleyPrice) / d.originalPrice) * 100);
        deals.sort((a, b) => savings(b) - savings(a));
        break;
      }
      case 'ending':
        deals.sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil));
        break;
      default:
        break;
    }

    return deals;
  }, [dealType, selectedCategory, sortBy]);

  return (
    <div className="page-wrapper">
      <div className="deals-page">
        <div className="deals-page-glow" />

        <div className="container">
          {/* Page heading */}
          <motion.div
            className="deals-page-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>
              Discover <span className="gradient-text">Deals</span>
            </h1>
            <p>Browse pair and group deals. Filter, sort, and save together.</p>
          </motion.div>

          {/* Toolbar — toggle + sort + search */}
          <motion.div
            className="deals-toolbar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            <div className="deals-toolbar-left">
              <DealTypeToggle activeType={dealType} onTypeChange={setDealType} />
            </div>
            <div className="deals-toolbar-right">
              <select
                className="deals-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort deals"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                className="deals-search-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search deals"
              >
                <Search size={16} />
                Search
              </button>
            </div>
          </motion.div>

          {/* Category filter */}
          <div className="deals-categories-wrapper">
            <CategorySection
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) =>
                setSelectedCategory(cat === selectedCategory ? null : cat)
              }
            />
          </div>

          {/* Deal count */}
          <div className="deals-count">
            Showing <strong>{filteredDeals.length}</strong> deal
            {filteredDeals.length !== 1 ? 's' : ''}
          </div>

          {/* Deals grid — or empty state */}
          {filteredDeals.length > 0 ? (
            <motion.div
              className="deals-grid-page"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`${dealType}-${selectedCategory}-${sortBy}`}
            >
              {filteredDeals.map((deal) => (
                <motion.div key={deal.id} variants={cardVariants}>
                  <DealCard deal={deal} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="deals-empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="deals-empty-icon">
                <PackageSearch />
              </div>
              <h3>No deals found</h3>
              <p>Try different filters or browse all categories!</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setDealType('all');
                  setSelectedCategory(null);
                }}
              >
                <SlidersHorizontal size={16} />
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Search overlay */}
      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
};

export default DealsPage;
