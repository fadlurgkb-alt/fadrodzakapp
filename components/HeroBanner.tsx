import React from 'react';
import Link from 'next/link';
import FadrodzakLogo from './FadrodzakLogo';
import { IconTulis, IconBelajar } from './NavIcons';

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl mb-8 border border-[#E8DEC0] bg-gradient-to-br from-[#FDFBF7] via-[#F8F2E6] to-[#EFE4D2] shadow-sm">
      {/* Decorative Vintage Ambient Background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#C85A32]/10 to-[#D97706]/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-[#557A60]/5 blur-xl pointer-events-none" />

      {/* Decorative Vintage Watermark Flourish */}
      <div className="absolute right-4 bottom-2 opacity-5 select-none pointer-events-none text-9xl font-serif text-[#C85A32]">
        ❦
      </div>

      <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Column: Brand Emblem, Titles, and Taglines */}
        <div className="flex-1 text-center md:text-left">
          {/* Badge Sub-Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E8DEC0] text-[11px] font-serif font-bold text-[#C85A32] shadow-2xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            <span>Ruang Sastra &amp; Komunitas Aksara</span>
            <span className="text-[#A5958A]">•</span>
            <span className="text-[#736B63] font-normal">Lebih dari Sekedar Kata</span>
          </div>

          {/* Main Logo & Title Banner */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 mb-4">
            <FadrodzakLogo size="xl" variant="icon" />
            <div className="flex flex-col items-center sm:items-start">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#C85A32] leading-tight">
                Fadrodzak
                <span className="block text-lg sm:text-xl md:text-2xl font-bold text-[#2C2A29] font-serif mt-1">
                  Ruang Sastra &amp; Komunitas Aksara
                </span>
              </h1>
              <p className="text-xs sm:text-sm tracking-widest uppercase font-serif text-[#7A6B63] font-semibold mt-1">
                Komunitas Penulis &amp; Pembaca Aksara Indonesia
              </p>
            </div>
          </div>

          {/* Primary Tagline */}
          <p className="text-base sm:text-lg font-serif italic text-[#3F3935] max-w-xl leading-relaxed mb-5">
            &ldquo;Tempat di mana kata-kata menemukan rumahnya.&rdquo;
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link
              href="/tulis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94824] text-white font-serif font-bold text-sm shadow-sm hover:shadow transition-all group"
            >
              <IconTulis size={20} className="filter brightness-0 invert" />
              <span>Mulai Menulis</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>

            <Link
              href="/belajar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#557A60] border border-[#E8DEC0] font-serif text-sm font-semibold hover:border-[#557A60]/40 shadow-2xs transition-all"
            >
              <IconBelajar size={20} />
              <span>Klinik Bedah Karya</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Literary Motto & Aksara Ornament Box */}
        <div className="shrink-0 w-full md:w-auto flex flex-col items-center">
          <div className="w-full md:w-64 p-5 rounded-xl bg-white/85 border border-[#E8DEC0] shadow-xs text-center backdrop-blur-xs">
            <div className="text-xs uppercase font-serif tracking-widest text-[#D97706] font-bold mb-2">
              ✦ Manifestasi Aksara ✦
            </div>
            <p className="text-sm font-serif text-[#4A4A4A] italic leading-snug mb-3">
              &ldquo;Setiap huruf yang terpahat adalah jejak jiwa, setiap bait adalah doa yang tak bersuara.&rdquo;
            </p>
            <div className="w-12 h-0.5 bg-[#C85A32]/30 mx-auto mb-2" />
            <span className="text-[11px] font-serif font-medium text-[#736B63]">
              Fadrodzak Literary Circle
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Ribbon Bar */}
      <div className="border-t border-[#E8DEC0]/80 bg-white/40 px-6 py-2 flex flex-wrap items-center justify-between text-[11px] font-serif text-[#7A6B63]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="text-[#C85A32]">📜</span> Puisi, Cerpen, Pantun &amp; Esai
          </span>
          <span className="hidden sm:inline-block text-[#C85A32]/30">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="text-[#557A60]">🌱</span> Ruang Apresiasi Bebas Distraksi
          </span>
        </div>
        <div className="italic text-[#998A7F] text-right">
          #LebihDariSekedarKata
        </div>
      </div>
    </section>
  );
}
