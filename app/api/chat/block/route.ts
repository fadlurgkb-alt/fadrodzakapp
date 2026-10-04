import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { setBlockUser } from '@/lib/chat-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const targetUserId = String(body.target_user_id || '').trim();
    const block = Boolean(body.block);

    if (!targetUserId) {
      return NextResponse.json({ error: 'target_user_id wajib diisi' }, { status: 400 });
    }

    await setBlockUser(user.uid, targetUserId, block);
    return NextResponse.json({ success: true, blocked: block });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
