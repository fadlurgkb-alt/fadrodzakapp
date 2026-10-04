'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  isActive?: boolean;
}

/**
 * 1. Ikon Beranda (Home)
 * Desain rumah dengan atap miring terracotta, dinding kokoh, pintu lengkung isi terracotta,
 * dan aksen gantungan tali halus di sebelah kiri, persis seperti ilustrasi.
 */
export function IconBeranda({ className = '', size = 28, isActive = false }: IconProps) {
  const strokeColor = isActive ? '#A73F1C' : '#BD532B';
  const doorFill = isActive ? '#A73F1C' : '#BD532B';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${className}`}
    >
      {/* Atap Rumah Segitiga dengan teritisan */}
      <path
        d="M9 30.5L32 9.5L55 30.5"
        stroke={strokeColor}
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dinding Rumah dengan sudut bawah sedikit melengkung */}
      <path
        d="M15 28.5V52.5C15 54.5 16.5 56 18.5 56H45.5C47.5 56 49 54.5 49 52.5V28.5"
        stroke={strokeColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Garis vertikal aksen di sisi kiri dalam */}
      <line
        x1="15"
        y1="34"
        x2="15"
        y2="44"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Pintu Lengkung isi warna terracotta */}
      <path
        d="M26 56V42C26 38.6863 28.6863 36 32 36C35.3137 36 38 38.6863 38 42V56H26Z"
        fill={doorFill}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * 2. Ikon Belajar (Buku Terbuka / Open Book)
 * Buku terbuka dengan garis cokelat sepia, lembaran melengkung,
 * dan 3 garis teks bergelombang di tiap sisi halaman.
 */
export function IconBelajar({ className = '', size = 28, isActive = false }: IconProps) {
  const strokeColor = isActive ? '#4A3427' : '#674F3F';
  const textLineColor = isActive ? '#553E30' : '#7D6352';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${className}`}
    >
      {/* Halaman kiri dan kanan buku terbuka */}
      <path
        d="M32 23.5C27 18 17 18 11.5 22V50C17 46 27 46 32 51.5C37 46 47 46 52.5 50V22C47 18 37 18 32 23.5Z"
        fill="#FFFFFF"
        stroke={strokeColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punggung & ketebalan kertas bawah */}
      <path
        d="M11.5 50C17 48.5 27 48.5 32 54C37 48.5 47 48.5 52.5 50"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="32"
        y1="23.5"
        x2="32"
        y2="51.5"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* 3 Garis teks di lembar kiri */}
      <path
        d="M18 29.5C21 28.5 25 28.5 27 29.5"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M17 36C20 35 24 35 27 36"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M18 42.5C21 41.5 25 41.5 27 42.5"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* 3 Garis teks di lembar kanan */}
      <path
        d="M37 29.5C39 28.5 43 28.5 46 29.5"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M37 36C40 35 44 35 47 36"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M37 42.5C39 41.5 43 41.5 46 42.5"
        stroke={textLineColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 3. Ikon Buku (Tumpukan Buku Isometrik / Stacked Books)
 * Buku atas bersampul terracotta merah-oranye, buku bawah bersampul sage-olive green,
 * dalam perspektif sudut isometrik yang manis.
 */
export function IconBuku({ className = '', size = 28, isActive = false }: IconProps) {
  const terraColor = isActive ? '#A73F1C' : '#BD532B';
  const greenColor = isActive ? '#3D543A' : '#52694E';
  const darkOutline = '#42332A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${className}`}
    >
      {/* --- BUKU ATAS (Sampul Terracotta) --- */}
      {/* Ketebalan kertas buku atas */}
      <path
        d="M18 27.5L34 37L50 27.5V31L34 40.5L18 31V27.5Z"
        fill="#FFFFFF"
        stroke={terraColor}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Sampul atas buku terracotta */}
      <polygon
        points="34,17.5 50,27.5 34,37 18,27.5"
        fill="#FAF8F5"
        stroke={terraColor}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Garis pinggiran sampul bawah buku atas */}
      <path
        d="M18 31L34 40.5L50 31"
        stroke={terraColor}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* --- BUKU BAWAH (Sampul Hijau Sage-Olive) --- */}
      {/* Punggung & ketebalan buku hijau */}
      <path
        d="M16 38.5L34 49L52 38.5V42.5L34 53L16 42.5V38.5Z"
        fill="#FFFFFF"
        stroke={greenColor}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Punggung sisi kiri buku hijau */}
      <polygon
        points="16,38.5 34,49 34,53 16,42.5"
        fill={greenColor}
        stroke={greenColor}
        strokeWidth="1.5"
      />
      {/* Garis batas bawah buku hijau */}
      <path
        d="M16 42.5L34 53L52 42.5"
        stroke={greenColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Garis tepian kertas buku bawah */}
      <path
        d="M16 38.5L34 49L52 38.5"
        stroke={darkOutline}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 4. Ikon Tulis (Pena Klasik / Fountain Pen & Ink Wave)
 * Mata pena vintage sudut ~45 derajat, gagang terakota hangat,
 * dengan coretan garis tinta artistik bergelombang di bawahnya.
 */
