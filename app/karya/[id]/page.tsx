import pool from '../../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { revalidatePath } from 'next/cache';
import ReadingExperience from '../../../components/ReadingExperience';
import NovelShowcaseCard from '../../../components/NovelShowcaseCard';
import { ReaksiTipe } from '../../../components/ApresiasiMikro';
import { getCurrentUser } from '../../../lib/auth-server';
import { eventKomentar } from '../../../lib/gamification-events';
import { cleanTextSnippet, SITE_URL } from '../../../lib/seo';
import { formatWaktuRelatif, formatWaktuLengkap } from '../../../lib/date';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const idAngka = Number.parseInt(resolvedParams.id, 10);
  if (!Number.isInteger(idAngka) || idAngka <= 0) {
    return {
      title: 'Karya Sastra Tidak Ditemukan',
    };
  }

  try {
    const { rows } = await pool.query('SELECT * FROM karya WHERE id = $1 LIMIT 1', [idAngka]);
    const karya = rows[0];
    if (!karya) {
      return {
        title: 'Karya Sastra Tidak Ditemukan',
      };
    }

    const pageTitle = `${karya.judul} — ${karya.nama_pengguna}`;
    const snippet = cleanTextSnippet(karya.isi_tulisan, 155);
    const description =
      snippet ||
      `Baca karya ${karya.judul} oleh ${karya.nama_pengguna} di Fadrodzak, ruang sastra dan komunitas aksara.`;
    const canonicalUrl = `${SITE_URL}/karya/${karya.id}`;
    const imageUrl = karya.gambar_url || `${SITE_URL}/pwa-512x512.png`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'article',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} | Fadrodzak`,
        description,
        publishedTime: karya.created_at ? new Date(karya.created_at).toISOString() : undefined,
        authors: [karya.nama_pengguna],
        images: [
          {
            url: imageUrl,
            alt: `Karya ${karya.judul} oleh ${karya.nama_pengguna}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} | Fadrodzak`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Karya Sastra',
    };
  }
}

async function tambahApresiasiAction(karyaId: number, tipe: ReaksiTipe) {
  'use server';
  if (!Number.isInteger(karyaId) || karyaId <= 0) return;

  let sessionUser = null;
  try {
    sessionUser = await getCurrentUser();
  } catch {}

  const uid = sessionUser?.uid || 'guest_user';
  const nama = sessionUser?.name || 'Pembaca Sastra';

  await pool.query(
    'INSERT INTO reaksi_sastra (karya_id, tipe_reaksi, user_id, nama_pengguna) VALUES ($1, $2, $3, $4)',
    [karyaId, tipe, uid, nama]
  );

  // Juga catat ke tabel likes umum dan sinkronkan jumlah_suka pada karya
  await pool.query(
    'INSERT INTO likes (karya_id, nama_pengguna) VALUES ($1, $2)',
    [karyaId, nama]
  );
  await pool.query(
    'UPDATE karya SET jumlah_suka = COALESCE(jumlah_suka, 0) + 1 WHERE id = $1',
    [karyaId]
  );

  revalidatePath('/');
  revalidatePath(`/karya/${karyaId}`);
  revalidatePath('/profil');
}

async function tambahLikeAction(formData: FormData) {
  'use server';
  const karyaId = Number(formData.get('karyaId'));
  if (!Number.isInteger(karyaId) || karyaId <= 0) return;

  let sessionUser = null;
  try {
    sessionUser = await getCurrentUser();
  } catch {}

  const nama = sessionUser?.name || 'Pembaca Sastra';
  const email = sessionUser?.email || '';

  await pool.query(
    'INSERT INTO likes (karya_id, nama_pengguna, user_email) VALUES ($1, $2, $3)',
    [karyaId, nama, email]
  );
  await pool.query(
    'UPDATE karya SET jumlah_suka = COALESCE(jumlah_suka, 0) + 1 WHERE id = $1',
    [karyaId]
  );

  revalidatePath('/');
  revalidatePath(`/karya/${karyaId}`);
  revalidatePath('/profil');
}

async function tambahTafsirAction(formData: FormData) {
  'use server';

  const karyaId = Number(formData.get('karyaId'));
  const baitIndex = Number(formData.get('baitIndex') || 0);
  const potonganBait = String(formData.get('potonganBait') || '');
  const namaPengguna = String(formData.get('namaPengguna') || 'Pembaca').trim();
  const isiTafsir = String(formData.get('isiTafsir') || '').trim();

  if (!Number.isInteger(karyaId) || karyaId <= 0 || !isiTafsir) return;

  let sessionUser = null;
  try {
    sessionUser = await getCurrentUser();
  } catch {}

  const uid = sessionUser?.uid || 'guest_user';

  await pool.query(
    'INSERT INTO tafsir_bait (karya_id, bait_index, potongan_bait, nama_pengguna, user_id, isi_tafsir) VALUES ($1, $2, $3, $4, $5, $6)',
    [karyaId, baitIndex, potonganBait, namaPengguna, uid, isiTafsir]
  );

  revalidatePath(`/karya/${karyaId}`);
}

async function tambahKomentar(formData: FormData) {
  'use server';

  const karyaId = Number(formData.get('karyaId'));
  const namaPengguna = String(formData.get('nama_pengguna') || '').trim();
  const isiKomentar = String(formData.get('isi_komentar') || '').trim();

  if (!Number.isInteger(karyaId) || karyaId <= 0 || !namaPengguna || !isiKomentar) {
    return;
  }

  let sessionUser = null;
  try {
    sessionUser = await getCurrentUser();
  } catch {}

  const uid = sessionUser?.uid || null;

  const insertRes = await pool.query(
    `INSERT INTO komentar (karya_id, nama_pengguna, isi_komentar)
     VALUES ($1, $2, $3) RETURNING id`,
    [karyaId, namaPengguna.slice(0, 255), isiKomentar]
  );

  // Sinkronkan jumlah_komentar pada karya
  await pool.query(
    'UPDATE karya SET jumlah_komentar = COALESCE(jumlah_komentar, 0) + 1 WHERE id = $1',
    [karyaId]
  );

  // Berikan XP gamifikasi jika pengguna login
  const komentarId = insertRes.rows[0]?.id;
  if (uid && komentarId) {
    try {
      await eventKomentar(uid, komentarId);
    } catch (gamifyErr) {
      console.warn('[Gamification] Gagal memberikan XP komentar:', gamifyErr);
    }
  }

  revalidatePath('/');
  revalidatePath(`/karya/${karyaId}`);
  revalidatePath('/profil');
}

export default async function DetailKarya({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idAngka = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isInteger(idAngka) || idAngka <= 0) {
    return <div className="p-6 text-center text-red-500 font-serif mt-20">Karya tidak ditemukan.</div>;
  }

  const [
    { rows: karyaRows },
    { rows: komentarRows },
    { rows: likeRows },
    { rows: reaksiRows },
    { rows: tafsirRows },
  ] = await Promise.all([
    pool.query('SELECT * FROM karya WHERE id = $1', [idAngka]),
    pool.query('SELECT * FROM komentar WHERE karya_id = $1 ORDER BY created_at DESC', [idAngka]),
    pool.query('SELECT COUNT(*)::int AS total FROM likes WHERE karya_id = $1', [idAngka]),
    pool.query(
      'SELECT tipe_reaksi, COUNT(*)::int as count FROM reaksi_sastra WHERE karya_id = $1 GROUP BY tipe_reaksi',
      [idAngka]
    ),
    pool.query(
      'SELECT * FROM tafsir_bait WHERE karya_id = $1 ORDER BY created_at DESC',
      [idAngka]
    ),
  ]);

  const karya = karyaRows[0];
  if (!karya) {
    return <div className="p-6 text-center text-red-500 font-serif mt-20">Karya tidak ditemukan.</div>;
  }

  // Sinkronisasi mutlak: ambil nilai terbesar antara counter karya dan baris tabel likes/komentar
  const totalLikes = Math.max(karya.jumlah_suka || 0, likeRows[0]?.total ?? 0);
  const totalKomentar = Math.max(karya.jumlah_komentar || 0, komentarRows.length);

  // Ambil bab-bab lain dalam seri cerita yang sama (untuk navigasi Wattpad)
  let siblingChapters: Array<{
    id: number;
    judul: string;
    nomor_bab?: number | null;
    judul_bab?: string | null;
    created_at?: string | Date;
    sinopsis?: string | null;
    gambar_url?: string | null;
    link_trakteer?: string | null;
    genre?: string | null;
    status_cerita?: string | null;
  }> = [];

  const isCerita =
    (karya.kategori || '').toLowerCase().includes('novel') ||
    (karya.kategori || '').toLowerCase().includes('cerbung') ||
    (karya.kategori || '').toLowerCase().includes('cerita') ||
    Boolean(karya.nama_cerita);

  if (isCerita) {
    try {
      const cleanSeriesTitle =
        karya.nama_cerita ||
        (karya.judul.includes('— Bab') ? karya.judul.split('— Bab')[0].trim() : karya.judul);
      const { rows: siblings } = await pool.query(
        `SELECT id, judul, nomor_bab, judul_bab, created_at, sinopsis, gambar_url, link_trakteer, genre, status_cerita
         FROM karya 
         WHERE (nama_cerita = $1 OR nama_cerita = $2 OR judul = $1 OR judul = $2 OR id = $3)
         ORDER BY COALESCE(nomor_bab, 1) ASC, created_at ASC`,
        [karya.nama_cerita || '', cleanSeriesTitle, karya.id]
      );
      if (siblings && siblings.length > 0) {
        siblingChapters = siblings;
      }
    } catch {}

    // Pastikan jika siblingChapters kosong, karya saat ini tetap ada di daftar
    if (siblingChapters.length === 0) {
      siblingChapters = [
        {
          id: karya.id,
          judul: karya.judul,
          nomor_bab: karya.nomor_bab || 1,
          judul_bab: karya.judul_bab,
          created_at: karya.created_at,
          sinopsis: karya.sinopsis,
          gambar_url: karya.gambar_url,
          link_trakteer: karya.link_trakteer,
          genre: karya.genre,
          status_cerita: karya.status_cerita,
        },
      ];
    }
  }

  const effectiveCover =
    karya.gambar_url ||
    siblingChapters.find((s) => s.gambar_url)?.gambar_url ||
    null;
  const effectiveSinopsis =
    karya.sinopsis ||
    siblingChapters.find((s) => s.sinopsis)?.sinopsis ||
    null;
  const effectiveGenre =
    karya.genre ||
    siblingChapters.find((s) => s.genre)?.genre ||
    'Romansa';
  const effectiveStatus =
    karya.status_cerita ||
    siblingChapters.find((s) => s.status_cerita)?.status_cerita ||
    'Ongoing';
  const effectiveDonateLink =
    karya.link_trakteer ||
    siblingChapters.find((s) => s.link_trakteer)?.link_trakteer ||
    null;

  const currentChapterIdx = siblingChapters.findIndex((c) => c.id === karya.id);
  const prevChapter = currentChapterIdx > 0 ? siblingChapters[currentChapterIdx - 1] : null;
  const nextChapter =
    currentChapterIdx >= 0 && currentChapterIdx < siblingChapters.length - 1
      ? siblingChapters[currentChapterIdx + 1]
      : null;

  // Petakan hitungan reaksi sastra (tersentuh, membakar, hangat, memukau)
  const initialReaksiCounts: Record<string, number> = {
    tersentuh: 0,
    membakar: 0,
    hangat: 0,
    memukau: 0,
  };
  reaksiRows.forEach((r: { tipe_reaksi: string; count: number }) => {
    initialReaksiCounts[r.tipe_reaksi] = Number(r.count) || 0;
  });

  const jsonLdKarya = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/karya/${karya.id}`,
    },
    headline: karya.judul,
    description: cleanTextSnippet(karya.isi_tulisan, 200),
    articleSection: karya.kategori,
    author: {
      '@type': 'Person',
      name: karya.nama_pengguna,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Fadrodzak',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/pwa-512x512.png`,
      },
    },
    datePublished: karya.created_at ? new Date(karya.created_at).toISOString() : undefined,
    image: karya.gambar_url || `${SITE_URL}/pwa-512x512.png`,
  };

  return (
    <main className="min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdKarya) }}
      />
      {/* Tombol Kembali ke Beranda & Suka Cepat */}
      <div className="max-w-2xl mx-auto px-4 pt-6 flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#C85A32] text-xs sm:text-sm font-serif font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda Sastra
        </Link>

        <form action={tambahLikeAction}>
          <input type="hidden" name="karyaId" value={karya.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-amber-900/15 hover:border-red-300 text-xs font-serif text-stone-700 hover:text-red-600 transition shadow-2xs cursor-pointer group"
            title="Beri Suka / Love"
          >
            <span className="text-red-500 group-hover:scale-125 transition-transform">❤️</span>
            <span className="font-bold">{totalLikes}</span>
            <span className="text-stone-400 text-[11px]">Suka</span>
          </button>
        </form>
      </div>

      {/* 1. KARTU NOVEL & CERITA BERSAMBUNG PALING ATAS (Judul, Gambar, Dukung Kami, Premis Cerita, Genre, & Bab-Bab yang bisa diklik) */}
      {isCerita && (
        <NovelShowcaseCard
          currentKaryaId={karya.id}
          judul={karya.judul}
          penulis={karya.nama_pengguna}
          userId={karya.user_id}
          namaCerita={karya.nama_cerita}
          nomorBab={karya.nomor_bab}
          judulBab={karya.judul_bab}
          gambarUrl={effectiveCover}
          sinopsis={effectiveSinopsis}
          genre={effectiveGenre}
          statusCerita={effectiveStatus}
          linkTrakteer={effectiveDonateLink}
          createdAt={karya.created_at}
          siblingChapters={siblingChapters}
          totalLikes={totalLikes}
        />
      )}

      {/* 2. Pengalaman Membaca Imersif Naskah: Mode Zen, Suasana Latar, Highlight Quote, Tafsir Bait, Apresiasi Mikro, Navigasi Bab Wattpad */}
      <ReadingExperience
        karyaId={karya.id}
        judul={karya.judul}
        penulis={karya.nama_pengguna}
        kategori={karya.kategori}
        isiTulisan={karya.isi_tulisan}
        createdAt={karya.created_at}
        audioUrl={karya.audio_url || null}
        totalLikes={totalLikes}
        initialReaksiCounts={initialReaksiCounts}
        initialTafsirs={tafsirRows || []}
        onReactAction={tambahApresiasiAction}
        onKirimTafsir={tambahTafsirAction}
        nomorBab={karya.nomor_bab}
        judulBab={karya.judul_bab}
        namaCerita={karya.nama_cerita}
        sinopsis={effectiveSinopsis}
        statusCerita={effectiveStatus}
        siblingChapters={siblingChapters}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />

      {/* Kolom Diskusi & Komentar Santun Komunitas */}
      <section id="komentar" className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 scroll-mt-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#EAE0D3]">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-[#C85A32]" />
            <h2 className="text-xl font-serif font-bold text-[#2C2A29]">
              Ruang Diskusi Sastra ({totalKomentar})
            </h2>
          </div>
          <p className="text-xs text-[#7A6B63] font-serif mb-6">
            Berikan ulasan dan tanggapan apresiatif dengan etika santun dan bersahabat.
          </p>

          <form action={tambahKomentar} className="space-y-3 mb-8">
            <input type="hidden" name="karyaId" value={karya.id} />
            <input
              type="text"
              name="nama_pengguna"
              required
              maxLength={255}
              placeholder="Nama Pena Anda..."
              className="w-full text-xs sm:text-sm rounded-xl border border-[#DECBC0] px-4 py-2.5 outline-none focus:border-[#C45A2C] bg-white font-serif"
            />
            <textarea
              name="isi_komentar"
              required
              rows={3}
              placeholder="Tuliskan ulasan atau kesan mendalam Anda setelah membaca karya ini..."
              className="w-full text-xs sm:text-sm rounded-xl border border-[#DECBC0] px-4 py-2.5 outline-none focus:border-[#C45A2C] bg-white font-serif resize-y"
            />
            <button
              type="submit"
              className="bg-[#C45A2C] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold hover:bg-[#A8451D] transition shadow-xs"
            >
              Kirim Tanggapan
            </button>
          </form>

          <div className="space-y-4">
            {komentarRows.length === 0 ? (
              <p className="text-xs text-[#8E8E8E] italic font-serif py-4 text-center">
                Belum ada tanggapan umum. Jadilah yang pertama memberikan apresiasi.
              </p>
            ) : (
              komentarRows.map((komentar) => (
                <div key={komentar.id} className="border-t border-[#F0E6D8] pt-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-bold text-xs sm:text-sm text-[#2C2C2C] font-serif">
                      {komentar.nama_pengguna}
                    </p>
                    <time
                      dateTime={komentar.created_at ? new Date(komentar.created_at).toISOString() : undefined}
                      className="text-[11px] text-[#8E8E8E] font-serif hover:text-[#C85A32] transition"
                      title={formatWaktuLengkap(komentar.created_at)}
                    >
                      {formatWaktuRelatif(komentar.created_at)}
                    </time>
                  </div>
                  <p className="text-xs sm:text-sm text-[#555] font-serif whitespace-pre-wrap leading-relaxed">
                    {komentar.isi_komentar}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
