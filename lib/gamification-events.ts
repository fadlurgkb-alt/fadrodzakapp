import 'server-only';

import {
  berikanXp,
} from './xp-server';

import {
  beriBadge,
} from './badge-server';

export async function eventKaryaTerbit(
  userId: string,
  karyaId: number | string
) {
  const hasilXp =
    await berikanXp(
      userId,
      'publikasi_karya',
      String(karyaId),
      'Memublikasikan karya'
    );

  // Karya pertama otomatis memperoleh badge
  // Tinta Pertama.
  await beriBadge(
    userId,
    'tinta_pertama'
  );

  return hasilXp;
}

export async function eventKomentar(
  userId: string,
  komentarId: number | string
) {
  return berikanXp(
    userId,
    'komentar',
    String(komentarId),
    'Memberikan komentar'
  );
}

export async function eventUlasanBuku(
  userId: string,
  ulasanId: number | string
) {
  return berikanXp(
    userId,
    'ulasan_buku',
    String(ulasanId),
    'Memberikan ulasan Book Corner'
  );
}