import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // PERBAIKAN: Menunggu Promise params selesai di-resolve
    const resolvedParams = await params;
    const karyaId = resolvedParams.id;
    
    const body = await request.json();

    await pool.query(
      'INSERT INTO likes (karya_id, user_email) VALUES ($1, $2)',
      [karyaId, body.userEmail || 'pembaca_android@fadrodzak.com']
    );

    await pool.query(
      'UPDATE karya SET jumlah_suka = COALESCE(jumlah_suka, 0) + 1 WHERE id = $1',
      [karyaId]
    );

    const countResult = await pool.query(
      'SELECT GREATEST(COALESCE(k.jumlah_suka, 0), (SELECT COUNT(*)::int FROM likes l WHERE l.karya_id = k.id)) AS total FROM karya k WHERE k.id = $1',
      [karyaId]
    );
    const totalLikes = countResult.rows[0]?.total || 1;

    return NextResponse.json({ message: 'Berhasil memberi Like!', total_likes: totalLikes }, { status: 201, headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'Gagal memberi Like' }, { status: 500, headers: corsHeaders });
  }
}