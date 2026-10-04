'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRedirect =
    error?.digest?.startsWith('NEXT_REDIRECT') ||
    error?.message === 'NEXT_REDIRECT' ||
    Boolean(error?.digest?.includes('replace;') || error?.digest?.includes('push;'));

  useEffect(() => {
    if (isRedirect) {
      const parts = error?.digest ? error.digest.split(';') : [];
      const destination = parts[2] || '/login';
      window.location.href = destination;
      return;
    }
    console.error('[Global Error]:', error);
  }, [error, isRedirect]);

  if (isRedirect) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-center font-serif text-[#7A6B63]">
        <p>Mengarahkan ke halaman...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-orange-100 text-[#C45A2C] flex items-center justify-center text-3xl mb-4 shadow-sm">
        🍂
      </div>
      <h2 className="text-2xl font-serif font-bold text-[#2C2C2C] mb-2">
        Halaman Sedang Beristirahat
      </h2>
      <p className="text-sm text-[#7A6B63] font-serif max-w-md mb-6 leading-relaxed">
        Terjadi kendala saat memuat data. Tenang, sesi atau akun Anda tetap aman.
        Silakan coba muat ulang atau kembali ke beranda sastra.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-[#C45A2C] text-white px-5 py-2.5 rounded-full text-sm font-serif font-bold hover:bg-[#A8481E] transition shadow-sm"
        >
          Muat Ulang Halaman
        </button>
        <Link
          href="/"
          className="bg-white text-[#2C2C2C] border border-[#EBE3D7] px-5 py-2.5 rounded-full text-sm font-serif font-bold hover:bg-gray-50 transition"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
