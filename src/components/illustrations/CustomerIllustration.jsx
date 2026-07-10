import React from 'react';
import './illustrations.css';

export default function CustomerIllustration({ className = "" }) {
  return (
    <svg
      className={`customer-illustration ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      {/* Background radial soft light */}
      <circle cx="80" cy="80" r="60" fill="url(#customerBg)" opacity="0.2" />

      {/* Body / Green T-Shirt */}
      <path d="M40 120 C40 100, 120 100, 120 120 L110 160 L50 160 Z" fill="#22C55E" />

      {/* Neck */}
      <rect x="74" y="90" width="12" height="15" fill="#FFD2A1" />

      {/* Head */}
      <circle cx="80" cy="74" r="22" fill="#FFD2A1" />

      {/* Hair (Dark long hair) */}
      <path d="M54 74 C54 44, 106 44, 106 74 C106 100, 100 110, 100 120 C96 110, 96 85, 80 85 C64 85, 64 110, 60 120 C54 110, 54 100, 54 74" fill="#1F2937" />

      {/* Eyes & Mouth */}
      <circle cx="72" cy="72" r="1.5" fill="#111827" />
      <circle cx="88" cy="72" r="1.5" fill="#111827" />
      <path d="M75 82 Q80 87 85 82" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Hands holding Phone */}
      <rect x="85" y="95" width="18" height="32" rx="3" fill="#1E293B" transform="rotate(15 85 95)" />
      <rect x="87" y="97" width="14" height="28" rx="2" fill="#22C55E" transform="rotate(15 85 95)" />
      {/* Hand fingers */}
      <circle cx="82" cy="110" r="5" fill="#FFD2A1" />

      {/* Float bubble with checkmark */}
      <g className="float-bubble">
        <circle cx="118" cy="50" r="14" fill="#22C55E" />
        <path d="M112 50 L116 54 L124 46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <defs>
        <radialGradient id="customerBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

