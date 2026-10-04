'use client';

import { useState } from 'react';
import { Award, Feather, Sparkles, Send, CheckCircle2, Star } from 'lucide-react';
import { BedahKaryaItem } from '../lib/db';

interface Props {
  bedahList: BedahKaryaItem[];
}

export default function BedahKaryaSection({ bedahList = [] }: Props) {
  const [selectedItem, setSelectedItem] = useState<BedahKaryaItem>(
    bedahList[0] || {
      id: 1,
      judul: 'Senja di Tepian Kali Porong',
      penulis_karya: 'Fadrodzak',
      kategori: 'Puisi',
      kutipan_karya:
        'Adakah yang lebih tabah dari batu karang, menyaksikan arus pulang saat petang datang menjelang?',
      mentor_nama: 'Dra. Siti Wardani, M.Hum',
      mentor_gelar: 'Pengasuh Bengkel Sastra & Kurator Senior',
      minggu_ke: 'Pekan IV - September 2026',
      ulasan_diksi:
        'Diksi yang dipilih hemat namun tajam. Pemilihan kata "merapuh", "saga", dan "arus pulang" saling bertaut membangun suasana nostalgik tanpa terperosok ke dalam kecengengan klise.',
      ulasan_rima:
        'Asosiasi bunyi vokal terbuka /a/ pada bait awal memberi kesan luasnya bentangan cakrawala senja, lalu ditutup dengan konsonan berat yang memberi ketegasan batin.',
      ulasan_rasa:
        'Rasa sunyi yang dialirkan sangat kontemplatif. Pembaca diajak menjadi pengamat yang hening di tepi sungai, bukan sekadar penonton pasif.',
      ulasan_pesan:
        'Ketabahan menghadapi perpisahan dan roda waktu yang tak bisa dibendung. Sebuah karya muda yang matang dan bernas.',
      kesimpulan:
        'Sangat direkomendasikan untuk dibaca berulang. Kerapian rima dan kejernihan citraan indrawi layak menjadi teladan bagi penulis pemula.',
      rating_apresiasi: 5,
      created_at: new Date(),
    }
  );

  const [ajukanJudul, setAjukanJudul] = useState('');
  const [ajukanPenulis, setAjukanPenulis] = useState('');
  const [ajukanAlasan, setAjukanAlasan] = useState('');
  const [sudahDiajukan, setSudahDiajukan] = useState(false);

  const handleAjukanKarya = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ajukanJudul.trim()) return;
    setSudahDiajukan(true);
    setAjukanJudul('');
    setAjukanPenulis('');
    setAjukanAlasan('');
    setTimeout(() => setSudahDiajukan(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Bedah Karya */}
      <div className="bg-gradient-to-br from-[#FAF5EE] to-[#F2E5D4] rounded-3xl p-6 border border-[#E2D2BF] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#E2D2BF]/60 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C45A2C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Edisi Mingguan
              </span>
              <span className="text-xs text-[#7A6B63] font-serif font-bold">
                {selectedItem.minggu_ke}
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#2C2C2C]">
              Bedah Karya Sastra Pilihan
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#7A6B63] font-serif bg-white/70 px-3 py-1.5 rounded-xl border border-[#E2D2BF]/60">
            <Award className="w-4 h-4 text-[#C45A2C]" />
            <span>Dibimbing Kurator & Mentor Senior</span>
          </div>
        </div>

        {bedahList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {bedahList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif transition whitespace-nowrap ${
                  selectedItem.id === item.id
                    ? 'bg-[#C45A2C] text-white font-bold'
                    : 'bg-white/80 text-[#555] hover:bg-white'
                }`}
              >
                {item.minggu_ke}: {item.judul}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-[#5A4A42] font-serif leading-relaxed">
          Setiap akhir pekan, satu karya anggota komunitas dipilih untuk dibedah secara santun,
          konstruktif, dan mendalam. Tempat terbaik bagi penulis pemula untuk bertumbuh dan
          mengasah kepekaan kata.
        </p>
      </div>

      {/* Kartu Telaah Mentor */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE0D3] shadow-sm">
        {/* Header Karya yang Dibedah */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F0E6D8] pb-5 mb-6">
          <div>
            <span className="text-xs font-serif font-bold text-[#C45A2C] uppercase tracking-wider">
              Karya Anggota Terpilih:
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#2C2C2C] mt-1">
              &ldquo;{selectedItem.judul}&rdquo;
            </h3>
            <p className="text-xs text-[#7A6B63] font-serif mt-0.5">
              Penulis: <strong className="text-[#2C2C2C]">{selectedItem.penulis_karya}</strong> ({selectedItem.kategori})
            </p>
          </div>

          {/* Profil Mentor */}
          <div className="bg-[#FAF6EE] p-3 rounded-2xl border border-[#E8DEC0] flex items-center gap-3 self-start">
            <div className="w-10 h-10 rounded-full bg-[#C45A2C] text-white flex items-center justify-center font-serif font-bold text-sm">
              SW
            </div>
            <div>
              <p className="text-xs font-serif font-bold text-[#2C2C2C]">
                {selectedItem.mentor_nama}
              </p>
              <p className="text-[11px] text-[#7A6B63] font-serif">
                {selectedItem.mentor_gelar}
              </p>
            </div>
          </div>
        </div>

        {/* Kutipan Bait Utama yang Dibedah */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border-l-4 border-[#C45A2C] mb-8 italic font-serif text-[#2C2C2C] text-base leading-relaxed">
          &ldquo;{selectedItem.kutipan_karya}&rdquo;
        </div>

        {/* 4 Pilar Analisis Sastra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Pilar 1: Diksi */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE5D8]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🪶</span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">
                1. Diksi & Pilihan Kata
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#555] font-serif leading-relaxed">
              {selectedItem.ulasan_diksi}
            </p>
          </div>

          {/* Pilar 2: Rima & Matra */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE5D8]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎶</span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">
                2. Rima & Matra Bait
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#555] font-serif leading-relaxed">
              {selectedItem.ulasan_rima}
            </p>
          </div>

          {/* Pilar 3: Rasa & Suasana */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE5D8]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌊</span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">
                3. Kedalaman Rasa & Atmosfer
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#555] font-serif leading-relaxed">
              {selectedItem.ulasan_rasa}
            </p>
          </div>

          {/* Pilar 4: Pesan Filosofis */}
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFE5D8]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <h4 className="font-serif font-bold text-sm text-[#2C2C2C]">
                4. Refleksi & Makna Tersirat
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-[#555] font-serif leading-relaxed">
              {selectedItem.ulasan_pesan}
            </p>
          </div>
        </div>

        {/* Kesimpulan & Rating Apresiasi Mentor */}
        <div className="bg-[#FAF0E6] p-5 rounded-2xl border border-[#EBD5C3]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif font-bold text-[#C45A2C] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Kesimpulan & Catatan Guru Sastra:
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(selectedItem.rating_apresiasi || 5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#443831] font-serif leading-relaxed">
            {selectedItem.kesimpulan}
          </p>
        </div>
      </div>

      {/* Formulir Ajukan Karya untuk Dibedah Pekan Depan */}
      <div className="bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Feather className="w-4 h-4 text-[#C45A2C]" />
          <h3 className="font-serif font-bold text-lg text-[#2C2C2C]">
            Ingin Karyamu Dibedah Pekan Depan?
          </h3>
        </div>
        <p className="text-xs text-[#7A6B63] font-serif mb-5 leading-relaxed">
          Redaksi dan Mentor memilih satu karya dari kiriman anggota tiap Jumat. Kirimkan judul karyamu yang sudah terbit di Fadrodzak.
        </p>

        {sudahDiajukan ? (
          <div className="bg-[#EAF5EE] text-[#2E6B43] p-4 rounded-2xl border border-[#C5E4D1] flex items-center gap-2.5 text-xs font-serif">
            <CheckCircle2 className="w-4 h-4 text-[#2E6B43] shrink-0" />
            <span>Terima kasih! Karyamu telah masuk dalam daftar kurasi telaah sastra pekan depan.</span>
          </div>
        ) : (
          <form onSubmit={handleAjukanKarya} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={ajukanJudul}
                onChange={(e) => setAjukanJudul(e.target.value)}
                placeholder="Judul Karyamu yang sudah terbit..."
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#DECBC0] bg-white outline-none focus:border-[#C45A2C]"
              />
              <input
                type="text"
                required
                value={ajukanPenulis}
                onChange={(e) => setAjukanPenulis(e.target.value)}
                placeholder="Nama Pena Anda..."
                className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#DECBC0] bg-white outline-none focus:border-[#C45A2C]"
              />
            </div>
            <textarea
              rows={2}
              value={ajukanAlasan}
              onChange={(e) => setAjukanAlasan(e.target.value)}
              placeholder="Catatan kecil / bagian bait mana yang paling ingin mendapat masukan dari mentor..."
              className="w-full text-xs px-4 py-2.5 rounded-xl border border-[#DECBC0] bg-white outline-none focus:border-[#C45A2C] resize-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#C45A2C] hover:bg-[#A8451D] text-white px-5 py-2.5 rounded-xl font-serif text-xs font-bold transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Ajukan Karya ke Meja Mentor
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
