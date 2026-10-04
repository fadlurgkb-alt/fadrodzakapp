'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Mic,
  Upload,
  Coffee,
  BookOpen,
  FileText,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { IconTulis } from './NavIcons';

interface Props {
  initialTema?: string;
  initialKategori?: string;
  defaultUserName?: string;
  simpanKaryaAction: (formData: FormData) => Promise<void>;
}

const DRAFT_STORAGE_KEY = 'fadrodzak_tulis_draft_v1';

export const NOVEL_GENRES = [
  'Romansa',
  'Fantasi',
  'Misteri',
  'Fiksi Sejarah',
  'Petualangan',
  'Horor',
  'Sci-Fi',
  'Slice of Life',
  'Thriller',
  'Drama',
  'Spiritual & Religi',
  'Komedi',
];

export const PRESET_COVERS = [
  {
    label: 'Senja Sastra',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Hutan Mistis',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Aksara Kuno',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Galaksi Fiksi',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  },
];

interface DraftData {
  judul: string;
  kategori: string;
  isiTulisan: string;
  nomorBab: number;
  judulBab?: string;
  namaCerita?: string;
  genre?: string;
  gambarUrl?: string;
  linkTrakteer?: string;
  sinopsis: string;
  statusCerita: 'Ongoing' | 'Tamat';
  savedAt: number;
}

export default function TulisKaryaForm({
  initialTema = '',
  initialKategori = 'Puisi',
  defaultUserName = '',
  simpanKaryaAction,
}: Props) {
  const normalizedInitialKategori = useMemo(() => {
    if (['Novel', 'Cerita Bersambung', 'Novel & Cerbung'].includes(initialKategori)) {
      return 'Novel & Cerbung';
    }
    return ['Puisi', 'Pantun', 'Cerpen'].includes(initialKategori) ? initialKategori : 'Puisi';
  }, [initialKategori]);

  const [kategori, setKategori] = useState<string>(normalizedInitialKategori);
  const [isiTulisan, setIsiTulisan] = useState('');
  const [judul, setJudul] = useState(initialTema || '');
  const [statusCerita, setStatusCerita] = useState<'Ongoing' | 'Tamat'>('Ongoing');
  const [nomorBab, setNomorBab] = useState<number>(1);
  const [judulBab, setJudulBab] = useState('');
  const [namaCerita, setNamaCerita] = useState('');
  const [genre, setGenre] = useState('Romansa');
  const [gambarUrl, setGambarUrl] = useState('');
  const [linkTrakteer, setLinkTrakteer] = useState('');
  const [sinopsis, setSinopsis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Kompresi gambar client-side (maks 800px, 78% JPEG) agar instan, tajam, ringan (~40-80KB), dan anti-error
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(e.target?.result || ''));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = String(e.target?.result || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih berkas gambar (JPG, PNG, atau WebP).');
      return;
    }
    setUploadLoading(true);
    setUploadError(null);
    try {
      const compressedDataUrl = await compressImage(file);
      setGambarUrl(compressedDataUrl);
    } catch {
      setUploadError('Gagal memproses gambar. Silakan gunakan format JPG atau PNG.');
    } finally {
      setUploadLoading(false);
    }
  };

  const [draftPrompt, setDraftPrompt] = useState<DraftData | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed: DraftData = JSON.parse(raw);
        if (parsed && (parsed.judul?.trim() || parsed.isiTulisan?.trim() || parsed.namaCerita?.trim())) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // 1. Fungsi simpan draf ke localStorage
  const saveDraftToStorage = useCallback(() => {
    if (!judul.trim() && !isiTulisan.trim() && !namaCerita.trim()) return;
    try {
      const data: DraftData = {
        judul,
        kategori,
        isiTulisan,
        nomorBab,
        judulBab,
        namaCerita,
        genre,
        gambarUrl,
        linkTrakteer,
        sinopsis,
        statusCerita,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      const now = new Date();
      setLastSavedTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    } catch {}
  }, [judul, kategori, isiTulisan, nomorBab, judulBab, namaCerita, genre, gambarUrl, linkTrakteer, sinopsis, statusCerita]);

  // 2. Debounced auto-save setiap kali ada perubahan teks
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraftToStorage();
    }, 1500);
    return () => clearTimeout(timer);
  }, [saveDraftToStorage]);

  // 3. Pulihkan draf
  const pulihkanDraft = () => {
    if (!draftPrompt) return;
    setJudul(draftPrompt.judul || '');
    setKategori(draftPrompt.kategori || normalizedInitialKategori);
    setIsiTulisan(draftPrompt.isiTulisan || '');
    setNomorBab(draftPrompt.nomorBab || 1);
    setJudulBab(draftPrompt.judulBab || '');
    setNamaCerita(draftPrompt.namaCerita || '');
    setGenre(draftPrompt.genre || 'Romansa');
    setGambarUrl(draftPrompt.gambarUrl || '');
    setLinkTrakteer(draftPrompt.linkTrakteer || '');
    setSinopsis(draftPrompt.sinopsis || '');
    setStatusCerita(draftPrompt.statusCerita || 'Ongoing');
    setDraftPrompt(null);
  };

  // 4. Buang draf
  const buangDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftPrompt(null);
    setLastSavedTime(null);
  };

  // Perhitungan statistik kata & perkiraan menit baca
  const { wordCount, readingMinutes } = useMemo(() => {
    const trimmed = isiTulisan.trim();
    if (!trimmed) return { wordCount: 0, readingMinutes: 0 };
    const words = trimmed.split(/\s+/).filter(Boolean);
    const count = words.length;
    const minutes = Math.max(1, Math.ceil(count / 180));
    return { wordCount: count, readingMinutes: minutes };
  }, [isiTulisan]);

  const isStoryCategory = kategori === 'Novel & Cerbung';

  const categories = [
    { id: 'Puisi', label: 'Puisi', icon: '🪶', desc: 'Bait sajak puitis' },
    { id: 'Pantun', label: 'Pantun', icon: '🎋', desc: 'Sampiran & isi tradisi' },
    { id: 'Cerpen', label: 'Cerpen', icon: '📜', desc: 'Kisah pendek tuntas' },
    { id: 'Novel & Cerbung', label: 'Novel & Cerbung', icon: '📖', desc: 'Cerita bersambung / bab novel' },
  ];

  return (
    <form
      action={async (formData: FormData) => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
          await simpanKaryaAction(formData);
          // Bersihkan draf setelah berhasil terbit
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (err: unknown) {
          setIsSubmitting(false);
          const errMsg = (err as Error)?.message || '';
          // Jangan cegah Next.js redirect
          if (
            errMsg.includes('NEXT_REDIRECT') ||
            (err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')
          ) {
            throw err;
          }
          console.error('[Tulis] Gagal menerbitkan karya:', err);
          setSubmitError(
            'Terjadi kendala saat menerbitkan karya. Tenang, naskah tulisan Anda tidak hilang. Silakan periksa kembali berkas atau coba terbitkan ulang.'
          );
        }
      }}
      className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto pb-24"
    >
      {/* Header Halaman */}
      <header className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#2C2C2C] font-bold">
            Ruang Tulis
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6B63] mt-1 italic font-serif">
            {isStoryCategory
              ? 'Tulis bab novel atau cerita bersambung tanpa ribet.'
              : 'Selembar kertas hening untuk menenun cipta, rasa, dan karsa.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveDraftToStorage}
            className="p-2 sm:px-3 sm:py-2 rounded-full border border-[#DECBC0] bg-white text-[#7A6B63] hover:text-[#C45A2C] hover:border-[#C45A2C] text-xs font-serif flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title="Simpan draf sekarang"
          >
            <Save className="w-3.5 h-3.5 text-[#C45A2C]" />
            <span className="hidden sm:inline">Simpan Draf</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#C45A2C] text-white px-5 sm:px-6 py-2.5 rounded-full font-serif font-bold text-sm flex items-center gap-2 shadow-md hover:bg-[#A8451D] disabled:opacity-50 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <IconTulis size={18} className="filter brightness-0 invert" />
            {isSubmitting ? 'Menerbitkan...' : 'Terbitkan'}
          </button>
        </div>
      </header>

      {/* Pesan Kesalahan Publikasi jika ada */}
      {submitError && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-serif flex items-start justify-between gap-3 shadow-xs">
          <div>
            <span className="font-bold block mb-0.5">⚠️ Kendala Penerbitan</span>
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Indikator Status Auto-Save Draf */}
      {lastSavedTime && (
        <div className="flex items-center gap-1.5 text-[11px] font-serif text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full w-fit mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Draf otomatis tersimpan pukul {lastSavedTime} WIB</span>
        </div>
      )}

      {/* Banner Pulihkan Draf Sebelumnya jika ada */}
      {draftPrompt && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📝</span>
            <div>
              <p className="text-xs font-serif font-bold text-amber-900">
                Draf Belum Terbit Ditemukan
              </p>
              <p className="text-[11px] text-amber-800/80 font-serif">
                &ldquo;{draftPrompt.judul || 'Tanpa Judul'}&rdquo; ({draftPrompt.kategori})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={pulihkanDraft}
              className="px-3 py-1.5 rounded-xl bg-[#C45A2C] text-white text-xs font-serif font-bold hover:bg-[#A8451D] transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Pulihkan Draf
            </button>
            <button
              type="button"
              onClick={buangDraft}
              className="p-1.5 rounded-xl bg-white border border-amber-200 text-stone-500 hover:text-rose-600 text-xs transition cursor-pointer"
              title="Buang Draf"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Banner Tema Tantangan Harian Jika Ada */}
      {initialTema && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FAF0E6] to-[#F5E6D8] border border-[#DECBC0] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C45A2C] shrink-0" />
            <div>
              <p className="text-[11px] uppercase font-bold text-[#C45A2C] tracking-wider">
                Tantangan Harian Diaktifkan
              </p>
              <p className="text-sm font-serif font-bold text-[#2C2C2C]">
                &ldquo;{initialTema}&rdquo;
              </p>
            </div>
          </div>
          <Link
            href="/tulis"
            className="text-xs text-[#7A6B63] hover:text-[#C45A2C] font-serif underline shrink-0"
          >
            Hapus Tema
          </Link>
        </div>
      )}

      {/* Nama Pena */}
      <div className="mb-6">
        <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-2">
          Nama Pena
        </label>
        <input
          type="text"
          name="nama_pengguna"
          defaultValue={defaultUserName}
          required
          className="w-full border border-[#DECBC0] rounded-xl p-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] shadow-xs text-sm font-serif"
          placeholder="Nama pena Anda..."
        />
      </div>

      {/* Pilihan Bentuk Karya Sastra / Cerita (Hanya 4 Kategori Ramping) */}
      <div className="mb-6">
        <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-2">
          Bentuk Karya:
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const isChecked = kategori === cat.id;
            return (
              <label
                key={cat.id}
                className={`cursor-pointer p-3 rounded-2xl border transition text-left flex flex-col justify-between ${
                  isChecked
                    ? 'border-[#C45A2C] bg-[#FAF0E6] shadow-xs'
                    : 'border-[#DECBC0] bg-white hover:border-[#C45A2C]/40'
                }`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value={cat.id}
                  checked={isChecked}
                  onChange={() => setKategori(cat.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span
                    className={`font-serif text-xs font-bold ${
                      isChecked ? 'text-[#C45A2C]' : 'text-[#2C2C2C]'
                    }`}
                  >
                    {cat.label}
                  </span>
                </div>
                <p className="text-[10px] text-[#7A6B63] font-serif mt-1">
                  {cat.desc}
                </p>
              </label>
            );
          })}
        </div>
      </div>

      {/* PENGATURAN LENGKAP NOVEL & CERITA BERSAMBUNG */}
      {isStoryCategory && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-[#FAF6F0] border-2 border-[#E8DEC0] shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-[#E8DEC0]/80 pb-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2C2C2C] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C45A2C]" />
                Pengaturan Novel &amp; Cerita Bersambung
              </h3>
              <p className="text-[11px] text-[#7A6B63] font-serif">
                Lengkap dengan 6 pengaturan: Judul, Gambar, Premis Cerita, Bab, Dukung Kami (Donate), dan Genre.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C45A2C]/10 text-[#C45A2C] font-serif">
              Studio Novel
            </span>
          </div>

          {/* Info Banner untuk Halaman Pembaca */}
          <div className="p-3 rounded-2xl bg-[#FFF8F0] border border-[#EACBB5] flex items-start gap-2.5 text-xs font-serif text-[#8C4A28]">
            <Sparkles className="w-4 h-4 text-[#C45A2C] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tampilan Halaman Pembaca:</strong> Saat pembaca membuka karya ini, di bagian paling atas akan otomatis tampil <strong>Kartu Sampul Novel</strong> (Judul, Gambar, Dukung Kami, Premis Cerita, Genre), lalu di bawahnya <strong>Daftar Bab yang bisa langsung diklik</strong>.
            </p>
          </div>

          {/* 1. Judul Seri / Nama Cerita & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#2C2C2C] mb-1.5">
                Judul Seri / Nama Novel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_cerita"
                value={namaCerita}
                onChange={(e) => {
                  const val = e.target.value;
                  setNamaCerita(val);
                  if (!judul || judul.includes('— Bab') || judul === '') {
                    setJudul(val ? `${val} — Bab ${nomorBab}${judulBab ? `: ${judulBab}` : ''}` : '');
                  }
                }}
                required
                placeholder="Contoh: Matahari di Ujung Senja"
                className="w-full border border-[#DECBC0] rounded-xl py-2 px-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#2C2C2C] mb-1.5">
                Genre Cerita
              </label>
              <select
                name="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full border border-[#DECBC0] rounded-xl py-2 px-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif shadow-2xs cursor-pointer"
              >
                {NOVEL_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Pengaturan Bab (Nomor Bab, Judul Bab, & Status Cerita) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-[#DECBC0]/80">
            <div>
              <label className="block text-[11px] font-serif font-bold text-[#2C2C2C] mb-1">
                Nomor Bab
              </label>
              <input
                type="number"
                min={1}
                max={999}
                name="nomor_bab"
                value={nomorBab}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10) || 1;
                  setNomorBab(num);
                  if (namaCerita) {
                    setJudul(`${namaCerita} — Bab ${num}${judulBab ? `: ${judulBab}` : ''}`);
                  }
                }}
                className="w-full border border-[#DECBC0] rounded-xl py-1.5 px-3 text-center outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] font-bold text-xs font-serif"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-bold text-[#2C2C2C] mb-1">
                Judul Khusus Bab Ini (Opsional)
              </label>
              <input
                type="text"
                name="judul_bab"
                value={judulBab}
                onChange={(e) => {
                  const val = e.target.value;
                  setJudulBab(val);
                  if (namaCerita) {
                    setJudul(`${namaCerita} — Bab ${nomorBab}${val ? `: ${val}` : ''}`);
                  }
                }}
                placeholder="Misal: Pertemuan Tak Terduga"
                className="w-full border border-[#DECBC0] rounded-xl py-1.5 px-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-bold text-[#2C2C2C] mb-1">
                Status Cerita
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusCerita('Ongoing')}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-serif font-bold transition cursor-pointer ${
                    statusCerita === 'Ongoing'
                      ? 'border-[#C45A2C] bg-[#FAF0E6] text-[#C45A2C]'
                      : 'border-[#DECBC0] bg-white text-[#7A6B63]'
                  }`}
                >
                  🟢 Ongoing
                </button>
                <button
                  type="button"
                  onClick={() => setStatusCerita('Tamat')}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-serif font-bold transition cursor-pointer ${
                    statusCerita === 'Tamat'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-[#DECBC0] bg-white text-[#7A6B63]'
                  }`}
                >
                  🏁 Tamat
                </button>
                <input type="hidden" name="status_cerita" value={statusCerita} />
              </div>
            </div>
          </div>

          {/* 3. Premis Cerita / Sinopsis (Penting untuk Card Novel Pembaca) */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#2C2C2C] mb-1.5">
              Premis Cerita / Sinopsis Memikat <span className="text-red-500">*</span>
            </label>
            <textarea
              name="sinopsis"
              value={sinopsis}
              onChange={(e) => setSinopsis(e.target.value)}
              rows={3}
              required
              placeholder="Tuliskan premis atau blurb cerita yang membuat pembaca penasaran... (misal: 'Di sebuah stasiun berkabut, dua jiwa asing bertukar buku catatan harian tanpa pernah menyadari rahasia di masa lalu...')"
              className="w-full border border-[#DECBC0] rounded-xl p-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif shadow-2xs leading-relaxed"
            />
          </div>

          {/* 4. Gambar Sampul Novel (Cover Image URL + File Upload + Live Preview) */}
          <div className="bg-white p-4 rounded-2xl border border-[#DECBC0]/80">
            <label className="block text-xs font-serif font-bold text-[#2C2C2C] mb-2">
              Gambar Sampul Novel / Cover Art
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Cover Preview (Rasio 2:3) */}
              <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl bg-stone-100 border-2 border-[#DECBC0] overflow-hidden shrink-0 flex items-center justify-center shadow-md relative">
                {gambarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={gambarUrl}
                    alt="Pratinjau Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-stone-400">
                    <span className="text-2xl block mb-1">📖</span>
                    <span className="text-[9px] font-serif leading-tight block">Cover 2:3</span>
                  </div>
                )}
              </div>

              {/* Cover Input Options */}
              <div className="flex-1 space-y-2.5 w-full">
                <div>
                  <span className="text-[11px] text-[#7A6B63] font-serif block mb-1">
                    Tautan URL Gambar Sampul:
                  </span>
                  <input
                    type="text"
                    value={gambarUrl.startsWith('data:') ? '' : gambarUrl}
                    onChange={(e) => setGambarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
                    className="w-full border border-[#DECBC0] rounded-xl py-1.5 px-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif shadow-2xs"
                  />
                </div>

                {/* Preset Sampul Cepat */}
                <div>
                  <span className="text-[10px] text-[#8C7E74] font-serif block mb-1">
                    Atau gunakan sampul estetik instan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COVERS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setGambarUrl(preset.url)}
                        className={`text-[10px] font-serif py-1 px-2.5 rounded-lg border transition ${
                          gambarUrl === preset.url
                            ? 'border-[#C45A2C] bg-[#FAF0E6] text-[#C45A2C] font-bold'
                            : 'border-[#DECBC0] bg-stone-50 text-[#665] hover:border-[#C45A2C]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                    {gambarUrl && (
                      <button
                        type="button"
                        onClick={() => setGambarUrl('')}
                        className="text-[10px] font-serif py-1 px-2 rounded-lg text-stone-400 hover:text-red-500"
                      >
                        Hapus Sampul
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#7A6B63] font-serif block mb-1">
                    Atau unggah berkas dari perangkat:
                  </span>
                  <input
                    type="file"
                    name="gambar"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileSelected}
                    className="block w-full text-xs text-[#7A6B63] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#FAF0E6] file:text-[#C45A2C] file:font-serif file:font-bold hover:file:bg-[#F2DFD2] file:cursor-pointer"
                  />
                  {uploadLoading && (
                    <p className="text-[11px] text-[#C45A2C] font-serif mt-1 animate-pulse">
                      ⏳ Mengoptimalkan gambar sampul...
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-[11px] text-red-600 font-serif mt-1">
                      ⚠️ {uploadError}
                    </p>
                  )}
                  <input type="hidden" name="gambar_url" value={gambarUrl} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Tautan Dukung Kami / Donasi (Donate Trakteer / Saweria) */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#DECBC0]/80">
            <label className="block text-xs font-serif font-bold text-[#2C2C2C] mb-1 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#C45A2C]" />
              Tautan Dukung Kami / Donasi Penulis (Saweria / Trakteer)
            </label>
            <p className="text-[11px] text-[#7A6B63] font-serif mb-2">
              Tombol &ldquo;☕ Dukung Kami&rdquo; akan otomatis dipasang di kartu paling atas halaman pembaca, mengarahkan pembaca langsung ke halaman donasi Anda.
            </p>
            <input
              type="url"
              name="link_trakteer"
              value={linkTrakteer}
              onChange={(e) => setLinkTrakteer(e.target.value)}
              placeholder="https://saweria.co/nama_anda atau https://trakteer.id/nama_anda/tip"
              className="w-full border border-[#DECBC0] rounded-xl py-2 px-3 outline-none focus:border-[#C45A2C] bg-white text-[#2C2C2C] text-xs font-serif shadow-2xs"
            />
          </div>
        </div>
      )}

      {/* Status Penulis */}
      <div className="mb-6">
        <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-2">
          Status Penulis:
        </label>

        <div className="flex gap-3 flex-wrap">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="status_penulis"
              value="Pelajar Sastra"
              defaultChecked
              className="peer sr-only"
            />
            <div className="px-4 py-2 rounded-xl border border-[#DECBC0] text-[#7A6B63] peer-checked:border-[#3D634C] peer-checked:text-[#3D634C] peer-checked:bg-[#EAF0EB] peer-checked:font-bold font-serif text-xs transition">
              🎓 Pelajar Sastra
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="status_penulis"
              value="Novelis & Cerpenis"
              className="peer sr-only"
            />
            <div className="px-4 py-2 rounded-xl border border-[#DECBC0] text-[#7A6B63] peer-checked:border-[#C45A2C] peer-checked:text-[#C45A2C] peer-checked:bg-[#FAF0E6] peer-checked:font-bold font-serif text-xs transition">
              📖 Novelis &amp; Cerpenis
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="status_penulis"
              value="Sastrawan Pro"
              className="peer sr-only"
            />
            <div className="px-4 py-2 rounded-xl border border-[#DECBC0] text-[#7A6B63] peer-checked:border-purple-600 peer-checked:text-purple-700 peer-checked:bg-purple-50 peer-checked:font-bold font-serif text-xs transition">
              ⭐ Sastrawan Pro
            </div>
          </label>
        </div>
      </div>

      {/* Rekaman Audio Puisi / Voice Note (Hanya untuk non-cerita atau opsional) */}
      {!isStoryCategory && (
        <div className="mb-6 bg-white p-4 rounded-2xl border border-[#DECBC0] shadow-xs">
          <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-1">
            Audio Pembacaan / Voice Note
            <span className="font-normal text-[#8E8E8E] ml-2 font-sans">(Opsional)</span>
          </label>
          <p className="text-xs text-[#7A6B63] font-serif mb-3">
            Unggah rekaman suara saat Anda membacakan karya ini atau narasi puisi (MP3, WAV, atau rekaman ponsel).
          </p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E6] text-[#C45A2C] flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <input
              type="file"
              name="audio_rekaman"
              accept="audio/*"
              className="block w-full text-xs text-[#7A6B63] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#FAF0E6] file:text-[#C45A2C] file:font-serif file:font-bold hover:file:bg-[#F2DFD2] file:cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tautan Donasi / Apresiasi Kopi untuk Non-Novel */}
      {!isStoryCategory && (
        <div className="mb-6">
          <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-2">
            Tautan Secangkir Kopi / Apresiasi (Trakteer / Saweria)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#C45A2C]">
              <Coffee className="w-4 h-4" />
            </span>
            <input
              type="url"
              name="link_trakteer"
              placeholder="https://trakteer.id/nama_anda/tip"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DECBC0] bg-white focus:border-[#C45A2C] outline-none shadow-xs text-[#2C2C2C] text-xs sm:text-sm font-serif"
            />
          </div>
        </div>
      )}

      {/* Upload Gambar Sampul untuk Non-Novel */}
      {!isStoryCategory && (
        <div className="mb-8">
          <label className="block text-xs font-serif font-bold text-[#2C2C2C] uppercase tracking-wider mb-2">
            Gambar Sampul Karya
            <span className="font-normal text-[#8E8E8E] ml-2 font-sans">(Opsional)</span>
          </label>
          <div className="border-2 border-dashed border-[#DECBC0] rounded-2xl p-5 text-center bg-white hover:border-[#C45A2C]/60 transition">
            <Upload className="w-6 h-6 text-[#C45A2C] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#2C2C2C] font-serif">
              Pilih gambar sampul pendukung
            </p>
            <p className="text-[11px] text-[#8E8E8E] mt-0.5 mb-3">
              JPG, PNG, atau WebP (Maksimal 3 MB)
            </p>
            <input
              type="file"
              name="gambar"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageFileSelected}
              className="block w-full text-xs text-[#7A6B63] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#C45A2C] file:text-white file:font-serif file:font-bold hover:file:bg-[#A8451D] file:cursor-pointer"
            />
            {uploadLoading && (
              <p className="text-[11px] text-[#C45A2C] font-serif mt-2 animate-pulse">
                ⏳ Mengoptimalkan gambar sampul...
              </p>
            )}
            {uploadError && (
              <p className="text-[11px] text-red-600 font-serif mt-2">
                ⚠️ {uploadError}
              </p>
            )}
            {gambarUrl && (
              <div className="mt-3 flex items-center justify-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gambarUrl} alt="Pratinjau Sampul" className="w-16 h-20 object-cover rounded-xl border border-[#DECBC0] shadow-xs" />
                <button
                  type="button"
                  onClick={() => setGambarUrl('')}
                  className="text-xs text-red-500 hover:underline font-serif cursor-pointer"
                >
                  Hapus Gambar
                </button>
              </div>
            )}
            <input type="hidden" name="gambar_url" value={gambarUrl} />
          </div>
        </div>
      )}

      {/* KANVAS MENULIS SASTRA & CERITA */}
      <div className="bg-[#FFFDF9] p-6 sm:p-8 rounded-3xl border border-[#DECBC0] shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] min-h-[500px]">
        {/* Bar Status Statistik Kata (Live Word Counter & Waktu Baca) */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8DEC0]/70 text-xs font-serif text-[#7A6B63]">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C45A2C]" />
            <strong>{wordCount.toLocaleString('id-ID')}</strong> kata
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C45A2C]" />
            Perkiraan <strong>{readingMinutes} menit</strong> baca
          </span>
        </div>

        {/* Input Judul Karya */}
        <input
          type="text"
          name="judul"
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          required
          placeholder={
            isStoryCategory
              ? 'Judul Cerita / Bab (misal: Gadis Penenun — Bab 1)...'
              : 'Judul Karya Sastra...'
          }
          className="w-full bg-transparent text-2xl sm:text-3xl font-serif font-bold text-[#2C2C2C] placeholder:text-[#BBB] outline-none border-b border-[#E8DEC0] pb-3 mb-6"
        />

        {/* Textarea Isi Tulisan / Naskah Bab */}
        <textarea
          name="isi_tulisan"
          value={isiTulisan}
          onChange={(e) => setIsiTulisan(e.target.value)}
          required
          placeholder={
            isStoryCategory
              ? `Tuliskan alur cerita atau bab bersambungmu di sini...

Pembaca menantikan kelanjutan kisahmu!`
              : `Tumpahkan bait rasamu di sini...

Untaian baris sajak, rima pantun, atau narasi cerpen yang mengalir dari kedalaman jiwamu.`
          }
          className="w-full bg-transparent text-[#2C2C2C] font-serif text-base sm:text-lg leading-loose outline-none resize-none h-96 placeholder:text-[#BBB]"
        />
      </div>
    </form>
  );
}
