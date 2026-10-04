'use server';

import pool from '../../lib/db';
import { revalidatePath } from 'next/cache';

type BookData = {
  google_books_id?: string | null;
  isbn_13?: string | null;
  judul: string;
  penulis: string;
  penerbit: string;
  jumlah_halaman: number;
  genre: string;
  sinopsis: string;
  gambar_url: string;
};

export async function simpanBukuOtomatis(
  bookData: BookData
) {
  try {
    await pool.query(
      `
      INSERT INTO buku (
        google_books_id,
        isbn_13,
        judul,
        penulis,
        penerbit,
        jumlah_halaman,
        genre,
        sinopsis,
        gambar_url
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9
      )

      ON CONFLICT (google_books_id)
      DO UPDATE SET
        isbn_13 = EXCLUDED.isbn_13,
        judul = EXCLUDED.judul,
        penulis = EXCLUDED.penulis,
        penerbit = EXCLUDED.penerbit,
        jumlah_halaman = EXCLUDED.jumlah_halaman,
        genre = EXCLUDED.genre,
        sinopsis = EXCLUDED.sinopsis,
        gambar_url = EXCLUDED.gambar_url
      `,
      [
        bookData.google_books_id ?? null,
        bookData.isbn_13 ?? null,
        bookData.judul,
        bookData.penulis,
        bookData.penerbit,
        bookData.jumlah_halaman,
        bookData.genre,
        bookData.sinopsis,
        bookData.gambar_url,
      ]
    );

    revalidatePath('/book-corner');

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      'ERROR SIMPAN BUKU:',
      error
    );

    return {
      success: false,
      error:
        'Database gagal menyimpan buku.',
    };
  }
}