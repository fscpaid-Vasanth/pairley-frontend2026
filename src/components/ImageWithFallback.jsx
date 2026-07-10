import React, { useState } from 'react';
import { User, Store, Sparkles } from 'lucide-react';
import { getCategoryById } from '../data/categories';
import './ImageWithFallback.css';

export default function ImageWithFallback({
  src,
  alt = 'Image',
  className = '',
  fallbackType = 'deal', // 'deal' | 'avatar' | 'business'
  category = 'shopping',
  name = '',
  style = {},
  loading = 'lazy'
}) {
  const [error, setError] = useState(false);

  // If there's no error and src is valid, render standard image
  if (!error && src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback rendering
  if (fallbackType === 'avatar') {
    // Get initials from name or alt
    const displayName = name || alt || 'User';
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    // Select background gradient seed based on name length
    const gradients = [
      'linear-gradient(135deg, #6366F1, #4F46E5)', // Indigo
      'linear-gradient(135deg, #EC4899, #DB2777)', // Pink
      'linear-gradient(135deg, #22C55E, #16a34a)', // Emerald
      'linear-gradient(135deg, #F59E0B, #D97706)', // Amber
      'linear-gradient(135deg, #3B82F6, #2563EB)'  // Blue
    ];
    const gradIndex = displayName.length % gradients.length;
    const bgGradient = gradients[gradIndex];

    return (
      <div
        className={`image-fallback image-fallback--avatar ${className}`}
        style={{
          background: bgGradient,
          ...style
        }}
      >
        <span className="image-fallback__initials">{initials}</span>
      </div>
    );
  }

  if (fallbackType === 'business') {
    return (
      <div
        className={`image-fallback image-fallback--business ${className}`}
        style={{
          background: 'linear-gradient(135deg, #5B12D6, #7C3AED)',
          ...style
        }}
      >
        <Store size={24} className="image-fallback__icon text-white" />
      </div>
    );
  }

  // Default: Deal fallback card (category-specific)
  const catData = getCategoryById(category);
  const bgGradient = catData?.gradient || 'linear-gradient(135deg, #5B12D6, #7C3AED)';
  const iconEmoji = catData?.icon || '🏷️';

  return (
    <div
      className={`image-fallback image-fallback--deal ${className}`}
      style={{
        background: bgGradient,
        ...style
      }}
    >
      <div className="image-fallback__circle-glow" />
      <div className="image-fallback__emoji-wrap">
        <span className="image-fallback__emoji">{iconEmoji}</span>
      </div>
    </div>
  );
}

