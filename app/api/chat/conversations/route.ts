import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getConversationsForUser, getOrCreateDirectConversation, searchUsers } from '@/lib/chat-server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchUrl = req.nextUrl.searchParams.get('search');
    if (searchUrl !== null) {
      const users = await searchUsers(searchUrl, user.uid);
      return NextResponse.json({ users });
    }

    const conversations = await getConversationsForUser(user.uid);
    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetUserId = String(body.target_user_id || '').trim();
    if (!targetUserId) {
      return NextResponse.json({ error: 'target_user_id wajib diisi' }, { status: 400 });
    }

    const conversationId = await getOrCreateDirectConversation(user.uid, targetUserId);
    return NextResponse.json({ conversation_id: conversationId });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
