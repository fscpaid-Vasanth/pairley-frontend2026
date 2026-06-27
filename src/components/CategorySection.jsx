import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '../data/categories';
import './CategorySection.css';

const SCROLL_AMOUNT = 320;

export default function CategorySection({ selectedCategory, onSelect, onSelectCategory }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  const handleSelect = (id) => {
    const targetId = id === 'all' ? null : id;
    if (onSelect) onSelect(targetId);
    if (onSelectCategory) onSelectCategory(targetId);
  };

  return (
    <div className="category-section">
      <div className="category-section__scroll-wrap">
        {/* Left arrow */}
        <button
          className="category-section__arrow category-section__arrow--left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrollable list */}
        <div className="category-section__list" ref={scrollRef}>
          {/* "All" card */}
          <motion.div
            className={`category-card ${!selectedCategory || selectedCategory === 'all' ? 'category-card--active' : ''}`}
            onClick={() => handleSelect('all')}
            whileTap={{ scale: 0.95 }}
            style={{ '--cat-color': 'var(--primary)' }}
          >
            <div className="category-card__icon-circle">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&auto=format&fit=crop&q=60" 
                alt="All Deals" 
                className="category-card__image-icon" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="category-card__emoji-fallback" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '20px' }}>
                🏷️
              </span>
            </div>
            <span className="category-card__name">All Deals</span>
          </motion.div>

          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              className={`category-card ${selectedCategory === cat.id ? 'category-card--active' : ''}`}
              onClick={() => handleSelect(cat.id)}
              whileTap={{ scale: 0.95 }}
              style={{ '--cat-color': cat.color }}
            >
              <div className="category-card__icon-circle">
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="category-card__image-icon" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="category-card__emoji-fallback" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '20px' }}>
                  {cat.icon}
                </span>
              </div>
              <span className="category-card__name">{cat.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          className="category-section__arrow category-section__arrow--right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
