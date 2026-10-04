import { getCurrentUser } from '@/lib/auth-server';
import { getMessagesForConversation, ensureChatTables } from '@/lib/chat-server';
import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';

export const dynamic = 'force-dynamic';

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const conversationId = Number.parseInt(resolvedParams.id, 10);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    redirect('/chat');
  }

  await ensureChatTables();

  // Get other user in conversation
  const otherMemberRes = await pool.query(
    `SELECT user_id FROM conversation_members 
     WHERE conversation_id = $1 AND user_id != $2`,
    [conversationId, user.uid]
  );

  if (otherMemberRes.rows.length === 0) {
    redirect('/chat');
  }

  const otherUserId = otherMemberRes.rows[0].user_id;

  // Get other user profile
  const profileRes = await pool.query(
    `SELECT user_id, nama, foto_url, status_badge FROM profil_pengguna WHERE user_id = $1`,
    [otherUserId]
  );

  const otherUser = profileRes.rows[0] || {
    user_id: otherUserId,
    nama: 'Penulis Sastra',
    foto_url: '',
    status_badge: 'Pelajar Sastra',
  };

  let messages = [];
  try {
    messages = await getMessagesForConversation(conversationId, user.uid);
  } catch {
    redirect('/chat');
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <ChatWindow
        conversationId={conversationId}
        currentUserId={user.uid}
        otherUser={otherUser}
        initialMessages={messages}
      />
    </div>
  );
}
