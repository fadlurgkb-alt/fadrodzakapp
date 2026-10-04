import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi pengguna platform sastra Fadrodzak mengenai perlindungan data akun, karya, dan privasi anggota komunitas.',
  alternates: {
    canonical: `${SITE_URL}/kebijakan-privasi`,
  },
  openGraph: {
    title: 'Kebijakan Privasi | Fadrodzak',
    description:
      'Kebijakan privasi pengguna platform sastra Fadrodzak mengenai perlindungan data akun, karya, dan privasi anggota komunitas.',
    url: `${SITE_URL}/kebijakan-privasi`,
    type: 'website',
  },
};

export default function KebijakanPrivasiPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-28 bg-[#FAF8F5]">
      <div className="mb-6">
        <Link href="/profil" className="text-xs text-gray-500 hover:text-terracotta transition font-serif flex items-center gap-1">
          &larr; Kembali ke Profil
        </Link>
      </div>

      <header className="mb-8">
        <span className="text-xs uppercase tracking-widest text-terracotta font-bold">Privasi</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C2C] mt-2 mb-1">Kebijakan Privasi</h1>
        <p className="text-xs text-gray-500 font-serif">Pembaruan Terakhir: 2026</p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#EAEAEA] space-y-6 text-[#444444] font-serif leading-relaxed text-sm">
        <section>
          <h2 className="font-bold text-base text-[#2C2C2C] font-sans mb-2">1. Informasi yang Kami Kumpulkan</h2>
          <p className="mb-2">Kami mengumpulkan informasi yang Anda berikan secara langsung saat berinteraksi di platform Fadrodzak:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Konten Pengguna:</strong> Judul karya, bait tulisan, ulasan, komentar, dan kategori karya sastra.</li>
            <li><strong>Data Profil:</strong> Nama pena/tampilan, deskripsi bio, tautan foto publik, dan tautan apresiasi donasi.</li>
            <li><strong>Data Interaksi:</strong> Catatan suka (*likes*) dan interaksi rating buku.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2C2C] font-sans mb-2">2. Penggunaan Informasi</h2>
          <p>Informasi yang terkumpul digunakan semata-mata untuk:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Menampilkan karya tulisan Anda kepada publik di website dan aplikasi seluler Fadrodzak.</li>
            <li>Menjaga sinkronisasi data tulisan, like, dan komentar antara aplikasi Android dan website.</li>
            <li>Meningkatkan stabilitas serta performa layanan platform literasi kami.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2C2C] font-sans mb-2">3. Keamanan & Pembagian Data</h2>
          <p>
            Kami <strong>tidak pernah menjual atau menyewakan</strong> data pribadi Anda kepada pihak ketiga mana pun. Data tersimpan secara aman di infrastruktur server basis data cloud terenkripsi.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-[#2C2C2C] font-sans mb-2">4. Hak Pengguna</h2>
          <p>
            Anda berhak memperbarui data profil Anda melalui halaman pengaturan profil atau menghapus karya yang telah Anda terbitkan secara mandiri kapan saja.
          </p>
        </section>
      </div>
    </main>
  );
}