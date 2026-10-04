import React from 'react';

/**
 * Utilitas pembersihan HTML tags untuk pencarian teks murni
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Utilitas pembersihan HTML dengan tetap mempertahankan pemisah baris (\n)
 * Sangat penting untuk karya berbentuk Puisi dan Pantun agar bait tidak menyatu menjadi esai.
 */
export function stripHtmlPreserveBreaks(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Komponen pembantu untuk menandai (highlight) kata kunci pencarian dalam teks
 */
export function HighlightText({
  text,
  query,
  className = 'bg-amber-200/80 text-amber-950 font-semibold px-0.5 rounded-xs',
}: {
  text: string;
  query: string;
  className?: string;
}) {
  if (!query || !query.trim() || !text) {
    return <>{text}</>;
  }

  const trimmedQuery = query.trim();
  // Escape regex special characters
  const escaped = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={className}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/**
 * Ekstrak cuplikan kalimat (snippet) yang memuat kata kunci pencarian
 */
export function extractMatchingSnippet(
  content: string,
  query: string,
  contextRadius = 50
): { snippet: string; isMatchedInContent: boolean } {
  const clean = stripHtml(content);
  if (!query || !query.trim()) {
    return {
      snippet: clean.slice(0, 160) + (clean.length > 160 ? '...' : ''),
      isMatchedInContent: false,
    };
  }

  const lowerClean = clean.toLowerCase();
  const lowerQuery = query.trim().toLowerCase();
  const matchIndex = lowerClean.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return {
      snippet: clean.slice(0, 160) + (clean.length > 160 ? '...' : ''),
      isMatchedInContent: false,
    };
  }

  // Tentukan batas awal dan akhir cuplikan
  let start = Math.max(0, matchIndex - contextRadius);
  let end = Math.min(clean.length, matchIndex + lowerQuery.length + contextRadius);

  // Rapikan ke spasi terdekat agar tidak terpotong di tengah kata
  if (start > 0) {
    const spaceBefore = clean.indexOf(' ', start);
    if (spaceBefore !== -1 && spaceBefore < matchIndex) {
      start = spaceBefore + 1;
    }
  }

  if (end < clean.length) {
    const spaceAfter = clean.lastIndexOf(' ', end);
    if (spaceAfter !== -1 && spaceAfter > matchIndex + lowerQuery.length) {
      end = spaceAfter;
    }
  }

  const prefix = start > 0 ? '...' : '';
  const suffix = end < clean.length ? '...' : '';
  const snippet = `${prefix}${clean.slice(start, end).trim()}${suffix}`;

  return {
    snippet,
    isMatchedInContent: true,
  };
}

/**
 * Periksa apakah karya cocok dengan kata kunci pencarian
 */
export function isKaryaMatching(
  karya: {
    judul: string;
    nama_pengguna: string;
    isi_tulisan: string;
    kategori?: string;
    nama_cerita?: string | null;
    sinopsis?: string | null;
    judul_bab?: string | null;
  },
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  const cleanIsi = stripHtml(karya.isi_tulisan).toLowerCase();
  const lowerJudul = (karya.judul || '').toLowerCase();
  const lowerPenulis = (karya.nama_pengguna || '').toLowerCase();
  const lowerKategori = (karya.kategori || '').toLowerCase();
  const lowerNamaCerita = (karya.nama_cerita || '').toLowerCase();
  const lowerSinopsis = (karya.sinopsis || '').toLowerCase();
  const lowerJudulBab = (karya.judul_bab || '').toLowerCase();

  // Setiap kata harus cocok di setidaknya salah satu atribut
  return words.every(
    (w) =>
      lowerJudul.includes(w) ||
      lowerPenulis.includes(w) ||
      cleanIsi.includes(w) ||
      lowerKategori.includes(w) ||
      lowerNamaCerita.includes(w) ||
      lowerSinopsis.includes(w) ||
      lowerJudulBab.includes(w)
  );
}
