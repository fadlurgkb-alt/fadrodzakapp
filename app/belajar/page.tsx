import pool from '../../lib/db';
import BelajarTabsClient from './BelajarTabsClient';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';
import { ArrowLeft } from 'lucide-react';
import { IconBelajar } from '../../components/NavIcons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Belajar Menulis & Bedah Karya Sastra',
  description:
    'Belajar menulis puisi, cerpen, pantun, dan perdalam wawasan sastra Indonesia bersama klinik bedah karya mingguan serta mentor sastra di Fadrodzak.',
  alternates: {
    canonical: `${SITE_URL}/belajar`,
  },
  openGraph: {
    title: 'Belajar Menulis & Bedah Karya Sastra | Fadrodzak',
    description:
      'Belajar menulis puisi, cerpen, pantun, dan perdalam wawasan sastra Indonesia bersama klinik bedah karya mingguan serta mentor sastra di Fadrodzak.',
    url: `${SITE_URL}/belajar`,
    type: 'website',
  },
};

export default async function BelajarPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = (resolvedParams?.tab === 'materi' ? 'materi' : 'bedah') as 'materi' | 'bedah';

  let tutorials = [];
  let bedahList = [];

  try {
    const [tutRes, bedahRes] = await Promise.all([
      pool.query('SELECT * FROM tutorial ORDER BY created_at DESC'),
      pool.query('SELECT * FROM bedah_karya ORDER BY created_at DESC'),
    ]);
    tutorials = tutRes.rows || [];
    bedahList = bedahRes.rows || [];
  } catch (err) {
    console.warn('[Belajar] Gagal mengambil data belajar/bedah karya:', err);
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto pb-24">
      {/* Tombol Navigasi Kembali */}
      <div className="mb-4 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#C45A2C] text-xs sm:text-sm font-serif font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <header className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C45A2C]/10 text-[#C45A2C] text-xs font-serif font-bold mb-2">
          <IconBelajar size={16} />
          Akademi & Komunitas Literasi
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2C2C2C]">
          Ruang Belajar & Bedah Karya
        </h1>
        <p className="text-[#7A6B63] text-xs sm:text-sm mt-1 font-serif max-w-md mx-auto">
          Asah kematangan menulismu bersama arahan mentor sastra dan bedah karya anggota setiap pekan.
        </p>
      </header>

      {/* Komponen Tab Dinamis */}
      <BelajarTabsClient
        tutorials={tutorials}
        bedahList={bedahList}
        initialTab={activeTab}
      />
    </main>
  );
}
