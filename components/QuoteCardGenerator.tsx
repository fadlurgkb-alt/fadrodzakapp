'use client';
import { useState } from 'react';

export default function QuoteCardGenerator({ judul, isi, penulis }: { judul: string, isi: string, penulis: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'krem' | 'sage' | 'gelap'>('krem');

  // Mengambil cuplikan teks pertama (maksimal 250 karakter) agar pas dijadikan kutipan
  const kutipanTeks = isi.replace(/<[^>]*>?/gm, '').slice(0, 250) + (isi.length > 250 ? '...' : '');

  // Fungsi untuk merakit dan mengunduh gambar kartu kutipan
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080; // Ukuran kotak persegi standar Instagram/WhatsApp
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 1. Warna Latar Berdasarkan Tema
    if (theme === 'krem') {
      ctx.fillStyle = '#FAF8F5';
    } else if (theme === 'sage') {
      ctx.fillStyle = '#E3EDE8';
    } else {
      ctx.fillStyle = '#1E1E1E'; // Tema Dark Fantasy
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Bingkai / Kotak Estetik di dalam Kartu
    ctx.strokeStyle = theme === 'gelap' ? '#D48C46' : '#C4A482';
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

    // 3. Judul Karya / Penanda
    ctx.fillStyle = theme === 'gelap' ? '#D48C46' : '#A44200';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`— ${judul.toUpperCase()} —`, canvas.width / 2, 220);

    // 4. Isi Kutipan Teks (Mengatur pembungkusan teks otomatis)
    ctx.fillStyle = theme === 'gelap' ? '#FDFBF7' : '#2C2C2C';
    ctx.font = 'italic 44px serif';
    
    const words = kutipanTeks.split(' ');
    let line = '';
    let y = 380;
    const maxWidth = 800;
    const lineHeight = 65;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // 5. Nama Penulis & Watermark Web Fadrodzak
    ctx.fillStyle = theme === 'gelap' ? '#A0A0A0' : '#707070';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`Ditulis oleh: ${penulis}`, canvas.width / 2, 850);

    ctx.fillStyle = theme === 'gelap' ? '#D48C46' : '#A44200';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('✨ fadrodzak.vercel.app', canvas.width / 2, 920);

    // 6. Proses Unduh File Gambar
    const link = document.createElement('a');
    link.download = `Kutipan-${judul.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      {/* Tombol Pemicu di Halaman Baca */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-terracotta/10 text-terracotta px-5 py-2.5 rounded-full font-bold text-sm hover:bg-terracotta/20 transition flex items-center justify-center gap-2"
      >
        <span>🖼️</span> Buat Kartu Kutipan
      </button>

      {/* Pop-up Modal Generator */}
      {isOpen && (
        <div className="fixed inset-0 bg-ink-charcoal/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-ink-muted/20 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl font-bold text-ink-charcoal">Kartu Kutipan Sastra</h3>
              <button onClick={() => setIsOpen(false)} className="text-ink-muted hover:text-ink-charcoal text-lg font-bold px-2">✕</button>
            </div>

            <p className="text-xs text-ink-secondary mb-4">Pilih nuansa kartu kesukaanmu, lalu unduh untuk dibagikan ke media sosial!</p>

            {/* Pilihan Tema Warna Kartu */}
            <div className="flex gap-2 mb-5">
              <button 
                onClick={() => setTheme('krem')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border ${theme === 'krem' ? 'bg-terracotta text-white border-terracotta' : 'bg-white text-ink-secondary border-ink-muted/20'}`}
              >
                Krem Klasik
              </button>
              <button 
                onClick={() => setTheme('sage')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border ${theme === 'sage' ? 'bg-sage text-white border-sage' : 'bg-white text-ink-secondary border-ink-muted/20'}`}
              >
                Sage Daun
              </button>
              <button 
                onClick={() => setTheme('gelap')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border ${theme === 'gelap' ? 'bg-ink-charcoal text-white border-ink-charcoal' : 'bg-white text-ink-secondary border-ink-muted/20'}`}
              >
                Dark Fantasy
              </button>
            </div>

            {/* Kotak Pratinjau Tampilan Kartu */}
            <div className={`p-6 rounded-2xl border-4 mb-6 shadow-inner text-center flex flex-col justify-between min-h-[260px] ${
              theme === 'krem' ? 'bg-[#FAF8F5] border-[#C4A482] text-ink-charcoal' :
              theme === 'sage' ? 'bg-[#E3EDE8] border-sage text-ink-charcoal' :
              'bg-[#1E1E1E] border-[#D48C46] text-[#FDFBF7]'
            }`}>
              <p className={`text-xs font-serif font-bold tracking-widest ${theme === 'gelap' ? 'text-terracotta' : 'text-[#A44200]'}`}>
                — {judul.toUpperCase()} —
              </p>
              <p className="font-serif italic text-sm my-4 leading-relaxed line-clamp-4">
                &ldquo;{kutipanTeks}&rdquo;
              </p>
              <div>
                <p className="text-[11px] opacity-75 mb-1">Oleh: {penulis}</p>
                <p className={`text-[10px] font-bold ${theme === 'gelap' ? 'text-terracotta' : 'text-[#A44200]'}`}>
                  ✨ fadrodzak.vercel.app
                </p>
              </div>
            </div>

            {/* Tombol Unduh & Tutup */}
            <div className="flex gap-3">
              <button 
                onClick={handleDownloadCard}
                className="flex-1 bg-terracotta text-paper py-3 rounded-2xl font-bold text-sm hover:bg-terracotta-hover transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>📥</span> Unduh Gambar Kartu
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-3 rounded-2xl border border-ink-muted/30 text-ink-secondary font-bold text-sm hover:bg-ink-muted/10 transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}