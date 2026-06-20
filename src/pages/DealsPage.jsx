import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import DealCard from '../components/DealCard';
import DealTypeToggle from '../components/DealTypeToggle';
import CategorySection from '../components/CategorySection';
import SearchOverlay from '../components/SearchOverlay';
import { mockDeals } from '../data/mockDeals';
import { api } from '../utils/api';
import { MALLS } from '../utils/constants';
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
  const [dealsList, setDealsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealType, setDealType] = useState('all'); // 'all' | 'pair' | 'group'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const mallQuery = searchParams.get('mall') || '';
  const searchQuery = searchParams.get('search') || '';

  const handleMallChange = (mall) => {
    if (mall) {
      searchParams.set('mall', mall);
    } else {
      searchParams.delete('mall');
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    api.get('/offers/list?status=ACTIVE')
      .then((data) => {
        // Map backend fields to frontend DealCard format
        const mapped = data.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          category: d.category ? d.category.toLowerCase() : 'shopping',
          mode: d.offer_type && (d.offer_type.toLowerCase() === 'bogo' || d.offer_type.toLowerCase() === 'pair') ? 'pair' : 'group',
          originalPrice: d.original_price,
          pairleyPrice: d.offer_price,
          images: [d.offer_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
          businessOwner: {
            id: d.business_id,
            name: d.business?.business_name || 'Local Seller',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (d.business?.business_name || 'Seller'),
            rating: 4.5
          },
          interestCount: d.joined_people || 0,
          maxParticipants: d.required_people || 2,
          location: d.business?.city || 'Select Location',
          validUntil: d.end_date || '2026-12-31',
          status: d.status ? d.status.toLowerCase() : 'active',
          createdAt: d.created_at || d.createdAt || '2026-06-01',
          mallName: d.business?.mall_name || null
        }));
        setDealsList(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load live deals from backend, falling back to mock:', err);
        const mappedMock = mockDeals.map((d, i) => ({
          ...d,
          mallName: d.mallName || (i % 2 === 0 ? 'Orion Mall, Rajajinagar' : 'Phoenix Marketcity, Whitefield')
        }));
        setDealsList(mappedMock);
        setLoading(false);
      });
  }, []);

  /* Filtered + sorted deals */
  const filteredDeals = useMemo(() => {
    let deals = [...dealsList];

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

    /* Filter by mall */
    if (mallQuery) {
      deals = deals.filter((d) => d.mallName === mallQuery);
    }

    /* Filter by search query */
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      deals = deals.filter((d) => 
        d.title?.toLowerCase().includes(q) || 
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        (d.businessOwner?.name && d.businessOwner.name.toLowerCase().includes(q))
      );
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
  }, [dealsList, dealType, selectedCategory, mallQuery, searchQuery, sortBy]);

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
                value={mallQuery}
                onChange={(e) => handleMallChange(e.target.value)}
                aria-label="Filter by Mall"
              >
                <option value="">All Malls (Bangalore)</option>
                {MALLS.map((mall) => (
                  <option key={mall} value={mall}>
                    {mall}
                  </option>
                ))}
              </select>

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
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold animate-pulse">
              ⚡ Loading live matching deals...
            </div>
          ) : filteredDeals.length > 0 ? (
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
