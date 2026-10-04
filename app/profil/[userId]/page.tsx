import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';
import { formatWaktuRelatif, formatWaktuLengkap } from '@/lib/date';
import KaryaSnippetPreview from '@/components/KaryaSnippetPreview';
import { ArrowLeft, MessageSquare, BookOpen, Heart, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface KaryaItem {
  id: number;
  judul: string;
  kategori: string;
  isi_tulisan: string;
  created_at: string | Date;
}

interface UserProfileData {
  nama?: string;
  email?: string;
  foto_url?: string;
  status_badge?: string;
  bio?: string;
}

interface UserGamificationData {
  xp?: number;
  role?: string;
  is_donatur?: boolean;
  reputasi?: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const targetUserId = decodeURIComponent(resolvedParams.userId);

  try {
    const { rows } = await pool.query(
      'SELECT nama, bio, foto_url FROM profil_pengguna WHERE user_id = $1 LIMIT 1',
      [targetUserId]
    );
    const profile = rows[0];
    if (!profile) {
      return {
        title: 'Profil Penulis Tidak Ditemukan | Fadrodzak',
      };
    }

    const nama = profile.nama || 'Penulis Sastra';
    const pageTitle = `${nama} — Profil Penulis`;
    const description = `Lihat profil, karya sastra, lencana, dan perjalanan literasi ${nama} di Fadrodzak.`;
    const canonicalUrl = `${SITE_URL}/profil/${encodeURIComponent(targetUserId)}`;
    const imageUrl = profile.foto_url || `${SITE_URL}/pwa-512x512.png`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'profile',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} | Fadrodzak`,
        description,
        images: [
          {
            url: imageUrl,
            alt: `Foto profil ${nama}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} | Fadrodzak`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Profil Penulis',
    };
  }
}

async function startConversationAction(targetUserId: string) {
  'use server';
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  if (currentUser.uid === targetUserId) {
    return;
  }

  const existing = await pool.query(
    `SELECT m1.conversation_id 
     FROM conversation_members m1
     JOIN conversation_members m2 ON m1.conversation_id = m2.conversation_id
     WHERE m1.user_id = $1 AND m2.user_id = $2
     GROUP BY m1.conversation_id
     HAVING COUNT(m1.conversation_id) = 2`,
    [currentUser.uid, targetUserId]
  );

  let convId = 0;
  if (existing.rows.length > 0) {
    convId = existing.rows[0].conversation_id;
  } else {
    const client = await pool.connect();
    try {
      const convRes = await client.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
      convId = convRes.rows[0].id;
      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id, last_read_at) VALUES 
         ($1, $2, CURRENT_TIMESTAMP), 
         ($1, $3, CURRENT_TIMESTAMP)`,
        [convId, currentUser.uid, targetUserId]
      );
    } finally {
      client.release();
    }
  }

  redirect(`/chat/${convId}`);
}

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  const targetUserId = decodeURIComponent(resolvedParams.userId);

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.uid === targetUserId) {
    redirect('/profil');
  }

  let profileRows: UserProfileData[] = [];
  let gamificationRows: UserGamificationData[] = [];
  let karyaRows: KaryaItem[] = [];

  try {
    const [pRes, gRes, kRes] = await Promise.all([
      pool.query('SELECT * FROM profil_pengguna WHERE user_id = $1', [targetUserId]),
      pool.query('SELECT * FROM user_gamification WHERE user_id = $1', [targetUserId]),
      pool.query('SELECT * FROM karya WHERE user_id = $1 ORDER BY created_at DESC', [targetUserId]),
    ]);
    profileRows = (pRes.rows as UserProfileData[]) || [];
    gamificationRows = (gRes.rows as UserGamificationData[]) || [];
    karyaRows = (kRes.rows as KaryaItem[]) || [];
  } catch (err) {
    console.warn('[UserProfilePage] Notice membaca profil user lain:', err);
  }

  if (profileRows.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#2C2A29]">Profil Penulis Tidak Ditemukan</h2>
          <p className="text-amber-900/70 font-serif">Penulis ini belum mendaftar atau profil tidak tersedia.</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#C85A32] text-white rounded-xl text-sm font-medium hover:bg-[#b04d29] transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const profile = profileRows[0];
  const gamification = gamificationRows[0] || { xp: 0, role: 'user', is_donatur: false, reputasi: 0 };

  const jsonLdProfile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.nama || 'Penulis Sastra',
      description: profile.bio || 'Penulis di komunitas aksara Fadrodzak.',
      image: profile.foto_url || undefined,
      url: `${SITE_URL}/profil/${encodeURIComponent(targetUserId)}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProfile) }}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#C85A32] hover:underline font-serif"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda Sastra
          </Link>
          {currentUser && (
            <form action={async () => {
              'use server';
              await startConversationAction(targetUserId);
            }}>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-sm font-medium hover:bg-[#b04d29] transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Kirim Pesan
              </button>
            </form>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-amber-900/10 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-amber-100 to-amber-50" />
          
          <div className="relative pt-6 flex flex-col items-center">
            {profile.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.foto_url}
                alt={`Foto profil ${profile.nama || 'Penulis'}, anggota Fadrodzak`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-200/50 border-4 border-white shadow-md mb-4 flex items-center justify-center text-[#2C2A29] font-serif font-bold text-2xl">
                {profile.nama ? profile.nama.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
              </div>
            )}

            <h1 className="text-2xl font-serif font-bold text-[#2C2A29] mb-1">
              {profile.nama || 'Penulis Sastra'}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-amber-100 text-[#C85A32] px-3 py-1 rounded-full font-serif font-medium">
                {profile.status_badge || 'Pelajar Sastra'}
              </span>
              {gamification.role === 'admin' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-serif font-medium">
                  Pengurus Komunitas
                </span>
              )}
            </div>

            <p className="text-sm text-amber-900/80 font-serif max-w-md mx-auto mb-6">
              {profile.bio || 'Pena baru di ruang sastra Fadrodzak.'}
            </p>

            <div className="flex items-center justify-center gap-6 border-t border-amber-900/10 pt-4 w-full">
              <div className="flex items-center gap-2 text-sm text-amber-900/70 font-serif">
                <BookOpen className="w-4 h-4 text-[#C85A32]" />
                <span>{karyaRows.length} Karya</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-900/70 font-serif">
                <Heart className="w-4 h-4 text-[#C85A32]" />
                <span>{gamification.reputasi} Reputasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Works */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#2C2A29] px-1">
            Karya Terbitan {profile.nama}
          </h2>

          {karyaRows.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-amber-900/10 text-center">
              <p className="text-amber-900/60 font-serif text-sm">Penulis ini belum menerbitkan karya sastra.</p>
            </div>
          ) : (
            (karyaRows as KaryaItem[]).map((karya) => (
              <article
                key={karya.id}
                className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-xs hover:border-[#C85A32]/30 transition"
              >
                <div className="flex items-center justify-between text-xs text-amber-900/60 mb-2 font-serif">
                  <span className="text-[#C85A32] font-medium">{karya.kategori}</span>
                  <time
                    dateTime={karya.created_at ? new Date(karya.created_at).toISOString() : undefined}
                    className="hover:text-[#C85A32] transition"
                    title={formatWaktuLengkap(karya.created_at)}
                  >
                    {formatWaktuRelatif(karya.created_at)}
                  </time>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2C2A29] mb-2">
                  <Link href={`/karya/${karya.id}`} className="hover:text-[#C85A32] transition">
                    {karya.judul}
                  </Link>
                </h3>
                <KaryaSnippetPreview
                  isiTulisan={karya.isi_tulisan}
                  kategori={karya.kategori}
                  maxPoemLines={3}
                />
                <Link
                  href={`/karya/${karya.id}`}
                  className="text-xs font-serif font-bold text-[#C85A32] hover:underline"
                >
                  Baca Selengkapnya &rarr;
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
