import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description:
    'Syarat dan ketentuan layanan penerbitan karya sastra, etika kepenulisan, hak cipta, dan pedoman komunitas di platform literasi Fadrodzak.',
  alternates: {
    canonical: `${SITE_URL}/syarat-ketentuan`,
  },
  openGraph: {
    title: 'Syarat & Ketentuan Layanan | Fadrodzak',
    description:
      'Syarat dan ketentuan layanan penerbitan karya sastra, etika kepenulisan, hak cipta, dan pedoman komunitas di platform literasi Fadrodzak.',
    url: `${SITE_URL}/syarat-ketentuan`,
    type: 'website',
  },
};

export default function SyaratKetentuanPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-28 bg-[#FAF8F5]">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-[#C85A32] transition font-serif flex items-center gap-1"
        >
          &larr; Kembali ke Beranda
        </Link>
      </div>

      <header className="mb-8">
        <span className="text-xs uppercase tracking-widest text-[#C85A32] font-bold">Ketentuan</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] mt-2 mb-1">
          Syarat & Ketentuan Layanan
        </h1>
        <p className="text-xs text-stone-500 font-serif">Pembaruan Terakhir: 2026</p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-amber-900/10 space-y-6 text-stone-700 font-serif leading-relaxed text-sm">
        <section>
          <h2 className="font-bold text-base text-[#2C2A29] font-sans mb-2">1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses, mengunduh, atau menggunakan situs web dan aplikasi Fadrodzak, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2A29] font-sans mb-2">2. Hak Cipta & Kepemilikan Karya</h2>
          <p>
            Setiap karya sastra, puisi, cerita pendek, pantun, dan catatan yang diterbitkan oleh penulis di platform Fadrodzak sepenuhnya tetap menjadi hak cipta milik pencipta/penulis aslinya. Fadrodzak hanya bertindak sebagai wadah publikasi dan apresiasi komunitas.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2A29] font-sans mb-2">3. Etika Komunitas & Tanggapan Santun</h2>
          <p>
            Komunitas Fadrodzak menjunjung tinggi etika kesantunan dan rasa saling menghargai. Pengguna dilarang mengunggah konten yang mengandung ujaran kebencian, pelecehan, plagiarisme karya orang lain, pornografi, atau konten yang melanggar hukum.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2A29] font-sans mb-2">4. Akun & Keamanan Sesi</h2>
          <p>
            Pengguna bertanggung jawab menjaga keamanan kredensial akun dan sesi mereka masing-masing. Fadrodzak berhak menangguhkan akun yang terindikasi melakukan penyalahgunaan atau spamming.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2A29] font-sans mb-2">5. Perubahan Layanan</h2>
          <p>
            Fadrodzak berhak memperbarui fitur, tampilan, maupun ketentuan ini sewaktu-waktu demi meningkatkan kenyamanan seluruh pegiat sastra.
          </p>
        </section>
      </div>
    </main>
  );
}
