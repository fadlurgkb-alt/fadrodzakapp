import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM karya ORDER BY created_at DESC');
    return NextResponse.json(rows, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // KUNCI PERBAIKAN: Menangkap ejaan snake_case dari Android
    const judul = body.judul || body.title;
    const isiTulisan = body.isi_tulisan || body.isiTulisan || body.content;
    const kategori = body.kategori || body.category || "Puisi";
    const namaPengguna = body.nama_pengguna || body.namaPengguna || "Anonim";
    const statusPenulis = body.status_penulis || body.statusPenulis || "Pelajar Sastra";
    const linkTrakteer = body.link_trakteer || body.linkTrakteer || "";
    const nomorBab = body.nomor_bab || body.nomorBab || (kategori === 'Novel' || kategori === 'Cerita Bersambung' ? 1 : null);
    const judulBab = body.judul_bab || body.judulBab || null;
    const namaCerita = body.nama_cerita || body.namaCerita || null;
    const sinopsis = body.sinopsis || null;
    const statusCerita = body.status_cerita || body.statusCerita || "Ongoing";

    const { rows } = await pool.query(
      `INSERT INTO karya (judul, isi_tulisan, kategori, nama_pengguna, status_penulis, link_trakteer, nomor_bab, judul_bab, nama_cerita, sinopsis, status_cerita) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [judul, isiTulisan, kategori, namaPengguna, statusPenulis, linkTrakteer, nomorBab, judulBab, namaCerita, sinopsis, statusCerita]
    );
    
    return NextResponse.json(rows[0], { status: 201, headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan karya' }, { status: 500, headers: corsHeaders });
  }
}