import React from 'react';
import './illustrations.css';

export default function HeroIllustration({ className = "" }) {
  return (
    <svg
      className={`hero-illustration ${className}`}
      viewBox="0 0 500 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      {/* Background soft circle */}
      <circle cx="250" cy="180" r="130" fill="url(#bgSphere)" opacity="0.15" />

      {/* CHARACTER 1: Boy in Blue Hoodie (Left) */}
      <g className="char-left">
        {/* Arm Raised */}
        <path d="M140 180 C120 140, 110 110, 130 95 C145 85, 160 110, 165 140" fill="#5B12D6" />
        <circle cx="128" cy="92" r="10" fill="#FDBA74" /> {/* Fist */}
        {/* Body */}
        <path d="M145 175 L195 175 L195 280 L135 280 Z" fill="#5B12D6" />
        {/* Head & Face */}
        <path d="M145 175 C145 155, 185 155, 185 175 Z" fill="#FDBA74" />
        <circle cx="165" cy="148" r="18" fill="#FDBA74" />
        {/* Hair */}
        <path d="M145 145 C145 130, 185 130, 185 145 C175 135, 155 135, 145 145" fill="#1F2937" />
        {/* Eyes & Mouth */}
        <circle cx="159" cy="147" r="1.5" fill="#1F2937" />
        <circle cx="171" cy="147" r="1.5" fill="#1F2937" />
        <path d="M161 156 Q165 162 169 156" stroke="#1F2937" strokeWidth="2" fill="none" />
      </g>

      {/* CHARACTER 2: Girl in Yellow Shirt (Middle-Left) */}
      <g className="char-mid-left">
        {/* Hair Back */}
        <path d="M195 170 C175 140, 175 240, 195 260 C215 280, 235 280, 240 260" fill="#111827" />
        {/* Body */}
        <path d="M190 190 L250 190 L245 280 L195 280 Z" fill="#FBBF24" />
        {/* Head & Face */}
        <circle cx="220" cy="165" r="18" fill="#FFD2A1" />
        {/* Hair Front */}
        <path d="M202 160 C202 145, 238 145, 238 160 C230 150, 210 150, 202 160" fill="#111827" />
        {/* Face Details */}
        <circle cx="213" cy="164" r="1.5" fill="#111827" />
        <circle cx="227" cy="164" r="1.5" fill="#111827" />
        <path d="M217 172 Q220 178 223 172" stroke="#111827" strokeWidth="2" fill="none" />
        {/* Holding Phone */}
        <rect x="235" y="180" width="14" height="26" rx="3" fill="#1F2937" transform="rotate(-10 235 180)" />
        <rect x="237" y="182" width="10" height="22" rx="2" fill="#06B6D4" transform="rotate(-10 235 180)" />
        <circle cx="229" cy="190" r="6" fill="#FFD2A1" /> {/* Hand */}
      </g>

      {/* CHARACTER 3: Boy in Green Shirt (Middle-Right) */}
      <g className="char-mid-right">
        {/* Body */}
        <path d="M260 185 L320 185 L320 280 L260 280 Z" fill="#22C55E" />
        {/* Head */}
        <circle cx="290" cy="155" r="18" fill="#FDBA74" />
        {/* Hair */}
        <path d="M272 150 C272 135, 308 135, 308 150 C300 140, 280 140, 272 150" fill="#4B5563" />
        {/* Face details */}
        <circle cx="283" cy="154" r="1.5" fill="#1F2937" />
        <circle cx="297" cy="154" r="1.5" fill="#1F2937" />
        <path d="M286 162 Q290 168 294 162" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Hand giving thumbs up */}
        <path d="M320 185 Q335 180 335 195 Q335 205 320 205" fill="#FDBA74" stroke="#22C55E" strokeWidth="1" />
        <circle cx="332" cy="188" r="4" fill="#FDBA74" /> {/* Thumb */}
      </g>

      {/* CHARACTER 4: Girl in Purple Hoodie (Right) */}
      <g className="char-right-girl">
        {/* Hair Back */}
        <path d="M340 180 C320 150, 320 250, 345 270" fill="#374151" />
        {/* Body */}
        <path d="M330 185 L390 185 L385 280 L335 280 Z" fill="#7C3AED" />
        {/* Arm Raised */}
        <path d="M375 175 C395 135, 410 110, 395 95 C380 85, 370 115, 365 145" fill="#7C3AED" />
        <circle cx="400" cy="93" r="10" fill="#FFD2A1" /> {/* Fist */}
        {/* Head */}
        <circle cx="360" cy="155" r="18" fill="#FFD2A1" />
        {/* Hair Front */}
        <path d="M342 150 C342 135, 378 135, 378 150 C370 142, 350 142, 342 150" fill="#374151" />
        {/* Face Details */}
        <circle cx="353" cy="154" r="1.5" fill="#111827" />
        <circle cx="367" cy="154" r="1.5" fill="#111827" />
        <path d="M357 162 Q360 168 363 162" stroke="#111827" strokeWidth="2" fill="none" />
      </g>

      {/* Gradients */}
      <defs>
        <radialGradient id="bgSphere" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B12D6" />
          <stop offset="100%" stopColor="#5B12D6" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

