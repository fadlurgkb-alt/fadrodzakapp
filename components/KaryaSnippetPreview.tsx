'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { HighlightText, stripHtmlPreserveBreaks } from '../lib/search-utils';

interface KaryaSnippetPreviewProps {
  isiTulisan: string;
  kategori: string;
  searchQuery?: string;
  isMatchedInContent?: boolean;
  snippet?: string;
  maxPoemLines?: number;
}

/**
 * Komponen cerdas untuk menampilkan cuplikan karya sastra:
 * - Puisi / Pantun ditampilkan berbentuk bait dan berbaris rapi (bukan paragraf esai panjang).
 * - Cerpen / Catatan Sastra ditampilkan sebagai pembuka narasi prosa yang mengalir.
 * - Hasil pencarian disorot dengan tanda kutip puitis.
 */
export default function KaryaSnippetPreview({
  isiTulisan,
  kategori,
  searchQuery = '',
  isMatchedInContent = false,
  snippet = '',
  maxPoemLines = 4,
}: KaryaSnippetPreviewProps) {
  // Jika pencarian cocok di tengah teks, tampilkan potongan kalimat relevan
  if (searchQuery.trim() && isMatchedInContent && snippet) {
    return (
      <div className="my-3 p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DEC0]/80">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C45A2C] mb-1 font-sans uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          Ditemukan dalam bait sajak:
        </div>
        <p className="text-[#2C2420] leading-relaxed font-serif text-[15px] sm:text-base italic whitespace-pre-line">
          &ldquo;
          <HighlightText text={snippet} query={searchQuery} />
          &rdquo;
        </p>
      </div>
    );
  }

  const cleanText = stripHtmlPreserveBreaks(isiTulisan);
  const normalizedCategory = (kategori || '').toLowerCase().trim();

  // Deteksi apakah karya berformat sajak/puisi/pantun atau teks bait berbaris
  const hasVerseLines = cleanText.includes('\n');
  const isPoeticCategory =
    normalizedCategory === 'puisi' ||
    normalizedCategory === 'pantun' ||
    normalizedCategory.includes('syair') ||
    normalizedCategory.includes('sajak') ||
    (hasVerseLines &&
      !normalizedCategory.includes('cerpen') &&
      !normalizedCategory.includes('novel') &&
      !normalizedCategory.includes('cerbung') &&
      !normalizedCategory.includes('cerita') &&
      !normalizedCategory.includes('catatan'));

  if (isPoeticCategory) {
    // Pisahkan berdasarkan bait (stanza) atau baris
    const stanzas = cleanText
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const firstStanza = stanzas[0] || cleanText;
    const allLines = firstStanza
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const previewLines = allLines.slice(0, maxPoemLines);
    const hasMore = allLines.length > maxPoemLines || stanzas.length > 1;

    return (
      <div className="my-3 pl-4 border-l-2.5 border-[#C45A2C]/40 bg-[#FAF7F2]/50 py-2.5 px-3 rounded-r-xl">
        <div className="font-serif text-[#2E2824] text-[15px] sm:text-base leading-relaxed italic space-y-1">
          {previewLines.map((line, idx) => (
            <p key={idx} className="tracking-wide">
              {searchQuery.trim() ? (
                <HighlightText text={line} query={searchQuery} />
              ) : (
                line
              )}
            </p>
          ))}
          {hasMore && (
            <p className="text-[11px] text-[#9E8E84] font-serif not-italic pt-1">
              &hellip; (baca selengkapnya untuk bait utuh)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Untuk Cerpen, Catatan Sastra, dan prosa naratif lainnya
  // Tampilkan sebagai pembuka cerita yang anggun dengan line-clamp 3
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const firstParagraph = paragraphs[0] || cleanText;

  return (
    <div className="my-3 font-serif text-[#4A4540] text-[15px] sm:text-base leading-relaxed line-clamp-3">
      {searchQuery.trim() ? (
        <HighlightText text={firstParagraph} query={searchQuery} />
      ) : (
        firstParagraph
      )}
    </div>
  );
}
