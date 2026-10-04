'use server';

import pool from '../../lib/db';

export async function getGamificationProfile(
  userId: string
) {
  if (!userId) {
    return null;
  }

  try {
    await pool.query(
      `
      INSERT INTO user_gamification (
        user_id,
        xp
      )

      VALUES ($1, 0)

      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [userId]
    );

    const gamification =
      await pool.query(
        `
        SELECT
          xp,
          role,
          is_donatur,
          reputasi

        FROM user_gamification

        WHERE user_id = $1

        LIMIT 1
        `,
        [userId]
      );

    if (
      gamification.rows.length ===
      0
    ) {
      return null;
    }

    const row =
      gamification.rows[0];

    const badges =
      await pool.query(
        `
        SELECT
          b.id,
          b.kode,
          b.nama,
          b.deskripsi,
          b.icon,
          b.rarity,
          ub.didapatkan_pada

        FROM user_badges ub

        JOIN badges b
          ON b.id =
          ub.badge_id

        WHERE
          ub.user_id = $1

        ORDER BY
          ub.didapatkan_pada DESC
        `,
        [userId]
      );

    return {
      xp:
        Number(row.xp) || 0,

      role:
        row.role || 'user',

      isDonatur:
        Boolean(
          row.is_donatur
        ),

      reputasi:
        Number(
          row.reputasi
        ) || 0,

      badges:
        badges.rows.map(
          (badge) => ({
            id:
              Number(
                badge.id
              ),

            kode:
              badge.kode,

            nama:
              badge.nama,

            deskripsi:
              badge.deskripsi,

            icon:
              badge.icon,

            rarity:
              badge.rarity,
          })
        ),
    };
  } catch (error) {
    console.error(
      'Gagal mengambil gamifikasi:',
      error
    );

    return null;
  }
}