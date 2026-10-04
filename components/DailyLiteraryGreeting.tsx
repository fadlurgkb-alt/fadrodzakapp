'use client';

import { useState, useEffect } from 'react';
import { CardTheme, downloadQuoteCard, shareQuoteCard, generateQuoteCardCanvas } from '../lib/quote-card';
import { Sparkles, Share2, Download, RefreshCw, Feather, Check } from 'lucide-react';

interface CuratedQuote {
  judul: string;
  penulis: string;
  kategori: string;
  bait: string;
  catatanRedaksi: string;
}

const DAFTAR_KUTIPAN: CuratedQuote[] = [
  {
    judul: 'Senja di Tepian Kali Porong',
    penulis: 'Fadrodzak',
    kategori: 'Puisi',
    bait: 'Di tepian kali yang merapuh senja,\nlangit menyapu saga dengan jemari jingga.\nAir mengalir tanpa keluh dan ragu,\nmenghanyutkan rindu yang lama membeku.',
    catatanRedaksi: 'Pilihan redaksi hari ini tentang ketabahan melepas hari yang telah lalu.',
  },
  {
    judul: 'Sepucuk Surat dari Lorong Perpustakaan',
    penulis: 'Aisyah Rahma',
    kategori: 'Cerpen',
    bait: 'Aroma kertas tua selalu menyembunyikan masa lalu.\nUntuk siapa saja yang masih percaya,\nbahwa kata-kata sanggup menyembuhkan luka.',
    catatanRedaksi: 'Kutipan pengingat betapa lembutnya daya sembuh seuntai kalimat.',
  },
  {
    judul: 'Garis Takdir Sang Penenun',
    penulis: 'Rengganis Aksara',
    kategori: 'Novel & Cerbung',
    bait: 'Bukan riuhnya metafora yang membuat kisah abadi,\nmelainkan ruang sunyi di antara bab-babnya,\ntempat pembaca menemukan detak jantungnya sendiri.',
    catatanRedaksi: 'Kutipan novel pilihan tentang kedalaman perenungan dalam membaca kisah.',
  },
  {
    judul: 'Pantun Penjaga Nyala',
    penulis: 'Budi Santoso',
    kategori: 'Pantun',
    bait: 'Bunga melati di taman sari,\nHarum semerbak di waktu pagi.\nMari membaca setiap hari,\nBuka jendela luasnya negeri.',
    catatanRedaksi: 'Pemicu semangat literasi pembuka pagi.',
  },
  {
    judul: 'Hujan di Pelataran Senja',
    penulis: 'Dra. Siti Wardani',
    kategori: 'Puisi',
    bait: 'Gerimis tak pernah tergesa menyentuh bumi,\nsebagaimana rindu yang tahu kemana ia harus kembali.',
    catatanRedaksi: 'Bait lembut menenangkan hati di tengah kesibukan.',
  },
];

function getInitialGreetingInfo() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) {
    return { greeting: 'Sapaan Fajar & Pagi Aksara', greetingIcon: '🌅', index: 0 };
  } else if (hour >= 11 && hour < 15) {
    return { greeting: 'Meneduhkan Siang dengan Aksara', greetingIcon: '🍃', index: 1 };
  } else if (hour >= 15 && hour < 19) {
    return { greeting: 'Senja di Pelataran Sastra', greetingIcon: '🌇', index: 2 };
  } else {
    return { greeting: 'Bait Kontemplasi Malam', greetingIcon: '🌙', index: 3 };
  }
}

