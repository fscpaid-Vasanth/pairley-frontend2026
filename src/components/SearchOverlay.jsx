import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Trash2, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { categories } from '../data/categories';
import { formatPrice } from '../utils/constants';
import { getCategoryById } from '../data/categories';
import { getDealMode, getOfferTypeIcon, getOfferTypeMeta } from '../utils/offerTypes';
import { api } from '../utils/api';
import ImageWithFallback from './ImageWithFallback';
import './SearchOverlay.css';

const MODE_FILTERS = [
  { id: 'all', label: 'All Offers' },
  { id: 'pair', label: '🤝 Pair BOGO' },
  { id: 'group', label: '👥 Group Tiers' },
];

const TRENDING_KEYWORDS = [
  'Samsung Buds',
  'Spa BOGO',
  'Kerala Tour',
  'Buffet Feast',
  'Fitness Pass',
  'OTT Premium'
];

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const inputRef = useRef(null);

  // Category tile counts — fetched once when the overlay first opens.
  useEffect(() => {
    if (!isOpen) return;
    api.get('/offers/category-counts')
      .then((counts) => setCategoryCounts(counts || {}))
      .catch((err) => console.error('Failed to load category counts:', err));
  }, [isOpen]);

  // Manage search history in session storage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = sessionStorage.getItem('pairley_recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== cleanTerm.toLowerCase());
      const next = [cleanTerm, ...filtered].slice(0, 5);
      sessionStorage.setItem('pairley_recent_searches', JSON.stringify(next));
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    sessionStorage.removeItem('pairley_recent_searches');
  };

  /* Auto-focus on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery('');
      setModeFilter('all');
      setCategoryFilter('all');
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Determine if user has actively started filtering or searching
  const isSearching = query.trim() !== '' || categoryFilter !== 'all' || modeFilter !== 'all';

  /* Real backend search — debounced, re-fires on query/category change.
     modeFilter (pair/group/all) has no server-side param; applied
     client-side on the fetched result set via the shared offer_type
     helper, same as DealsPage. */
  useEffect(() => {
    if (!isSearching) {
      setResults([]);
      return;
    }

    const params = new URLSearchParams({ status: 'ACTIVE' });
    if (query.trim()) params.set('search', query.trim());
    if (categoryFilter !== 'all') params.set('category', categoryFilter);

    setIsLoadingResults(true);
    const timeoutId = setTimeout(() => {
      api.get(`/offers/list?${params.toString()}`)
        .then((data) => {
          const mapped = data.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category ? d.category.toLowerCase() : 'shopping',
            offer_type: d.offer_type,
            mode: getDealMode(d.offer_type),
            pairleyPrice: d.offer_price,
            images: [d.offer_image || d.cover_image],
            location: d.business?.city || '',
            businessOwner: { name: d.business?.business_name || 'Local Seller' },
          }));
          const filtered =
            modeFilter === 'all' ? mapped : mapped.filter((d) => d.mode === modeFilter);
          setResults(filtered);
        })
        .catch((err) => {
          console.error('Search failed:', err);
          setResults([]);
        })
        .finally(() => setIsLoadingResults(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, categoryFilter, modeFilter, isSearching]);

  const handleKeywordClick = (term) => {
    setQuery(term);
    addRecentSearch(term);
  };

  const handleCategoryClick = (catId) => {
    setCategoryFilter(catId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close button */}
          <button
            className="search-overlay__close"
            onClick={onClose}
            aria-label="Close search"
            style={{ position: 'fixed', top: 24, right: 24 }}
          >
            <X size={22} />
          </button>

          {/* Search Input */}
          <div className="search-overlay__header">
            <div className="search-overlay__input-wrap">
              <Search size={22} className="search-overlay__input-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-overlay__input"
                placeholder="Search deals, categories, locations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addRecentSearch(query);
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Filter Toolbar */}
          <div className="search-overlay__filters">
            {MODE_FILTERS.map((f) => (
              <button
                key={f.id}
                className={`search-overlay__pill ${modeFilter === f.id ? 'search-overlay__pill--active' : ''}`}
                onClick={() => setModeFilter(f.id)}
              >
                {f.label}
              </button>
            ))}

            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

            <button
              className={`search-overlay__pill ${categoryFilter === 'all' ? 'search-overlay__pill--active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All Categories
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                className={`search-overlay__pill ${categoryFilter === cat.id ? 'search-overlay__pill--active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Main Results / Dashboard Container */}
          <div className="search-overlay__results custom-scrollbar">
            {isSearching ? (
              // SEARCH RESULTS ACTIVE VIEW
              <motion.div 
                key="search-results-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="search-overlay__results-title">
                    {isLoadingResults
                      ? 'Searching…'
                      : `${results.length} matched offer${results.length !== 1 ? 's' : ''}`}
                  </p>
                  <button
                    onClick={() => {
                      setQuery('');
                      setCategoryFilter('all');
                      setModeFilter('all');
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Clear Filters
                  </button>
                </div>

                {isLoadingResults ? (
                  <div className="search-overlay__no-results py-12">
                    <div className="search-overlay__no-results-emoji">⏳</div>
                    <p className="font-bold text-slate-300 text-lg">Searching offers…</p>
                  </div>
                ) : results.length > 0 ? (
                  results.map((deal) => {
                    const cat = getCategoryById(deal.category);
                    const modeLabel =
                      deal.mode === 'pair'
                        ? '🤝 Pair BOGO'
                        : deal.mode === 'group'
                        ? '👥 Group Tiers'
                        : `${getOfferTypeIcon(deal.offer_type)} ${getOfferTypeMeta(deal.offer_type).shortLabel}`;
                    return (
                      <Link
                        key={deal.id}
                        to={`/deals/${deal.id}`}
                        className="search-overlay__result-item"
                        onClick={() => {
                          addRecentSearch(query || deal.title);
                          onClose();
                        }}
                      >
                        <ImageWithFallback
                          src={deal.images?.[0]}
                          alt={deal.title}
                          className="search-overlay__result-img"
                          fallbackType="deal"
                          category={deal.category}
                        />
                        <div className="search-overlay__result-info">
                          <div className="search-overlay__result-title">{deal.title}</div>
                          <div className="search-overlay__result-meta">
                            {cat?.icon} {cat?.name} · {deal.location} · {modeLabel}
                          </div>
                        </div>
                        <span className="search-overlay__result-price">
                          {formatPrice(deal.pairleyPrice)}
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="search-overlay__no-results py-12">
                    <div className="search-overlay__no-results-emoji">🔍</div>
                    <p className="font-bold text-slate-300 text-lg">No offers match your criteria</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                      Try adjusting filters or checking for typos.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              // LANDING EXPLORER VIEW (WHEN SEARCH IS EMPTY)
              <motion.div 
                key="search-landing-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-8 py-2"
              >
                {/* 1. Recent Searches history */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock size={13} /> Recent Searches
                      </h4>
                      <button 
                        onClick={clearRecentSearches}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                      >
                        <Trash2 size={11} /> Clear History
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleKeywordClick(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Trending Searches tags */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                    <TrendingUp size={13} /> Trending Offers
                  </h4>
                  
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_KEYWORDS.map((keyword, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleKeywordClick(keyword)}
                        className="px-3.5 py-2 rounded-xl bg-[#5B12D6]/10 border border-[#5B12D6]/20 hover:bg-[#5B12D6]/20 hover:border-[#5B12D6]/30 text-xs font-bold text-[#A78BFA] transition"
                      >
                        ⚡ {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Explorer Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Explore Categories
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="group flex flex-col text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#5B12D6]/50 hover:bg-white/10 transition-all duration-200"
                      >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">
                          {cat.icon}
                        </span>
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-indigo-300">
                          {categoryCounts[cat.id] || 0} active deals <ArrowRight size={10} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

