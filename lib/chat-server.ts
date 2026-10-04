import 'server-only';
import pool from './db';

export interface Conversation {
  id: number;
  created_at: Date;
  updated_at: Date;
  other_user_id?: string;
  other_user_name?: string;
  other_user_foto?: string;
  last_message?: string;
  last_message_at?: Date;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  isi: string;
  created_at: Date;
  edited_at?: Date | null;
  deleted_at?: Date | null;
}

/**
 * Memastikan tabel chat ada di database
 */
export async function ensureChatTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pastikan kolom created_at dan updated_at ada jika tabel sudah ada sebelumnya
    await pool.query(`
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      )
    `);

    await pool.query(`
      ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
        sender_user_id TEXT NOT NULL,
        isi TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        edited_at TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        blocker_user_id TEXT NOT NULL,
        blocked_user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (blocker_user_id, blocked_user_id)
      )
    `);
  } catch (err) {
    console.warn('[Chat Server] Inisialisasi tabel chat:', (err as Error)?.message || err);
  }
}

/**
 * Cek apakah user A memblokir user B atau sebaliknya
 */
export async function isBlocked(userA: string, userB: string): Promise<boolean> {
  await ensureChatTables();
  const res = await pool.query(
    `SELECT 1 FROM user_blocks 
     WHERE (blocker_user_id = $1 AND blocked_user_id = $2) 
        OR (blocker_user_id = $2 AND blocked_user_id = $1)`,
    [userA, userB]
  );
  return (res.rowCount ?? res.rows.length) > 0;
}

/**
 * Ambil atau buat percakapan 1-on-1 antara currentUserId dan targetUserId
 */
export async function getOrCreateDirectConversation(currentUserId: string, targetUserId: string): Promise<number> {
  if (currentUserId === targetUserId) {
    throw new Error('Tidak dapat memulai percakapan dengan diri sendiri.');
  }

  await ensureChatTables();

  const existing = await pool.query(
    `SELECT m1.conversation_id 
     FROM conversation_members m1
     JOIN conversation_members m2 ON m1.conversation_id = m2.conversation_id
     WHERE m1.user_id = $1 AND m2.user_id = $2
     GROUP BY m1.conversation_id
     HAVING COUNT(m1.conversation_id) = 2`,
    [currentUserId, targetUserId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].conversation_id;
  }

  const client = await pool.connect();
  try {
    const convRes = await client.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
    const convId = convRes.rows[0].id;

    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id, last_read_at) VALUES 
       ($1, $2, CURRENT_TIMESTAMP), 
       ($1, $3, CURRENT_TIMESTAMP)`,
      [convId, currentUserId, targetUserId]
    );

    return convId;
  } finally {
    client.release();
  }
}

/**
 * Ambil daftar percakapan user beserta info lawan bicara, pesan terakhir, dan unread count
 */
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  await ensureChatTables();

  const query = `
    SELECT 
      c.id, 
      c.created_at, 
      c.updated_at,
      m_other.user_id AS other_user_id,
      COALESCE(p.nama, m_other.user_id) AS other_user_name,
      COALESCE(p.foto_url, '') AS other_user_foto,
      (
        SELECT msg.isi FROM messages msg 
        WHERE msg.conversation_id = c.id AND msg.deleted_at IS NULL 
        ORDER BY msg.created_at DESC LIMIT 1
      ) AS last_message,
      (
        SELECT msg.created_at FROM messages msg 
        WHERE msg.conversation_id = c.id AND msg.deleted_at IS NULL 
        ORDER BY msg.created_at DESC LIMIT 1
      ) AS last_message_at,
      (
        SELECT COUNT(*)::int FROM messages msg
        WHERE msg.conversation_id = c.id 
          AND msg.sender_user_id != $1
          AND msg.created_at > COALESCE(m_self.last_read_at, TO_TIMESTAMP(0))
          AND msg.deleted_at IS NULL
      ) AS unread_count
    FROM conversations c
    JOIN conversation_members m_self ON c.id = m_self.conversation_id AND m_self.user_id = $1
    JOIN conversation_members m_other ON c.id = m_other.conversation_id AND m_other.user_id != $1
    LEFT JOIN profil_pengguna p ON m_other.user_id = p.user_id
    ORDER BY COALESCE((
      SELECT msg.created_at FROM messages msg 
      WHERE msg.conversation_id = c.id AND msg.deleted_at IS NULL 
      ORDER BY msg.created_at DESC LIMIT 1
    ), c.updated_at) DESC
  `;

  const res = await pool.query(query, [userId]);
  return res.rows;
}

/**
 * Ambil pesan dalam suatu conversation dengan verifikasi member
 */
export async function getMessagesForConversation(conversationId: number, userId: string): Promise<Message[]> {
  await ensureChatTables();

  const memberCheck = await pool.query(
    'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (memberCheck.rows.length === 0) {
    throw new Error('Akses ditolak ke percakapan ini.');
  }

  const res = await pool.query(
    `SELECT id, conversation_id, sender_user_id, isi, created_at, edited_at, deleted_at
     FROM messages
     WHERE conversation_id = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return res.rows;
}

