import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

/**
 * Konfigurasi Firebase Client
 * Menggunakan NEXT_PUBLIC_* agar aman diakses di browser.
 * Disediakan fallback mock config agar `next build` dan prerendering
 * tidak crash jika env belum terpasang di Vercel build phase.
 */
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoFallbackKeyForAIStudioPreview123',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fadrodzak-demo.firebaseapp.com',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'fadrodzak-demo',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fadrodzak-demo.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Inisialisasi Firebase App singleton di sisi browser
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const auth: Auth = getAuth(app);

// Provider Google Auth
const googleProvider = new GoogleAuthProvider();

// PENTING: Selalu munculkan pemilih akun Google agar multi-akun lancar
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, googleProvider };
