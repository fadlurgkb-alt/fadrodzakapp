'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, PenTool, BookOpen, Clock } from 'lucide-react';

interface PromptItem {
  hari: string;
  tanggal: string;
  tema: string;
  kategoriSaran: string;
  pemantik: string;
  isToday?: boolean;
}

const TANTANGAN_SEPEKAN: PromptItem[] = [
  {
    hari: 'Senin',
    tanggal: 'Pekan Ini',
    tema: 'Senja di Balik Jendela',
    kategoriSaran: 'Puisi',
    pemantik: 'Tuliskan tentang seseorang yang menatap pulang dari kaca berembun.',
  },
  {
    hari: 'Selasa',
    tanggal: 'Pekan Ini',
    tema: 'Aroma Kopi Pagi dan Kenangan',
    kategoriSaran: 'Novel & Cerbung',
    pemantik: 'Tuliskan bab pembuka kisah tentang bagaimana secangkir kopi membangkitkan masa silam tokoh utama.',
  },
  {
    hari: 'Rabu',
    tanggal: 'Pekan Ini',
    tema: 'Hujan yang Terlambat Datang',
    kategoriSaran: 'Puisi',
    pemantik: 'Tentang kemarau batin dan titik air pertama yang menyejukkan tanah gersang.',
  },
  {
    hari: 'Kamis',
    tanggal: 'Pekan Ini',
    tema: 'Jejak Sunyi di Kota Tua',
    kategoriSaran: 'Cerpen',
    pemantik: 'Langkah kaki di trotoar lengang dan bangunan bernapas kolonial.',
  },
  {
    hari: 'Jumat',
    tanggal: 'Hari Ini',
    tema: 'Surat Tak Pernah Terkirim',
    kategoriSaran: 'Puisi',
    pemantik: 'Ungkapkan kalimat yang tertahan di kerongkongan sebelum berpisah.',
    isToday: true,
  },
  {
    hari: 'Sabtu',
    tanggal: 'Besok',
    tema: 'Kereta Senja dan Rahasia yang Terbawa',
    kategoriSaran: 'Novel & Cerbung',
    pemantik: 'Bab lanjutan tentang pengelana yang menemukan koper tertinggal di gerbong malam.',
  },
  {
    hari: 'Minggu',
    tanggal: 'Lusa',
    tema: 'Pasar Malam dan Balon Gas Merah',
    kategoriSaran: 'Cerpen',
    pemantik: 'Kenangan masa kecil dan tawa riang yang memudar perlahan.',
  },
];

export default function DailyPromptWidget() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem>(
    TANTANGAN_SEPEKAN.find((p) => p.isToday) || TANTANGAN_SEPEKAN[4]
  );
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  return (
    <section className="bg-gradient-to-br from-[#FAF8F5] to-[#F4ECE1] rounded-3xl p-6 border border-[#E8DEC0]/80 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#E8DEC0]/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C45A2C]/10 text-[#C45A2C] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#2C2C2C]">
                Kalender Tantangan Harian
              </h3>
              <span className="bg-[#C45A2C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Daily Prompt
              </span>
            </div>
            <p className="text-xs text-[#7A6B63] font-serif mt-0.5">
              Pemicu inspirasi harian agar penamu tidak pernah kehabisan kata.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllPrompts(!showAllPrompts)}
          className="text-xs font-serif text-[#C45A2C] hover:text-[#9E3C16] font-bold self-start sm:self-center flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          {showAllPrompts ? 'Sembunyikan Pekan Ini' : 'Lihat Tema Sepekan'}
        </button>
      </div>

      {/* Tema Harian Aktif */}
      <div className="bg-white rounded-2xl p-5 border border-[#EBE1D2] shadow-xs mb-4">
        <div className="flex items-center justify-between text-xs text-[#8A796E] font-serif mb-2">
          <span className="flex items-center gap-1.5 font-bold text-[#C45A2C]">
            <Clock className="w-3.5 h-3.5" />
            Tema {selectedPrompt.hari} ({selectedPrompt.tanggal})
          </span>
          <span className="bg-[#FAF0E6] text-[#C45A2C] px-2.5 py-1 rounded-full font-semibold text-[11px]">
            Saran: {selectedPrompt.kategoriSaran}
          </span>
        </div>

        <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2C2C] mb-2 leading-snug">
          &ldquo;{selectedPrompt.tema}&rdquo;
        </h4>

        <p className="text-sm text-[#5A4A42] font-serif leading-relaxed mb-4">
          {selectedPrompt.pemantik}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F5EFE6]">
          <span className="text-xs text-[#8A796E] italic font-serif flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#C45A2C]" />
            Karya bertema ini otomatis tampil di kurasi tantangan redaksi.
          </span>

          <Link
            href={`/tulis?tema=${encodeURIComponent(selectedPrompt.tema)}&kategori=${encodeURIComponent(selectedPrompt.kategoriSaran)}`}
            className="inline-flex items-center gap-2 bg-[#C45A2C] hover:bg-[#A8451D] text-white px-5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition active:scale-[0.98]"
          >
            <PenTool className="w-4 h-4" />
            Tulis dengan Tema Ini &rarr;
          </Link>
        </div>
      </div>

      {/* Grid Tema Sepekan (Jika dibuka) */}
      {showAllPrompts && (
        <div className="pt-2 animate-in fade-in duration-200">
          <p className="text-xs font-serif font-bold text-[#7A6B63] uppercase tracking-wider mb-2.5">
            Daftar Inspirasi 7 Hari:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {TANTANGAN_SEPEKAN.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPrompt(item)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedPrompt.tema === item.tema
                    ? 'bg-white border-[#C45A2C] shadow-xs ring-1 ring-[#C45A2C]/40'
                    : 'bg-white/60 hover:bg-white border-[#E6DBCF]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-serif mb-1">
                  <span className={`font-bold ${item.isToday ? 'text-[#C45A2C]' : 'text-[#7A6B63]'}`}>
                    {item.hari} {item.isToday && '• Hari Ini'}
                  </span>
                  <span className="text-[10px] text-[#8E8E8E]">{item.kategoriSaran}</span>
                </div>
                <p className="font-serif font-bold text-sm text-[#2C2C2C] line-clamp-1">
                  {item.tema}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
