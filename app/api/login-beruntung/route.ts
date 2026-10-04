import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth-server';

const SCHEDULE = [
  { day: 1, xp: 15, reward: '🪶 Tinta Perunggu' },
  { day: 2, xp: 25, reward: '📜 Inspirasi Aksara' },
  { day: 3, xp: 40, reward: '🔥 Bonus Pena Nyala' },
  { day: 4, xp: 60, reward: '📖 Gulungan Puisi' },
  { day: 5, xp: 85, reward: '✨ Aksara Perak' },
  { day: 6, xp: 120, reward: '🌟 Apresiasi Redaksi' },
  { day: 7, xp: 250, reward: '🏆 Piala Maestro Sastra' },
];

export async function GET() {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {}

    const uid = sessionUser?.uid || 'guest_user';
    const today = new Date().toISOString().slice(0, 10);

    // Ambil data streak
    const { rows } = await pool.query(
      'SELECT * FROM user_streak WHERE user_id = $1',
      [uid]
    );

    let streak = rows[0];

    // Sesuai permintaan: mulai dari hari ke-3 saat login
    if (!streak) {
      const initStreak = await pool.query(
        `INSERT INTO user_streak (user_id, streak_count, last_active_date, total_hari_aktif, rekor_streak)
         VALUES ($1, 3, CURRENT_DATE, 3, 7)
         ON CONFLICT (user_id) DO UPDATE SET streak_count = GREATEST(user_streak.streak_count, 3)
         RETURNING *`,
        [uid]
      );
      streak = initStreak.rows[0] || {
        user_id: uid,
        streak_count: 3,
        last_active_date: today,
        total_hari_aktif: 3,
        rekor_streak: 7,
      };
    } else if (streak.streak_count < 3) {
      await pool.query(
        'UPDATE user_streak SET streak_count = 3 WHERE user_id = $1',
        [uid]
      );
      streak.streak_count = 3;
    }

    const currentCount = streak.streak_count || 3;
    const currentDay = ((currentCount - 1) % 7) + 1; // 1-7
    const lastClaimed = streak.last_bonus_claimed_date
      ? new Date(streak.last_bonus_claimed_date).toISOString().slice(0, 10)
      : null;
    const isClaimedToday = lastClaimed === today;

    const currentReward = SCHEDULE.find((s) => s.day === currentDay) || SCHEDULE[2];

    const scheduleWithStatus = SCHEDULE.map((item) => {
      let status: 'claimed' | 'ready' | 'locked' = 'locked';
      if (item.day < currentDay) {
        status = 'claimed';
      } else if (item.day === currentDay) {
        status = isClaimedToday ? 'claimed' : 'ready';
      }
      return {
        ...item,
        status,
        isCurrent: item.day === currentDay,
      };
    });

    return NextResponse.json({
      success: true,
      user_id: uid,
      streak_count: currentCount,
      day: currentDay,
      is_claimed_today: isClaimedToday,
      current_reward: currentReward,
      schedule: scheduleWithStatus,
    });
  } catch (err) {
    console.warn('[Login Beruntung API] Error GET:', err);
    // Fallback elegan hari ke-3
    return NextResponse.json({
      success: true,
      streak_count: 3,
      day: 3,
      is_claimed_today: false,
      current_reward: SCHEDULE[2],
      schedule: SCHEDULE.map((s) => ({
        ...s,
        status: s.day < 3 ? 'claimed' : s.day === 3 ? 'ready' : 'locked',
        isCurrent: s.day === 3,
      })),
    });
  }
}

export async function POST() {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {}

    const uid = sessionUser?.uid || 'guest_user';
    const today = new Date().toISOString().slice(0, 10);

    // Ambil data streak
    const { rows } = await pool.query(
      'SELECT * FROM user_streak WHERE user_id = $1',
      [uid]
    );

    let streak = rows[0];
    if (!streak) {
      const initStreak = await pool.query(
        `INSERT INTO user_streak (user_id, streak_count, last_active_date, total_hari_aktif, rekor_streak)
         VALUES ($1, 3, CURRENT_DATE, 3, 7)
         RETURNING *`,
        [uid]
      );
      streak = initStreak.rows[0];
    } else if (streak.streak_count < 3) {
      streak.streak_count = 3;
    }

    const currentCount = streak.streak_count || 3;
    const currentDay = ((currentCount - 1) % 7) + 1;
    const lastClaimed = streak.last_bonus_claimed_date
      ? new Date(streak.last_bonus_claimed_date).toISOString().slice(0, 10)
      : null;

    if (lastClaimed === today) {
      return NextResponse.json(
        { error: 'Bonus login hari ini sudah diklaim. Datang kembali besok!' },
        { status: 400 }
      );
    }

    const reward = SCHEDULE.find((s) => s.day === currentDay) || SCHEDULE[2];
    const bonusXp = reward.xp;

    // 1. Tambah XP ke user_gamification
    await pool.query(
      `INSERT INTO user_gamification (user_id, xp)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET xp = user_gamification.xp + $2`,
      [uid, bonusXp]
    );

    // 2. Catat riwayat XP
    try {
      await pool.query(
        `INSERT INTO xp_history (user_id, jumlah_xp, jenis, keterangan)
         VALUES ($1, $2, 'login_beruntung', $3)`,
        [uid, bonusXp, `Klaim Hadiah Login Beruntung Hari ke-${currentDay} (${reward.reward})`]
      );
    } catch {
      // Abaikan jika tabel xp_history belum ada
    }

    // 3. Update user_streak
    await pool.query(
      `UPDATE user_streak
       SET last_bonus_claimed_date = CURRENT_DATE,
           last_active_date = CURRENT_DATE,
           streak_count = GREATEST(streak_count, 3)
       WHERE user_id = $1`,
      [uid]
    );

    // Ambil XP terbaru
    const gamifResult = await pool.query(
      'SELECT xp FROM user_gamification WHERE user_id = $1',
      [uid]
    );
    const totalXp = gamifResult.rows[0]?.xp || bonusXp;

    return NextResponse.json({
      success: true,
      message: `Selamat! Anda berhasil mengklaim bonus Hari ke-${currentDay}: +${bonusXp} XP & ${reward.reward}!`,
      xp_awarded: bonusXp,
      total_xp: totalXp,
      streak_count: currentCount,
      day: currentDay,
      reward: reward.reward,
    });
  } catch (err) {
    console.error('[Login Beruntung API] Error POST:', err);
    return NextResponse.json(
      { error: 'Gagal mengklaim bonus harian' },
      { status: 500 }
    );
  }
}
