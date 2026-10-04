'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Type,
  Clock,
  Sparkles,
  Share2,
  CloudRain,
  Wind,
  Music,
  Feather,
  Sliders,
  Play,
  Pause,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { getAmbientSoundEngine, AmbientSoundType } from '../lib/ambient-sound';
import { generateQuoteCardCanvas, downloadQuoteCard, shareQuoteCard, CardTheme } from '../lib/quote-card';
import { isBookmarked, toggleBookmark, updateReadingProgress } from '../lib/bookmark';
import ApresiasiMikro, { ReaksiTipe } from './ApresiasiMikro';
import TafsirBaitSection, { TafsirItem } from './TafsirBaitSection';
import { formatWaktuRelatif, formatWaktuLengkap } from '../lib/date';

export interface ChapterItem {
  id: number;
  judul: string;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  created_at?: string | Date;
}

interface Props {
  karyaId: number;
  judul: string;
  penulis: string;
  kategori: string;
  isiTulisan: string;
  createdAt?: string | Date;
  audioUrl?: string | null;
  totalLikes: number;
  initialReaksiCounts?: Record<string, number>;
  initialTafsirs?: TafsirItem[];
  onReactAction?: (karyaId: number, tipe: ReaksiTipe) => Promise<void>;
  onKirimTafsir?: (formData: FormData) => Promise<void>;
  nomorBab?: number | null;
  judulBab?: string | null;
  namaCerita?: string | null;
  sinopsis?: string | null;
  statusCerita?: string | null;
  siblingChapters?: ChapterItem[];
  prevChapter?: ChapterItem | null;
  nextChapter?: ChapterItem | null;
}

