'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Coffee,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
} from 'lucide-react';
import { formatWaktuRelatif } from '../lib/date';
import { isBookmarked, toggleBookmark } from '../lib/bookmark';

export interface SiblingChapter {
  id: number;
  judul: string;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  created_at?: string | Date;
  sinopsis?: string | null;
  gambar_url?: string | null;
  link_trakteer?: string | null;
  genre?: string | null;
  status_cerita?: string | null;
}

interface NovelShowcaseCardProps {
  currentKaryaId: number;
  judul: string;
  penulis: string;
  userId?: string | null;
  namaCerita?: string | null;
  nomorBab?: number | null;
  judulBab?: string | null;
  gambarUrl?: string | null;
  sinopsis?: string | null;
  genre?: string | null;
  statusCerita?: string | null;
  linkTrakteer?: string | null;
  createdAt?: string | Date;
  siblingChapters: SiblingChapter[];
  totalLikes?: number;
}

export default function NovelShowcaseCard({
  currentKaryaId,
  judul,
  penulis,
  userId,
  namaCerita,
  nomorBab = 1,
  judulBab,
  gambarUrl,
  sinopsis,
  genre = 'Romansa',
  statusCerita = 'Ongoing',
  linkTrakteer,
  createdAt,
  siblingChapters = [],
  totalLikes = 0,
}: NovelShowcaseCardProps) {
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isBookmarked(currentKaryaId);
  });
  const [showCoverModal, setShowCoverModal] = useState(false);

  const displayTitle = namaCerita || judul.replace(/— Bab.*$/, '').trim() || judul;
  const currentChapterNumber = nomorBab || 1;
  const currentChapterTitle =
    judulBab ||
    (judul.includes('— Bab') ? judul.split('— Bab')[1]?.replace(/^[\d\s:]+/, '').trim() : '') ||
    `Bab ${currentChapterNumber}`;

  const cleanSinopsis =
    sinopsis?.trim() ||
    'Belum ada premis atau sinopsis cerita yang dicantumkan oleh penulis. Mulai membaca bab untuk menyelami alur cerita.';

  const isCompleted = (statusCerita || '').toLowerCase() === 'tamat';

  const handleToggleBookmark = () => {
    const nextState = toggleBookmark({
      id: currentKaryaId,
      judul,
      penulis,
      kategori: 'Novel & Cerbung',
      nomor_bab: nomorBab,
      judul_bab: judulBab,
      nama_cerita: namaCerita,
      progressPercent: 0,
      url: `/karya/${currentKaryaId}`,
    });
    setBookmarked(nextState);
  };

  const handleCopyShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {}
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-6">
      {/* KARTU UTAMA NOVEL & CERITA BERSAMBUNG */}
      <div className="relative rounded-3xl bg-linear-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE1] border-2 border-[#E6D7C3] p-5 sm:p-8 shadow-xl shadow-amber-950/5 overflow-hidden">
        {/* Ornamen latar sastra */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#C45A2C]/10 via-[#F3E5D8]/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-[#3D634C]/5 via-transparent to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        {/* 1. BAGIAN PALING ATAS: JUDUL, GAMBAR, DUKUNG KAMI, PREMIS CERITA, GENRE */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* A. GAMBAR SAMPUL NOVEL (COVER BUKU 2:3 MEWAH) */}
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center mx-auto md:mx-0">
            <div
              onClick={() => gambarUrl && setShowCoverModal(true)}
              className={`relative group w-44 sm:w-52 aspect-2/3 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] border-2 border-[#E0D0BE] ${
                gambarUrl ? 'cursor-pointer' : ''
              }`}
              style={{
                boxShadow:
                  '0 20px 30px -10px rgba(78, 52, 36, 0.25), 0 0 0 1px rgba(196, 90, 44, 0.1)',
              }}
            >
              {/* Efek Punggung Buku (Spine 3D Effect) */}
              <div className="absolute inset-y-0 left-0 w-3 bg-linear-to-r from-black/30 via-white/10 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10 z-10 pointer-events-none" />

              {gambarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gambarUrl}
                  alt={`Sampul Novel ${displayTitle}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                /* Fallback Cover Sampul Artistik jika belum ada gambar */
                <div className="w-full h-full bg-linear-to-br from-[#8C3A1E] via-[#5C2310] to-[#2B1006] p-4 flex flex-col justify-between text-white text-center font-serif select-none">
                  <div className="pt-2">
                    <span className="text-[10px] tracking-widest uppercase text-amber-200/80 block font-sans">
                      Fadrodzak Novel
                    </span>
                    <span className="text-[11px] font-bold text-amber-300/90 mt-1 block">
                      {genre}
                    </span>
                  </div>

                  <div className="my-auto px-1 py-3 border-y border-amber-300/30">
                    <h3 className="font-bold text-base sm:text-lg leading-snug tracking-wide line-clamp-3 text-amber-50">
                      {displayTitle}
                    </h3>
                  </div>

                  <div className="pb-1">
                    <p className="text-[11px] italic text-amber-200/90">Karya: {penulis}</p>
                    <p className="text-[9px] text-amber-300/60 mt-0.5">Edisi Aksara Digital</p>
                  </div>
                </div>
              )}

              {/* Badge Status di Pojok Sampul */}
              <div className="absolute top-2.5 right-2.5 z-20">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-900/85 text-emerald-200 border border-emerald-500/40'
                      : 'bg-amber-950/85 text-amber-200 border border-amber-500/40'
                  }`}
                >
                  {isCompleted ? '🏁 Tamat' : '🟢 Ongoing'}
                </span>
              </div>
            </div>

            {/* Aksi Cepat Bawah Sampul: Simpan ke Rak & Bagikan */}
            <div className="flex items-center gap-2 mt-3.5 w-full justify-center">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-serif font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                  bookmarked
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-[#DECBC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:border-[#C45A2C]'
                }`}
                title="Tandai dan simpan ke Rak Bacaan Pribadi"
              >
                {bookmarked ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Tersimpan
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Simpan Novel
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyShare}
                className="py-1.5 px-3 rounded-xl border border-[#DECBC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:border-[#C45A2C] text-xs font-serif font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                title="Bagikan tautan novel ini"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Bagikan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* B. KONTEN TEKS: JUDUL, GENRE, DUKUNG KAMI, & PREMIS CERITA */}
          <div className="flex-1 w-full space-y-4">
            {/* Meta Tags: Genre, Kategori, Bab Aktif */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#C45A2C]/15 text-[#C45A2C] text-xs font-bold font-sans tracking-wide flex items-center gap-1 border border-[#C45A2C]/25">
                <span>🏷️</span> Genre: {genre}
              </span>

              <span className="px-3 py-1 rounded-full bg-stone-200/80 text-stone-700 text-xs font-semibold font-serif flex items-center gap-1">
                <span>📚</span> {siblingChapters.length || 1} Bab Diterbitkan
              </span>

              {statusCerita && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {isCompleted ? '🏁 Selesai / Tamat' : '🟢 Masih Bersambung'}
                </span>
              )}
            </div>

            {/* Judul Utama Novel & Bab Saat Ini */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2C241E] leading-tight">
                {displayTitle}
              </h1>

              {/* Subtitle Bab Aktif */}
              <div className="mt-1.5 flex items-center gap-2 text-sm sm:text-base font-serif text-[#8C4A28] font-bold">
                <span>📖 Sedang Membaca:</span>
                <span className="underline decoration-dotted underline-offset-4">
                  Bab {currentChapterNumber}: {currentChapterTitle}
                </span>
              </div>

              {/* Penulis & Info Publikasi */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#736458] font-serif">
                <span>
                  Ditulis oleh:{' '}
                  {userId ? (
                    <Link
                      href={`/profil/${userId}`}
                      className="font-bold text-[#C45A2C] hover:underline"
                    >
                      {penulis}
                    </Link>
                  ) : (
                    <strong className="font-bold text-[#C45A2C]">{penulis}</strong>
                  )}
                </span>
                {createdAt && (
                  <>
                    <span>•</span>
                    <span>Rilis {formatWaktuRelatif(createdAt)}</span>
                  </>
                )}
                {totalLikes > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      ❤️ {totalLikes} Suka
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* C. TOMBOL DUKUNG KAMI (DONASI PENULIS / TRAKTEER / SAWERIA) */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-[#FAF0E6] via-[#FFF5EC] to-[#F5ECE1] border-2 border-[#E5CDBB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3.5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-11 h-11 rounded-2xl bg-[#C45A2C] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Coffee className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C241E] flex items-center gap-1.5">
                    Dukung Penulis Cerita Ini
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </h4>
                  <p className="text-[11px] text-[#736458] font-serif leading-tight">
                    Suka dengan bab ini? Traktir secangkir kopi untuk menyemangati penulis menulis bab
                    berikutnya!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {linkTrakteer ? (
                  <a
                    href={linkTrakteer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#C45A2C] to-[#DF6E3E] text-white font-serif font-bold text-xs sm:text-sm hover:from-[#A8451D] hover:to-[#C45A2C] transition-all shadow-md hover:shadow-lg hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto"
                  >
                    <Coffee className="w-4 h-4" />
                    ☕ Dukung Kami
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDonateModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#C45A2C] to-[#DF6E3E] text-white font-serif font-bold text-xs sm:text-sm hover:from-[#A8451D] hover:to-[#C45A2C] transition-all shadow-md hover:shadow-lg hover:scale-102 active:scale-98 cursor-pointer w-full sm:w-auto"
                  >
                    <Coffee className="w-4 h-4" />
                    ☕ Dukung Kami
                  </button>
                )}
              </div>
            </div>

            {/* D. PREMIS CERITA / SINOPSIS (KOTAK SINOPSIS MEMIKAT) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#E0D0BD] shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8C4A28] uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Premis Cerita &amp; Sinopsis Novel</span>
              </div>
              <p className="text-xs sm:text-sm font-serif text-[#4A3E36] leading-relaxed italic select-text whitespace-pre-wrap">
                &ldquo;{cleanSinopsis}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 2. BAGIAN BAWAH: BAB-BAB YANG BISA DI-KLIK! (INTERACTIVE CHAPTER LIST) */}
        <div className="mt-8 pt-6 border-t-2 border-[#E6D7C3]/90">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#2C241E] flex items-center gap-2">
                <span>📑</span> Daftar Bab {displayTitle} ({siblingChapters.length || 1} Bab)
              </h3>
              <p className="text-xs text-[#7A6B63] font-serif">
                Pilih dan klik nomor bab mana saja di bawah ini untuk langsung membaca:
              </p>
            </div>

            <a
              href="#naskah-bacaan"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C45A2C] text-white text-xs font-serif font-bold hover:bg-[#A8451D] transition shadow-xs"
            >
              Lanjut Baca Bab {currentChapterNumber}
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Grid Bab-Bab Yang Bisa Diklik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {siblingChapters && siblingChapters.length > 0 ? (
              siblingChapters.map((ch, idx) => {
                const isCurrent = ch.id === currentKaryaId;
                const babNum = ch.nomor_bab || idx + 1;
                const chapterTitle = ch.judul_bab || ch.judul || `Bab ${babNum}`;

                return (
                  <Link
                    key={ch.id}
                    href={`/karya/${ch.id}#naskah-bacaan`}
                    className={`group relative p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left ${
                      isCurrent
                        ? 'border-2 border-[#C45A2C] bg-[#FAF0E6] shadow-sm ring-2 ring-[#C45A2C]/20'
                        : 'border-[#E0D0BD] bg-white/90 hover:bg-[#FAF6F0] hover:border-[#C45A2C]/50 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs font-bold font-serif flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-[#C45A2C] text-white shadow-2xs'
                              : 'bg-stone-100 text-stone-700 group-hover:bg-[#FAF0E6] group-hover:text-[#C45A2C]'
                          }`}
                        >
                          {babNum}
                        </span>
                        <div className="min-w-0">
                          <span
                            className={`font-serif text-xs font-bold block truncate ${
                              isCurrent ? 'text-[#C45A2C]' : 'text-[#2C241E] group-hover:text-[#C45A2C]'
                            }`}
                          >
                            Bab {babNum}
                          </span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-full bg-[#C45A2C] text-white shrink-0">
                          Aktif Dibaca
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C45A2C] transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>

                    <p
                      className={`text-[11px] font-serif mt-2 line-clamp-1 ${
                        isCurrent ? 'text-[#8C4A28] font-medium' : 'text-[#736458]'
                      }`}
                    >
                      {chapterTitle}
                    </p>

                    {ch.created_at && (
                      <span className="text-[10px] text-[#A6978A] font-serif mt-1 block">
                        {formatWaktuRelatif(ch.created_at)}
                      </span>
                    )}
                  </Link>
                );
              })
            ) : (
              /* Jika hanya ada bab pertama */
              <div className="col-span-full p-4 rounded-2xl bg-white border border-[#E0D0BD] text-center">
                <p className="text-xs font-serif text-[#7A6B63]">
                  Ini adalah Bab 1 (Bab Perdana). Bab-bab berikutnya akan otomatis muncul di sini saat
                  penulis menerbitkannya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DUKUNG PENULIS JIKA BELUM ADA LINK LANGSUNG ATAU INGIN BERBAGI */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[#DECBC0] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF0E6] text-[#C45A2C] flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2C2C]">
                    Dukung Penulis: {penulis}
                  </h3>
                  <p className="text-[11px] text-[#7A6B63] font-serif">Karya: {displayTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-serif text-[#555] leading-relaxed">
              <p>
                Penulis belum menautkan link Trakteer atau Saweria secara publik di karya ini.
                Namun Anda bisa memberikan dukungan terbaik dengan cara:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#333]">
                <li>Memberikan suka (Love) dan reaksi sastra di bawah naskah.</li>
                <li>Menuliskan apresiasi dan ulasan hangat di kolom komentar.</li>
                <li>Membagikan karya ini kepada rekan-rekan pembaca Anda.</li>
              </ul>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCopyShare}
                className="flex-1 py-2.5 rounded-xl border border-[#DECBC0] text-xs font-serif font-bold text-[#C45A2C] hover:bg-[#FAF0E6] transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedLink ? 'Tautan Tersalin!' : 'Salin Tautan Cerita'}
              </button>
              <button
                type="button"
                onClick={() => setShowDonateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#C45A2C] text-white text-xs font-serif font-bold hover:bg-[#A8451D] transition"
              >
                Kembali Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM COVER SAMPUL NOVEL */}
      {showCoverModal && gambarUrl && (
        <div
          onClick={() => setShowCoverModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-md w-full relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambarUrl}
              alt={`Sampul Lengkap ${displayTitle}`}
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20 mx-auto"
            />
            <p className="text-center text-xs font-serif text-white/80 mt-3">
              Klik di mana saja untuk menutup pratinjau sampul
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
