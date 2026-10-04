import pool from '../../lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tulis Materi Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TulisMateriAdmin() {
  async function simpanMateri(formData: FormData) {
    'use server';
    const judul = formData.get('judul') as string;
    const isi = formData.get('isi_materi') as string;

    await pool.query(
      'INSERT INTO tutorial (judul, kategori, isi_materi, penulis, waktu_baca) VALUES ($1, $2, $3, $4, $5)',
      [judul, 'Materi', isi, 'Fadhil (Admin)', '5 mnt baca']
    );
    
    revalidatePath('/belajar');
    redirect('/belajar');
  }

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto pb-24">
      <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 font-bold text-center">
        🔒 JALUR RAHASIA ADMIN
      </div>
      
      <form action={simpanMateri} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <label className="text-sm font-bold block mb-2">Judul Materi</label>
          <input type="text" name="judul" required className="w-full border rounded-xl p-3 outline-none" placeholder="Tulis judul..." />
        </div>
        <div>
          <label className="text-sm font-bold block mb-2">Isi Materi</label>
          <textarea name="isi_materi" required rows={6} className="w-full border rounded-xl p-3 outline-none" placeholder="Tulis materi di sini..."></textarea>
        </div>
        <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">
          Terbitkan Materi
        </button>
      </form>
    </main>
  );
}