import { MetadataRoute } from 'next';

const BASE_URL = 'https://fadrodzak.my.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/chat',
          '/chat/',
          '/profil/edit',
          '/tulis',
          '/tulis/',
          '/tulis-buku',
          '/tulis-buku/',
          '/tulis-materi',
          '/tulis-materi/',
          '/notifikasi',
          '/login',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap_index.xml`,
    ],
    host: 'fadrodzak.my.id',
  };
}
