'use client';

import { useState } from 'react';
import { MessageSquareText, Feather, Send, User } from 'lucide-react';

export interface TafsirItem {
  id: number;
  karya_id: number;
  bait_index: number;
  potongan_bait: string;
  nama_pengguna: string;
  user_id?: string;
  isi_tafsir: string;
  created_at: string | Date;
}

interface Props {
  karyaId: number;
  baitIndex: number;
  potonganBait: string;
  initialTafsirs: TafsirItem[];
  onKirimTafsir?: (formData: FormData) => Promise<void>;
}

export default function TafsirBaitSection({
  karyaId,
  baitIndex,
  potonganBait,
  initialTafsirs = [],
  onKirimTafsir,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tafsirList, setTafsirList] = useState<TafsirItem[]>(initialTafsirs);
  const [nama, setNama] = useState('');
  const [isiTafsir, setIsiTafsir] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isiTafsir.trim()) return;

    setIsSubmitting(true);
    const namaKirim = nama.trim() || 'Pembaca Sastra';

    const newObj: TafsirItem = {
      id: Date.now(),
      karya_id: karyaId,
      bait_index: baitIndex,
      potongan_bait: potonganBait,
      nama_pengguna: namaKirim,
      isi_tafsir: isiTafsir.trim(),
      created_at: new Date().toISOString(),
    };

    setTafsirList([newObj, ...tafsirList]);
    setIsiTafsir('');

    if (onKirimTafsir) {
      const fd = new FormData();
      fd.append('karyaId', String(karyaId));
      fd.append('baitIndex', String(baitIndex));
      fd.append('potonganBait', potonganBait);
      fd.append('namaPengguna', namaKirim);
      fd.append('isiTafsir', newObj.isi_tafsir);

      try {
        await onKirimTafsir(fd);
      } catch (err) {
        console.warn('Gagal menyimpan tafsir:', err);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative my-3 group">
      {/* Tombol Mini di Sisi Bait */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all ${
            isOpen || tafsirList.length > 0
              ? 'bg-[#C45A2C]/10 text-[#C45A2C] border border-[#C45A2C]/30 font-bold'
              : 'text-[#8E8E8E] hover:text-[#C45A2C] hover:bg-[#FAF0E6] opacity-75 group-hover:opacity-100 border border-transparent'
          }`}
          title="Buka / Tulis Tafsir untuk bait ini"
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Tafsir Bait #{baitIndex + 1}</span>
          {tafsirList.length > 0 && (
            <span className="bg-[#C45A2C] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-bold ml-0.5">
              {tafsirList.length}
            </span>
          )}
        </button>
      </div>

      {/* Panel Catatan Tafsir Per Bait */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-2xl bg-[#FAF6EE] border border-[#E5DACD] shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E8DEC0]/60 pb-2 mb-3">
            <p className="text-xs font-serif font-bold text-[#5A4A42] flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-[#C45A2C]" />
              Tafsir & Catatan Bait Ke-{baitIndex + 1}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#8E8E8E] hover:text-[#2C2C2C]"
            >
              Tutup
            </button>
          </div>

          {/* Cuplikan Bait yang Dikomentari */}
          <div className="text-xs font-serif italic text-[#7A6B63] bg-white/70 p-2.5 rounded-xl border border-[#EFE5D8] mb-3 border-l-2 border-l-[#C45A2C]">
            &ldquo;{potonganBait.slice(0, 120)}{potonganBait.length > 120 ? '...' : ''}&rdquo;
          </div>

          {/* Form Kirim Tafsir */}
          <form onSubmit={handleSubmit} className="space-y-2 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Anda (opsional)"
                className="w-1/3 text-xs px-3 py-2 rounded-xl bg-white border border-[#E0D5C7] outline-none focus:border-[#C45A2C]"
              />
              <input
                type="text"
                required
                value={isiTafsir}
                onChange={(e) => setIsiTafsir(e.target.value)}
                placeholder="Tuliskan tafsir atau renungan pada bait ini..."
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-[#E0D5C7] outline-none focus:border-[#C45A2C]"
              />
              <button
                type="submit"
                disabled={isSubmitting || !isiTafsir.trim()}
                className="bg-[#C45A2C] hover:bg-[#A8451D] text-white px-3 py-2 rounded-xl text-xs font-bold font-serif flex items-center gap-1 transition disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Kirim
              </button>
            </div>
          </form>

          {/* Daftar Komentar Tafsir */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {tafsirList.length === 0 ? (
              <p className="text-[11px] text-[#8E8E8E] italic font-serif text-center py-2">
                Belum ada tafsir untuk bait ini. Berikan renungan pertamamu.
              </p>
            ) : (
              tafsirList.map((t) => (
                <div key={t.id} className="bg-white p-2.5 rounded-xl border border-[#EDE2D4] text-xs">
                  <div className="flex items-center justify-between text-[#8E8E8E] text-[10px] mb-1 font-serif">
                    <span className="font-bold text-[#2C2C2C] flex items-center gap-1">
                      <User className="w-2.5 h-2.5 text-[#C45A2C]" />
                      {t.nama_pengguna}
                    </span>
                    <span>
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-[#444444] font-serif leading-relaxed">
                    {t.isi_tafsir}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