/**
 * Kirim pesan dengan validasi anti-spam, panjang, dan blokir
 */
export async function sendMessage(conversationId: number, senderUserId: string, isi: string): Promise<Message> {
  await ensureChatTables();

  const cleanContent = isi.trim();
  if (!cleanContent) {
    throw new Error('Pesan kosong tidak dapat dikirim.');
  }
  if (cleanContent.length > 2000) {
    throw new Error('Pesan terlalu panjang (maksimal 2000 karakter).');
  }

  const memberRes = await pool.query(
    'SELECT user_id FROM conversation_members WHERE conversation_id = $1',
    [conversationId]
  );
  const members = memberRes.rows.map((r) => r.user_id);
  if (!members.includes(senderUserId)) {
    throw new Error('Anda bukan anggota percakapan ini.');
  }

  const recipientUserId = members.find((id) => id !== senderUserId);
  if (recipientUserId) {
    const blocked = await isBlocked(senderUserId, recipientUserId);
    if (blocked) {
      throw new Error('Tidak dapat mengirim pesan karena status blokir.');
    }
  }

  // Anti-spam: max 20 pesan per menit
  const rateCheck = await pool.query(
    `SELECT COUNT(*)::int AS count FROM messages
     WHERE sender_user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
    [senderUserId]
  );
  if (rateCheck.rows[0].count >= 20) {
    throw new Error('Terlalu banyak pesan dikirim. Harap tunggu sebentar.');
  }

  // Cek duplicate message identik dalam 5 detik terakhir
  const dupCheck = await pool.query(
    `SELECT 1 FROM messages
     WHERE conversation_id = $1 AND sender_user_id = $2 AND isi = $3 AND created_at > NOW() - INTERVAL '5 seconds'`,
    [conversationId, senderUserId, cleanContent]
  );
  if (dupCheck.rows.length > 0) {
    throw new Error('Pesan serupa baru saja dikirim (mencegah duplikat).');
  }

  const client = await pool.connect();
  try {
    const msgRes = await client.query(
      `INSERT INTO messages (conversation_id, sender_user_id, isi)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_user_id, isi, created_at, edited_at, deleted_at`,
      [conversationId, senderUserId, cleanContent]
    );

    await client.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    return msgRes.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Mark conversation as read
 */
export async function markConversationAsRead(conversationId: number, userId: string): Promise<void> {
  await ensureChatTables();
  await pool.query(
    `UPDATE conversation_members 
     SET last_read_at = CURRENT_TIMESTAMP 
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]
  );
}

/**
 * Block or unblock user
 */
export async function setBlockUser(blockerUserId: string, blockedUserId: string, block: boolean): Promise<void> {
  await ensureChatTables();
  if (blockerUserId === blockedUserId) {
    throw new Error('Tidak dapat memblokir diri sendiri.');
  }

  if (block) {
    await pool.query(
      `INSERT INTO user_blocks (blocker_user_id, blocked_user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING`,
      [blockerUserId, blockedUserId]
    );
  } else {
    await pool.query(
      `DELETE FROM user_blocks 
       WHERE blocker_user_id = $1 AND blocked_user_id = $2`,
      [blockerUserId, blockedUserId]
    );
  }
}

/**
 * Search users to start chat
 */
export async function searchUsers(keyword: string, currentUserId: string) {
  await ensureChatTables();
  const searchPattern = `%${keyword.trim()}%`;
  const res = await pool.query(
    `SELECT user_id, nama, foto_url, status_badge, bio
     FROM profil_pengguna
     WHERE user_id != $1 AND (nama ILIKE $2 OR user_id ILIKE $2 OR bio ILIKE $2)
     LIMIT 20`,
    [currentUserId, searchPattern]
  );
  return res.rows;
}