export default function ReadingExperience({
  karyaId,
  judul,
  penulis,
  kategori,
  isiTulisan,
  createdAt,
  audioUrl,
  initialReaksiCounts = {},
  initialTafsirs = [],
  onReactAction,
  onKirimTafsir,
  nomorBab,
  judulBab,
  namaCerita,
  sinopsis,
  statusCerita,
  siblingChapters = [],
  prevChapter = null,
  nextChapter = null,
}: Props) {
  const [showChapterList, setShowChapterList] = useState(false);
  // 1. Pengaturan Mode Baca (Zen Mode & OLED Pure Black)
  const [themeMode, setThemeMode] = useState<'sepia' | 'dark' | 'oled' | 'light'>('sepia');
  const [fontSize, setFontSize] = useState<number>(19); // 16, 19, 22, 25
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isZenMode, setIsZenMode] = useState(false);

  // Penanda Buku (Bookmark) & Progress Baca
  const [bookmarked, setBookmarked] = useState<boolean>(() => isBookmarked(karyaId));
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleBookmarkChange = () => {
      setBookmarked(isBookmarked(karyaId));
    };
    window.addEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
    return () => window.removeEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
  }, [karyaId]);

  // Pantau posisi scroll untuk membaca progress & simpan otomatis
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setReadingProgress(100);
        return;
      }
      const currentScroll = window.scrollY;
      const percent = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setReadingProgress(percent);
      updateReadingProgress(karyaId, percent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [karyaId]);

  const handleToggleBookmark = () => {
    const res = toggleBookmark({
      id: karyaId,
      judul,
      penulis,
      kategori,
      nomor_bab: nomorBab,
      judul_bab: judulBab,
      nama_cerita: namaCerita,
      progressPercent: readingProgress,
      url: `/karya/${karyaId}`,
    });
    setBookmarked(res);
  };

  // 2. Ambient Sound State
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('rain');
  const [volume, setVolume] = useState<number>(0.4);
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  // 3. Audio Voice Note (Pembacaan Puisi oleh Penulis)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // 4. Highlight & Quote Selection
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [cardTheme, setCardTheme] = useState<CardTheme>('terracotta');
  const [quotePreviewUrl, setQuotePreviewUrl] = useState<string | null>(null);

  // Estimasi Waktu Baca (180 kata per menit)
  const trimmed = isiTulisan?.trim() || '';
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 180));

  // Parsing Bait / Paragraf untuk fitur Tafsir Bait
  const baitArray = isiTulisan
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  // Efek ambient sound
  useEffect(() => {
    const engine = getAmbientSoundEngine();
    if (isAmbientPlaying) {
      engine.play(ambientType);
      engine.setVolume(volume);
    } else {
      engine.stop();
    }

    return () => {
      engine.stop();
    };
  }, [isAmbientPlaying, ambientType, volume]);

  // Listener Seleksi Kalimat Favorit (Highlight)
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltipPos(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length >= 6) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 12 + window.scrollY,
        });
      } else {
        setTooltipPos(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Update Preview Kartu Kutipan saat modal terbuka
  useEffect(() => {
    if (!showQuoteModal) return;
    let cancelled = false;

    generateQuoteCardCanvas({
      judul,
      kutipan: selectedText || isiTulisan.slice(0, 200),
      penulis,
      kategori,
      theme: cardTheme,
    }).then((canvas) => {
      if (!cancelled) {
        setQuotePreviewUrl(canvas.toDataURL('image/png'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showQuoteModal, cardTheme, selectedText, isiTulisan, judul, penulis, kategori]);

  // Voice Note toggle
  const toggleVoiceNote = () => {
    if (!voiceAudioRef.current) return;
    if (isVoicePlaying) {
      voiceAudioRef.current.pause();
      setIsVoicePlaying(false);
    } else {
      voiceAudioRef.current.play();
      setIsVoicePlaying(true);
    }
  };

  // Tema gaya visual (termasuk OLED Pure Black hemat baterai & nyaman di mata)
  const themeClasses = {
    sepia: 'bg-[#FAF6EE] text-[#2C241E] border-[#E8DEC0]',
    dark: 'bg-[#121212] text-[#E0E0E0] border-[#2A2A2A]',
    oled: 'bg-[#000000] text-[#E5E5E5] border-[#1C1C1C]',
    light: 'bg-[#FFFFFF] text-[#212121] border-[#EAEAEA]',
  };

  const articleThemeClasses = {
    sepia: 'bg-[#FFFDF9] border-[#EFE5D4]',
    dark: 'bg-[#18181A] border-[#2A2A2E] text-[#D8D8DC]',
    oled: 'bg-[#050505] border-[#1A1A1A] text-[#EDEDED] shadow-[0_0_20px_rgba(0,0,0,0.8)]',
    light: 'bg-[#FFFFFF] border-[#EAEAEA]',
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isZenMode
          ? `fixed inset-0 z-50 overflow-y-auto p-4 sm:p-10 ${themeClasses[themeMode]}`
          : themeClasses[themeMode]
      }`}
    >
      {/* Tooltip Mengambang: "Kutip Kalimat Ini" saat user menyeleksi teks */}
      {tooltipPos && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => {
              setShowQuoteModal(true);
              setTooltipPos(null);
            }}
            className="flex items-center gap-1.5 bg-[#C45A2C] text-white px-3.5 py-1.5 rounded-full text-xs font-serif font-bold shadow-lg hover:bg-[#A8451D] transition active:scale-95 animate-in fade-in zoom-in duration-150"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Jadikan Kartu Kutipan
          </button>
        </div>
      )}

      {/* Bar Indikator Kemajuan Membaca (Reading Progress Bar) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50 pointer-events-none">
        <div
          className="h-full bg-[#C45A2C] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Toolbar Pengalaman Membaca Imersif */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md border-b py-2 px-4 mb-6 shadow-xs transition-colors ${
          themeMode === 'oled'
            ? 'bg-black/90 border-[#1F1F1F] text-stone-300'
            : themeMode === 'dark'
            ? 'bg-[#18181A]/90 border-[#2A2A2E] text-stone-300'
            : 'bg-white/80 border-[#E8DEC0]/80 text-[#7A6B63]'
        }`}
      >
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
          {/* Info Waktu Baca & Persentase Selesai */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C45A2C]" />
            <span>
              Waktu baca: <strong>~{estimatedReadingTime} menit</strong> ({wordCount} kata)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#C45A2C]/10 text-[#C45A2C] font-bold">
              {readingProgress}%
            </span>
          </div>

          {/* Opsi Kontrol Zen: Tema, Ukuran Font, Ambient Suasana, Rak Buku */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tombol Simpan ke Rak Buku (Bookmark) */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-serif transition cursor-pointer ${
                bookmarked
                  ? 'border-[#C45A2C] bg-[#FAF0E6] text-[#C45A2C] font-bold shadow-xs'
                  : 'border-[#DECBC0] bg-white text-[#5A4A42] hover:bg-[#F8F2EA]'
              }`}
              title={bookmarked ? 'Karya tersimpan di Rak Bacaan' : 'Simpan ke Rak Bacaan Pribadi'}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-[#C45A2C]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{bookmarked ? 'Di Rak' : 'Simpan'}</span>
            </button>

            {/* Pilihan Suasana Audio Latar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAmbientMenu(!showAmbientMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                  isAmbientPlaying
                    ? 'border-[#C45A2C] bg-[#C45A2C]/10 text-[#C45A2C] font-bold'
                    : 'border-[#DECBC0] bg-white text-[#5A4A42] hover:bg-[#F8F2EA]'
                }`}
                title="Atur musikalisasi / suara suasana latar"
              >
                {isAmbientPlaying ? (
                  <Volume2 className="w-3.5 h-3.5 text-[#C45A2C] animate-pulse" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span>Suasana</span>
              </button>

              {showAmbientMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E5DACD] p-3 shadow-xl z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D8] mb-2 font-bold text-[#2C2C2C]">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-[#C45A2C]" />
                      Suara Latar Imersif
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAmbientPlaying(!isAmbientPlaying)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isAmbientPlaying
                          ? 'bg-red-500 text-white'
                          : 'bg-[#C45A2C] text-white'
                      }`}
                    >
                      {isAmbientPlaying ? 'Matikan' : 'Putar'}
                    </button>
                  </div>

                  {/* Pilihan Jenis Suasana */}
                  <div className="space-y-1 mb-3">
                    {[
                      { type: 'rain', label: 'Rintik Hujan di Daun', icon: CloudRain },
                      { type: 'wind', label: 'Desau Angin Lembut', icon: Wind },
                      { type: 'quill', label: 'Goresan Pena di Kertas', icon: Feather },
                      { type: 'harp', label: 'Petikan Dawai Santai', icon: Music },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setAmbientType(item.type as AmbientSoundType);
                          setIsAmbientPlaying(true);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                          ambientType === item.type
                            ? 'bg-[#FAF0E6] text-[#C45A2C] font-bold'
                            : 'hover:bg-gray-50 text-[#555]'
                        }`}
                      >
                        <item.icon className="w-3 h-3 text-[#C45A2C]" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider */}
                  <div className="pt-2 border-t border-[#F0E6D8]">
                    <div className="flex items-center justify-between text-[10px] text-[#8E8E8E] mb-1">
                      <span>Volume</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#C45A2C] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pilihan Tema Latar (Termasuk OLED Hitam Pekat) */}
            <div className="flex items-center bg-white border border-[#DECBC0] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setThemeMode('sepia')}
                className={`px-2 py-1 rounded-lg text-xs font-serif ${
                  themeMode === 'sepia' ? 'bg-[#FAF0E6] text-[#C45A2C] font-bold' : 'text-[#777]'
                }`}
                title="Mode Kertas Kuno Sepia"
              >
                Kertas
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-2 py-1 rounded-lg text-xs font-serif ${
                  themeMode === 'dark' ? 'bg-[#2A2A2E] text-white font-bold' : 'text-[#777]'
                }`}
                title="Mode Redup Malam"
              >
                Malam
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('oled')}
                className={`px-2 py-1 rounded-lg text-xs font-serif ${
                  themeMode === 'oled' ? 'bg-black text-[#D4AF37] font-bold border border-[#333]' : 'text-[#777]'
                }`}
                title="Mode OLED Hitam Pekat (Hemat Baterai & Ramah Mata)"
              >
                OLED
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-2 py-1 rounded-lg text-xs font-serif ${
                  themeMode === 'light' ? 'bg-gray-100 text-[#2C2C2C] font-bold' : 'text-[#777]'
                }`}
                title="Mode Bersih Terang"
              >
                Terang
              </button>
            </div>

            {/* Kontrol Ukuran Font */}
            <div className="flex items-center bg-white border border-[#DECBC0] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(15, f - 2))}
                className="px-2 py-1 text-xs font-bold text-[#555] hover:text-[#C45A2C]"
                title="Kecilkan Font"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize(19)}
                className="px-1.5 py-1 text-[11px] text-[#777]"
                title="Reset Ukuran"
              >
                <Type className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(27, f + 2))}
                className="px-2 py-1 text-xs font-bold text-[#555] hover:text-[#C45A2C]"
                title="Besarkan Font"
              >
                A+
              </button>
            </div>

            {/* Ganti Serif / Sans */}
            <button
              type="button"
              onClick={() => setFontFamily((prev) => (prev === 'serif' ? 'sans' : 'serif'))}
              className="px-2.5 py-1.5 rounded-xl border border-[#DECBC0] bg-white text-[#555] hover:text-[#C45A2C]"
              title="Ganti jenis huruf sastra / modern"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-1.5 rounded-xl border border-[#DECBC0] bg-white text-[#555] hover:text-[#C45A2C]"
              title={isZenMode ? 'Keluar Mode Zen' : 'Masuk Mode Zen Imersif'}
            >
              {isZenMode ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Kontainer Utama Bacaan */}
      <div id="naskah-bacaan" className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-6">
        <article className={`p-6 sm:p-10 rounded-3xl shadow-sm border transition-all ${articleThemeClasses[themeMode]}`}>
          {/* Header Karya */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[11px] font-bold text-[#C45A2C] uppercase tracking-widest font-sans">
                {kategori === 'Novel' || kategori === 'Cerita Bersambung'
                  ? 'Novel & Cerbung'
                  : kategori}
              </span>
              {nomorBab && (
                <span className="bg-[#FAF0E6] text-[#C45A2C] text-xs font-bold px-2.5 py-0.5 rounded-full font-serif">
                  Bab {nomorBab}
                </span>
              )}
              {statusCerita && (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-sans ${
                    statusCerita.toLowerCase() === 'tamat'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {statusCerita.toLowerCase() === 'tamat' ? '🏁 Tamat' : '🟢 Ongoing'}
                </span>
              )}
            </div>

            {namaCerita && namaCerita !== judul && (
              <p className="text-xs font-serif font-bold text-[#C45A2C] uppercase tracking-wider mb-1">
                📖 Seri: {namaCerita}
              </p>
            )}

            <h1 className="text-3xl sm:text-4xl font-serif font-bold mt-1 mb-1 leading-tight">
              {judul}
            </h1>

            {judulBab && (
              <p className="text-base sm:text-lg font-serif italic text-[#7A6B63] mb-2">
                {judulBab}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#7A6B63] font-serif">
              <span>
                Oleh: <strong className="font-bold text-[#C45A2C]">{penulis}</strong>
              </span>
              {createdAt && (
                <>
                  <span className="text-[#C8BEB5]">•</span>
                  <time
                    dateTime={new Date(createdAt).toISOString()}
                    className="text-[#8C7E74]"
                    title={formatWaktuLengkap(createdAt)}
                  >
                    {formatWaktuRelatif(createdAt)}
                  </time>
                </>
              )}
            </div>

            {/* Sinopsis Cerita / Blurb (Wattpad Style) */}
            {sinopsis && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF0E6]/60 border border-[#E8DEC0] text-xs sm:text-sm font-serif italic text-[#66584F] leading-relaxed">
                <span className="font-bold not-italic text-[#C45A2C] mr-2 text-[11px] uppercase tracking-wider font-sans">
                  Sinopsis / Blurb Cerita:
                </span>
                &ldquo;{sinopsis}&rdquo;
              </div>
            )}
          </div>

          {/* Pemutar Audio Puisi oleh Penulis (Jika ada rekaman audio) */}
          {audioUrl && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FAF0E6] border border-[#E8DACB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceNote}
                  className="w-10 h-10 rounded-full bg-[#C45A2C] text-white flex items-center justify-center hover:scale-105 transition shadow-sm"
                >
                  {isVoicePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <p className="font-serif font-bold text-xs text-[#2C2C2C]">
                    Dengarkan Pembacaan Puisi
                  </p>
                  <p className="text-[11px] text-[#7A6B63] font-serif">
                    Dibacakan langsung oleh {penulis}
                  </p>
                </div>
              </div>
              <audio
                ref={voiceAudioRef}
                src={audioUrl}
                onEnded={() => setIsVoicePlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Isi Tulisan Karya dengan Tafsir Bait */}
          <div
            className={`transition-all leading-loose ${
              fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {baitArray.map((bait, idx) => {
              const baitTafsirs = initialTafsirs.filter((t) => t.bait_index === idx);
              return (
                <div key={idx} className="relative mb-6">
                  <p className="whitespace-pre-wrap leading-relaxed select-text">
                    {bait}
                  </p>

                  {/* Komponen Tafsir Bait Per Baris / Paragraf */}
                  <TafsirBaitSection
                    karyaId={karyaId}
                    baitIndex={idx}
                    potonganBait={bait}
                    initialTafsirs={baitTafsirs}
                    onKirimTafsir={onKirimTafsir}
                  />
                </div>
              );
            })}
          </div>

          {/* Apresiasi Mikro Khas Sastra (🍂 Tersentuh, 🔥 Membakar, ☕ Hangat, ✨ Memukau) */}
          <ApresiasiMikro
            karyaId={karyaId}
            initialCounts={initialReaksiCounts}
            onReactAction={onReactAction}
          />

          {/* Tombol Buat Kartu Kutipan Manual */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs font-serif">
            <span className="text-[#8E8E8E] italic">
              Sorot kalimat mana saja untuk menjadikannya kartu kutipan.
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedText(isiTulisan.slice(0, 180));
                setShowQuoteModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-[#C45A2C] hover:text-[#9E3C16] font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Bagikan Kartu Kutipan
            </button>
          </div>

          {/* Navigasi Bab Wattpad (Bab Sebelumnya & Bab Selanjutnya) */}
          {(prevChapter || nextChapter || (siblingChapters && siblingChapters.length > 1)) && (
            <div className="mt-8 pt-6 border-t border-[#E8DEC0]/80 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {prevChapter ? (
                  <Link
                    href={`/karya/${prevChapter.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DECBC0] bg-white hover:border-[#C45A2C] hover:bg-[#FAF0E6] text-xs font-serif font-bold text-[#C45A2C] transition shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Bab {prevChapter.nomor_bab || 'Sebelumnya'}
                  </Link>
                ) : (
                  <span className="text-xs text-[#9E8E84] font-serif italic">
                    Bab Pertama
                  </span>
                )}

                {siblingChapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowChapterList(!showChapterList)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DECBC0] bg-white hover:bg-[#FAF0E6] text-xs font-serif font-bold text-[#7A6B63] hover:text-[#C45A2C] transition cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                    Daftar Bab ({siblingChapters.length})
                  </button>
                )}

                {nextChapter ? (
                  <Link
                    href={`/karya/${nextChapter.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C45A2C] text-white hover:bg-[#A8451D] text-xs font-serif font-bold transition shadow-xs"
                  >
                    Bab {nextChapter.nomor_bab || 'Selanjutnya'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-xs text-[#9E8E84] font-serif italic">
                    {statusCerita === 'Tamat' ? '🏁 Cerita Tamat' : 'Menunggu bab berikutnya...'}
                  </span>
                )}
              </div>

              {/* Accordion Daftar Isi Seluruh Bab */}
              {showChapterList && siblingChapters.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC0] animate-in fade-in duration-200">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#C45A2C] mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Daftar Isi Bab ({namaCerita || judul})
                  </h4>
                  <div className="divide-y divide-[#E8DEC0]/60 max-h-60 overflow-y-auto">
                    {siblingChapters.map((ch) => {
                      const isCurrent = ch.id === karyaId;
                      return (
                        <Link
                          key={ch.id}
                          href={`/karya/${ch.id}`}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-serif transition ${
                            isCurrent
                              ? 'bg-[#FAF0E6] font-bold text-[#C45A2C]'
                              : 'hover:bg-white text-[#4A423D] hover:text-[#C45A2C]'
                          }`}
                        >
                          <span className="truncate mr-2">
                            Bab {ch.nomor_bab || '—'}: {ch.judul_bab || ch.judul}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#C45A2C] text-white px-2 py-0.5 rounded-full shrink-0">
                              Sedang Dibaca
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      </div>

      {/* Modal Generator Kartu Kutipan dari Kalimat yang Diblok */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 border border-[#E0D4C5] shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D3] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C2C2C]">
                  Kartu Kutipan Karya
                </h3>
                <p className="text-xs text-[#7A6B63]">
                  Bagikan ke Story Instagram / WhatsApp
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-sm font-bold text-[#555]"
              >
                ✕
              </button>
            </div>

            {/* Pilihan Tema */}
            <div className="mb-4">
              <label className="block text-xs font-serif font-bold text-[#5A4A42] uppercase tracking-wider mb-2">
                Pilih Nuansa Kartu:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'terracotta', label: 'Terakota' },
                  { id: 'krem', label: 'Kertas' },
                  { id: 'sage', label: 'Sage' },
                  { id: 'gelap', label: 'Malam' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setCardTheme(th.id as CardTheme)}
                    className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition ${
                      cardTheme === th.id
                        ? 'border-[#C45A2C] bg-[#C45A2C] text-white font-bold ring-2 ring-[#C45A2C]/20'
                        : 'border-[#DECBC0] bg-white text-[#555] hover:bg-[#FAF0E6]'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pratinjau Gambar Kartu */}
            <div className="bg-[#EFE8DD] p-2 rounded-2xl border border-[#DECBC0] mb-5 flex items-center justify-center">
              {quotePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quotePreviewUrl}
                  alt="Pratinjau Kartu Kutipan"
                  className="rounded-xl max-h-[300px] w-auto shadow-md object-contain"
                />
              ) : (
                <div className="py-20 text-xs text-[#8A796E] font-serif">
                  Merakit kartu kutipan...
                </div>
              )}
            </div>

            {/* Tombol Unduh & Share */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadQuoteCard(
                    {
                      judul,
                      kutipan: selectedText || isiTulisan.slice(0, 200),
                      penulis,
                      kategori,
                      theme: cardTheme,
                    },
                    `kutipan-${judul.toLowerCase().replace(/\s+/g, '-')}.png`
                  )
                }
                className="py-2.5 px-4 rounded-xl bg-white border border-[#D5C4B2] font-serif text-xs sm:text-sm font-semibold text-[#2C2C2C] hover:bg-gray-50 transition"
              >
                Unduh PNG
              </button>

              <button
                type="button"
                onClick={() =>
                  shareQuoteCard({
                    judul,
                    kutipan: selectedText || isiTulisan.slice(0, 200),
                    penulis,
                    kategori,
                    theme: cardTheme,
                  })
                }
                className="py-2.5 px-4 rounded-xl bg-[#C45A2C] text-white font-serif text-xs sm:text-sm font-semibold hover:bg-[#A8451D] transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                Kirim ke Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
