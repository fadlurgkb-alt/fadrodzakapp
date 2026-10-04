import pool from '../../../lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCurrentUser } from '../../../lib/auth-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Profil Pengguna',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProfilPage() {
  // 1. Verifikasi User Login
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn('[EditProfil] Notice membaca sesi:', err);
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto pb-24 font-sans text-[#2B2B2B]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8DEC0]/80">
          <Link
            href="/profil"
            className="text-xs sm:text-sm font-serif text-[#C85A32] hover:underline flex items-center gap-1.5"
          >
            <span>&larr;</span> Kembali ke Profil
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8DEC0] p-8 text-center shadow-xs">
          <h1 className="text-xl font-serif font-bold text-[#2B2B2B] mb-2">
            Masuk untuk Menyunting Profil
          </h1>
          <p className="text-xs text-[#736B63] font-serif mb-6">
            Anda perlu masuk ke akun terlebih dahulu sebelum dapat mengubah nama pena, foto, atau bio.
          </p>
          <Link
            href="/login"
            className="inline-flex px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-serif font-bold shadow-xs hover:bg-[#A94824] transition"
          >
            Masuk ke Akun &rarr;
          </Link>
        </div>
      </main>
    );
  }

  const firebaseUid = currentUser.uid;

  // 2. Ambil data profil eksisting milik user aktif
  let profil = {
    nama: currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Penulis Sastra'),
    email: currentUser.email || '',
    foto_url: currentUser.picture || '',
    status_badge: 'Pelajar Sastra',
    bio: 'Pena baru di ruang sastra Fadrodzak.',
    link_donasi: '',
  };

  try {
    const { rows } = await pool.query(
      `SELECT user_id, email, nama, foto_url, status_badge, bio, link_donasi
       FROM profil_pengguna
       WHERE user_id = $1
       LIMIT 1`,
      [firebaseUid]
    );

    if (rows && rows.length > 0) {
      profil = {
        nama: rows[0].nama || profil.nama,
        email: rows[0].email || profil.email,
        foto_url: rows[0].foto_url || profil.foto_url,
        status_badge: rows[0].status_badge || profil.status_badge,
        bio: rows[0].bio || '',
        link_donasi: rows[0].link_donasi || '',
      };
    }
  } catch (err) {
    console.warn('[EditProfil] Notice membaca profil pengguna:', err);
  }

  // 3. Server Action Simpan Profil
  async function simpanProfil(formData: FormData) {
    'use server';

    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      redirect('/login');
    }

    const uid = sessionUser.uid;
    const nama = String(formData.get('nama') || '').trim();
    const fotoUrl = String(formData.get('foto_url') || '').trim();
    const statusBadge = String(formData.get('status_badge') || 'Pelajar Sastra').trim();
    const bio = String(formData.get('bio') || '').trim();
    const linkDonasi = String(formData.get('link_donasi') || '').trim();

    if (!nama) {
      throw new Error('Nama pena wajib diisi.');
    }

    try {
      await pool.query(
        `INSERT INTO profil_pengguna (user_id, email, nama, foto_url, status_badge, bio, link_donasi)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO UPDATE SET
           nama = EXCLUDED.nama,
           foto_url = EXCLUDED.foto_url,
           status_badge = EXCLUDED.status_badge,
           bio = EXCLUDED.bio,
           link_donasi = EXCLUDED.link_donasi`,
        [uid, sessionUser.email || '', nama, fotoUrl, statusBadge, bio, linkDonasi]
      );
    } catch (saveErr) {
      console.warn('[EditProfil] Standard upsert notice, trying UPDATE/INSERT fallback:', saveErr);
      try {
        const updateRes = await pool.query(
          `UPDATE profil_pengguna SET nama = $1, foto_url = $2, status_badge = $3, bio = $4, link_donasi = $5, email = $6 WHERE user_id = $7`,
          [nama, fotoUrl, statusBadge, bio, linkDonasi, sessionUser.email || '', uid]
        );
        if (updateRes.rowCount === 0) {
          await pool.query(
            `INSERT INTO profil_pengguna (user_id, email, nama, foto_url, status_badge, bio, link_donasi) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [uid, sessionUser.email || '', nama, fotoUrl, statusBadge, bio, linkDonasi]
          );
        }
      } catch (fallbackErr) {
        console.error('[EditProfil] Gagal menyimpan data profil:', fallbackErr);
      }
    }

    revalidatePath('/profil');
    revalidatePath('/profil/edit');
    redirect('/profil');
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto pb-24 font-sans text-[#2B2B2B]">
      {/* Header Navigasi */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8DEC0]/80">
        <Link
          href="/profil"
          className="text-xs sm:text-sm font-serif text-[#C85A32] hover:underline flex items-center gap-1.5"
        >
          <span>&larr;</span> Kembali ke Profil Saya
        </Link>
        <span className="text-xs font-serif text-[#736B63]">
          Pengaturan Identitas Pena
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8DEC0] p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-[#2B2B2B]">
            Sunting Profil Penulis
          </h1>
          <p className="text-xs text-[#736B63] font-serif mt-1">
            Data ini akan tampil di samping karya dan halaman apresiasi sastra Anda.
          </p>
        </div>

        <form action={simpanProfil} className="space-y-5">
          {/* Email Akun (Readonly) */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Akun Terverifikasi
            </label>
            <input
              type="text"
              disabled
              value={profil.email || '(Masuk via Akun Google)'}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] bg-[#FAF8F5] text-sm text-[#736B63] font-mono cursor-not-allowed"
            />
          </div>

          {/* Nama Pena */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Nama Pena / Nama Lengkap <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              name="nama"
              required
              defaultValue={profil.nama}
              placeholder="misal: Sapardi Djoko Damono"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif"
            />
          </div>

          {/* URL Foto Profil */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              URL Foto Profil (Avatar)
            </label>
            <input
              type="url"
              name="foto_url"
              defaultValue={profil.foto_url}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-mono"
            />
            <p className="text-[11px] text-[#A5958A] mt-1 font-serif">
              Otomatis terisi dari Google saat pertama kali masuk, atau gunakan tautan gambar Anda sendiri.
            </p>
          </div>

          {/* Status Penulis */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Gelar / Status Aksara
            </label>
            <select
              name="status_badge"
              defaultValue={profil.status_badge}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif"
            >
              <option value="Pelajar Sastra">Pelajar Sastra</option>
              <option value="Pencinta Aksara">Pencinta Aksara</option>
              <option value="Penikmat Puisi">Penikmat Puisi</option>
              <option value="Penenun Sajak">Penenun Sajak</option>
              <option value="Penulis Cerpen">Penulis Cerpen</option>
              <option value="Sastrawan Muda">Sastrawan Muda</option>
              <option value="Pujangga Kelana">Pujangga Kelana</option>
            </select>
          </div>

          {/* Bio Sastra */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Biografi Singkat
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={profil.bio}
              placeholder="Ceritakan ketertarikan Anda pada sastra, gaya tulisan, atau kutipan favorit..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif"
            />
          </div>

          {/* Link Donasi / Trakteer */}
          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Tautan Dukungan (Trakteer / Saweria / KaryaKarsa)
            </label>
            <input
              type="url"
              name="link_donasi"
              defaultValue={profil.link_donasi}
              placeholder="https://trakteer.id/ahmad_rahman7/tip"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-mono"
            />
            <p className="text-[11px] text-[#A5958A] mt-1 font-serif">
              Beri kesempatan bagi pembaca untuk mengirimkan kopi apresiasi atas karya Anda.
            </p>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8DEC0]/80">
            <Link
              href="/profil"
              className="px-4 py-2 rounded-xl text-xs font-serif text-[#736B63] hover:text-[#2B2B2B] transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94824] text-white text-xs font-serif font-bold shadow-sm transition cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
