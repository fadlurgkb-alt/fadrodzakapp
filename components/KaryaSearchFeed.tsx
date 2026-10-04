'use client';

import React, { useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from './SearchContext';
import {
  HighlightText,
  extractMatchingSnippet,
  isKaryaMatching,
} from '../lib/search-utils';
import KaryaSnippetPreview from './KaryaSnippetPreview';
import { formatWaktuRelatif, formatWaktuLengkap } from '../lib/date';
import {
  Search,
  X,
  PenTool,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export interface KaryaRow {
  id: number;
  judul: string;
  kategori: string;
  isi_tulisan: string;
  nama_pengguna: string;
  status_penulis: string;
  link_trakteer: string | null;
  gambar_url: string | null;
  audio_url?: string | null;
  user_id?: string;
  total_likes: number;
  total_komentar: number;
  created_at: string | Date;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  nama_cerita?: string | null;
  sinopsis?: string | null;
  status_cerita?: string | null;
}

interface Props {
  initialKaryas: KaryaRow[];
  kategoriAktif: string;
  onLikeAction: (formData: FormData) => Promise<void>;
}

const ITEMS_PER_PAGE = 6;

export default function KaryaSearchFeed({
  initialKaryas,
  kategoriAktif,
  onLikeAction,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, clearSearch, isSearching } = useSearch();

  const feedTopRef = useRef<HTMLDivElement>(null);

  // Ambil nomor halaman langsung dari URL query (?page=...)
  const pageParam = parseInt(searchParams?.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Filter karya berdasarkan kategori dan query pencarian
  const filteredKaryas = useMemo(() => {
    let result = initialKaryas;

    // Filter kategori jika bukan 'Semua'
    if (kategoriAktif && kategoriAktif !== 'Semua') {
      const target = kategoriAktif.toLowerCase();
      if (target.includes('novel') || target.includes('cerbung')) {
        result = result.filter((k) => {
          const kLower = k.kategori.toLowerCase();
          return (
            kLower.includes('novel') ||
            kLower.includes('cerbung') ||
            kLower.includes('cerita bersambung')
          );
        });
      } else {
        result = result.filter(
          (k) => k.kategori.toLowerCase() === target
        );
      }
    }

    // Filter teks (judul, nama penulis, cuplikan bait/isi)
    if (searchQuery.trim()) {
      result = result.filter((k) => isKaryaMatching(k, searchQuery));
    }

    return result;
  }, [initialKaryas, kategoriAktif, searchQuery]);

  const totalItems = filteredKaryas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Potong karya untuk halaman yang sedang aktif
  const paginatedKaryas = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredKaryas.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredKaryas, safeCurrentPage]);

  // Fungsi helper membuat URL dengan query params yang terjaga
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (kategoriAktif && kategoriAktif !== 'Semua') {
      params.set('kategori', kategoriAktif);
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (pageNumber > 1) {
      params.set('page', String(pageNumber));
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  };

  // Navigasi ke halaman tertentu dengan smooth scroll ke atas daftar
  const goToPage = (pageNumber: number) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    router.push(createPageUrl(target), { scroll: false });
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handler lompat ke nomor halaman via form input
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      goToPage(target);
      setJumpPageInput('');
    }
  };

  // Buat deretan angka halaman yang cerdas (misal: 1, 2, 3, 4, 5, ..., 12)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [totalPages, safeCurrentPage]);

  const categories = ['Semua', 'Puisi', 'Cerpen', 'Pantun', 'Novel & Cerbung'];

  return (
    <div>
      {/* Titik jangkar scroll saat berganti halaman */}
      <div ref={feedTopRef} id="ruang-baca-feed" className="-mt-4 pt-4" />

      {/* 1. Filter Kategori Tab */}
      <div className="flex gap-2.5 mb-6 text-xs sm:text-sm border-b border-[#E8DEC0]/60 pb-3 overflow-x-auto no-scrollbar">
        {categories.map((kat) => {
          const isActive = kategoriAktif === kat;
          const href =
            kat === 'Semua'
              ? searchQuery
                ? `/?q=${encodeURIComponent(searchQuery)}`
                : '/'
              : searchQuery
              ? `/?kategori=${encodeURIComponent(kat)}&q=${encodeURIComponent(searchQuery)}`
              : `/?kategori=${encodeURIComponent(kat)}`;

          return (
            <Link
              key={kat}
              href={href}
              className={
                isActive
                  ? 'bg-[#C45A2C] text-white px-4 py-1.5 rounded-full font-serif font-bold shadow-xs whitespace-nowrap'
                  : 'text-[#7A6B63] hover:text-[#2C2C2C] hover:bg-[#FAF0E6] px-3.5 py-1.5 rounded-full transition font-serif whitespace-nowrap'
              }
            >
              {kat}
            </Link>
          );
        })}
      </div>

      {/* 2. Banner Status Hasil Pencarian Aktif */}
      {isSearching && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC0] flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-serif text-[#2C2C2C]">
            <span className="p-1.5 rounded-lg bg-[#C45A2C]/10 text-[#C45A2C]">
              <Search className="w-4 h-4" />
            </span>
            <span>
              Menemukan <strong>{totalItems}</strong> karya untuk kata
              kunci &ldquo;<span className="text-[#C45A2C] font-bold">{searchQuery}</span>&rdquo;
              {kategoriAktif !== 'Semua' && (
                <span>
                  {' '}
                  pada kategori <em>{kategoriAktif}</em>
                </span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={clearSearch}
            className="inline-flex items-center gap-1.5 text-xs font-serif text-[#C45A2C] hover:text-[#9F3714] font-bold hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset Pencarian
          </button>
        </div>
      )}

      {/* 3. Daftar Kartu Karya yang Cocok */}
      <div className="space-y-6">
        {totalItems === 0 ? (
          // Keadaan Kosong (Empty State) Sastra Ramah
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#E8DEC0] shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C45A2C]">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2C2C2C] mb-2">
              Aksara Tidak Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6B63] font-serif max-w-md mx-auto leading-relaxed mb-6">
              {isSearching ? (
                <>
                  Tidak ada karya yang cocok dengan kata kunci &ldquo;
                  <span className="font-bold text-[#C45A2C]">{searchQuery}</span>
                  &rdquo; pada judul, nama penulis, maupun isi bait.
                </>
              ) : (
                'Belum ada karya yang diunggah untuk kategori ini...'
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 rounded-xl border border-[#C45A2C] text-[#C45A2C] hover:bg-[#FAF0E6] text-xs font-serif font-bold transition cursor-pointer"
                >
                  Tampilkan Semua Karya
                </button>
              )}
              <Link
                href={
                  isSearching
                    ? `/tulis?tema=${encodeURIComponent(searchQuery)}`
                    : '/tulis'
                }
                className="inline-flex items-center gap-2 bg-[#C45A2C] hover:bg-[#A8451D] text-white px-5 py-2 rounded-xl text-xs font-serif font-bold shadow-xs transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                {isSearching ? 'Tulis Karya dengan Kata Kunci Ini' : 'Tulis Karya Sekarang'}
              </Link>
            </div>
          </div>
        ) : (
          paginatedKaryas.map((karya) => {
            // Cek pencocokan cuplikan dalam bait
            const { snippet, isMatchedInContent } = extractMatchingSnippet(
              karya.isi_tulisan,
              searchQuery
            );

            return (
              <article
                key={karya.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-ink-muted/20 hover:border-[#C45A2C]/30 transition"
              >
                {/* Header Penulis & Info Waktu */}
                <div className="flex items-center gap-3 mb-5">
                  <Link
                    href={
                      karya.user_id
                        ? `/profil/${encodeURIComponent(karya.user_id)}`
                        : '#'
                    }
                    className="w-10 h-10 bg-sage-light rounded-full flex items-center justify-center text-sage font-bold font-serif text-lg hover:opacity-90 transition shrink-0"
                  >
                    {karya.nama_pengguna.charAt(0).toUpperCase()}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-ink-charcoal text-sm truncate">
                        <Link
                          href={
                            karya.user_id
                              ? `/profil/${encodeURIComponent(karya.user_id)}`
                              : '#'
                          }
                          className="hover:underline hover:text-terracotta transition"
                        >
                          <HighlightText
                            text={karya.nama_pengguna}
                            query={searchQuery}
                          />
                        </Link>
                        <span className="bg-ink-muted/10 text-ink-secondary rounded px-2 py-0.5 font-normal text-xs ml-2 inline-block">
                          {karya.status_penulis}
                        </span>
                      </p>

                      <time
                        dateTime={
                          karya.created_at
                            ? new Date(karya.created_at).toISOString()
                            : undefined
                        }
                        className="text-[11px] text-[#8C7E74] font-serif whitespace-nowrap shrink-0"
                        title={formatWaktuLengkap(karya.created_at)}
                      >
                        {formatWaktuRelatif(karya.created_at)}
                      </time>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5 flex-wrap">
                      <span className="text-terracotta font-medium">
                        {karya.kategori}
                      </span>
                      {karya.nomor_bab && (
                        <span className="bg-[#FAF0E6] text-[#C45A2C] px-2 py-0.5 rounded-md font-bold text-[11px]">
                          Bab {karya.nomor_bab}
                        </span>
                      )}
                      {karya.status_cerita && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            karya.status_cerita.toLowerCase() === 'tamat'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {karya.status_cerita.toLowerCase() === 'tamat' ? '🏁 Tamat' : '🟢 Ongoing'}
                        </span>
                      )}
                      <span className="text-[#D3C7BC]">•</span>
                      <span className="text-[11px] text-[#8C7E74]">
                        {formatWaktuRelatif(karya.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Judul Karya & Info Bab Novel/Cerbung */}
                <div className="flex gap-4 items-start mb-3">
                  {karya.gambar_url && (
                    <Link
                      href={`/karya/${karya.id}`}
                      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#DECBC0] shadow-sm hover:scale-102 transition-transform"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={karya.gambar_url}
                        alt={`Sampul ${karya.judul}`}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    {karya.nama_cerita && karya.nama_cerita !== karya.judul && (
                      <p className="text-xs font-serif font-bold text-[#C45A2C] uppercase tracking-wider mb-1">
                        📖 Seri: {karya.nama_cerita}
                      </p>
                    )}
                    <h3 className="font-serif text-2xl font-bold text-ink-charcoal">
                      <Link
                        href={`/karya/${karya.id}`}
                        className="hover:text-terracotta transition"
                      >
                        <HighlightText text={karya.judul} query={searchQuery} />
                      </Link>
                    </h3>
                    {karya.judul_bab && (
                      <p className="text-sm font-serif italic text-[#7A6B63] mt-0.5">
                        {karya.judul_bab}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sinopsis Singkat untuk Novel / Cerita Bersambung */}
                {karya.sinopsis && (
                  <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DEC0]/70 text-xs font-serif text-[#66584F] leading-relaxed italic">
                    <span className="font-bold not-italic text-[#C45A2C] mr-1.5 font-sans uppercase text-[10px] tracking-wider">
                      Sinopsis:
                    </span>
                    &ldquo;{karya.sinopsis}&rdquo;
                  </div>
                )}

                {/* Cuplikan Karya dengan Pemformatan Khusus Sastra (Bait Puisi vs Prosa Cerpen) */}
                <KaryaSnippetPreview
                  isiTulisan={karya.isi_tulisan}
                  kategori={karya.kategori}
                  searchQuery={searchQuery}
                  isMatchedInContent={isMatchedInContent}
                  snippet={snippet}
                />

                <Link
                  href={`/karya/${karya.id}`}
                  className="text-terracotta text-sm font-bold hover:underline mb-6 inline-block"
                >
                  Baca Selengkapnya &rarr;
                </Link>

                {/* Footer Interaksi: Suka & Komentar */}
                <div className="flex items-center gap-6 pt-4 border-t border-ink-muted/10">
                  <form action={onLikeAction}>
                    <input type="hidden" name="karyaId" value={karya.id} />
                    <button
                      type="submit"
                      className="text-ink-muted text-sm hover:text-red-500 flex items-center gap-2 transition group cursor-pointer"
                    >
                      <span className="group-hover:scale-110 transition-transform">
                        ❤️
                      </span>
                      {karya.total_likes || 0} Suka
                    </button>
                  </form>

                  <Link
                    href={`/karya/${karya.id}#komentar`}
                    className="text-ink-muted text-sm hover:text-terracotta flex items-center gap-2 transition"
                  >
                    <span>💬</span>
                    {karya.total_komentar || 0} Komentar
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 4. Navigasi Nomor Halaman (Pagination 1, 2, 3...) */}
      {totalPages > 1 && (
        <nav
          aria-label="Navigasi Halaman Karya"
          className="pt-8 mt-8 border-t border-[#E8DEC0]/80 flex flex-col gap-4 text-xs font-serif"
        >
          {/* Baris Status & Ringkasan Halaman */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[#7A6B63]">
            <p>
              Menampilkan karya{' '}
              <strong className="text-[#2C2C2C]">
                {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-[#2C2C2C]">
                {Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems)}
              </strong>{' '}
              dari <strong className="text-[#2C2C2C]">{totalItems}</strong> total karya
            </p>
            <p className="bg-[#FAF0E6] text-[#C45A2C] px-3 py-1 rounded-full font-bold">
              Halaman {safeCurrentPage} dari {totalPages}
            </p>
          </div>

          {/* Deretan Tombol Angka Halaman & Input Lompat Cepat */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* Tombol Pertama (<<) */}
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={safeCurrentPage === 1}
                title="Ke Halaman Pertama (1)"
                className="p-2 rounded-xl border border-[#E8DEC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:bg-[#FAF0E6] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#7A6B63] transition cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Tombol Sebelumnya (<) */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                title="Halaman Sebelumnya"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E8DEC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:bg-[#FAF0E6] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#7A6B63] transition font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Deretan Angka Nomor Halaman (1, 2, 3, 4, 5...) */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-9 flex items-center justify-center text-[#9E8E84] font-serif"
                      >
                        &hellip;
                      </span>
                    );
                  }

                  const pageNum = item as number;
                  const isCurrent = pageNum === safeCurrentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={
                        isCurrent
                          ? 'w-9 h-9 rounded-xl bg-[#C45A2C] text-white font-bold font-serif shadow-xs flex items-center justify-center cursor-default'
                          : 'w-9 h-9 rounded-xl bg-white border border-[#E8DEC0] text-[#7A6B63] hover:text-[#C45A2C] hover:bg-[#FAF0E6] font-serif transition flex items-center justify-center cursor-pointer'
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Selanjutnya (>) */}
              <button
                type="button"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                title="Halaman Selanjutnya"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E8DEC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:bg-[#FAF0E6] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#7A6B63] transition font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Tombol Terakhir (>>) */}
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                title={`Ke Halaman Terakhir (${totalPages})`}
                className="p-2 rounded-xl border border-[#E8DEC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:bg-[#FAF0E6] disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#7A6B63] transition cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Input Lompat Cepat ke Halaman (misal langsung lompat ke halaman 4 atau 5) */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2 shrink-0">
              <label htmlFor="jump-page-input" className="text-[#7A6B63] whitespace-nowrap">
                Lompat ke hal:
              </label>
              <input
                id="jump-page-input"
                type="number"
                min={1}
                max={totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                placeholder={String(safeCurrentPage)}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-[#E8DEC0] bg-white text-center text-xs font-serif text-[#2C2C2C] focus:outline-none focus:border-[#C45A2C] focus:ring-1 focus:ring-[#C45A2C]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF0E6] text-[#C45A2C] hover:bg-[#C45A2C] hover:text-white border border-[#E8DEC0] font-bold font-serif transition cursor-pointer active:scale-95"
              >
                Buka
              </button>
            </form>
          </div>
        </nav>
      )}
    </div>
  );
}
