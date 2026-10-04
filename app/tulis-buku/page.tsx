'use client';

import {
  useState,
  type FormEvent,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  simpanBukuOtomatis,
} from '../actions/buku';

type IndustryIdentifier = {
  type?: string;
  identifier?: string;
};

type ImageLinks = {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
};

type VolumeInfo = {
  title?: string;
  authors?: string[];
  publisher?: string;
  pageCount?: number;
  categories?: string[];
  description?: string;
  imageLinks?: ImageLinks;
  industryIdentifiers?: IndustryIdentifier[];
};

type GoogleBook = {
  id: string;
  volumeInfo: VolumeInfo;
};

type GoogleBooksResponse = {
  items?: GoogleBook[];
};

function TulisBukuAdmin() {
  const [query, setQuery] =
    useState('');

  const [
    hasilPencarian,
    setHasilPencarian,
  ] = useState<GoogleBook[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [
    sedangSimpan,
    setSedangSimpan,
  ] = useState<string | null>(null);

  const router = useRouter();

  async function cariBuku(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const pencarian =
      query.trim();

    if (!pencarian) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/books/search?q=${encodeURIComponent(
            pencarian
          )}`
        );

      const contentType =
        response.headers.get(
          'content-type'
        );

      if (
        !contentType ||
        !contentType.includes(
          'application/json'
        )
      ) {
        const text =
          await response.text();

        console.error(
          'Response bukan JSON:',
          text
        );

        throw new Error(
          `API internal bermasalah. Status: ${response.status}`
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Pencarian gagal: ${response.status}`
        );
      }

      const hasil =
        data as GoogleBooksResponse;

      if (
        hasil.items &&
        hasil.items.length > 0
      ) {
        setHasilPencarian(
          hasil.items
        );
      } else {
        setHasilPencarian([]);

        alert(
          'Buku tidak ditemukan.'
        );
      }
    } catch (error) {
      console.error(
        'Gagal mencari buku:',
        error
      );

      if (
        error instanceof Error
      ) {
        alert(
          `Gagal mencari buku: ${error.message}`
        );
      } else {
        alert(
          'Gagal mencari buku.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSimpan(
    buku: GoogleBook
  ) {
    setSedangSimpan(
      buku.id
    );

    try {
      const info =
        buku.volumeInfo;

      const isbn13 =
        info.industryIdentifiers?.find(
          (item) =>
            item.type ===
            'ISBN_13'
        )?.identifier ?? null;

      const gambar =
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.small ||
        info.imageLinks?.thumbnail ||
        '';

      const bookData = {
        google_books_id:
          buku.id,

        isbn_13:
          isbn13,

        judul:
          info.title ||
          'Tanpa Judul',

        penulis:
          info.authors?.join(
            ', '
          ) ||
          'Penulis Tidak Diketahui',

        penerbit:
          info.publisher ||
          'Penerbit Tidak Diketahui',

        jumlah_halaman:
          info.pageCount || 0,

        genre:
          info.categories?.[0] ||
          'Umum',

        sinopsis:
          info.description ||
          'Sinopsis belum tersedia untuk buku ini.',

        gambar_url:
          gambar.replace(
            'http:',
            'https:'
          ),
      };

      const hasil =
        await simpanBukuOtomatis(
          bookData
        );

      if (!hasil.success) {
        throw new Error(
          hasil.error ||
            'Database gagal menyimpan buku.'
        );
      }

      alert(
        `"${bookData.judul}" berhasil ditambahkan ke Book Corner.`
      );

      router.push(
        '/book-corner'
      );

      router.refresh();
    } catch (error) {
      console.error(
        'Gagal menyimpan buku:',
        error
      );

      if (
        error instanceof Error
      ) {
        alert(
          `Buku gagal disimpan: ${error.message}`
        );
      } else {
        alert(
          'Buku gagal disimpan.'
        );
      }
    } finally {
      setSedangSimpan(
        null
      );
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-24 bg-[#FAF8F5]">

      <div className="bg-amber-50 text-amber-900 p-4 rounded-xl mb-6 font-bold text-center border border-amber-200">
        🔍 MESIN PENCARI BUKU GOOGLE
      </div>

      <form
        onSubmit={cariBuku}
        className="flex gap-2 mb-8"
      >

        <input
          type="text"
          value={query}
          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }
          placeholder="Judul, penulis, atau ISBN..."
          className="flex-1 border border-[#EAEAEA] rounded-xl p-4 outline-none bg-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#2C2C2C] text-white px-6 rounded-xl font-bold disabled:opacity-50"
        >
          {loading
            ? 'Mencari...'
            : 'Cari Buku'}
        </button>

      </form>

      <div className="space-y-4">

        {hasilPencarian.map(
          (buku) => {

            const info =
              buku.volumeInfo;

            const gambar =
              info.imageLinks?.medium ||
              info.imageLinks?.small ||
              info.imageLinks?.thumbnail ||
              '';

            return (
              <div
                key={buku.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAEAEA] flex gap-4"
              >

                {gambar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      gambar.replace(
                        'http:',
                        'https:'
                      )
                    }
                    alt={
                      info.title ||
                      'Sampul buku'
                    }
                    className="w-24 h-36 object-cover rounded-lg bg-gray-100"
                  />
                ) : (
                  <div className="w-24 h-36 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 text-center p-2">
                    Tidak ada sampul
                  </div>
                )}

                <div className="flex-1">

                  <h3 className="font-bold text-lg text-[#2C2C2C] mb-1">
                    {info.title ||
                      'Tanpa Judul'}
                  </h3>

                  <p className="text-sm text-gray-600 mb-1">
                    {info.authors?.join(
                      ', '
                    ) ||
                      'Penulis Tidak Diketahui'}
                  </p>

                  <p className="text-xs text-gray-500 mb-2">
                    {info.publisher ||
                      'Penerbit tidak diketahui'}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">

                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {info.pageCount ||
                        '?'}{' '}
                      halaman
                    </span>

                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {info.categories?.[0] ||
                        'Umum'}
                    </span>

                  </div>

                  <button
                    type="button"
                    disabled={
                      sedangSimpan ===
                      buku.id
                    }
                    onClick={() =>
                      handleSimpan(
                        buku
                      )
                    }
                    className="bg-[#A44200] text-white text-sm font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {sedangSimpan ===
                    buku.id
                      ? 'Menyimpan...'
                      : '+ Simpan ke Katalog'}
                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

    </main>
  );
}

export default TulisBukuAdmin;