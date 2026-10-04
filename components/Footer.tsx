import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-16 pb-24 border-t border-amber-900/10 pt-8 text-center select-none">
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        {/* Dukungan & Kritik Saran - Desain Elegan & Tidak Mengganggu */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Tautan Dukung Kami via Trakteer */}
          <a
            href="https://trakteer.id/ahmad_rahman7/tip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-50/80 border border-amber-900/15 text-xs font-serif text-[#C85A32] shadow-2xs hover:shadow-xs hover:border-[#C85A32]/40 transition-all duration-200 group"
            title="Dukung kelangsungan dan perkembangan Fadrodzak"
          >
            <span className="text-sm group-hover:scale-110 transition-transform">☕</span>
            <span className="font-medium">Dukung Kami agar Terus Berkembang</span>
            <span className="text-amber-900/40 text-[10px] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>

          {/* Tautan Kritik & Saran via Instagram */}
          <a
            href="https://www.instagram.com/fadrodzak_el_fa?stkn=M2tlYXhuZWhpMHdq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-50/80 border border-amber-900/15 text-xs font-serif text-stone-700 hover:text-[#C85A32] shadow-2xs hover:shadow-xs hover:border-amber-900/30 transition-all duration-200 group"
            title="Kirim kritik dan saran langsung melalui Instagram"
          >
            <span className="text-sm group-hover:scale-110 transition-transform">💬</span>
            <span className="font-medium">Kritik &amp; Saran: <strong className="font-semibold text-stone-800 group-hover:text-[#C85A32]">@fadrodzak_el_fa</strong></span>
            <span className="text-amber-900/40 text-[10px] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>
        </div>

        {/* Navigasi Minimalis */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-serif text-stone-600">
          <Link
            href="/tentang-kami"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Tentang Kami
          </Link>
          <span className="text-amber-900/20 hidden sm:inline">•</span>
          <Link
            href="/kontak"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Hubungi Kami
          </Link>
          <span className="text-amber-900/20 hidden sm:inline">•</span>
          <Link
            href="/kebijakan-privasi"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Kebijakan Privasi
          </Link>
          <span className="text-amber-900/20 hidden sm:inline">•</span>
          <Link
            href="/syarat-ketentuan"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Syarat & Ketentuan
          </Link>
        </nav>

        {/* Hak Cipta & Slogan */}
        <p className="text-[11px] font-serif text-stone-400">
          © {new Date().getFullYear()} <strong className="text-stone-600 font-normal">Fadrodzak</strong> — Lebih dari Sekadar Kata. Tempat di mana kata-kata menemukan rumahnya.
        </p>
      </div>
    </footer>
  );
}
