import pool from '../lib/db';
import Link from 'next/link';
import { Suspense } from 'react';
import NotificationModal from '../components/NotificationModal';
import LoginButton from '../components/LoginButton';
import DailyLiteraryGreeting from '../components/DailyLiteraryGreeting';
import DailyPromptWidget from '../components/DailyPromptWidget';
import HeroBanner from '../components/HeroBanner';
import FadrodzakLogo from '../components/FadrodzakLogo';
import PWAInstallButton from '../components/PWAInstallButton';
import { SearchProvider } from '../components/SearchContext';
import HeaderSearchBar from '../components/HeaderSearchBar';
import KaryaSearchFeed, { KaryaRow } from '../components/KaryaSearchFeed';
import { getCurrentUser } from '../lib/auth-server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function handleLike(formData: FormData) {
  'use server';

  const karyaId = Number(formData.get('karyaId'));
  if (!Number.isInteger(karyaId) || karyaId <= 0) return;

  let sessionUser = null;
  try {
    sessionUser = await getCurrentUser();
  } catch {}

  const nama = sessionUser?.name || 'Pembaca Sastra';
  const email = sessionUser?.email || '';

  // 1. Catat ke tabel likes
  await pool.query(
    'INSERT INTO likes (karya_id, nama_pengguna, user_email) VALUES ($1, $2, $3)',
    [karyaId, nama, email]
  );

  // 2. Sinkronkan jumlah_suka pada tabel karya
  await pool.query(
    'UPDATE karya SET jumlah_suka = COALESCE(jumlah_suka, 0) + 1 WHERE id = $1',
    [karyaId]
  );

  revalidatePath('/');
  revalidatePath(`/karya/${karyaId}`);
  revalidatePath('/profil');
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ kategori?: string; q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const kategoriAktif = resolvedSearchParams?.kategori || 'Semua';
  const initialQuery = resolvedSearchParams?.q || '';

  const baseQuery = `
    SELECT
      k.*,
      GREATEST(
        COALESCE(k.jumlah_suka, 0),
        COALESCE((SELECT COUNT(*)::int FROM likes l WHERE l.karya_id = k.id), 0)
      ) AS total_likes,
      GREATEST(
        COALESCE(k.jumlah_komentar, 0),
        COALESCE((SELECT COUNT(*)::int FROM komentar c WHERE c.karya_id = k.id), 0)
      ) AS total_komentar
    FROM karya k
  `;

  let karyas = [];
  try {
    if (kategoriAktif === 'Semua') {
      const { rows } = await pool.query(`${baseQuery} ORDER BY k.created_at DESC`);
      karyas = rows;
    } else if (
      kategoriAktif.toLowerCase().includes('novel') ||
      kategoriAktif.toLowerCase().includes('cerbung')
    ) {
      const { rows } = await pool.query(
        `${baseQuery} WHERE (k.kategori ILIKE '%novel%' OR k.kategori ILIKE '%cerbung%' OR k.kategori ILIKE '%cerita bersambung%') ORDER BY k.created_at DESC`
      );
      karyas = rows;
    } else {
      const { rows } = await pool.query(
        `${baseQuery} WHERE k.kategori = $1 ORDER BY k.created_at DESC`,
        [kategoriAktif]
      );
      karyas = rows;
    }
  } catch (err) {
    console.warn('[Home] Query karyas fallback:', err);
    karyas = [];
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 max-w-4xl mx-auto flex items-center justify-center font-serif text-[#7A6B63]">
          Memuat beranda sastra Fadrodzak...
        </div>
      }
    >
      <SearchProvider initialQuery={initialQuery}>
        <main className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto pb-24">
          {/* Header Utama Fadrodzak dengan Pencarian Cerdas Terintegrasi */}
          <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-6 border-b border-[#E8DEC0]/80 pb-4">
            <FadrodzakLogo size="md" variant="compact" showLink={true} />

            {/* Kolom Pencarian Header: Filter Judul, Penulis, & Cuplikan Bait */}
            <div className="order-3 sm:order-none w-full sm:w-auto flex-1 max-w-sm sm:mx-3">
              <HeaderSearchBar />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <NotificationModal />
              <LoginButton />
            </div>
          </header>

          {/* Banner Pasang Aplikasi PWA (Satu-satunya tombol unduh aplikasi) */}
          <div className="mb-6">
            <PWAInstallButton variant="banner" />
          </div>

          {/* Banner Judul & Identitas Brand Fadrodzak */}
          <HeroBanner />

          {/* 1. Sapaan Aksara Harian (Daily Quote & 1-Klik Share Story IG/WA) */}
          <DailyLiteraryGreeting />

          {/* 2. Kalender Tantangan Harian (Daily Prompt) */}
          <DailyPromptWidget />

          {/* Bagian Kurasi & Eksplorasi Karya */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[11px] font-bold text-[#C45A2C] uppercase tracking-widest">
                  Ruang Baca & Apresiasi
                </p>
                <h2 className="text-xl sm:text-2xl font-serif text-[#2C2C2C] font-bold">
                  Karya Terbaru Anggota Komunitas
                </h2>
              </div>
              <Link
                href="/belajar"
                className="text-xs font-serif text-[#C45A2C] hover:underline font-bold hidden sm:inline"
              >
                Lihat Bedah Karya Mingguan &rarr;
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-[#7A6B63] font-serif">
              Telusuri karya berdasarkan judul, nama penulis, maupun cuplikan bait sastra Nusantara melalui kolom pencarian di header.
            </p>
          </section>

          {/* Feed Eksplorasi Karya dengan Filter Real-time & Cuplikan Bait */}
          <KaryaSearchFeed
            initialKaryas={karyas as KaryaRow[]}
            kategoriAktif={kategoriAktif}
            onLikeAction={handleLike}
          />
        </main>
      </SearchProvider>
    </Suspense>
  );
}
