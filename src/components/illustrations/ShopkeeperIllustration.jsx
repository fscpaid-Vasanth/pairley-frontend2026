import React from 'react';
import './illustrations.css';

export default function ShopkeeperIllustration({ className = "" }) {
  return (
    <svg
      className={`shopkeeper-illustration ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      {/* Background soft light */}
      <circle cx="80" cy="80" r="60" fill="url(#shopBg)" opacity="0.2" />

      {/* STOREFRONT BACKGROUND */}
      {/* Store wall */}
      <rect x="25" y="40" width="110" height="90" fill="#E2E8F0" rx="4" />
      {/* Door */}
      <rect x="35" y="70" width="28" height="60" fill="#475569" />
      <rect x="55" y="95" width="4" height="4" rx="2" fill="#FBBF24" /> {/* Door handle */}
      {/* Window */}
      <rect x="75" y="70" width="50" height="40" fill="#93C5FD" rx="2" stroke="#475569" strokeWidth="2" />
      {/* Window shine */}
      <path d="M110 72 L122 72 L95 108 L83 108 Z" fill="#E0F2FE" opacity="0.6" />

      {/* Striped Awning */}
      <rect x="20" y="30" width="120" height="15" rx="3" fill="#EF4444" />
      <g fill="#FFFFFF">
        <rect x="32" y="30" width="12" height="15" />
        <rect x="56" y="30" width="12" height="15" />
        <rect x="80" y="30" width="12" height="15" />
        <rect x="104" y="30" width="12" height="15" />
        <rect x="128" y="30" width="8" height="15" />
      </g>
      {/* Scallop details of awning */}
      <circle cx="26" cy="45" r="6" fill="#EF4444" />
      <circle cx="38" cy="45" r="6" fill="#FFFFFF" />
      <circle cx="50" cy="45" r="6" fill="#EF4444" />
      <circle cx="62" cy="45" r="6" fill="#FFFFFF" />
      <circle cx="74" cy="45" r="6" fill="#EF4444" />
      <circle cx="86" cy="45" r="6" fill="#FFFFFF" />
      <circle cx="98" cy="45" r="6" fill="#EF4444" />
      <circle cx="110" cy="45" r="6" fill="#FFFFFF" />
      <circle cx="122" cy="45" r="6" fill="#EF4444" />
      <circle cx="134" cy="45" r="6" fill="#FFFFFF" />

      {/* SHOPKEEPER MAN */}
      {/* Body / Blue Shirt */}
      <path d="M50 115 C50 100, 110 100, 110 115 L105 160 L55 160 Z" fill="#2563EB" />
      {/* Apron (Red) */}
      <path d="M62 115 L98 115 L94 160 L66 160 Z" fill="#DC2626" />
      {/* Apron straps */}
      <line x1="62" y1="115" x2="68" y2="105" stroke="#991B1B" strokeWidth="2.5" />
      <line x1="98" y1="115" x2="92" y2="105" stroke="#991B1B" strokeWidth="2.5" />

      {/* Neck */}
      <rect x="74" y="94" width="12" height="12" fill="#FDBA74" />

      {/* Head */}
      <circle cx="80" cy="80" r="18" fill="#FDBA74" />

      {/* Beard & Hair */}
      <path d="M62 80 C62 55, 98 55, 98 80 C98 92, 94 98, 80 98 C66 98, 62 92, 62 80 Z" fill="#1F2937" opacity="0.15" /> {/* beard shadow */}
      <path d="M68 85 C68 95, 92 95, 92 85 C92 98, 68 98, 68 85" fill="#374151" /> {/* actual beard */}
      <path d="M62 76 C62 60, 98 60, 98 76 C94 66, 66 66, 62 76" fill="#374151" /> {/* hair */}

      {/* Eyes & Smile */}
      <circle cx="73" cy="76" r="1.5" fill="#111827" />
      <circle cx="87" cy="76" r="1.5" fill="#111827" />
      <path d="M76 83 Q80 88 84 83" stroke="#FDBA74" strokeWidth="2.5" fill="none" />
      <path d="M77 87 Q80 91 83 87" stroke="#FFFFFF" strokeWidth="2" fill="none" />

      {/* Folded Arms */}
      <rect x="56" y="122" width="48" height="12" rx="6" fill="#1E40AF" />
      <rect x="62" y="125" width="36" height="10" rx="5" fill="#B91C1C" />

      <defs>
        <radialGradient id="shopBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

