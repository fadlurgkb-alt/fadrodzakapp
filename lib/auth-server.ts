import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './firebase-admin';

export const SESSION_COOKIE_NAME = 'fadrodzak_session';

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  picture: string;
  [key: string]: unknown;
}

/**
 * Mengambil data user yang sedang login dari HTTP-only session cookie.
 * Mengembalikan null jika pengguna belum login atau session tidak valid / expired.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!session) {
      return null;
    }

    const verified = await adminAuth.verifySessionCookie(session, false);
    if (!verified || !verified.uid) {
      return null;
    }

    const uid = String(verified.uid);
    const email = verified.email ? String(verified.email) : '';
    const name = verified.name
      ? String(verified.name)
      : (email ? email.split('@')[0] : 'Penulis Sastra');
    const picture = verified.picture ? String(verified.picture) : '';

    return {
      ...verified,
      uid,
      email,
      name,
      picture,
    };
  } catch (error) {
    console.warn('[Auth Server] Gagal memverifikasi session cookie:', error);
    return null;
  }
}

/**
 * Memastikan user sudah login. Jika belum, otomatis redirect ke /login.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
