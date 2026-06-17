import React from 'react';
import './illustrations.css';

export default function SmartwatchIllustration({ className = "" }) {
  return (
    <svg
      className={`smartwatch-illustration ${className}`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      {/* Background shadow glow */}
      <circle cx="60" cy="60" r="45" fill="url(#watchGlow)" opacity="0.4" className="pulse-glow" />

      {/* Straps */}
      <rect x="44" y="8" width="32" height="104" rx="8" fill="#1E1E2F" />
      {/* Strap detail lines */}
      <line x1="44" y1="20" x2="76" y2="20" stroke="#2D2D44" strokeWidth="2" />
      <line x1="44" y1="100" x2="76" y2="100" stroke="#2D2D44" strokeWidth="2" />
      <line x1="44" y1="14" x2="76" y2="14" stroke="#2D2D44" strokeWidth="2" />
      <line x1="44" y1="106" x2="76" y2="106" stroke="#2D2D44" strokeWidth="2" />

      {/* Watch Case Shadow */}
      <rect x="30" y="28" width="60" height="64" rx="18" fill="#0A0A10" />

      {/* Watch Case Bezel */}
      <rect x="32" y="30" width="56" height="60" rx="16" fill="#2D2D3F" stroke="#4E2BC4" strokeWidth="2" />
      {/* Inner Bezel Ring */}
      <rect x="36" y="34" width="48" height="52" rx="12" fill="#0D0D14" />

      {/* Side Button */}
      <rect x="91" y="50" width="3" height="20" rx="1.5" fill="#4E2BC4" />
      <rect x="90" y="52" width="2" height="16" rx="1" fill="#6D4EE3" />

      {/* Screen Interface */}
      <circle cx="60" cy="60" r="20" stroke="#1F2937" strokeWidth="4" />
      
      {/* Progress ring 1 (Cyan/Blue) */}
      <circle
        cx="60"
        cy="60"
        r="20"
        stroke="#06B6D4"
        strokeWidth="4"
        strokeDasharray="125"
        strokeDashoffset="35"
        strokeLinecap="round"
        className="watch-ring-outer"
      />

      {/* Progress ring 2 (Green) */}
      <circle cx="60" cy="60" r="14" stroke="#1F2937" strokeWidth="3" />
      <circle
        cx="60"
        cy="60"
        r="14"
        stroke="#10B981"
        strokeWidth="3"
        strokeDasharray="88"
        strokeDashoffset="18"
        strokeLinecap="round"
        className="watch-ring-inner"
      />

      {/* Center dot/indicator */}
      <circle cx="60" cy="60" r="2" fill="#FFFFFF" />

      {/* Mini digital readings */}
      <text x="60" y="47" fill="#8B5CF6" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">
        10:09
      </text>
      <text x="60" y="78" fill="#10B981" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="'Inter', sans-serif">
        9,842
      </text>

      {/* Definitions */}
      <defs>
        <radialGradient id="watchGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4E2BC4" />
          <stop offset="100%" stopColor="#4E2BC4" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
