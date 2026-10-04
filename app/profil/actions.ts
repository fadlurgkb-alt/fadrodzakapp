'use server';

import pool from '../../lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../../lib/auth-server';

// Fungsi mengambil data karya
export async function getKaryaProfil() {
  try {
    const { rows } = await pool.query('SELECT * FROM karya ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('getKaryaProfil failed:', error);
    return [];
  }
}

// Fungsi menghapus data karya berdasarkan ID
export async function hapusKarya(id: number) {
  try {
    await pool.query('DELETE FROM karya WHERE id = $1', [id]);
    revalidatePath('/profil');
    revalidatePath('/');
  } catch (error) {
    console.error('hapusKarya failed:', error);
  }
}

// Server Action untuk form hapus karya
export async function hapusKaryaAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  const id = formData.get('id');
  if (!id) return;

  try {
    if (currentUser?.uid) {
      await pool.query('DELETE FROM karya WHERE id = $1 AND (user_id = $2 OR user_id IS NULL OR user_id = $3)', [
        Number(id),
        currentUser.uid,
        'guest_user',
      ]);
    } else {
      await pool.query('DELETE FROM karya WHERE id = $1', [Number(id)]);
    }
    revalidatePath('/profil');
    revalidatePath('/');
  } catch (error) {
    console.error('hapusKaryaAction failed:', error);
  }
}
