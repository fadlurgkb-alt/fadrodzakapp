import pool from '../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';
import { IconBuku } from '../../components/NavIcons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book Corner — Katalog Buku & Rekomendasi Sastra',
  description:
    'Temukan katalog sastra pilihan, sinopsis buku, dan rekomendasi karya literatur Indonesia terbaik di Book Corner Fadrodzak.',
  alternates: {
    canonical: `${SITE_URL}/book-corner`,
  },
  openGraph: {
    title: 'Book Corner — Katalog Buku & Rekomendasi Sastra | Fadrodzak',
    description:
      'Temukan katalog sastra pilihan, sinopsis buku, dan rekomendasi karya literatur Indonesia terbaik di Book Corner Fadrodzak.',
    url: `${SITE_URL}/book-corner`,
    type: 'website',
  },
};

type Book = {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  jumlah_halaman: number | null;
  genre: string | null;
  sinopsis: string | null;
  gambar_url: string | null;
};

export default async function BookCorner() {
  let rows: Book[] = [];
  try {
    const res = await pool.query<Book>(
      `
      SELECT *
      FROM buku
      ORDER BY created_at DESC
      `
    );
    rows = res.rows || [];
  } catch (err) {
    console.warn('[BookCorner] Query buku error handled:', err);
    rows = [];
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-24 bg-[#FAF8F5]">

      <header className="text-center mb-10 mt-4">
        <div className="flex justify-center mb-2">
          <IconBuku size={40} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] mb-2">
          Book Corner Fadrodzak
        </h1>

        <p className="text-[#8E8E8E] text-sm italic font-serif">
          Katalog Sastra Pilihan & Ulasan Pembaca
        </p>
      </header>

      <div className="space-y-6">

        {rows.length === 0 ? (

          <p className="text-center text-gray-400 italic">
            Belum ada buku di katalog.
          </p>

        ) : (

          rows.map((book) => (

            <article
              key={book.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-[#EAEAEA] flex flex-col md:flex-row gap-6"
            >

              {book.gambar_url ? (

                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.gambar_url}
                  alt={`Sampul buku ${book.judul} karya ${book.penulis}`}
                  className="w-32 h-48 object-cover rounded-xl shadow-md mx-auto md:mx-0"
                />

              ) : (

                <div className="w-32 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm text-center mx-auto md:mx-0">
                  Sampul tidak tersedia
                </div>

              )}

              <div className="flex-1">

                <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
                  {book.judul}
                </h2>

                <p className="text-sm text-terracotta font-medium mb-3">
                  {book.penulis}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">

                  <span className="bg-[#FAF8F5] px-2 py-1 rounded border border-gray-200">
                    Penerbit:{' '}
                    {book.penerbit ||
                      'Tidak diketahui'}
                  </span>

                  <span className="bg-[#FAF8F5] px-2 py-1 rounded border border-gray-200">
                    {book.jumlah_halaman ||
                      '?'}{' '}
                    Halaman
                  </span>

                  <span className="bg-[#FAF8F5] px-2 py-1 rounded border border-gray-200">
                    Genre:{' '}
                    {book.genre ||
                      'Umum'}
                  </span>

                </div>

                <p className="text-[14px] text-[#555555] font-serif leading-relaxed line-clamp-3 mb-4">
                  {book.sinopsis ||
                    'Sinopsis belum tersedia.'}
                </p>

                <Link
                  href={`/book-corner/${book.id}`}
                  className="text-ink-muted text-sm hover:text-terracotta transition font-bold flex gap-2"
                >
                  <span>⭐</span>

                  Lihat Rating & Ulasan Pembaca
                  <span>→</span>
                </Link>

              </div>

            </article>

          ))

        )}

      </div>
    </main>
  );
}