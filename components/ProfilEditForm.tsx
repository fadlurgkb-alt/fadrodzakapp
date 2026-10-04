'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Upload, Camera, Coffee, AlertCircle } from 'lucide-react';

interface ProfilData {
  nama: string;
  email: string;
  foto_url: string;
  status_badge: string;
  bio: string;
  link_donasi: string;
}

interface Props {
  initialProfil: ProfilData;
  simpanProfilAction: (formData: FormData) => Promise<void>;
}

export default function ProfilEditForm({ initialProfil, simpanProfilAction }: Props) {
  const [fotoUrl, setFotoUrl] = useState(initialProfil.foto_url || '');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kompresi foto avatar menjadi maks 400x400px JPEG berkualitas tinggi ~25-45KB
  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(String(e.target?.result || ''));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = String(e.target?.result || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih berkas gambar (JPG, PNG, atau WebP).');
      return;
    }
    setUploadLoading(true);
    setUploadError(null);
    try {
      const compressedDataUrl = await compressAvatar(file);
      setFotoUrl(compressedDataUrl);
    } catch {
      setUploadError('Gagal memproses foto. Silakan coba berkas gambar lain.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <form
      action={async (formData: FormData) => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
          await simpanProfilAction(formData);
        } catch (err: unknown) {
          setIsSubmitting(false);
          const errMsg = (err as Error)?.message || '';
          if (
            errMsg.includes('NEXT_REDIRECT') ||
            (err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')
          ) {
            throw err;
          }
          console.error('[ProfilEdit] Error saat menyimpan profil:', err);
          setSubmitError('Terjadi kendala saat memperbarui profil. Silakan coba lagi.');
        }
      }}
      className="space-y-6"
    >
      {/* Pesan Kesalahan jika ada */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-serif flex items-center justify-between gap-3 shadow-xs">
          <span>⚠️ {submitError}</span>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. Pratinjau & Unggah Foto Profil (Avatar) */}
      <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E8DEC0] flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group shrink-0">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoUrl}
              alt="Foto Profil"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-3 border-[#C85A32] shadow-md"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF0E6] text-[#C85A32] font-serif font-bold text-3xl flex items-center justify-center border-3 border-[#C85A32]/40 shadow-sm">
              {initialProfil.nama ? initialProfil.nama.charAt(0).toUpperCase() : '✍️'}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#C85A32] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#A8451D] transition">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              name="foto_file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarFileSelected}
              className="sr-only"
            />
          </label>
        </div>

        <div className="flex-1 w-full space-y-2 text-center sm:text-left">
          <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider font-serif">
            Foto Profil / Avatar Penulis
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DECBC0] hover:border-[#C85A32] hover:text-[#C85A32] text-xs font-serif font-bold cursor-pointer transition shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah dari Perangkat</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileSelected}
                className="sr-only"
              />
            </label>
            {fotoUrl && (
              <button
                type="button"
                onClick={() => setFotoUrl('')}
                className="px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-red-500 text-xs font-serif transition"
              >
                Hapus Foto
              </button>
            )}
          </div>
          {uploadLoading && (
            <p className="text-[11px] text-[#C85A32] font-serif animate-pulse">
              ⏳ Mengoptimalkan foto profil...
            </p>
          )}
          {uploadError && (
            <p className="text-[11px] text-red-600 font-serif flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {uploadError}
            </p>
          )}

          {/* Opsi masukkan URL langsung */}
          <div className="pt-1">
            <input
              type="text"
              placeholder="Atau tempel tautan URL gambar (https://...)"
              value={fotoUrl.startsWith('data:') ? '' : fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#DECBC0] bg-white text-xs font-mono outline-none focus:border-[#C85A32]"
            />
          </div>
          <input type="hidden" name="foto_url" value={fotoUrl} />
        </div>
      </div>

      {/* 2. Email Akun (Readonly) */}
      <div>
        <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
          Akun Terverifikasi
        </label>
        <input
          type="text"
          disabled
          value={initialProfil.email || '(Masuk via Akun Google)'}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] bg-[#FAF8F5] text-sm text-[#736B63] font-mono cursor-not-allowed"
        />
      </div>

      {/* 3. Nama Pena */}
      <div>
        <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
          Nama Pena / Nama Lengkap <span className="text-[#C85A32]">*</span>
        </label>
        <input
          type="text"
          name="nama"
          required
          defaultValue={initialProfil.nama}
          placeholder="misal: Sapardi Djoko Damono"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif"
        />
      </div>

      {/* 4. Status Penulis */}
      <div>
        <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
          Gelar / Status Aksara
        </label>
        <select
          name="status_badge"
          defaultValue={initialProfil.status_badge}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif cursor-pointer"
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

      {/* 5. Bio Sastra */}
      <div>
        <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif">
          Biografi Singkat
        </label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={initialProfil.bio}
          placeholder="Ceritakan ketertarikan Anda pada sastra, gaya tulisan, atau kutipan favorit..."
          className="w-full px-4 py-2.5 rounded-xl border border-[#E0D8CC] focus:ring-2 focus:ring-[#C85A32] bg-[#FAF8F5] text-sm outline-none font-serif"
        />
      </div>

      {/* 6. Link Donasi / Trakteer */}
      <div>
        <label className="block text-xs font-semibold text-[#736B63] uppercase tracking-wider mb-1.5 font-serif flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5 text-[#C85A32]" />
          Tautan Dukungan (Trakteer / Saweria / KaryaKarsa)
        </label>
        <input
          type="url"
          name="link_donasi"
          defaultValue={initialProfil.link_donasi}
          placeholder="https://trakteer.id/nama_anda/tip atau https://saweria.co/nama_anda"
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
          className="px-4 py-2.5 rounded-xl text-xs font-serif text-[#736B63] hover:text-[#2B2B2B] transition"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A94824] text-white text-xs font-serif font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
