import pool from '../../lib/db';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '../../lib/auth-server';
import { eventKaryaTerbit } from '../../lib/gamification-events';
import TulisKaryaForm from '../../components/TulisKaryaForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tulis Karya Sastra & Cerita Baru',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TulisKarya({
  searchParams,
}: {
  searchParams?: Promise<{ tema?: string; kategori?: string }>;
}) {
  const resolvedParams = await searchParams;
  const promptTema = resolvedParams?.tema ? decodeURIComponent(resolvedParams.tema) : '';
  const promptKategori = resolvedParams?.kategori ? decodeURIComponent(resolvedParams.kategori) : 'Puisi';

  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    console.warn('[Tulis] Error reading current user:', err);
  }

  // Jika belum login, arahkan ke halaman login
  if (!currentUser) {
    redirect('/login');
  }

  async function simpanKarya(formData: FormData) {
    'use server';

    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      redirect('/login');
    }

    const userId = sessionUser.uid;

    const judul = String(formData.get('judul') ?? '').trim();
    const kategori = String(formData.get('kategori') ?? '').trim();
    const isi_tulisan = String(formData.get('isi_tulisan') ?? '').trim();
    const nama_pengguna =
      String(formData.get('nama_pengguna') ?? '').trim() || sessionUser.name || 'Penulis Sastra';
    const status_penulis = String(
      formData.get('status_penulis') ?? 'Pelajar Sastra'
    ).trim();

    const linkTrakteerRaw = String(formData.get('link_trakteer') ?? '').trim();
    const link_trakteer = linkTrakteerRaw || null;

    // Field khusus Novel & Cerita Bersambung (Wattpad Style)
    const nomorBabRaw = formData.get('nomor_bab');
    const nomor_bab = nomorBabRaw ? parseInt(String(nomorBabRaw), 10) || 1 : null;
    const judul_bab = String(formData.get('judul_bab') ?? '').trim() || null;
    const nama_cerita = String(formData.get('nama_cerita') ?? '').trim() || null;
    const sinopsis = String(formData.get('sinopsis') ?? '').trim() || null;
    const status_cerita = String(formData.get('status_cerita') ?? 'Ongoing').trim();
    const genre = String(formData.get('genre') ?? 'Umum').trim() || 'Umum';

    // 1. Upload Gambar Sampul (Cover URL atau File Upload)
    const gambarUrlInput = String(formData.get('gambar_url') ?? '').trim();
    let gambarUrl: string | null = gambarUrlInput || null;

    if (!gambarUrl) {
      const gambar = formData.get('gambar');
      if (gambar instanceof File && gambar.size > 0) {
        try {
          const buffer = Buffer.from(await gambar.arrayBuffer());
          gambarUrl = `data:${gambar.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        } catch (imgErr) {
          console.warn('[Tulis] Peringatan membaca berkas gambar:', imgErr);
        }
      }
    }

    // 2. Upload Rekaman Audio Pembacaan Puisi / Voice Note (Opsional)
    const audio = formData.get('audio_rekaman');
    let audioUrl: string | null = null;

    if (audio instanceof File && audio.size > 0) {
      try {
        const audioBuffer = Buffer.from(await audio.arrayBuffer());
        audioUrl = `data:${audio.type || 'audio/webm'};base64,${audioBuffer.toString('base64')}`;
      } catch (audErr) {
        console.warn('[Tulis] Peringatan membaca rekaman audio:', audErr);
      }
    }

    // Validasi dasar
    if (!judul || !kategori || !isi_tulisan || !nama_pengguna) {
      redirect('/tulis?error=Semua+bidang+wajib+diisi');
    }

    // Simpan karya ke database (PostgreSQL / Neon & in-memory fallback)
    let karyaId: number | null = null;
    try {
      const insertRes = await pool.query(
        `
        INSERT INTO karya
        (
          judul,
          kategori,
          isi_tulisan,
          nama_pengguna,
          status_penulis,
          link_trakteer,
          gambar_url,
          audio_url,
          user_id,
          nomor_bab,
          judul_bab,
          nama_cerita,
          sinopsis,
          status_cerita,
          genre
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
        `,
        [
          judul,
          kategori,
          isi_tulisan,
          nama_pengguna,
          status_penulis,
          link_trakteer,
          gambarUrl,
          audioUrl,
          userId,
          nomor_bab,
          judul_bab,
          nama_cerita,
          sinopsis,
          status_cerita,
          genre,
        ]
      );

      karyaId = insertRes.rows[0]?.id;
    } catch (dbErr) {
      console.warn('[Tulis] Insert standar gagal, mencoba fallback schema query:', dbErr);
      try {
        const fallbackRes = await pool.query(
          `INSERT INTO karya
           (judul, kategori, isi_tulisan, nama_pengguna, status_penulis, link_trakteer, gambar_url, audio_url, user_id, nomor_bab, judul_bab, nama_cerita, sinopsis, status_cerita)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING id`,
          [
            judul,
            kategori,
            isi_tulisan,
            nama_pengguna,
            status_penulis,
            link_trakteer,
            gambarUrl,
            audioUrl,
            userId,
            nomor_bab,
            judul_bab,
            nama_cerita,
            sinopsis,
            status_cerita,
          ]
        );
        karyaId = fallbackRes.rows[0]?.id;
      } catch (fallbackErr) {
        console.error('[Tulis] Fatal gagal simpan karya ke database:', fallbackErr);
      }
    }

    if (userId && karyaId) {
      try {
        await eventKaryaTerbit(userId, karyaId);
      } catch (err) {
        console.warn('[Tulis] Gamification event notice:', err);
      }
    }

    if (karyaId) {
      redirect(`/karya/${karyaId}`);
    } else {
      redirect('/profil');
    }
  }

  return (
    <TulisKaryaForm
      initialTema={promptTema}
      initialKategori={promptKategori}
      defaultUserName={currentUser?.name || ''}
      simpanKaryaAction={simpanKarya}
    />
  );
}
