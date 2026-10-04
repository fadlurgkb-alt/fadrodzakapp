'use client';

import { useState, useEffect } from 'react';
import { Flame, Gift, Check, ChevronRight, X, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleItem {
  day: number;
  xp: number;
  reward: string;
  status: 'claimed' | 'ready' | 'locked';
  isCurrent: boolean;
}

interface LoginBeruntungData {
  streak_count: number;
  day: number;
  is_claimed_today: boolean;
  current_reward: {
    day: number;
    xp: number;
    reward: string;
  };
  schedule: ScheduleItem[];
}

export default function StreakWidget({ initialCount = 3 }: { initialCount?: number }) {
  const [data, setData] = useState<LoginBeruntungData>({
    streak_count: Math.max(initialCount, 3),
    day: 3,
    is_claimed_today: false,
    current_reward: {
      day: 3,
      xp: 40,
      reward: '🔥 Bonus Pena Nyala',
    },
    schedule: [
      { day: 1, xp: 15, reward: '🪶 Tinta Perunggu', status: 'claimed', isCurrent: false },
      { day: 2, xp: 25, reward: '📜 Inspirasi Aksara', status: 'claimed', isCurrent: false },
      { day: 3, xp: 40, reward: '🔥 Bonus Pena Nyala', status: 'ready', isCurrent: true },
      { day: 4, xp: 60, reward: '📖 Gulungan Puisi', status: 'locked', isCurrent: false },
      { day: 5, xp: 85, reward: '✨ Aksara Perak', status: 'locked', isCurrent: false },
      { day: 6, xp: 120, reward: '🌟 Apresiasi Redaksi', status: 'locked', isCurrent: false },
      { day: 7, xp: 250, reward: '🏆 Piala Maestro Sastra', status: 'locked', isCurrent: false },
    ],
  });

  const [isClaiming, setIsClaiming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  // Ambil sinkronisasi dari server
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/login-beruntung');
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.success) {
            setData({
              streak_count: Math.max(json.streak_count || 3, 3),
              day: json.day || 3,
              is_claimed_today: !!json.is_claimed_today,
              current_reward: json.current_reward || {
                day: 3,
                xp: 40,
                reward: '🔥 Bonus Pena Nyala',
              },
              schedule: json.schedule || [],
            });
          }
        }
      } catch (err) {
        console.warn('[StreakWidget] Sinkronisasi offline, menggunakan status hari ke-3:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClaimBonus = async () => {
    if (data.is_claimed_today || isClaiming) return;

    setIsClaiming(true);
    try {
      const res = await fetch('/api/login-beruntung', {
        method: 'POST',
      });
      const resJson = await res.json();

      if (res.ok && resJson.success) {
        // Konfeti perayaan sastra
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C85A32', '#F59E0B', '#FCD34D', '#7E2D11'],
        });

        setData((prev) => ({
          ...prev,
          is_claimed_today: true,
          schedule: prev.schedule.map((item) =>
            item.day === prev.day ? { ...item, status: 'claimed' } : item
          ),
        }));

        setClaimSuccessMessage(
          `Selamat! Anda memperoleh +${resJson.xp_awarded} XP & ${resJson.reward}!`
        );
      } else {
        setClaimSuccessMessage(resJson.error || 'Gagal mengklaim bonus.');
      }
    } catch {
      setClaimSuccessMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Gelar Pena Sastra berdasarkan jumlah streak
  const count = data.streak_count;
  let streakTitle = 'Pena Nyala';
  let flameColor = 'text-amber-500';
  let badgeBg = 'bg-amber-500/15 border-amber-500/40 text-amber-700';

  if (count >= 30) {
    streakTitle = 'Sang Maestro Aksara';
    flameColor = 'text-purple-600 animate-pulse';
    badgeBg = 'bg-purple-500/15 border-purple-500/40 text-purple-700';
  } else if (count >= 14) {
    streakTitle = 'Pujangga Tekun';
    flameColor = 'text-red-500';
    badgeBg = 'bg-red-500/15 border-red-500/40 text-red-700';
  } else if (count >= 7) {
    streakTitle = 'Pena Tak Padam';
    flameColor = 'text-orange-500';
    badgeBg = 'bg-orange-500/15 border-orange-500/40 text-orange-700';
  } else if (count >= 3) {
    streakTitle = 'Pena Nyala';
    flameColor = 'text-amber-500';
    badgeBg = 'bg-amber-500/15 border-amber-500/40 text-amber-700';
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-xs mb-8 space-y-4">
        {/* Bagian Utama: Status Streak Hari ke-3 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Ikon Api Nyala */}
            <div className="relative w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 flex items-center justify-center shadow-xs shrink-0">
              <Flame className={`w-7 h-7 ${flameColor}`} />
              <span className="absolute -bottom-1 -right-1 bg-[#C85A32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                {count}d
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                  {count} Hari Berturut-turut
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}
                >
                  {streakTitle}
                </span>
              </div>

              <p className="text-xs text-[#7A6B63] mt-0.5 font-serif">
                {data.is_claimed_today
                  ? '✨ Pena Tak Padam! Bonus login hari ke-3 sudah masuk ke akun Anda.'
                  : '🔥 Hadiah Login Beruntung Hari ke-3 siap Anda klaim hari ini!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {/* Tombol Klaim Cepat */}
            {!data.is_claimed_today ? (
              <button
                onClick={handleClaimBonus}
                disabled={isClaiming}
                className="px-3.5 py-2 bg-gradient-to-r from-[#C85A32] to-[#B0451F] hover:from-[#B0451F] hover:to-[#963412] text-white rounded-xl text-xs font-serif font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                {isClaiming ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Gift className="w-3.5 h-3.5" />
                )}
                <span>Klaim +{data.current_reward?.xp || 40} XP</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-serif font-medium rounded-xl border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                <span>Bonus Terklaim</span>
              </div>
            )}

            {/* Tombol Buka Kalender Bonus */}
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-serif font-medium transition cursor-pointer flex items-center gap-1"
              title="Lihat Jadwal Hadiah 7 Hari"
            >
              <span>Jadwal Bonus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner Mini Hadiah Hari ke-3 */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-900/10 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs font-serif">
          <div className="flex items-center gap-2 text-stone-700">
            <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>
              <strong>Login Beruntung:</strong> Mulai di <strong>Hari ke-3</strong> (Bonus:{' '}
              {data.current_reward?.reward || 'Pena Nyala'}). Pertahankan terus agar api penamu tak padam!
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-[#C85A32] font-bold hover:underline shrink-0 text-[11px]"
          >
            Lihat Semua Hadiah →
          </button>
        </div>
      </div>

      {/* Modal Kalender 7 Hari Hadiah Login Beruntung */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#FAF8F5] p-6 shadow-2xl border border-amber-900/15 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                    Hadiah Login Beruntung
                  </h3>
                  <p className="text-xs text-amber-900/70 font-serif">
                    Klaim bonus setiap hari untuk meningkatkan reputasi & XP sastramu!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setClaimSuccessMessage(null);
                }}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {claimSuccessMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-2xl font-serif flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{claimSuccessMessage}</span>
              </div>
            )}

            {/* Grid 7 Hari Hadiah */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {(data.schedule || []).map((item) => {
                const isClaimed = item.status === 'claimed';
                const isReady = item.status === 'ready';

                return (
                  <div
                    key={item.day}
                    className={`rounded-2xl p-3 border text-center font-serif flex flex-col justify-between transition-all ${
                      item.day === 7 ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300' : ''
                    } ${
                      isReady
                        ? 'bg-white border-[#C85A32] shadow-md ring-2 ring-[#C85A32]/20'
                        : isClaimed
                        ? 'bg-stone-100/70 border-stone-200 opacity-80'
                        : 'bg-white/80 border-amber-900/10'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">
                        Hari ke-{item.day}
                      </span>
                      <p className="text-xs font-bold text-[#2C2A29] mt-0.5">
                        +{item.xp} XP
                      </p>
                      <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-tight">
                        {item.reward}
                      </p>
                    </div>

                    <div className="mt-2.5">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">
                          <Check className="w-3 h-3" /> Terklaim
                        </span>
                      ) : isReady ? (
                        <button
                          onClick={handleClaimBonus}
                          disabled={isClaiming}
                          className="w-full py-1 bg-[#C85A32] hover:bg-[#B0451F] text-white text-[11px] font-bold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          {isClaiming ? 'Mengambil...' : 'Klaim'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          Terkunci
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setClaimSuccessMessage(null);
                }}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-serif font-medium transition cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
