import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Hubungi Kami — Redaksi & Komunitas Fadrodzak',
  description:
    'Hubungi pengelola, redaksi, dan kurator komunitas sastra Fadrodzak untuk kerja sama literasi, saran, apresiasi karya, maupun pertanyaan platform.',
  alternates: {
    canonical: `${SITE_URL}/kontak`,
  },
  openGraph: {
    title: 'Hubungi Kami — Redaksi & Komunitas Fadrodzak',
    description:
      'Hubungi pengelola, redaksi, dan kurator komunitas sastra Fadrodzak untuk kerja sama literasi, saran, apresiasi karya, maupun pertanyaan platform.',
    url: `${SITE_URL}/kontak`,
    type: 'website',
  },
};

export default function KontakPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-28 bg-[#FAF8F5]">
      <div className="mb-6">
        <Link
          href="/profil"
          className="text-xs text-gray-500 hover:text-terracotta transition font-serif flex items-center gap-1"
        >
          &larr; Kembali ke Profil
        </Link>
      </div>

      <header className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-terracotta font-bold">
          Komunikasi
        </span>

        <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] mt-2 mb-2">
          Hubungi Kami
        </h1>

        <p className="italic text-gray-600 font-serif text-sm">
          Ada saran, kerja sama literasi, atau pertanyaan seputar platform?
        </p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#EAEAEA] space-y-6">

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAEAEA]">
          <span className="text-2xl">📬</span>

          <div>
            <h3 className="font-bold text-sm text-[#2C2C2C]">
              Surel / Email Redaksi
            </h3>

            <p className="text-xs text-gray-500 font-serif mb-2">
              Untuk kerja sama, kurasi buku, atau aduan konten
            </p>

            <a
              href="mailto:fadlur.gkb@gmail.com"
              className="text-sm font-bold text-terracotta hover:underline"
            >
              fadlur.gkb@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAEAEA]">
          <span className="text-2xl">☕</span>

          <div>
            <h3 className="font-bold text-sm text-[#2C2C2C]">
              Dukungan Kami agar Terus Berkembang
            </h3>

            <p className="text-xs text-gray-500 font-serif mb-2">
              Dukung kelangsungan server dan ruang literasi independen ini melalui Trakteer
            </p>

            <a
              href="https://trakteer.id/ahmad_rahman7/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#C85A32] hover:underline"
            >
              Dukung di Trakteer (ahmad_rahman7) &rarr;
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAEAEA]">
          <span className="text-2xl">📸</span>

          <div>
            <h3 className="font-bold text-sm text-[#2C2C2C]">
              Kritik &amp; Saran Instagram
            </h3>

            <p className="text-xs text-gray-500 font-serif mb-2">
              Sampaikan aspirasi, ide pengembangan fitur, atau kolaborasi langsung ke redaksi
            </p>

            <a
              href="https://www.instagram.com/fadrodzak_el_fa?stkn=M2tlYXhuZWhpMHdq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#C85A32] hover:underline"
            >
              @fadrodzak_el_fa di Instagram &rarr;
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAEAEA]">
          <span className="text-2xl">🌐</span>

          <div>
            <h3 className="font-bold text-sm text-[#2C2C2C]">
              Website Resmi
            </h3>

            <p className="text-xs text-gray-500 font-serif mb-2">
              Akses seluruh ruang baca dan ulasan
            </p>

            <a
              href="https://fadrodzak.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#2C2C2C] hover:text-terracotta transition"
            >
              fadrodzak.my.id
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}