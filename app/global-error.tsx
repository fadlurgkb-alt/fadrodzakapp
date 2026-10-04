'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#FAF8F5] text-[#2C2A29] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-[#C85A32] flex items-center justify-center text-3xl mb-4 shadow-xs">
          🍂
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#2C2A29] mb-2">
          Halaman Mengalami Kendala
        </h2>
        <p className="text-sm text-[#7A6B63] font-serif max-w-md mb-6 leading-relaxed">
          Terjadi kesalahan saat memproses permintaan. Sesi dan akun Anda tetap aman.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#C85A32] text-white px-5 py-2.5 rounded-full text-sm font-serif font-bold hover:bg-[#A8481E] transition cursor-pointer"
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}
