import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { markConversationAsRead } from '@/lib/chat-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const conversationId = Number(body.conversation_id);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json({ error: 'conversation_id tidak valid' }, { status: 400 });
    }

    await markConversationAsRead(conversationId, user.uid);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
