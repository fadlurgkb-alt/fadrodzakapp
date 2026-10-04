'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from './SearchContext';

export default function HeaderSearchBar() {
  const { searchQuery, setSearchQuery, clearSearch, inputRef } = useSearch();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex items-center">
      {/* 1. Mobile Search Trigger Icon (hanya tampil di layar sangat kecil jika belum dibuka) */}
      <button
        type="button"
        onClick={() => {
          setIsMobileExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`sm:hidden p-2 rounded-xl border border-[#E8DEC0] bg-[#FAF6F0] text-[#7A6B63] hover:text-[#C45A2C] hover:border-[#C45A2C]/50 transition cursor-pointer ${
          isMobileExpanded ? 'hidden' : 'flex items-center justify-center'
        }`}
        title="Buka pencarian karya"
        aria-label="Cari karya sastra"
      >
        <Search className="w-4 h-4 text-[#C45A2C]" />
        {searchQuery.trim() && (
          <span className="w-2 h-2 rounded-full bg-[#C45A2C] absolute top-1 right-1" />
        )}
      </button>

      {/* 2. Container Input Search (Desktop selalu tampil; Mobile tampil saat isMobileExpanded atau di layar sm:) */}
      <div
        className={`${
          isMobileExpanded
            ? 'fixed inset-x-0 top-0 p-3 bg-white/95 backdrop-blur-md z-50 border-b border-[#E8DEC0] shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150'
            : 'hidden sm:flex items-center'
        } relative w-full sm:w-60 md:w-72 lg:w-88`}
      >
        <div
          className={`w-full flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl border transition-all duration-200 ${
            isFocused
              ? 'border-[#C45A2C] bg-white ring-2 ring-[#C45A2C]/15 shadow-xs'
              : 'border-[#E8DEC0] bg-[#FAF6F0]/80 hover:bg-[#FAF6F0] hover:border-[#DECBC0]'
          }`}
        >
          <Search
            className={`w-4 h-4 shrink-0 transition-colors ${
              isFocused || searchQuery ? 'text-[#C45A2C]' : 'text-[#9C8E84]'
            }`}
          />

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cari judul, penulis, bait..."
            className="w-full bg-transparent text-xs sm:text-sm font-serif text-[#2C2C2C] placeholder-[#9C8E84] focus:outline-none"
            aria-label="Cari judul karya, nama penulis, atau cuplikan bait"
          />

          {/* Tombol Clear (X) saat ada teks */}
          {searchQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 rounded-full text-[#9C8E84] hover:text-[#C45A2C] hover:bg-[#FAF0E6] transition cursor-pointer shrink-0"
              title="Bersihkan pencarian"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            // Indikator Pintasan Keyboard Shortcut (tampil di layar besar saat kosong)
            <span
              className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#9C8E84] bg-white border border-[#E8DEC0] shadow-2xs shrink-0 select-none"
              title="Tekan tombol '/' untuk langsung mencari"
            >
              /
            </span>
          )}
        </div>

        {/* Tombol Tutup Khusus Mobile Fullscreen Bar */}
        {isMobileExpanded && (
          <button
            type="button"
            onClick={() => {
              setIsMobileExpanded(false);
            }}
            className="sm:hidden px-3 py-2 text-xs font-serif text-[#7A6B63] hover:text-[#2C2C2C] shrink-0 font-medium"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
