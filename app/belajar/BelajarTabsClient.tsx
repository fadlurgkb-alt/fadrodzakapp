'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Sparkles, ArrowRight, Clock, User } from 'lucide-react';
import BedahKaryaSection from '../../components/BedahKaryaSection';
import { BedahKaryaItem } from '../../lib/db';

interface TutorialItem {
  id: number;
  judul: string;
  kategori: string;
  isi_materi: string;
  penulis: string;
  waktu_baca: string;
  created_at: Date;
}

interface Props {
  tutorials: TutorialItem[];
  bedahList: BedahKaryaItem[];
  initialTab?: 'materi' | 'bedah';
}

export default function BelajarTabsClient({
  tutorials = [],
  bedahList = [],
  initialTab = 'bedah',
}: Props) {
  const [activeTab, setActiveTab] = useState<'materi' | 'bedah'>(initialTab);

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex p-1.5 rounded-2xl bg-[#EDE4D8] border border-[#DFCFC0] mb-8 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('bedah')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-serif text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'bedah'
              ? 'bg-[#C45A2C] text-white shadow-sm'
              : 'text-[#7A6B63] hover:text-[#2C2C2C]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Bedah Karya Mingguan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materi')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-serif text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'materi'
              ? 'bg-[#C45A2C] text-white shadow-sm'
              : 'text-[#7A6B63] hover:text-[#2C2C2C]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Materi & Tuntunan</span>
        </button>
      </div>

      {/* Konten Tab Aktif */}
      {activeTab === 'bedah' ? (
        <BedahKaryaSection bedahList={bedahList} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EAE0D3] shadow-xs mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C45A2C]" />
              <h3 className="font-serif font-bold text-lg text-[#2C2C2C]">
                Tuntunan & Pedoman Penulisan Sastra
              </h3>
            </div>
            <p className="text-xs text-[#7A6B63] font-serif leading-relaxed">
              Kumpulan materi fundamental untuk mengasah daya bahasa, penulisan puisi, cerpen, serta analisis sastra dari mentor dan redaksi Fadrodzak.
            </p>
          </div>

          {tutorials.length === 0 ? (
            <p className="text-center text-[#8E8E8E] italic font-serif py-12">
              Belum ada materi pelajaran yang diunggah.
            </p>
          ) : (
            tutorials.map((item) => (
              <article
                key={item.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAE0D3] relative overflow-hidden transition hover:shadow-md"
              >
                <div className="flex items-center justify-between text-xs text-[#8E8E8E] font-serif mb-2">
                  <span className="bg-[#FAF0E6] text-[#C45A2C] px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                    {item.kategori}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C45A2C]" />
                      {item.waktu_baca}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#7A6B63]" />
                      {item.penulis}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold mb-3 text-[#2C2C2C] leading-snug">
                  {item.judul}
                </h3>

                <p className="text-[14px] text-[#555] font-serif leading-relaxed line-clamp-3 mb-4">
                  {item.isi_materi}
                </p>

                <div className="pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                  <Link
                    href={`/belajar/${item.id}`}
                    className="text-[#C45A2C] text-xs font-serif font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Pelajari Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
