import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getMessagesForConversation, sendMessage } from '@/lib/chat-server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationIdParam = req.nextUrl.searchParams.get('conversation_id');
    if (!conversationIdParam) {
      return NextResponse.json({ error: 'conversation_id wajib diisi' }, { status: 400 });
    }

    const conversationId = Number.parseInt(conversationIdParam, 10);
    if (!Number.isInteger(conversationId)) {
      return NextResponse.json({ error: 'conversation_id tidak valid' }, { status: 400 });
    }

    const messages = await getMessagesForConversation(conversationId, user.uid);
    return NextResponse.json({ messages });
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
    const conversationId = Number(body.conversation_id);
    const isi = String(body.isi || '');

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json({ error: 'conversation_id tidak valid' }, { status: 400 });
    }

    const message = await sendMessage(conversationId, user.uid, isi);
    return NextResponse.json({ message });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 400 });
  }
}
