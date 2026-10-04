import 'server-only';

import pool from './db';

export type JenisXp =
  | 'publikasi_karya'
  | 'komentar'
  | 'like_diterima'
  | 'komentar_diterima'
  | 'ulasan_buku'
  | 'aktif_harian'
  | 'pilihan_redaksi'
  | 'tantangan';

type XpRule = {
  xp: number;
  batasHarian?: number;
};

export const XP_RULES: Record<
  JenisXp,
  XpRule
> = {
  publikasi_karya: {
    xp: 20,
    batasHarian: 60,
  },

  komentar: {
    xp: 3,
    batasHarian: 30,
  },

  like_diterima: {
    xp: 1,
    batasHarian: 30,
  },

  komentar_diterima: {
    xp: 2,
    batasHarian: 30,
  },

  ulasan_buku: {
    xp: 5,
    batasHarian: 25,
  },

  aktif_harian: {
    xp: 2,
    batasHarian: 2,
  },

  pilihan_redaksi: {
    xp: 50,
  },

  tantangan: {
    xp: 30,
  },
};

export async function berikanXp(
  userId: string,
  jenis: JenisXp,
  sourceId?: string,
  keterangan?: string
) {
  if (!userId) {
    return {
      success: false,
      awarded: false,
    };
  }

  const aturan =
    XP_RULES[jenis];

  const client =
    await pool.connect();

  try {
    await client.query('BEGIN');

    // Pastikan akun gamifikasi tersedia
    await client.query(
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

    // Kunci row agar transaksi XP tidak bertabrakan
    await client.query(
      `
      SELECT user_id
      FROM user_gamification
      WHERE user_id = $1
      FOR UPDATE
      `,
      [userId]
    );

    // Cegah pemberian XP dua kali
    // untuk objek yang sama
    if (sourceId) {
      const duplicate =
        await client.query(
          `
          SELECT id
          FROM xp_history
          WHERE
            user_id = $1
            AND jenis = $2
            AND source_id = $3
          LIMIT 1
          `,
          [
            userId,
            jenis,
            sourceId,
          ]
        );

      if (
        duplicate.rows.length > 0
      ) {
        await client.query(
          'ROLLBACK'
        );

        return {
          success: true,
          awarded: false,
          reason: 'duplicate',
        };
      }
    }

    let xpDiberikan =
      aturan.xp;

    // Batasi farming XP harian
    if (
      aturan.batasHarian
    ) {
      const hasilHariIni =
        await client.query(
          `
          SELECT
            COALESCE(
              SUM(jumlah_xp),
              0
            ) AS total

          FROM xp_history

          WHERE
            user_id = $1
            AND jenis = $2
            AND created_at >= CURRENT_DATE
            AND created_at <
              CURRENT_DATE
              + INTERVAL '1 day'
          `,
          [
            userId,
            jenis,
          ]
        );

      const xpHariIni =
        Number(
          hasilHariIni
            .rows[0]
            ?.total || 0
        );

      const sisa =
        aturan.batasHarian -
        xpHariIni;

      if (sisa <= 0) {
        await client.query(
          'ROLLBACK'
        );

        return {
          success: true,
          awarded: false,
          reason:
            'daily_limit',
        };
      }

      xpDiberikan =
        Math.min(
          aturan.xp,
          sisa
        );
    }

    // Catat riwayat XP
    await client.query(
      `
      INSERT INTO xp_history (
        user_id,
        jumlah_xp,
        jenis,
        keterangan,
        source_id
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      `,
      [
        userId,
        xpDiberikan,
        jenis,
        keterangan ?? null,
        sourceId ?? null,
      ]
    );

    // Tambah XP pengguna
    await client.query(
      `
      UPDATE user_gamification

      SET
        xp = xp + $1,
        updated_at =
          CURRENT_TIMESTAMP

      WHERE user_id = $2
      `,
      [
        xpDiberikan,
        userId,
      ]
    );

    await client.query(
      'COMMIT'
    );

    return {
      success: true,
      awarded: true,
      xp: xpDiberikan,
    };
  } catch (error) {
    await client.query(
      'ROLLBACK'
    );

    console.error(
      'Gagal memberikan XP:',
      error
    );

    return {
      success: false,
      awarded: false,
    };
  } finally {
    client.release();
  }
}