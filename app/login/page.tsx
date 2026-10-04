'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import Link from 'next/link';
import FadrodzakLogo from '@/components/FadrodzakLogo';

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Mengirim ID token Firebase ke server Next.js untuk membuat session cookie
   */
  async function syncSession(idToken: string, userPayload?: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }) {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        user: userPayload,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal membuat sesi login di server.');
    }
  }

  /**
   * Login Google dengan Pemilih Akun (Multi-Account Support)
   */
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);

      await syncSession(idToken, {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });

      router.push('/profil');
      router.refresh();
    } catch (err: unknown) {
      console.error('[Login Google Error]:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login Google ditutup sebelum selesai.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Popup browser diblokir. Izinkan popup untuk login dengan Google.');
      } else {
        setErrorMsg((err as Error)?.message || 'Terjadi kendala saat login dengan Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login / Register Email & Password
   */
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!nama.trim()) {
          throw new Error('Nama pena wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Kata sandi minimal 6 karakter.');
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: nama.trim() });

        const idToken = await cred.user.getIdToken(true);
        await syncSession(idToken, {
          uid: cred.user.uid,
          displayName: nama.trim(),
          email: cred.user.email,
          photoURL: cred.user.photoURL,
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const idToken = await cred.user.getIdToken(true);

        await syncSession(idToken, {
          uid: cred.user.uid,
          displayName: cred.user.displayName,
          email: cred.user.email,
          photoURL: cred.user.photoURL,
        });
      }

      router.push('/profil');
      router.refresh();
    } catch (err: unknown) {
      console.error('[Email Auth Error]:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan login langsung.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak sesuai.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('Akun belum terdaftar. Silakan daftar akun baru.');
      } else {
        setErrorMsg((err as Error)?.message || 'Gagal memproses autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center p-4 font-sans text-[#2B2B2B]">
      <div className="max-w-md w-full bg-white border border-[#E8DEC0] rounded-2xl p-8 shadow-sm">
        {/* Brand Header & Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <FadrodzakLogo size="lg" variant="compact" showLink={true} className="justify-center mb-2" />
          <p className="text-xs font-serif italic text-[#736B63]">
            &ldquo;Tempat di mana kata-kata menemukan rumahnya&rdquo;
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tombol Login Google Utama */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-[#E0D8CC] rounded-xl hover:bg-[#FAF8F5] transition text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Menghubungkan Akun...' : 'Masuk dengan Akun Google'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8DEC0]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white px-3 text-[#A5958A] font-serif">atau via email</span>
          </div>
        </div>

        {/* Form Email / Sandi */}
        <form onSubmit={handleSubmitEmail} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
                Nama Pena
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none"
                placeholder="misal: Amir Hamzah"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none"
              placeholder="penulis@aksara.id"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#A94824] text-white rounded-xl font-medium transition text-sm shadow-xs disabled:opacity-50 font-serif cursor-pointer"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk ke Ruang Sastra'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#736B63]">
          {isRegister ? (
            <p>
              Sudah punya akun pena?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#C85A32] font-semibold hover:underline cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum terdaftar sebagai penulis?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-[#C85A32] font-semibold hover:underline cursor-pointer"
              >
                Buat akun sekarang
              </button>
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#E8DEC0]/60 text-center">
          <Link href="/" className="text-xs text-[#736B63] hover:text-[#2B2B2B] transition font-serif">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
