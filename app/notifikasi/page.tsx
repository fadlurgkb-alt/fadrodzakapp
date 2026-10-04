import pool from '../../lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { formatWaktuRelatif, formatWaktuLengkap } from '../../lib/date';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Notifikasi & Aktivitas Sastra',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotifikasiPage() {
  const { rows: notifs } = await pool.query('SELECT * FROM notifikasi ORDER BY created_at DESC LIMIT 20');

  return (
    <main className="min-h-screen p-6 max-w-xl mx-auto pb-24 bg-[#FAF8F5]">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#7A6B63] hover:text-[#C45A2C] font-serif mb-4 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Beranda
      </Link>

      <h1 className="text-2xl font-serif font-bold mb-6 text-[#2C2C2C]">🔔 Aktivitas & Notifikasi</h1>

      <div className="space-y-4">
        {notifs.length === 0 ? (
          <p className="text-center text-gray-400 italic">Belum ada notifikasi aktivitas.</p>
        ) : (
          notifs.map((n) => (
            <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAEAEA] flex items-center gap-4">
              <div className="text-2xl">
                {n.tipe === 'like' ? '❤️' : '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2C2C2C]">{n.pesan}</p>
                <time
                  dateTime={n.created_at ? new Date(n.created_at).toISOString() : undefined}
                  className="text-[11px] text-gray-400 font-serif"
                  title={formatWaktuLengkap(n.created_at)}
                >
                  {formatWaktuRelatif(n.created_at)}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}