export function IconTulis({ className = '', size = 28, isActive = false }: IconProps) {
  const terraColor = isActive ? '#A73F1C' : '#BD532B';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${className}`}
    >
      {/* Gagang / Barrel Pena Berisi Terracotta */}
      <path
        d="M38 31.5C36.5 28.5 37 25 40 21C42.5 17.5 45.5 15.5 48.5 14C50 13.2 51.5 14.5 50.8 16C49.5 19 47.5 22 44 24.5C40.5 27.5 39 31 38 31.5Z"
        fill={terraColor}
      />
      <path
        d="M39 30.5L46.5 21C48.5 18 51 15 51.5 13.5C52 12.5 50.5 12 49.5 12.5C47.5 13.5 44 16.5 41 19.5L34 29"
        stroke={terraColor}
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ujung knob atas pena */}
      <circle cx="51.5" cy="12.5" r="2.2" fill={terraColor} />

      {/* Ring pemisah leher pena */}
      <line
        x1="33"
        y1="29.5"
        x2="42"
        y2="36"
        stroke={terraColor}
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Mata Pena Segitiga (Nib) */}
      <path
        d="M33 30L20.5 48.5L38.5 34.5L33 30Z"
        fill="#FAF8F5"
        stroke={terraColor}
        strokeWidth="3.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Belahan tinta & lubang nafas mata pena */}
      <line
        x1="20.5"
        y1="48.5"
        x2="28"
        y2="39"
        stroke={terraColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="29" cy="38" r="1.5" fill={terraColor} />

      {/* Coretan Kaligrafi / Gelombang Tinta di bawah pena */}
      <path
        d="M17.5 53.5C21 50 25.5 50 28.5 52.5C31.5 55 35 55 38.5 52.5C42 50 45.5 51 47 52"
        stroke={terraColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 5. Ikon Profil (Lingkaran Pengguna / Avatar Silhouette)
 * Lingkaran berbingkai sepia-cokelat dengan siluet kepala dan pundak
 * berisi warna taupe/krem hangat.
 */
export function IconProfil({ className = '', size = 28, isActive = false }: IconProps) {
  const strokeColor = isActive ? '#4A3427' : '#674F3F';
  const silhouetteFill = isActive ? '#8E7362' : '#A88B77';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'} ${className}`}
    >
      {/* Lingkaran Luar */}
      <circle
        cx="32"
        cy="32"
        r="24.5"
        stroke={strokeColor}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* Kepala Bulat Oval Isi Taupe */}
      <ellipse
        cx="32"
        cy="26"
        rx="7.5"
        ry="8.5"
        fill={silhouetteFill}
      />

      {/* Bahu / Dada Melengkung Isi Taupe */}
      <path
        d="M18.8 49C20.5 40.5 25.5 37 32 37C38.5 37 43.5 40.5 45.2 49C41.8 53.5 37.2 56 32 56C26.8 56 22.2 53.5 18.8 49Z"
        fill={silhouetteFill}
      />
    </svg>
  );
}
