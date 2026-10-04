'use client';

import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'floating' | 'compact';
  className?: string;
}

export default function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Jika sudah terpasang sebagai aplikasi standalone
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-serif rounded-full border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Aplikasi Terpasang</span>
      </div>
    );
  }

  const handleAction = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setIsDone(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`bg-gradient-to-r from-amber-50 to-[#FAF8F5] border border-amber-900/15 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#2C2A29]">
                Pasang Aplikasi Fadrodzak
              </h4>
              <p className="text-xs text-amber-900/70 font-serif">
                Akses lebih cepat, ringan, dan nyaman langsung dari layar utama HP Anda.
              </p>
            </div>
          </div>
          <button
            onClick={handleAction}
            className="w-full sm:w-auto px-4 py-2 bg-[#C85A32] hover:bg-[#b04d29] text-white rounded-xl text-xs font-medium font-serif flex items-center justify-center gap-2 shadow-xs transition shrink-0"
          >
            <Download className="w-4 h-4" />
            Download Aplikasi
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          onClick={handleAction}
          className={`flex items-center gap-1.5 text-xs text-[#C85A32] font-serif hover:underline ${className}`}
          title="Download Aplikasi"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang App</span>
        </button>
      ) : (
        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#C85A32] hover:bg-[#b04d29] text-white text-xs font-serif font-medium rounded-xl shadow-xs transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDone ? 'Aplikasi Terpasang' : 'Download Aplikasi'}</span>
        </button>
      )}

      {/* Modal Panduan Instalasi (untuk iOS / browser tanpa beforeinstallprompt otomatis) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-amber-900/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#C85A32] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                  Pasang Aplikasi Fadrodzak
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-amber-900/80 font-serif space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-900/10">
              {isIOS ? (
                <>
                  <p className="font-medium text-stone-800">
                    Cara pasang di iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-stone-700">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">1.</span>
                      <span>Ketuk tombol <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" />) di bilah bawah Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">2.</span>
                      <span>Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-stone-700" />).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">3.</span>
                      <span>Ketuk <strong>Tambah</strong> di sudut kanan atas. Selesai!</span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-stone-800">
                    Cara pasang di Android / Komputer (Chrome / Edge):
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-stone-700">
                    <li>Buka menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser.</li>
                    <li>Pilih <strong>Pasang Aplikasi</strong> atau <strong>Instal Fadrodzak</strong> / <em>Add to Home Screen</em>.</li>
                    <li>Konfirmasi pemasangan, ikon Fadrodzak akan muncul di layar utama Anda.</li>
                  </ol>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#C85A32] text-white rounded-xl text-xs font-serif font-medium hover:bg-[#b04d29] transition shadow-xs"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
