/**
 * Utilitas pemformatan tanggal dan waktu sosial media Fadrodzak.
 * Menyediakan representasi waktu relatif yang alami dalam Bahasa Indonesia:
 * - "Baru saja" (kurang dari 1 menit)
 * - "X menit lalu" (kurang dari 1 jam)
 * - "X jam lalu" (hari ini)
 * - "Kemarin, HH:mm" (kemarin)
 * - "X hari lalu" (2-6 hari lalu)
 * - "D MMM, HH:mm" (tahun ini)
 * - "D MMM YYYY" (tahun lalu atau lebih)
 */

const NAMA_BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
];

const NAMA_BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

function toValidDate(dateInput: unknown): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  try {
    const parsed = new Date(dateInput as string | number);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Format waktu relatif untuk feed timeline sosial media
 */
export function formatWaktuRelatif(
  dateInput: string | Date | number | undefined | null,
  includeTimeForOld = true
): string {
  const date = toValidDate(dateInput);
  if (!date) return 'Baru saja';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Tangani sedikit selisih jam server/client
  if (diffMs < 0 && diffMs > -60000) {
    return 'Baru saja';
  }

  const diffSec = Math.floor(Math.max(0, diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const jamMenit = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  // Kurang dari 1 menit
  if (diffSec < 60) {
    return 'Baru saja';
  }

  // Kurang dari 60 menit
  if (diffMin < 60) {
    return `${diffMin} menit lalu`;
  }

  // Kurang dari 12 jam: selalu tampilkan "X jam lalu" agar konsisten meskipun melintasi tengah malam
  if (diffHours < 12) {
    return `${diffHours} jam lalu`;
  }

  // Cek apakah tanggal kalender sama hari ini
  const isHariIni =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isHariIni) {
    return `${diffHours} jam lalu`;
  }

  // Cek apakah kemarin (kalender) atau dalam rentang 12 hingga 36 jam yang melintasi hari
  const kemarin = new Date(now);
  kemarin.setDate(now.getDate() - 1);
  const isKemarin =
    (kemarin.getDate() === date.getDate() &&
      kemarin.getMonth() === date.getMonth() &&
      kemarin.getFullYear() === date.getFullYear()) ||
    (diffHours >= 12 && diffHours < 36);

  if (isKemarin) {
    return `Kemarin, ${jamMenit}`;
  }

  // 2 sampai 6 hari lalu
  if (diffDays >= 2 && diffDays <= 6) {
    return `${diffDays} hari lalu`;
  }

  const hari = date.getDate();
  const bulan = NAMA_BULAN_PENDEK[date.getMonth()];
  const tahun = date.getFullYear();

  // Tahun berjalan
  if (now.getFullYear() === tahun) {
    return includeTimeForOld ? `${hari} ${bulan}, ${jamMenit}` : `${hari} ${bulan}`;
  }

  // Tahun lalu atau lebih
  return `${hari} ${bulan} ${tahun}`;
}

/**
 * Format tanggal lengkap untuk tooltip atau header detail artikel
 */
export function formatWaktuLengkap(
  dateInput: string | Date | number | undefined | null
): string {
  const date = toValidDate(dateInput);
  if (!date) return '-';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hariNama = NAMA_HARI[date.getDay()];
  const tgl = date.getDate();
  const bulan = NAMA_BULAN_PANJANG[date.getMonth()];
  const tahun = date.getFullYear();
  const jam = pad(date.getHours());
  const menit = pad(date.getMinutes());

  return `${hariNama}, ${tgl} ${bulan} ${tahun} pukul ${jam}:${menit} WIB`;
}
