import React from 'react';
import Link from 'next/link';

interface FadrodzakLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'compact' | 'full';
  showLink?: boolean;
}

export default function FadrodzakLogo({
  className = '',
  size = 'md',
  variant = 'compact',
  showLink = false,
}: FadrodzakLogoProps) {
  // Dimensions based on size
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 52,
    xl: 72,
  };

  const currentIconSize = iconSizes[size];

  const EmblemSVG = (
    <svg
      width={currentIconSize}
      height={currentIconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Logo Fadrodzak"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C85A32" />
          <stop offset="60%" stopColor="#AD4620" />
          <stop offset="100%" stopColor="#7E2D11" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bookPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF9" />
          <stop offset="100%" stopColor="#F3ECE0" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#C85A32" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Decorative Circular Ring with Dashed Literary Orbit */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#terracottaGrad)"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="url(#goldGrad)"
        strokeWidth="1"
        strokeDasharray="3 3"
        strokeOpacity="0.6"
      />

      {/* Stylized Open Book Wings / Aksara Base */}
      <path
        d="M50 78 C35 70 20 74 15 76 C15 54 22 46 36 44 C42 43 47 47 50 51 C53 47 58 43 64 44 C78 46 85 54 85 76 C80 74 65 70 50 78 Z"
        fill="url(#bookPageGrad)"
        stroke="url(#terracottaGrad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Page lines texture */}
      <path
        d="M23 60 C32 58 40 61 46 64"
        stroke="#7A6B63"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M24 67 C32 65 40 67 46 70"
        stroke="#7A6B63"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M77 60 C68 58 60 61 54 64"
        stroke="#7A6B63"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M76 67 C68 65 60 67 54 70"
        stroke="#7A6B63"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />

      {/* Central Fountain Pen Nib (Pena Sastra) */}
      <g filter="url(#softGlow)">
        {/* Main Nib Blade */}
        <path
          d="M50 14 L62 42 C64 47 62 55 58 58 L50 63 L42 58 C38 55 36 47 38 42 L50 14 Z"
          fill="url(#terracottaGrad)"
          stroke="#7E2D11"
          strokeWidth="1"
        />

        {/* Nib Gold Center Filigree */}
        <path
          d="M50 20 L58 42 C59 45 57 51 54 53 L50 56 L46 53 C43 51 41 45 42 42 L50 20 Z"
          fill="url(#goldGrad)"
          opacity="0.9"
        />

        {/* Nib Slit and Breather Hole */}
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="37"
          stroke="#3A1700"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="50" cy="37" r="2.2" fill="#3A1700" />
      </g>

      {/* Top Inspiring Spark / Aksara Star */}
      <path
        d="M50 7 L51.5 10.5 L55 12 L51.5 13.5 L50 17 L48.5 13.5 L45 12 L48.5 10.5 Z"
        fill="url(#goldGrad)"
      />
    </svg>
  );

  const LogoText = (
    <div className="flex flex-col leading-tight">
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-serif font-black tracking-tight text-[#C85A32] ${
            size === 'sm'
              ? 'text-lg'
              : size === 'md'
              ? 'text-2xl'
              : size === 'lg'
              ? 'text-3xl'
              : 'text-4xl'
          }`}
        >
          fadrodzak
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D97706] mb-0.5"></span>
      </div>
      {(variant === 'compact' || variant === 'full') && (
        <span
          className={`font-serif tracking-wider uppercase text-[#736B63] font-semibold ${
            size === 'sm'
              ? 'text-[9px]'
              : size === 'md'
              ? 'text-[10px]'
              : size === 'lg'
              ? 'text-xs'
              : 'text-sm'
          }`}
        >
          Ruang Sastra &amp; Komunitas Aksara
        </span>
      )}
      {variant === 'full' && (
        <span className="text-[11px] font-serif italic text-[#998A7F] mt-0.5">
          &ldquo;Tempat di mana kata-kata menemukan rumahnya&rdquo;
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {EmblemSVG}
      {variant !== 'icon' && LogoText}
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
