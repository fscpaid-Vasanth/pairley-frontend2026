import { Star, Quote } from 'lucide-react';
import { formatPrice } from '../utils/constants';
import ImageWithFallback from './ImageWithFallback';
import './TestimonialCard.css';

export default function TestimonialCard({ testimonial }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'testimonial-card__star--filled' : 'testimonial-card__star--empty'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="testimonial-card card-glass p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={testimonial.avatar}
              alt={testimonial.name}
              className="avatar"
              fallbackType="avatar"
              name={testimonial.name}
            />
            <div>
              <h4 className="font-semibold text-base">{testimonial.name}</h4>
              <p className="text-xs text-muted">{testimonial.city}</p>
            </div>
          </div>
          <Quote className="testimonial-card__quote-icon text-muted" size={24} />
        </div>

        <div className="stars mb-3">
          {renderStars(testimonial.rating)}
        </div>

        <p className="testimonial-card__text text-sm text-secondary italic mb-4">
          "{testimonial.quote}"
        </p>
      </div>

      <div className="flex justify-between items-center mt-2 pt-3 border-t border-glass">
        <span className="badge badge-success">
          Saved {formatPrice(testimonial.saved)}!
        </span>
        <span className="text-xs text-muted capitalize">
          #{testimonial.category}
        </span>
      </div>
    </div>
  );
}

