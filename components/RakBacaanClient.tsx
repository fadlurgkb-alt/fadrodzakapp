'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { getBookmarks, removeBookmark } from '@/lib/bookmark';
import { BookOpen, Trash2, ArrowRight } from 'lucide-react';

function subscribeBookmarks(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('fadrodzak_bookmark_changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('fadrodzak_bookmark_changed', callback);
    window.removeEventListener('storage', callback);
  };
}

const emptyBookmarks: ReturnType<typeof getBookmarks> = [];

export default function RakBacaanClient() {
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarks,
    () => emptyBookmarks
  );

  const handleRemove = (id: number) => {
    removeBookmark(id);
  };

  if (!isLoaded) {
    return (
      <div className="bg-white/80 p-6 rounded-3xl border border-[#DECBC0] text-center text-xs font-serif text-[#7A6B63]">
        Memuat rak bacaan...
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white/80 p-8 rounded-3xl border border-[#DECBC0] text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF0E6] text-[#C45A2C] flex items-center justify-center text-xl">
          🔖
        </div>
        <h3 className="font-serif font-bold text-base text-[#2C2C2C]">
          Rak Bacaan Masih Kosong
        </h3>
        <p className="text-xs text-[#7A6B63] font-serif max-w-sm mx-auto leading-relaxed">
          Tandai karya atau bab novel favoritmu saat membaca untuk menyimpannya di sini beserta catatan kemajuan bacaanmu.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C45A2C] text-white text-xs font-serif font-bold hover:bg-[#A8451D] transition shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Jelajahi Beranda Sastra
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-serif text-[#7A6B63]">
          Menampilkan <strong>{bookmarks.length}</strong> karya tersimpan di rak
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded-2xl border border-[#DECBC0] shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-[#C45A2C] uppercase tracking-wider bg-[#FAF0E6] px-2 py-0.5 rounded-full font-serif">
                  {b.kategori}
                  {b.nomor_bab ? ` • Bab ${b.nomor_bab}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(b.id)}
                  className="text-stone-400 hover:text-rose-600 transition p-1"
                  title="Hapus dari Rak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-serif font-bold text-sm text-[#2C2C2C] line-clamp-1 mb-1">
                {b.judul}
              </h4>
              <p className="text-xs text-[#7A6B63] font-serif mb-3">
                Oleh {b.penulis}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F2E8DC]">
              {/* Progress Bar */}
              <div className="flex items-center justify-between text-[10px] font-serif text-[#7A6B63] mb-1">
                <span>Kemajuan</span>
                <span className="font-bold text-[#C45A2C]">{b.progressPercent || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#C45A2C] rounded-full transition-all duration-300"
                  style={{ width: `${b.progressPercent || 0}%` }}
                />
              </div>

              <Link
                href={b.url || `/karya/${b.id}`}
                className="w-full py-1.5 px-3 rounded-xl bg-[#FAF0E6] hover:bg-[#F2DFD2] text-[#C45A2C] text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>Lanjutkan Membaca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