export default function DailyLiteraryGreeting() {
  const [greetingInfo] = useState(getInitialGreetingInfo);
  const [quoteIndex, setQuoteIndex] = useState(greetingInfo.index);
  const [greeting] = useState(greetingInfo.greeting);
  const [greetingIcon] = useState(greetingInfo.greetingIcon);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<CardTheme>('terracotta');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const quote = DAFTAR_KUTIPAN[quoteIndex % DAFTAR_KUTIPAN.length];

  // Buat pratinjau canvas saat modal dibuka atau tema berganti
  useEffect(() => {
    if (!isModalOpen) return;
    let isCancelled = false;

    generateQuoteCardCanvas({
      judul: quote.judul,
      kutipan: quote.bait,
      penulis: quote.penulis,
      kategori: quote.kategori,
      theme,
    }).then((canvas) => {
      if (!isCancelled) {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isModalOpen, quote, theme]);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DAFTAR_KUTIPAN.length);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQuoteCard({
        judul: quote.judul,
        kutipan: quote.bait,
        penulis: quote.penulis,
        kategori: quote.kategori,
        theme,
      }, `kutipan-${quote.judul.toLowerCase().replace(/\s+/g, '-')}.png`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareQuoteCard({
        judul: quote.judul,
        kutipan: quote.bait,
        penulis: quote.penulis,
        kategori: quote.kategori,
        theme,
      });
      if (success) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF5EE] via-[#F6ECE0] to-[#EFE2D2] border border-[#E4D1BF] p-6 sm:p-7 shadow-sm mb-8 transition-all">
      {/* Ornamen Latar Tipis */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#C45A2C]/5 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#3D634C]/5 blur-2xl pointer-events-none" />

      {/* Header Widget */}
      <div className="flex items-center justify-between gap-3 mb-4 border-b border-[#E4D1BF]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label="waktu">{greetingIcon}</span>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[#C45A2C] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C45A2C]" />
              Sapaan Aksara Harian
            </p>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#2C2C2C]">
              {greeting}
            </h2>
          </div>
        </div>

        <button
          onClick={handleNextQuote}
          title="Ganti bait inspirasi lainnya"
          className="p-2 text-[#7A6B63] hover:text-[#C45A2C] hover:bg-white/60 rounded-xl transition flex items-center gap-1.5 text-xs font-serif border border-[#E4D1BF]/40 bg-white/40 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kutipan Lain</span>
        </button>
      </div>

      {/* Bait Kutipan Estetik */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-white/70 shadow-xs mb-4">
        <div className="flex items-center justify-between text-xs text-[#8A796E] font-serif mb-2">
          <span className="italic">Kutipan dari &ldquo;{quote.judul}&rdquo;</span>
          <span className="px-2 py-0.5 rounded-full bg-[#C45A2C]/10 text-[#C45A2C] font-semibold text-[10px] uppercase tracking-wider">
            {quote.kategori}
          </span>
        </div>

        <blockquote className="font-serif text-base sm:text-lg text-[#2A2A2A] italic leading-relaxed whitespace-pre-line border-l-3 border-[#C45A2C] pl-4 my-2">
          &ldquo;{quote.bait}&rdquo;
        </blockquote>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0E6D8] text-xs">
          <p className="text-[#5A4A42] font-serif">
            — <strong className="font-bold text-[#2C2C2C]">{quote.penulis}</strong>
          </p>
          <p className="text-[11px] text-[#8A796E] italic hidden sm:block">
            {quote.catatanRedaksi}
          </p>
        </div>
      </div>

      {/* Tombol Aksi 1-Klik Bagikan ke Story WA / IG */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-[#7A6B63] italic font-serif flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5 text-[#C45A2C]" />
          Karya pilihan Kurator & Redaksi Fadrodzak
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C45A2C] hover:bg-[#A8451D] text-white px-5 py-2.5 rounded-2xl font-serif text-sm font-semibold shadow-sm hover:shadow-md transition active:scale-[0.98]"
        >
          <Share2 className="w-4 h-4" />
          Bagikan ke Story WhatsApp / IG
        </button>
      </div>

      {/* Modal Pratinjau & Kustomisasi Kartu Sastra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 border border-[#E0D4C5] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D3] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C2C2C]">Kartu Kutipan Sastra</h3>
                <p className="text-xs text-[#7A6B63]">Siap dibagikan ke Story WA & Instagram</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-sm font-bold text-[#555] transition"
              >
                ✕
              </button>
            </div>

            {/* Pemilihan Tema Kartu */}
            <div className="mb-4">
              <label className="block text-xs font-serif font-bold text-[#5A4A42] uppercase tracking-wider mb-2">
                Pilih Nuansa Kartu:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('terracotta')}
                  className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition ${
                    theme === 'terracotta'
                      ? 'border-[#C45A2C] bg-[#C45A2C] text-white font-bold ring-2 ring-[#C45A2C]/30'
                      : 'border-[#DECBC0] bg-[#FAF0E6] text-[#7A4A33] hover:bg-[#F2DFD2]'
                  }`}
                >
                  Terakota
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('krem')}
                  className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition ${
                    theme === 'krem'
                      ? 'border-[#C45A2C] bg-white text-[#2C2C2C] font-bold ring-2 ring-[#C45A2C]/30'
                      : 'border-[#E4D1BF] bg-[#F7F2EA] text-[#5A4A42] hover:bg-white'
                  }`}
                >
                  Kertas Kuno
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('sage')}
                  className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition ${
                    theme === 'sage'
                      ? 'border-[#3D634C] bg-[#3D634C] text-white font-bold ring-2 ring-[#3D634C]/30'
                      : 'border-[#C6D8CC] bg-[#EAF0EB] text-[#2F523E] hover:bg-[#DCE6DE]'
                  }`}
                >
                  Embun Sage
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('gelap')}
                  className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition ${
                    theme === 'gelap'
                      ? 'border-[#D4AF37] bg-[#18181B] text-[#D4AF37] font-bold ring-2 ring-[#D4AF37]/30'
                      : 'border-[#3F3F46] bg-[#27272A] text-[#D4D4D8] hover:bg-[#18181B]'
                  }`}
                >
                  Malam Emas
                </button>
              </div>
            </div>

            {/* Pratinjau Gambar Kartu */}
            <div className="bg-[#EFE8DD] p-2 rounded-2xl border border-[#DECBC0] mb-5 flex items-center justify-center">
              {previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDataUrl}
                  alt="Pratinjau Kartu Kutipan"
                  className="rounded-xl max-h-[300px] w-auto shadow-md object-contain"
                />
              ) : (
                <div className="py-24 text-center text-xs text-[#8A796E] font-serif">
                  Merakit kartu kutipan...
                </div>
              )}
            </div>

            {/* Tombol Aksi Download & Share */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F2ECE2] text-[#2C2C2C] border border-[#D5C4B2] py-2.5 px-4 rounded-xl font-serif text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#C45A2C]" />
                {isDownloading ? 'Menyimpan...' : 'Unduh PNG'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className="inline-flex items-center justify-center gap-2 bg-[#C45A2C] hover:bg-[#A8451D] text-white py-2.5 px-4 rounded-xl font-serif text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 shadow-sm"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Dibagikan!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {isSharing ? 'Membuka...' : 'Kirim ke Story'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
