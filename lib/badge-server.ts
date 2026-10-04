import 'server-only';

import pool from './db';

export async function beriBadge(
  userId: string,
  kodeBadge: string
) {
  if (!userId) {
    return {
      success: false,
    };
  }

  try {
    const badge =
      await pool.query(
        `
        SELECT id
        FROM badges
        WHERE kode = $1
        LIMIT 1
        `,
        [kodeBadge]
      );

    if (
      badge.rows.length === 0
    ) {
      return {
        success: false,
      };
    }

    const badgeId =
      badge.rows[0].id;

    await pool.query(
      `
      INSERT INTO user_badges (
        user_id,
        badge_id
      )

      VALUES ($1, $2)

      ON CONFLICT (
        user_id,
        badge_id
      )
      DO NOTHING
      `,
      [
        userId,
        badgeId,
      ]
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      'Gagal memberikan badge:',
      error
    );

    return {
      success: false,
    };
  }
}