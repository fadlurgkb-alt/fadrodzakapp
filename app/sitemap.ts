import { MetadataRoute } from 'next';
import pool from '../lib/db';

const BASE_URL = 'https://fadrodzak.my.id';

// Cache sitemap selama 1 jam (3600 detik) agar Googlebot menerima respons instan (<50ms)
// dan terhindar dari latency/timeout saat database serverless mengalami cold start.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Rute Statis Publik Utama
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/belajar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/book-corner`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tentang-kami`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/kontak`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/kebijakan-privasi`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/syarat-ketentuan`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 2. Rute Dinamis dari Database (dengan penanganan error tangguh)
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // A. Karya Sastra Publik
    const { rows: karyaRows } = await pool.query<{ id: number; created_at: string | Date }>(
      'SELECT id, created_at FROM karya ORDER BY created_at DESC LIMIT 500'
    );
    for (const karya of karyaRows || []) {
      if (karya?.id) {
        dynamicRoutes.push({
          url: `${BASE_URL}/karya/${karya.id}`,
          lastModified: karya.created_at ? new Date(karya.created_at) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Gagal memuat data karya publik:', err);
  }

  try {
    // B. Materi Belajar Sastra (Tutorial)
    const { rows: tutorialRows } = await pool.query<{ id: number; created_at: string | Date }>(
      'SELECT id, created_at FROM tutorial ORDER BY created_at DESC LIMIT 100'
    );
    for (const tutorial of tutorialRows || []) {
      if (tutorial?.id) {
        dynamicRoutes.push({
          url: `${BASE_URL}/belajar/${tutorial.id}`,
          lastModified: tutorial.created_at ? new Date(tutorial.created_at) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Gagal memuat data materi belajar:', err);
  }

  try {
    // C. Katalog Buku (Book Corner)
    const { rows: bookRows } = await pool.query<{ id: number; created_at: string | Date }>(
      'SELECT id, created_at FROM buku ORDER BY created_at DESC LIMIT 200'
    );
    for (const book of bookRows || []) {
      if (book?.id) {
        dynamicRoutes.push({
          url: `${BASE_URL}/book-corner/${book.id}`,
          lastModified: book.created_at ? new Date(book.created_at) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Gagal memuat data buku:', err);
  }

  try {
    // D. Profil Penulis Publik
    const { rows: userRows } = await pool.query<{ user_id: string; created_at: string | Date }>(
      `SELECT user_id, created_at 
       FROM profil_pengguna 
       WHERE user_id IS NOT NULL AND user_id != '' 
       ORDER BY created_at DESC LIMIT 200`
    );
    for (const user of userRows || []) {
      if (user?.user_id) {
        dynamicRoutes.push({
          url: `${BASE_URL}/profil/${encodeURIComponent(user.user_id)}`,
          lastModified: user.created_at ? new Date(user.created_at) : now,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Gagal memuat data profil publik:', err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
