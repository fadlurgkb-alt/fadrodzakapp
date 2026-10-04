import pool from '../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cleanTextSnippet, SITE_URL } from '../../../lib/seo';

export const dynamic = 'force-dynamic';

type Book = {
  id: number;
  judul: string;
  penulis: string;
  penerbit: string | null;
  jumlah_halaman: number | null;
  genre: string | null;
  sinopsis: string | null;
  gambar_url: string | null;
  created_at?: string | Date;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return {
      title: 'Buku Tidak Ditemukan | Fadrodzak',
    };
  }

  try {
    const { rows } = await pool.query<Book>(
      'SELECT id, judul, penulis, sinopsis, gambar_url, created_at FROM buku WHERE id = $1 LIMIT 1',
      [bookId]
    );
    const book = rows[0];
    if (!book) {
      return {
        title: 'Buku Tidak Ditemukan | Fadrodzak',
      };
    }

    const pageTitle = `${book.judul} — ${book.penulis} | Book Corner`;
    const snippet = cleanTextSnippet(book.sinopsis, 155);
    const description =
      snippet ||
      `Ulasan, sinopsis, dan informasi buku ${book.judul} karya ${book.penulis} di katalog sastra Book Corner Fadrodzak.`;
    const canonicalUrl = `${SITE_URL}/book-corner/${book.id}`;
    const imageUrl = book.gambar_url || `${SITE_URL}/pwa-512x512.png`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'website',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} — Fadrodzak`,
        description,
        images: [
          {
            url: imageUrl,
            alt: `Sampul buku ${book.judul} karya ${book.penulis}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} — Fadrodzak`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Book Corner',
    };
  }
}

export default async function DetailBuku({
  params,
}: PageProps) {
  const { id } = await params;
  const bookId = Number(id);

  if (!Number.isInteger(bookId)) {
    notFound();
  }

  let book: Book | null = null;
  try {
    const { rows } = await pool.query<Book>(
      `
      SELECT
        id,
        judul,
        penulis,
        penerbit,
        jumlah_halaman,
        genre,
        sinopsis,
        gambar_url,
        created_at
      FROM buku
      WHERE id = $1
      LIMIT 1
      `,
      [bookId]
    );
    book = rows[0] || null;
  } catch (err) {
    console.warn('[BookDetail] Query error:', err);
  }

  if (!book) {
    notFound();
  }

  const jsonLdBook = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.judul,
    author: {
      '@type': 'Person',
      name: book.penulis,
    },
    publisher: book.penerbit
      ? {
          '@type': 'Organization',
          name: book.penerbit,
        }
      : undefined,
    numberOfPages: book.jumlah_halaman || undefined,
    genre: book.genre || undefined,
    description: cleanTextSnippet(book.sinopsis, 250),
    image: book.gambar_url || undefined,
    url: `${SITE_URL}/book-corner/${book.id}`,
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] p-6 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBook) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/book-corner"
          className="inline-block text-sm text-gray-500 mb-6 hover:text-[#A44200]"
        >
          &larr; Kembali ke Book Corner
        </Link>

        <article className="bg-white rounded-3xl border border-[#EAEAEA] shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {book.gambar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.gambar_url}
                alt={`Sampul buku ${book.judul} karya ${book.penulis}`}
                className="w-40 h-60 object-cover rounded-xl shadow-md mx-auto md:mx-0"
              />
            ) : (
              <div className="w-40 h-60 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm text-center mx-auto md:mx-0">
                Sampul tidak tersedia
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">
                {book.judul}
              </h1>

              <p className="text-[#A44200] font-medium mb-4">
                Karya: <strong className="font-semibold">{book.penulis}</strong>
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-5">
                <span className="bg-[#FAF8F5] border border-gray-200 px-3 py-2 rounded-lg">
                  Penerbit: {book.penerbit || 'Tidak diketahui'}
                </span>

                <span className="bg-[#FAF8F5] border border-gray-200 px-3 py-2 rounded-lg">
                  {book.jumlah_halaman || '?'} halaman
                </span>

                <span className="bg-[#FAF8F5] border border-gray-200 px-3 py-2 rounded-lg">
                  Genre: {book.genre || 'Sastra'}
                </span>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="font-serif text-xl font-bold text-[#2C2C2C] mb-3">
              Sinopsis
            </h2>

            <p className="text-[#555555] leading-relaxed whitespace-pre-line font-serif">
              {book.sinopsis || 'Sinopsis belum tersedia untuk judul ini.'}
            </p>
          </section>

          <section className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-[#2C2C2C] mb-3">
              Apresiasi Pembaca
            </h2>

            <div className="bg-[#FAF8F5] border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-sm font-serif">
                Buku ini terdaftar dalam katalog sastra Fadrodzak. Diskusikan dan rekomendasikan bacaan ini bersama komunitas.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
