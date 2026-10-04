import { Pool } from 'pg';

// Muat .env atau .env.local jika ada saat dijalankan via CLI
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    try {
      process.loadEnvFile('.env');
    } catch {
      // Abaikan jika tidak ada file .env lokal
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('[Migration Error] DATABASE_URL tidak ditemukan di environment variable.');
  console.error('Harap sediakan DATABASE_URL sebelum menjalankan migrasi.');
  process.exit(1);
}

const isLocal = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

// Inisialisasi pool khusus migrasi
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 2,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 10000,
  ...(isLocal && !DATABASE_URL.includes('sslmode=') ? { ssl: false } : {}),
});

const DDL_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS profil_pengguna (
    user_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    foto_url TEXT,
    status_badge TEXT DEFAULT 'Pelajar Sastra',
    bio TEXT,
    link_donasi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user_gamification (
    user_id TEXT PRIMARY KEY,
    xp INT DEFAULT 0,
    role TEXT DEFAULT 'user',
    is_donatur BOOLEAN DEFAULT FALSE,
    reputasi INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(50) UNIQUE,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    icon VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common'
  )`,
  `CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_id INT NOT NULL,
    didapatkan_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS xp_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    jumlah_xp INT NOT NULL,
    jenis VARCHAR(50) NOT NULL,
    keterangan TEXT,
    source_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS karya (
    id SERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori TEXT NOT NULL,
    isi_tulisan TEXT NOT NULL,
    nama_pengguna TEXT NOT NULL,
    status_penulis TEXT DEFAULT 'Pelajar Sastra',
    link_trakteer TEXT,
    gambar_url TEXT,
    audio_url TEXT,
    user_id TEXT,
    jumlah_suka INT DEFAULT 0,
    jumlah_komentar INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS user_id TEXT`,
  `ALTER TABLE profil_pengguna ADD COLUMN IF NOT EXISTS email TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_profil_pengguna_user_id ON profil_pengguna (user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification (user_id)`,
  `ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'`,
  `ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`,
  `ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS is_donatur BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS reputasi INT DEFAULT 0`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_user_badges_unique ON user_badges (user_id, badge_id)`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS status_penulis TEXT DEFAULT 'Pelajar Sastra'`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS link_trakteer TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS gambar_url TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS audio_url TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS jumlah_suka INT DEFAULT 0`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS jumlah_komentar INT DEFAULT 0`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS nomor_bab INT DEFAULT 1`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS judul_bab TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS nama_cerita TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS sinopsis TEXT`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS status_cerita TEXT DEFAULT 'Ongoing'`,
  `ALTER TABLE karya ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT 'Umum'`,
  `UPDATE karya SET kategori = 'Novel & Cerbung' WHERE kategori IN ('Novel', 'Cerita Bersambung', 'Catatan Sastra')`,
  `CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    karya_id INT NOT NULL,
    nama_pengguna TEXT,
    user_email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS komentar (
    id SERIAL PRIMARY KEY,
    karya_id INT NOT NULL,
    nama_pengguna TEXT NOT NULL,
    isi_komentar TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS tutorial (
    id SERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'Materi',
    isi_materi TEXT NOT NULL,
    penulis VARCHAR(100) DEFAULT 'Admin',
    waktu_baca VARCHAR(50) DEFAULT '5 mnt baca',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS buku (
    id SERIAL PRIMARY KEY,
    google_books_id TEXT,
    isbn_13 TEXT,
    judul TEXT NOT NULL,
    penulis TEXT NOT NULL,
    penerbit TEXT,
    jumlah_halaman INT,
    genre TEXT,
    sinopsis TEXT,
    gambar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notifikasi (
    id SERIAL PRIMARY KEY,
    tipe VARCHAR(50),
    pesan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reaksi_sastra (
    id SERIAL PRIMARY KEY,
    karya_id INT NOT NULL,
    tipe_reaksi VARCHAR(30) NOT NULL,
    user_id TEXT,
    nama_pengguna TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS tafsir_bait (
    id SERIAL PRIMARY KEY,
    karya_id INT NOT NULL,
    bait_index INT NOT NULL,
    potongan_bait TEXT,
    nama_pengguna TEXT NOT NULL,
    user_id TEXT,
    isi_tafsir TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user_streak (
    user_id TEXT PRIMARY KEY,
    streak_count INT DEFAULT 3,
    last_active_date DATE DEFAULT CURRENT_DATE,
    total_hari_aktif INT DEFAULT 3,
    rekor_streak INT DEFAULT 7,
    last_bonus_claimed_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE user_streak ADD COLUMN IF NOT EXISTS last_bonus_claimed_date DATE`,
  `CREATE TABLE IF NOT EXISTS bedah_karya (
    id SERIAL PRIMARY KEY,
    karya_id INT,
    judul TEXT NOT NULL,
    penulis_karya TEXT NOT NULL,
    kategori VARCHAR(50) DEFAULT 'Puisi',
    kutipan_karya TEXT,
    mentor_nama TEXT NOT NULL,
    mentor_gelar TEXT,
    minggu_ke VARCHAR(100),
    ulasan_diksi TEXT,
    ulasan_rima TEXT,
    ulasan_rasa TEXT,
    ulasan_pesan TEXT,
    kesimpulan TEXT,
    rating_apresiasi INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
  )`,
  `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_user_id TEXT NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
  )`,
  `ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`,
  `ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`,
  `CREATE TABLE IF NOT EXISTS user_blocks (
    blocker_user_id TEXT NOT NULL,
    blocked_user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_user_id, blocked_user_id)
  )`,
  `INSERT INTO badges (kode, nama, deskripsi, icon, rarity) VALUES
    ('pena_mula', 'Pena Mula', 'Menerbitkan karya sastra pertama Anda.', '🪶', 'common'),
    ('pengrajin_kata', 'Pengrajin Kata', 'Telah menghasilkan 5 karya sastra.', '📜', 'uncommon'),
    ('penjaga_nyala', 'Penjaga Nyala', 'Streak membaca selama 7 hari berturut-turut.', '🔥', 'rare'),
    ('suara_sahdu', 'Suara Syahdu', 'Merekam dan mengunggah audio pembacaan puisi.', '🎙️', 'rare'),
    ('maestro_aksara', 'Maestro Aksara', 'Mencapai reputasi tinggi dan 30 hari aktif.', '👑', 'legendary')
   ON CONFLICT (kode) DO NOTHING`,
];

async function runMigration() {
  console.log('[Migration] Menghubungkan ke PostgreSQL...');
  try {
    const client = await pool.connect();
    client.release();
    console.log('[Migration] Koneksi ke database PostgreSQL berhasil diverifikasi.');
  } catch (connErr) {
    console.error('[Migration Gagal] Tidak dapat terhubung ke PostgreSQL:', (connErr as Error)?.message || connErr);
    await pool.end();
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < DDL_STATEMENTS.length; i++) {
    const sql = DDL_STATEMENTS[i];
    try {
      await pool.query(sql);
      successCount++;
    } catch (err) {
      console.warn(`[Migration Warning] Step ${i + 1}/${DDL_STATEMENTS.length}:`, (err as Error)?.message || err);
      errorCount++;
    }
  }

  console.log(`[Migration Selesai] Berhasil: ${successCount}, Catatan/Peringatan: ${errorCount}`);
  await pool.end();
  process.exit(0);
}

runMigration().catch(async (err) => {
  console.error('[Migration Fatal Error]:', err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
