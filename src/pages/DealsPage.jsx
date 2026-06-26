import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, PackageSearch, Sun, Moon } from 'lucide-react';
import DealCard from '../components/DealCard';
import DealTypeToggle from '../components/DealTypeToggle';
import CategorySection from '../components/CategorySection';
import CustomDropdown from '../components/CustomDropdown';
import { api } from '../utils/api';
import { MALLS } from '../utils/constants';
import SEO from '../components/SEO';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [dealType, setDealType] = useState('all'); // 'all' | 'pair' | 'group'
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('deals-theme') === 'dark';
  });

  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      const next = !prev;
      localStorage.setItem('deals-theme', next ? 'dark' : 'light');
      return next;
    });
  };
  const searchInputRef = useRef(null);

  const mallQuery = searchParams.get('mall') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const handleFocus = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener('focus-deals-search', handleFocus);

    if (searchParams.get('focusSearch') === 'true') {
      handleFocus();
      searchParams.delete('focusSearch');
      setSearchParams(searchParams, { replace: true });
    }

    return () => {
      window.removeEventListener('focus-deals-search', handleFocus);
    };
  }, [searchParams, setSearchParams]);

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
        console.error('Failed to load live deals from backend:', err);
        setDealsList([]);
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
    if (selectedCategory && selectedCategory !== 'all') {
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
      <SEO
        title="Local Deals & Group Offers"
        description="Discover exclusive group deals near you on Pairley. Browse restaurant offers, gym memberships, salon discounts, retail shopping deals and more. Join deals together and save big."
        keywords="local deals, group offers, restaurant discounts, gym deals, salon offers, retail deals India"
        canonical="https://www.pairley.com/deals"
      />
      <div className={`deals-page ${isDarkTheme ? 'deals-page--dark' : ''}`}>

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
              <CustomDropdown
                value={mallQuery}
                onChange={handleMallChange}
                options={MALLS}
                placeholder="All Malls (Bangalore)"
                bordered={true}
              />

              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
                placeholder="Sort by"
                bordered={true}
                showClear={false}
              />

              <div className="deals-search-wrapper">
                <Search className="deals-search-icon" size={16} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search deals..."
                  className="deals-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      searchParams.set('search', val);
                    } else {
                      searchParams.delete('search');
                    }
                    setSearchParams(searchParams);
                  }}
                />
              </div>

              <button
                type="button"
                className="deals-theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
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
                  setSelectedCategory('all');
                }}
              >
                <SlidersHorizontal size={16} />
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DealsPage;
