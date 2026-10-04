/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// In-memory data store for resilient fallback when remote Postgres / Neon is offline or unreachable
interface KaryaItem {
  id: number;
  judul: string;
  kategori: string;
  genre?: string | null;
  isi_tulisan: string;
  nama_pengguna: string;
  status_penulis: string;
  link_trakteer: string | null;
  gambar_url: string | null;
  audio_url?: string | null;
  user_id?: string;
  jumlah_suka?: number;
  jumlah_komentar?: number;
  nomor_bab?: number;
  judul_bab?: string | null;
  nama_cerita?: string | null;
  sinopsis?: string | null;
  status_cerita?: string | null;
  created_at: Date;
}

export interface ReaksiSastraItem {
  id: number;
  karya_id: number;
  tipe_reaksi: 'tersentuh' | 'membakar' | 'hangat' | 'memukau';
  user_id?: string;
  nama_pengguna?: string;
  created_at: Date;
}

export interface TafsirBaitItem {
  id: number;
  karya_id: number;
  bait_index: number;
  potongan_bait: string;
  nama_pengguna: string;
  user_id?: string;
  isi_tafsir: string;
  created_at: Date;
}

export interface UserStreakItem {
  user_id: string;
  streak_count: number;
  last_active_date: string; // YYYY-MM-DD
  total_hari_aktif: number;
  rekor_streak: number;
  last_bonus_claimed_date?: string | null;
  updated_at: Date;
}

export interface BedahKaryaItem {
  id: number;
  karya_id?: number | null;
  judul: string;
  penulis_karya: string;
  kategori: string;
  kutipan_karya: string;
  mentor_nama: string;
  mentor_gelar: string;
  minggu_ke: string;
  ulasan_diksi: string;
  ulasan_rima: string;
  ulasan_rasa: string;
  ulasan_pesan: string;
  kesimpulan: string;
  rating_apresiasi: number;
  created_at: Date;
}

interface TutorialItem {
  id: number;
  judul: string;
  kategori: string;
  isi_materi: string;
  penulis: string;
  waktu_baca: string;
  created_at: Date;
}

interface BukuItem {
  id: number;
  google_books_id: string | null;
  isbn_13: string | null;
  judul: string;
  penulis: string;
  penerbit: string | null;
  jumlah_halaman: number | null;
  genre: string | null;
  sinopsis: string | null;
  gambar_url: string | null;
  created_at: Date;
}

interface KomentarItem {
  id: number;
  karya_id: number;
  nama_pengguna: string;
  isi_komentar: string;
  created_at: Date;
}

interface LikeItem {
  id: number;
  karya_id: number;
  nama_pengguna: string;
  user_email?: string;
  created_at: Date;
}

interface NotifikasiItem {
  id: number;
  tipe: string;
  pesan: string;
  created_at: Date;
}

interface ProfilItem {
  user_id: string;
  email?: string | null;
  nama: string;
  foto_url: string;
  status_badge: string;
  bio: string;
  link_donasi: string;
  created_at: Date;
}

interface UserGamificationItem {
  user_id: string;
  xp: number;
  role: string;
  is_donatur: boolean;
  reputasi: number;
  updated_at: Date;
}

interface BadgeItem {
  id: number;
  kode: string;
  nama: string;
  deskripsi: string;
  icon: string;
  rarity: string;
}

interface UserBadgeItem {
  id: number;
  user_id: string;
  badge_id: number;
  didapatkan_pada: Date;
}

interface XpHistoryItem {
  id: number;
  user_id: string;
  jumlah_xp: number;
  jenis: string;
  keterangan: string | null;
  source_id: string | null;
  created_at: Date;
}

export interface ChatConversationItem {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChatConversationMemberItem {
  conversation_id: number;
  user_id: string;
  last_read_at: Date;
  joined_at: Date;
}

export interface ChatMessageItem {
  id: number;
  conversation_id: number;
  sender_user_id: string;
  isi: string;
  created_at: Date;
  edited_at: Date | null;
  deleted_at: Date | null;
}

export interface ChatUserBlockItem {
  blocker_user_id: string;
  blocked_user_id: string;
  created_at: Date;
}

const initialKaryas: KaryaItem[] = [
  {
    id: 1,
    judul: 'Senja di Tepian Kali Porong',
    kategori: 'Puisi',
    isi_tulisan: `Di tepian kali yang merapuh senja,\nlangit menyapu saga dengan jemari jingga.\nAir mengalir tanpa keluh dan ragu,\nmenghanyutkan rindu yang lama membeku.\n\nAdakah yang lebih tabah dari batu karang,\nmenyaksikan arus pulang saat petang datang menjelang?`,
    nama_pengguna: 'Fadrodzak',
    status_penulis: 'Sastrawan Muda',
    link_trakteer: 'https://trakteer.id',
    gambar_url: null,
    user_id: 'guest_user',
    jumlah_suka: 12,
    jumlah_komentar: 3,
    created_at: new Date(Date.now() - 3600 * 1000 * 5),
  },
  {
    id: 2,
    judul: 'Sepucuk Surat dari Lorong Perpustakaan',
    kategori: 'Cerpen',
    isi_tulisan: `Aroma kertas tua selalu menyembunyikan masa lalu. Di sudut rak 800 sastra umum, sebuah amplop cokelat terselip di balik sampul tebal antologi sajak Chairil Anwar. Tidak ada alamat tujuan, hanya tulisan tangan miring dengan tinta biru pudar: "Untuk siapa saja yang masih percaya bahwa kata-kata sanggup menyembuhkan luka."\n\nFarhan membacanya perlahan. Setiap baitnya seperti memanggil kembali kenangan kota hujan yang telah lama ia tinggalkan.`,
    nama_pengguna: 'Aisyah Rahma',
    status_penulis: 'Pelajar Sastra',
    link_trakteer: null,
    gambar_url: null,
    user_id: 'user_aisyah',
    jumlah_suka: 18,
    jumlah_komentar: 5,
    created_at: new Date(Date.now() - 3600 * 1000 * 24),
  },
  {
    id: 3,
    judul: 'Pantun Semangat Literasi',
    kategori: 'Pantun',
    isi_tulisan: `Bunga melati di taman sari,\nHarum semerbak di waktu pagi.\nMari membaca setiap hari,\nBuka jendela luasnya negeri.\n\nKayuh perahu ke pulau seberang,\nSinggah sebentar memetik selasih.\nIndah sastra pekerti terang,\nHati yang gundah kembali bersih.`,
    nama_pengguna: 'Budi Santoso',
    status_penulis: 'Pencinta Aksara',
    link_trakteer: null,
    gambar_url: null,
    user_id: 'user_budi',
    jumlah_suka: 9,
    jumlah_komentar: 2,
    created_at: new Date(Date.now() - 3600 * 1000 * 48),
  },
  {
    id: 4,
    judul: 'Gadis Penenun Benang Emas — Bab 1: Kilau Benang Perak di Kaki Gunung',
    kategori: 'Novel & Cerbung',
    nomor_bab: 1,
    judul_bab: 'Bab 1: Kilau Benang Perak di Kaki Gunung',
    nama_cerita: 'Gadis Penenun Benang Emas',
    sinopsis: 'Rengganis mewarisi alat tenun ramalan di perbatasan hutan keramat. Setiap kain yang ia sulam menyimpan ramalan masa depan, hingga seorang pengelana terluka mengetuk pintunya di malam badai.',
    genre: 'Fantasi',
    status_cerita: 'Ongoing',
    isi_tulisan: `Di sebuah desa sunyi di kaki Pegunungan Seribu, hiduplah Rengganis, seorang penenun muda yang mewarisi alat tenun kuno dari mendiang neneknya.\n\nSetiap helai benang sutra yang ia lintangkan di kayu jati itu seolah berbisik, meramalkan takdir siapa saja yang kelak mengenakan kainnya.\n\n"Jangan pernah menenun saat hatimu bimbang," begitu mendiang neneknya berpesan sepuluh tahun silam. Namun malam ini, gerimis turun deras membasahi lereng bukit. Di kejauhan, lolongan serigala bersahutan dengan denting belati di jalan setapak.\n\nTepat tengah malam, tiga ketukan berat mendarat di pintu kayunya yang rapuh. Napas terengah seorang pemuda berselubung jubah hitam terdengar di balik gerbang bambu...`,
    nama_pengguna: 'Rengganis Aksara',
    status_penulis: 'Novelis Muda',
    link_trakteer: 'https://trakteer.id/fadrodzak/tip',
    gambar_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    user_id: 'user_rengganis',
    jumlah_suka: 24,
    jumlah_komentar: 8,
    created_at: new Date(Date.now() - 3600 * 1000 * 36),
  },
  {
    id: 6,
    judul: 'Gadis Penenun Benang Emas — Bab 2: Tamu dari Lembah Kabut',
    kategori: 'Novel & Cerbung',
    nomor_bab: 2,
    judul_bab: 'Bab 2: Tamu dari Lembah Kabut',
    nama_cerita: 'Gadis Penenun Benang Emas',
    sinopsis: 'Rengganis mewarisi alat tenun ramalan di perbatasan hutan keramat. Setiap kain yang ia sulam menyimpan ramalan masa depan, hingga seorang pengelana terluka mengetuk pintunya di malam badai.',
    genre: 'Fantasi',
    status_cerita: 'Ongoing',
    isi_tulisan: `Pintu kayu berderit pelan saat Rengganis mengangkat palang pengunci. Udara lembap bercampur aroma tembaga menusuk hidungnya seketika.\n\nDi ambang pintu, seorang pemuda tersungkur. Jemari tangannya menggenggam sebilah belati berukir lambang rajawali perak—lambang kesatria istana timur yang telah lama musnah dari ingatan penduduk desa.\n\n"Tolong... jangan biarkan mereka mengambil gulungan sutra biru," bisik pemuda itu parau sebelum jatuh tak sadarkan diri di atas lantai papan.\n\nRengganis tertegun. Di dada pemuda itu, darah merembes membasahi kain tenun berwarna biru laut—persis seperti sehelai kain yang baru saja selesai ia tenun tadi sore.`,
    nama_pengguna: 'Rengganis Aksara',
    status_penulis: 'Novelis Muda',
    link_trakteer: 'https://trakteer.id/fadrodzak/tip',
    gambar_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    user_id: 'user_rengganis',
    jumlah_suka: 15,
    jumlah_komentar: 4,
    created_at: new Date(Date.now() - 3600 * 1000 * 20),
  },
  {
    id: 5,
    judul: 'Melodi di Ujung Senja — Bab 1: Kereta Api Senja Utama',
    kategori: 'Novel & Cerbung',
    nomor_bab: 1,
    judul_bab: 'Bab 1: Kereta Api Senja Utama',
    nama_cerita: 'Melodi di Ujung Senja',
    sinopsis: 'Pertemuan tak terduga antara Alana si pemain biola yang kehilangan inspirasi dan Danu sang arsitek perantau di dalam gerbong kereta menuju Yogyakarta.',
    genre: 'Romansa',
    status_cerita: 'Ongoing',
    isi_tulisan: `Kereta Senja Utama melaju tenang membelah hamparan sawah yang basah diguyur hujan petang. Di kursi 14A kelas ekonomi, Alana menatap lembaran partitur biola di pangkuannya yang masih belum terselesaikan.\n\n"Nada kelima ini selalu buntu," gumamnya pelan sambil menyandarkan dahi ke kaca jendela yang berembun.\n\nTiba-tiba seorang pemuda dengan ransel kanvas cokelat meletakkan sebuah cangkir kopi panas di atas meja kecil di sampingnya. "Permisi, apakah kursi 14B kosong?" sapanya hangat dengan senyum tipis.\n\nAlana mengangguk perlahan. Ia tidak tahu bahwa perjalanan kereta selama delapan jam ke depan akan mengubah seluruh komposisi hidupnya yang selama ini terasa sunyi.`,
    nama_pengguna: 'Alana Kirana',
    status_penulis: 'Penulis Cerita',
    link_trakteer: 'https://saweria.co/fadrodzak',
    gambar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    user_id: 'user_alana',
    jumlah_suka: 19,
    jumlah_komentar: 6,
    created_at: new Date(Date.now() - 3600 * 1000 * 12),
  },
  {
    id: 7,
    judul: 'Melodi di Ujung Senja — Bab 2: Kopi Hangat dan Nada yang Hilang',
    kategori: 'Novel & Cerbung',
    nomor_bab: 2,
    judul_bab: 'Bab 2: Kopi Hangat dan Nada yang Hilang',
    nama_cerita: 'Melodi di Ujung Senja',
    sinopsis: 'Pertemuan tak terduga antara Alana si pemain biola yang kehilangan inspirasi dan Danu sang arsitek perantau di dalam gerbong kereta menuju Yogyakarta.',
    genre: 'Romansa',
    status_cerita: 'Ongoing',
    isi_tulisan: `Uap tipis membubung dari cangkir kertas berisi kopi susu tubruk. Aroma kopi robusta memenuhi ruang sempit di antara kursi 14A dan 14B.\n\n"Kamu seorang musisi?" tanya Danu memecah keheningan, matanya menatap kotak biola beludru hitam yang diletakkan Alana di bawah kakinya.\n\n"Hanya seseorang yang sedang belajar mendengar kembali suara hatinya," jawab Alana pelan, jemarinya meremas ujung lengan sweternya yang hangat.\n\nDanu tertawa kecil tanpa nada mengejek. "Arsitek dan musisi rupanya tidak jauh berbeda. Kami sama-sama menyusun jeda. Bangunan butuh ruang kosong untuk bernapas, begitu juga irama lagu, bukan?"\n\nAlana menoleh. Untuk pertama kalinya setelah berbulan-bulan, sebuah nada baru melintas jernih di kepalanya.`,
    nama_pengguna: 'Alana Kirana',
    status_penulis: 'Penulis Cerita',
    link_trakteer: 'https://saweria.co/fadrodzak',
    gambar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    user_id: 'user_alana',
    jumlah_suka: 14,
    jumlah_komentar: 3,
    created_at: new Date(Date.now() - 3600 * 1000 * 6),
  },
];

const initialTutorials: TutorialItem[] = [
  {
    id: 1,
    judul: 'Menemukan Diksi yang Bernyawa dalam Puisi',
    kategori: 'Materi',
    isi_materi: `Menulis puisi bukan sekadar merangkai kata-kata indah yang rumit dari kamus besar. Puisi yang menggugah adalah puisi yang memilih diksi sederhana namun memiliki bobot emosional yang tepat.\n\nTips praktis dari Redaksi Fadrodzak:\n1. Hindari kata klise yang berlebihan tanpa makna baru.\n2. Manfaatkan citraan indrawi (penglihatan, pendengaran, penciuman, rabaan).\n3. Beri ruang nafas dan ritme pada setiap pemenggalan bait (enjambemen).\n4. Baca karyamu keras-keras dengan telinga, rasakan iramanya.`,
    penulis: 'Fadhil (Admin)',
    waktu_baca: '4 mnt baca',
    created_at: new Date(Date.now() - 3600 * 1000 * 12),
  },
  {
    id: 2,
    judul: 'Membangun Konflik Batin Tokoh dalam Cerita Pendek',
    kategori: 'Materi',
    isi_materi: `Cerpen yang membekas di hati pembaca seringkali bukan berpusat pada aksi spektakuler di luar, melainkan tarik-menarik moral dan batin yang dialami karakternya.\n\nLangkah mudah merancang konflik batin:\n1. Apa yang paling diinginkan oleh tokoh utamamu?\n2. Apa konsekuensi terbesar bila keinginannya itu terwujud?\n3. Tempatkan tokoh pada situasi di mana semua pilihan memiliki harga yang harus dibayar.\n4. Biarkan pembaca merasakan dilema tersebut melalui tindakan konkret, bukan ceramah narator.`,
    penulis: 'Fadhil (Admin)',
    waktu_baca: '5 mnt baca',
    created_at: new Date(Date.now() - 3600 * 1000 * 48),
  },
];

const initialBuku: BukuItem[] = [
  {
    id: 1,
    google_books_id: 'bumi_manusia_01',
    isbn_13: '9789799731234',
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Lentera Dipantara',
    jumlah_halaman: 535,
    genre: 'Sastra Sejarah',
    sinopsis: 'Kisah pergerakan dan pergulatan batin Minke, pemuda pribumi terpelajar di tengah hegemoni kolonial Hindia Belanda pada pergantian abad ke-20.',
    gambar_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    created_at: new Date(Date.now() - 3600 * 1000 * 72),
  },
  {
    id: 2,
    google_books_id: 'hujan_bulan_juni_02',
    isbn_13: '9786020318431',
    judul: 'Hujan Bulan Juni',
    penulis: 'Sapardi Djoko Damono',
    penerbit: 'Gramedia Pustaka Utama',
    jumlah_halaman: 144,
    genre: 'Kumpulan Puisi',
    sinopsis: 'Tak ada yang lebih tabah dari hujan bulan Juni; dirahasiakannya rintik rindunya kepada pohon berbunga itu. Kumpulan sajak liris legendaris tanah air.',
    gambar_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    created_at: new Date(Date.now() - 3600 * 1000 * 96),
  },
  {
    id: 3,
    google_books_id: 'cantik_itu_luka_03',
    isbn_13: '9786020312583',
    judul: 'Cantik Itu Luka',
    penulis: 'Eka Kurniawan',
    penerbit: 'Gramedia Pustaka Utama',
    jumlah_halaman: 508,
    genre: 'Realisme Magis',
    sinopsis: 'Di satu sore, seorang perempuan bernama Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun mati. Epos megah berlatar kota pesisir Halimunda.',
    gambar_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    created_at: new Date(Date.now() - 3600 * 1000 * 120),
  },
];

const initialBadges: BadgeItem[] = [
  { id: 1, kode: 'tinta_pertama', nama: 'Tinta Pertama', deskripsi: 'Menerbitkan karya sastra pertama di platform', icon: '✒️', rarity: 'common' },
  { id: 2, kode: 'penyair_muda', nama: 'Penyair Muda', deskripsi: 'Mempublikasikan 3 karya puisi', icon: '📜', rarity: 'rare' },
  { id: 3, kode: 'pembaca_setia', nama: 'Pembaca Setia', deskripsi: 'Aktif mengulas dan memberi tanggapan', icon: '📖', rarity: 'common' },
  { id: 4, kode: 'sastrawan', nama: 'Sastrawan Pilihan', deskripsi: 'Karya terpilih dalam kurasi redaksi', icon: '👑', rarity: 'epic' },
];

const initialUserBadges: UserBadgeItem[] = [
  { id: 1, user_id: 'guest_user', badge_id: 1, didapatkan_pada: new Date(Date.now() - 3600 * 1000 * 24) },
  { id: 2, user_id: 'guest_user', badge_id: 2, didapatkan_pada: new Date(Date.now() - 3600 * 1000 * 10) },
];

const initialKomentar: KomentarItem[] = [
  { id: 1, karya_id: 1, nama_pengguna: 'Dra. Siti Wardani', isi_komentar: 'Pilihan diksi yang tenang dan penuh perenungan. Teruskan menenun kata.', created_at: new Date(Date.now() - 3600 * 1000 * 4) },
  { id: 2, karya_id: 1, nama_pengguna: 'Bambang Sudiro', isi_komentar: 'Sangat menyentuh, bait kedua membuat teringat kampung halaman.', created_at: new Date(Date.now() - 3600 * 1000 * 2) },
];

const initialLikes: LikeItem[] = [
  { id: 1, karya_id: 1, nama_pengguna: 'Pembaca 1', user_email: 'pembaca1@fadrodzak.com', created_at: new Date() },
  { id: 2, karya_id: 1, nama_pengguna: 'Pembaca 2', user_email: 'pembaca2@fadrodzak.com', created_at: new Date() },
  { id: 3, karya_id: 2, nama_pengguna: 'Pembaca 3', user_email: 'pembaca3@fadrodzak.com', created_at: new Date() },
];

const initialNotifikasi: NotifikasiItem[] = [
  { id: 1, tipe: 'reaksi', pesan: 'Seseorang menitipkan apresiasi "🍂 Tersentuh" pada bait puisimu.', created_at: new Date(Date.now() - 3600 * 1000 * 1) },
  { id: 2, tipe: 'komentar', pesan: 'Dra. Siti Wardani memberikan telaah di tafsir bait ke-2 karyamu.', created_at: new Date(Date.now() - 3600 * 1000 * 3) },
  { id: 3, tipe: 'streak', pesan: 'Pena Tak Padam: Streak membacamu mencapai 3 hari berturut-turut! 🔥', created_at: new Date(Date.now() - 3600 * 1000 * 5) },
];

const initialReaksi: ReaksiSastraItem[] = [
  { id: 1, karya_id: 1, tipe_reaksi: 'tersentuh', user_id: 'user_aisyah', nama_pengguna: 'Aisyah Rahma', created_at: new Date(Date.now() - 3600 * 1000 * 2) },
  { id: 2, karya_id: 1, tipe_reaksi: 'hangat', user_id: 'user_budi', nama_pengguna: 'Budi Santoso', created_at: new Date(Date.now() - 3600 * 1000 * 3) },
  { id: 3, karya_id: 1, tipe_reaksi: 'memukau', user_id: 'guest_user', nama_pengguna: 'Pembaca Tamu', created_at: new Date(Date.now() - 3600 * 1000 * 4) },
  { id: 4, karya_id: 2, tipe_reaksi: 'tersentuh', user_id: 'guest_user', nama_pengguna: 'Fadrodzak', created_at: new Date(Date.now() - 3600 * 1000 * 5) },
  { id: 5, karya_id: 2, tipe_reaksi: 'membakar', user_id: 'user_budi', nama_pengguna: 'Budi Santoso', created_at: new Date(Date.now() - 3600 * 1000 * 6) },
];

const initialTafsir: TafsirBaitItem[] = [
  {
    id: 1,
    karya_id: 1,
    bait_index: 0,
    potongan_bait: 'Di tepian kali yang merapuh senja,\nlangit menyapu saga dengan jemari jingga.',
    nama_pengguna: 'Dra. Siti Wardani (Mentor)',
    user_id: 'mentor_siti',
    isi_tafsir: 'Personifikasi "langit menyapu saga dengan jemari jingga" melukiskan pergantian hari bukan sekadar fenomena alam, tetapi peristiwa batin yang intim.',
    created_at: new Date(Date.now() - 3600 * 1000 * 3),
  },
  {
    id: 2,
    karya_id: 1,
    bait_index: 1,
    potongan_bait: 'Adakah yang lebih tabah dari batu karang,\nmenyaksikan arus pulang saat petang datang menjelang?',
    nama_pengguna: 'Aisyah Rahma',
    user_id: 'user_aisyah',
    isi_tafsir: 'Menemukan gema sajak Sapardi dalam bait ini. Sikap ketabahan yang bersanding dengan kesunyian pulang sangat menusuk sanubari.',
    created_at: new Date(Date.now() - 3600 * 1000 * 1),
  },
];

const initialBedahKarya: BedahKaryaItem[] = [
  {
    id: 1,
    karya_id: 1,
    judul: 'Senja di Tepian Kali Porong',
    penulis_karya: 'Fadrodzak',
    kategori: 'Puisi',
    kutipan_karya: 'Adakah yang lebih tabah dari batu karang, menyaksikan arus pulang saat petang datang menjelang?',
    mentor_nama: 'Dra. Siti Wardani, M.Hum',
    mentor_gelar: 'Pengasuh Bengkel Sastra & Kurator Senior',
    minggu_ke: 'Pekan IV - September 2026',
    ulasan_diksi: 'Diksi yang dipilih hemat namun tajam. Pemilihan kata "merapuh", "saga", dan "arus pulang" saling bertaut membangun suasana nostalgik tanpa terperosok ke dalam kecengengan klise.',
    ulasan_rima: 'Asosiasi bunyi vokal terbuka /a/ pada bait awal memberi kesan luasnya bentangan cakrawala senja, lalu ditutup dengan konsonan berat yang memberi ketegasan batin.',
    ulasan_rasa: 'Rasa sunyi yang dialirkan sangat kontemplatif. Pembaca diajak menjadi pengamat yang hening di tepi sungai, bukan sekadar penonton pasif.',
    ulasan_pesan: 'Ketabahan menghadapi perpisahan dan roda waktu yang tak bisa dibendung. Sebuah karya muda yang matang dan bernas.',
    kesimpulan: 'Sangat direkomendasikan untuk dibaca berulang. Kerapian rima dan kejernihan citraan indrawi layak menjadi teladan bagi penulis pemula.',
    rating_apresiasi: 5,
    created_at: new Date(Date.now() - 3600 * 1000 * 48),
  },
];

const initialStreaks: Map<string, UserStreakItem> = new Map([
  [
    'guest_user',
    {
      user_id: 'guest_user',
      streak_count: 3,
      last_active_date: new Date().toISOString().slice(0, 10),
      total_hari_aktif: 12,
      rekor_streak: 7,
      updated_at: new Date(),
    },
  ],
]);

interface MemoryStoreData {
  karyas: KaryaItem[];
  tutorials: TutorialItem[];
  buku: BukuItem[];
  komentar: KomentarItem[];
  likes: LikeItem[];
  notifikasi: NotifikasiItem[];
  reaksi: ReaksiSastraItem[];
  tafsir: TafsirBaitItem[];
  bedahKarya: BedahKaryaItem[];
  streaks: Map<string, UserStreakItem>;
  profil: Map<string, ProfilItem>;
  userGamification: Map<string, UserGamificationItem>;
  badges: BadgeItem[];
  userBadges: UserBadgeItem[];
  xpHistory: XpHistoryItem[];
  conversations: ChatConversationItem[];
  conversationMembers: ChatConversationMemberItem[];
  messages: ChatMessageItem[];
  userBlocks: ChatUserBlockItem[];
  nextId: number;
}

const globalWithStore = globalThis as unknown as { __FADRODZAK_STORE__?: MemoryStoreData };
const memoryStore: MemoryStoreData = (globalWithStore.__FADRODZAK_STORE__ = globalWithStore.__FADRODZAK_STORE__ || {
  karyas: [...initialKaryas],
  tutorials: [...initialTutorials],
  buku: [...initialBuku],
  komentar: [...initialKomentar],
  likes: [...initialLikes],
  notifikasi: [...initialNotifikasi],
  reaksi: [...initialReaksi],
  tafsir: [...initialTafsir],
  bedahKarya: [...initialBedahKarya],
  streaks: new Map(initialStreaks),
  profil: new Map<string, ProfilItem>([
    [
      'guest_user',
      {
        user_id: 'guest_user',
        nama: 'Fadrodzak',
        foto_url: '',
        status_badge: 'Pelajar Sastra',
        bio: 'Pencinta aksara, penenun kata di beranda sastra Nusantara.',
        link_donasi: 'https://trakteer.id',
        created_at: new Date(),
      },
    ],
  ]),
  userGamification: new Map<string, UserGamificationItem>([
    [
      'guest_user',
      {
        user_id: 'guest_user',
        xp: 140,
        role: 'user',
        is_donatur: false,
        reputasi: 12,
        updated_at: new Date(),
      },
    ],
  ]),
  badges: [...initialBadges],
  userBadges: [...initialUserBadges],
  xpHistory: [] as XpHistoryItem[],
  conversations: [] as { id: number; created_at: Date; updated_at: Date }[],
  conversationMembers: [] as { conversation_id: number; user_id: string; last_read_at: Date; joined_at: Date }[],
  messages: [] as { id: number; conversation_id: number; sender_user_id: string; isi: string; created_at: Date; edited_at: Date | null; deleted_at: Date | null }[],
  userBlocks: [] as { blocker_user_id: string; blocked_user_id: string; created_at: Date }[],
  nextId: 100,
});

const PERSISTENCE_FILE = path.join(process.cwd(), '.memory_store.json');

function saveStoreToDisk() {
  try {
    const dataToSave = {
      karyas: memoryStore.karyas,
      tutorials: memoryStore.tutorials,
      buku: memoryStore.buku,
      komentar: memoryStore.komentar,
      likes: memoryStore.likes,
      notifikasi: memoryStore.notifikasi,
      reaksi: memoryStore.reaksi,
      tafsir: memoryStore.tafsir,
      bedahKarya: memoryStore.bedahKarya,
      streaks: Array.from(memoryStore.streaks.entries()),
      profil: Array.from(memoryStore.profil.entries()),
      userGamification: Array.from(memoryStore.userGamification.entries()),
      badges: memoryStore.badges,
      userBadges: memoryStore.userBadges,
      xpHistory: memoryStore.xpHistory,
      nextId: memoryStore.nextId,
    };
    fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch {
    // Abaikan kegagalan tulis bila di environment tanpa izin write
  }
}

function loadStoreFromDisk() {
  try {
    if (fs.existsSync(PERSISTENCE_FILE)) {
      const raw = fs.readFileSync(PERSISTENCE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.karyas) && parsed.karyas.length > 0) {
        memoryStore.karyas = parsed.karyas.map((k: any) => ({
          ...k,
          created_at: new Date(k.created_at),
        }));
      }
      if (Array.isArray(parsed?.komentar)) {
        memoryStore.komentar = parsed.komentar.map((c: any) => ({
          ...c,
          created_at: new Date(c.created_at),
        }));
      }
      if (Array.isArray(parsed?.likes)) {
        memoryStore.likes = parsed.likes.map((l: any) => ({
          ...l,
          created_at: new Date(l.created_at),
        }));
      }
      if (Array.isArray(parsed?.notifikasi)) {
        memoryStore.notifikasi = parsed.notifikasi.map((n: any) => ({
          ...n,
          created_at: new Date(n.created_at),
        }));
      }
      if (Array.isArray(parsed?.reaksi)) {
        memoryStore.reaksi = parsed.reaksi.map((r: any) => ({
          ...r,
          created_at: new Date(r.created_at),
        }));
      }
      if (Array.isArray(parsed?.tafsir)) {
        memoryStore.tafsir = parsed.tafsir.map((t: any) => ({
          ...t,
          created_at: new Date(t.created_at),
        }));
      }
      if (Array.isArray(parsed?.profil) && parsed.profil.length > 0) {
        memoryStore.profil = new Map(
          parsed.profil.map(([uid, p]: [string, any]) => [
            uid,
            { ...p, created_at: new Date(p.created_at) },
          ])
        );
      }
      if (Array.isArray(parsed?.userGamification) && parsed.userGamification.length > 0) {
        memoryStore.userGamification = new Map(
          parsed.userGamification.map(([uid, g]: [string, any]) => [
            uid,
            { ...g, updated_at: new Date(g.updated_at) },
          ])
        );
      }
      if (parsed?.nextId && typeof parsed.nextId === 'number') {
        memoryStore.nextId = Math.max(memoryStore.nextId, parsed.nextId);
      }
    }
  } catch {
    // Gunakan initial state jika parse gagal
  }
}

// Muat data yang sudah tersimpan sebelumnya
loadStoreFromDisk();

async function runMemoryQuery(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  const q = text.trim();
  const upper = q.toUpperCase();

  // 1. TUTORIAL
  if (upper.includes('FROM TUTORIAL')) {
    if (upper.startsWith('SELECT * FROM TUTORIAL WHERE ID =') || (upper.includes('WHERE ID = $1') && upper.includes('TUTORIAL'))) {
      const id = Number(params[0]);
      const found = memoryStore.tutorials.find((t: TutorialItem) => t.id === id);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    const sorted = [...memoryStore.tutorials].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: sorted, rowCount: sorted.length };
  }

  if (upper.startsWith('INSERT INTO TUTORIAL')) {
    const [judul, kategori, isi_materi, penulis, waktu_baca] = params;
    const newItem: TutorialItem = {
      id: ++memoryStore.nextId,
      judul: String(judul || 'Tanpa Judul'),
      kategori: String(kategori || 'Materi'),
      isi_materi: String(isi_materi || ''),
      penulis: String(penulis || 'Admin'),
      waktu_baca: String(waktu_baca || '5 mnt baca'),
      created_at: new Date(),
    };
    memoryStore.tutorials.unshift(newItem);
    return { rows: [newItem], rowCount: 1 };
  }

  // 2. BUKU
  if (upper.includes('FROM BUKU')) {
    if (upper.includes('WHERE ID = $1')) {
      const id = Number(params[0]);
      const found = memoryStore.buku.find((b: BukuItem) => b.id === id);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    const sorted = [...memoryStore.buku].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: sorted, rowCount: sorted.length };
  }

  if (upper.startsWith('INSERT INTO BUKU')) {
    const [google_books_id, isbn_13, judul, penulis, penerbit, jumlah_halaman, genre, sinopsis, gambar_url] = params;
    const existingIndex = memoryStore.buku.findIndex((b: BukuItem) => google_books_id && b.google_books_id === google_books_id);
    const item: BukuItem = {
      id: existingIndex >= 0 ? memoryStore.buku[existingIndex].id : ++memoryStore.nextId,
      google_books_id: google_books_id ?? null,
      isbn_13: isbn_13 ?? null,
      judul: String(judul || 'Tanpa Judul'),
      penulis: String(penulis || 'Anonim'),
      penerbit: penerbit ?? null,
      jumlah_halaman: jumlah_halaman ? Number(jumlah_halaman) : null,
      genre: genre ?? 'Umum',
      sinopsis: sinopsis ?? '',
      gambar_url: gambar_url ?? '',
      created_at: new Date(),
    };
    if (existingIndex >= 0) {
      memoryStore.buku[existingIndex] = item;
    } else {
      memoryStore.buku.unshift(item);
    }
    return { rows: [item], rowCount: 1 };
  }

  // 3. KARYA
  if (upper.startsWith('DELETE FROM KARYA')) {
    const karyaId = Number(params[0]);
    const uid = params[1] ? String(params[1]) : null;
    const initialLen = memoryStore.karyas.length;
    memoryStore.karyas = memoryStore.karyas.filter((k: KaryaItem) => {
      if (k.id === karyaId) {
        if (uid && k.user_id && k.user_id !== uid) return true;
        return false;
      }
      return true;
    });
    saveStoreToDisk();
    return { rows: [], rowCount: initialLen - memoryStore.karyas.length };
  }

  if (upper.includes('FROM KARYA')) {
    if (upper.includes('WHERE ID = $1')) {
      const id = Number(params[0]);
      const found = memoryStore.karyas.find((k: KaryaItem) => k.id === id);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    if (upper.includes('USER_ID = $1') || upper.includes('USER_ID = $2')) {
      const uid = String(params[0]);
      let items = memoryStore.karyas.filter((k: KaryaItem) => k.user_id === uid);
      items = items.map((k) => {
        const total_likes = Math.max(k.jumlah_suka || 0, memoryStore.likes.filter((l: LikeItem) => l.karya_id === k.id).length);
        const total_komentar = Math.max(k.jumlah_komentar || 0, memoryStore.komentar.filter((c: KomentarItem) => c.karya_id === k.id).length);
        return { ...k, total_likes, total_komentar };
      });
      items.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: items, rowCount: items.length };
    }
    if (upper.includes('NAMA_CERITA') || (upper.includes('NOMOR_BAB') && upper.includes('WHERE'))) {
      const p0 = String(params[0] || '').toLowerCase().trim();
      const p1 = String(params[1] || '').toLowerCase().trim();
      const p2 = params[2] ? Number(params[2]) : 0;
      let matched = memoryStore.karyas.filter((k: KaryaItem) => {
        if (p2 && k.id === p2) return true;
        const kNama = (k.nama_cerita || '').toLowerCase().trim();
        const kJudul = (k.judul || '').toLowerCase().trim();
        if (p0 && (kNama === p0 || kJudul === p0)) return true;
        if (p1 && (kNama === p1 || kJudul === p1)) return true;
        return false;
      });
      if (matched.length === 0 && p2) {
        matched = memoryStore.karyas.filter((k) => k.id === p2);
      }
      matched.sort((a, b) => (a.nomor_bab || 1) - (b.nomor_bab || 1));
      return { rows: matched, rowCount: matched.length };
    }
    let list = [...memoryStore.karyas];
    if (upper.includes('WHERE K.KATEGORI = $1') || upper.includes('WHERE KATEGORI = $1')) {
      const kat = String(params[0]);
      if (kat && kat !== 'Semua') {
        const lowerKat = kat.toLowerCase();
        if (lowerKat.includes('novel') || lowerKat.includes('cerbung')) {
          list = list.filter((k) => {
            const kLower = k.kategori.toLowerCase();
            return (
              kLower.includes('novel') ||
              kLower.includes('cerbung') ||
              kLower.includes('cerita bersambung')
            );
          });
        } else {
          list = list.filter((k) => k.kategori.toLowerCase() === lowerKat);
        }
      }
    }
    const mapped = list.map((k) => {
      const total_likes = Math.max(k.jumlah_suka || 0, memoryStore.likes.filter((l: LikeItem) => l.karya_id === k.id).length);
      const total_komentar = Math.max(k.jumlah_komentar || 0, memoryStore.komentar.filter((c: KomentarItem) => c.karya_id === k.id).length);
      return { ...k, total_likes, total_komentar };
    });
    mapped.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: mapped, rowCount: mapped.length };
  }

  if (upper.startsWith('INSERT INTO KARYA')) {
    const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15] = params;
    let judul = p1;
    let kategori = p2;
    let isi_tulisan = p3;
    let nama_pengguna = p4;
    let status_penulis = p5;
    let link_trakteer = p6;
    let gambar_url = p7;
    let audio_url = p8;
    let user_id = p9;
    const nomor_bab = p10 ? Number(p10) : 1;
    const judul_bab = p11 ? String(p11) : null;
    const nama_cerita = p12 ? String(p12) : null;
    const sinopsis = p13 ? String(p13) : null;
    const status_cerita = p14 ? String(p14) : 'Ongoing';
    const genre = p15 ? String(p15) : 'Umum';
    const created_at = new Date();

    // Jika format lama [judul, isi_tulisan, kategori, nama_pengguna, ...]
    if (typeof p3 === 'string' && ['Puisi', 'Cerpen', 'Pantun', 'Novel', 'Cerita Bersambung'].includes(p3)) {
      judul = p1;
      isi_tulisan = p2;
      kategori = p3;
      nama_pengguna = p4;
      status_penulis = p5;
      link_trakteer = p6;
      gambar_url = p7;
      audio_url = null;
      user_id = p8;
    }

    const newItem: KaryaItem = {
      id: ++memoryStore.nextId,
      judul: String(judul || 'Tanpa Judul'),
      kategori: String(kategori || 'Puisi'),
      genre: genre,
      isi_tulisan: String(isi_tulisan || ''),
      nama_pengguna: String(nama_pengguna || 'Anonim'),
      status_penulis: String(status_penulis || 'Pelajar Sastra'),
      link_trakteer: link_trakteer ? String(link_trakteer) : null,
      gambar_url: gambar_url ? String(gambar_url) : null,
      audio_url: audio_url ? String(audio_url) : null,
      user_id: user_id ? String(user_id) : 'guest_user',
      jumlah_suka: 0,
      jumlah_komentar: 0,
      nomor_bab: nomor_bab,
      judul_bab: judul_bab,
      nama_cerita: nama_cerita,
      sinopsis: sinopsis,
      status_cerita: status_cerita,
      created_at: created_at,
    };
    memoryStore.karyas.unshift(newItem);
    saveStoreToDisk();
    return { rows: [newItem], rowCount: 1 };
  }

  if (upper.startsWith('UPDATE KARYA')) {
    if (upper.includes('JUMLAH_KOMENTAR')) {
      const karyaId = Number(params[0]);
      const found = memoryStore.karyas.find((k: KaryaItem) => k.id === karyaId);
      if (found) {
        found.jumlah_komentar = (found.jumlah_komentar || 0) + 1;
      }
    }
    if (upper.includes('JUMLAH_SUKA')) {
      const karyaId = Number(params[0]);
      const found = memoryStore.karyas.find((k: KaryaItem) => k.id === karyaId);
      if (found) {
        found.jumlah_suka = (found.jumlah_suka || 0) + 1;
      }
    }
    return { rows: [], rowCount: 1 };
  }

  // 4. LIKES
  if (upper.includes('FROM LIKES')) {
    if (upper.includes('COUNT(*)')) {
      const karyaId = Number(params[0]);
      const targetKarya = memoryStore.karyas.find((k: KaryaItem) => k.id === karyaId);
      const likesCount = memoryStore.likes.filter((l: LikeItem) => l.karya_id === karyaId).length;
      const count = Math.max(targetKarya?.jumlah_suka || 0, likesCount);
      return { rows: [{ total: count }], rowCount: 1 };
    }
  }

  if (upper.startsWith('INSERT INTO LIKES')) {
    const [karya_id, namaOrEmail] = params;
    const kid = Number(karya_id);
    const newLike: LikeItem = {
      id: ++memoryStore.nextId,
      karya_id: kid,
      nama_pengguna: String(namaOrEmail || 'Pembaca'),
      user_email: String(namaOrEmail || ''),
      created_at: new Date(),
    };
    memoryStore.likes.push(newLike);
    const targetKarya = memoryStore.karyas.find((k: KaryaItem) => k.id === kid);
    if (targetKarya) {
      targetKarya.jumlah_suka = (targetKarya.jumlah_suka || 0) + 1;
    }
    return { rows: [newLike], rowCount: 1 };
  }

  // 5. KOMENTAR
  if (upper.includes('FROM KOMENTAR')) {
    const karyaId = Number(params[0]);
    if (upper.includes('COUNT(*)')) {
      const targetKarya = memoryStore.karyas.find((k: KaryaItem) => k.id === karyaId);
      const commentCount = memoryStore.komentar.filter((c: KomentarItem) => c.karya_id === karyaId).length;
      const count = Math.max(targetKarya?.jumlah_komentar || 0, commentCount);
      return { rows: [{ total: count }], rowCount: 1 };
    }
    const items = memoryStore.komentar
      .filter((c: KomentarItem) => c.karya_id === karyaId)
      .sort((a: KomentarItem, b: KomentarItem) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: items, rowCount: items.length };
  }

  if (upper.startsWith('INSERT INTO KOMENTAR')) {
    const [karya_id, nama_pengguna, isi_komentar] = params;
    const kid = Number(karya_id);
    const newComment: KomentarItem = {
      id: ++memoryStore.nextId,
      karya_id: kid,
      nama_pengguna: String(nama_pengguna || 'Anonim'),
      isi_komentar: String(isi_komentar || ''),
      created_at: new Date(),
    };
    memoryStore.komentar.unshift(newComment);
    const targetKarya = memoryStore.karyas.find((k: KaryaItem) => k.id === kid);
    if (targetKarya) {
      targetKarya.jumlah_komentar = (targetKarya.jumlah_komentar || 0) + 1;
    }
    return { rows: [newComment], rowCount: 1 };
  }

  // 6. NOTIFIKASI
  if (upper.includes('FROM NOTIFIKASI')) {
    return { rows: memoryStore.notifikasi, rowCount: memoryStore.notifikasi.length };
  }

  // 7. PROFIL PENGGUNA
  if (upper.includes('FROM PROFIL_PENGGUNA')) {
    const uid = String(params[0] || '');
    let p = memoryStore.profil.get(uid);
    if (!p) {
      for (const val of memoryStore.profil.values()) {
        if (val.user_id === uid) {
          p = val;
          break;
        }
      }
    }
    if (p) {
      // Pastikan status_badge tidak terkorupsi dengan string data base64
      const safeBadge = p.status_badge && p.status_badge.startsWith('data:') ? 'Pelajar Sastra' : (p.status_badge || 'Pelajar Sastra');
      const safeFoto = p.foto_url || (p.status_badge && p.status_badge.startsWith('data:') ? p.status_badge : '');
      const cleanedProf = {
        ...p,
        email: p.email || '',
        status_badge: safeBadge,
        foto_url: safeFoto,
      };
      return { rows: [cleanedProf], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (upper.startsWith('INSERT INTO PROFIL_PENGGUNA')) {
    let uid = '';
    let email = '';
    let nama = 'Penulis Sastra';
    let foto_url = '';
    let status_badge = 'Pelajar Sastra';
    let bio = '';
    let link_donasi = '';

    if (params.length >= 7) {
      [uid, email, nama, foto_url, status_badge, bio, link_donasi] = params;
    } else {
      [uid, nama, foto_url, status_badge, bio, link_donasi] = params;
    }

    const targetUid = String(uid || '');
    const safeBadge = String(status_badge || 'Pelajar Sastra').startsWith('data:')
      ? 'Pelajar Sastra'
      : String(status_badge || 'Pelajar Sastra');
    const newProf: ProfilItem = {
      user_id: targetUid,
      email: email ? String(email) : null,
      nama: String(nama || 'Penulis Sastra'),
      foto_url: String(foto_url || ''),
      status_badge: safeBadge,
      bio: String(bio || ''),
      link_donasi: String(link_donasi || ''),
      created_at: new Date(),
    };
    memoryStore.profil.set(targetUid, newProf);
    saveStoreToDisk();
    return { rows: [newProf], rowCount: 1 };
  }

  if (upper.startsWith('UPDATE PROFIL_PENGGUNA')) {
    let nama = '';
    let foto_url = '';
    let status_badge = '';
    let bio = '';
    let link_donasi = '';
    let uid = '';

    if (params.length === 6) {
      [nama, foto_url, status_badge, bio, link_donasi, uid] = params;
    } else if (params.length >= 7) {
      [, nama, foto_url, status_badge, bio, link_donasi, uid] = params;
    }
    const targetUid = String(uid || params[params.length - 1] || '');
    const existing = memoryStore.profil.get(targetUid) || {
      user_id: targetUid,
      nama: 'Penulis Sastra',
      foto_url: '',
      status_badge: 'Pelajar Sastra',
      bio: '',
      link_donasi: '',
      created_at: new Date(),
    };
    const safeBadge =
      status_badge && String(status_badge).startsWith('data:')
        ? existing.status_badge
        : (status_badge || existing.status_badge);
    const updated: ProfilItem = {
      ...existing,
      nama: String(nama || existing.nama),
      foto_url: String(foto_url ?? existing.foto_url),
      status_badge: String(safeBadge || 'Pelajar Sastra'),
      bio: String(bio ?? existing.bio),
      link_donasi: String(link_donasi ?? existing.link_donasi),
    };
    memoryStore.profil.set(targetUid, updated);
    saveStoreToDisk();
    return { rows: [updated], rowCount: 1 };
  }

  // 8. USER GAMIFICATION
  if (upper.startsWith('INSERT INTO USER_GAMIFICATION')) {
    const uid = String(params[0]);
    if (!memoryStore.userGamification.has(uid)) {
      memoryStore.userGamification.set(uid, {
        user_id: uid,
        xp: 0,
        role: 'user',
        is_donatur: false,
        reputasi: 0,
        updated_at: new Date(),
      });
    }
    return { rows: [], rowCount: 1 };
  }

  if (upper.includes('FROM USER_GAMIFICATION')) {
    const uid = String(params[0]);
    const g = memoryStore.userGamification.get(uid);
    return { rows: g ? [g] : [], rowCount: g ? 1 : 0 };
  }

  if (upper.startsWith('UPDATE USER_GAMIFICATION')) {
    const xpAdd = Number(params[0]) || 0;
    const uid = String(params[1]);
    const g = memoryStore.userGamification.get(uid) || {
      user_id: uid,
      xp: 0,
      role: 'user',
      is_donatur: false,
      reputasi: 0,
      updated_at: new Date(),
    };
    g.xp += xpAdd;
    g.updated_at = new Date();
    memoryStore.userGamification.set(uid, g);
    return { rows: [g], rowCount: 1 };
  }

  // 9. BADGES & USER BADGES
  if (upper.includes('FROM BADGES') && upper.includes('WHERE KODE = $1')) {
    const kode = String(params[0]);
    const b = memoryStore.badges.find((badge: BadgeItem) => badge.kode === kode);
    return { rows: b ? [b] : [], rowCount: b ? 1 : 0 };
  }

  if (upper.includes('FROM USER_BADGES UB') && upper.includes('JOIN BADGES B')) {
    const uid = String(params[0]);
    const userBadgesList = memoryStore.userBadges.filter((ub: UserBadgeItem) => ub.user_id === uid);
    const result = userBadgesList.map((ub: UserBadgeItem) => {
      const b = memoryStore.badges.find((item: BadgeItem) => item.id === ub.badge_id) || {
        id: ub.badge_id,
        kode: 'badge',
        nama: 'Aksara',
        deskripsi: '',
        icon: '⭐',
        rarity: 'common',
      };
      return {
        id: b.id,
        kode: b.kode,
        nama: b.nama,
        deskripsi: b.deskripsi,
        icon: b.icon,
        rarity: b.rarity,
        didapatkan_pada: ub.didapatkan_pada,
      };
    });
    return { rows: result, rowCount: result.length };
  }

  if (upper.startsWith('INSERT INTO USER_BADGES')) {
    const [uid, badgeId] = params;
    const exists = memoryStore.userBadges.some((ub: UserBadgeItem) => ub.user_id === String(uid) && ub.badge_id === Number(badgeId));
    if (!exists) {
      memoryStore.userBadges.push({
        id: ++memoryStore.nextId,
        user_id: String(uid),
        badge_id: Number(badgeId),
        didapatkan_pada: new Date(),
      });
    }
    return { rows: [], rowCount: 1 };
  }

  // 10. XP HISTORY & TRANSACTIONS
  if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
    return { rows: [], rowCount: 0 };
  }

  if (upper.includes('FROM XP_HISTORY')) {
    if (upper.includes('WHERE') && upper.includes('USER_ID = $1') && upper.includes('JENIS = $2') && upper.includes('SOURCE_ID = $3')) {
      const [uid, jenis, sourceId] = params;
      const found = memoryStore.xpHistory.find((x: XpHistoryItem) => x.user_id === String(uid) && x.jenis === String(jenis) && x.source_id === String(sourceId));
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    if (upper.includes('SUM(JUMLAH_XP)')) {
      const [uid, jenis] = params;
      const total = memoryStore.xpHistory
        .filter((x: XpHistoryItem) => x.user_id === String(uid) && x.jenis === String(jenis))
        .reduce((sum: number, cur: XpHistoryItem) => sum + cur.jumlah_xp, 0);
      return { rows: [{ total }], rowCount: 1 };
    }
  }

  if (upper.startsWith('INSERT INTO XP_HISTORY')) {
    const [uid, jumlah_xp, jenis, keterangan, sourceId] = params;
    const item: XpHistoryItem = {
      id: ++memoryStore.nextId,
      user_id: String(uid),
      jumlah_xp: Number(jumlah_xp),
      jenis: String(jenis),
      keterangan: keterangan ? String(keterangan) : null,
      source_id: sourceId ? String(sourceId) : null,
      created_at: new Date(),
    };
    memoryStore.xpHistory.push(item);
    return { rows: [item], rowCount: 1 };
  }

  // 11. REAKSI SASTRA
  if (upper.includes('FROM REAKSI_SASTRA')) {
    const kid = Number(params[0]);
    if (upper.includes('COUNT(*)') && upper.includes('GROUP BY TIPE_REAKSI')) {
      const counts: Record<string, number> = {
        tersentuh: 0,
        membakar: 0,
        hangat: 0,
        memukau: 0,
      };
      memoryStore.reaksi
        .filter((r) => r.karya_id === kid)
        .forEach((r) => {
          counts[r.tipe_reaksi] = (counts[r.tipe_reaksi] || 0) + 1;
        });
      const rows = Object.entries(counts).map(([tipe_reaksi, count]) => ({
        tipe_reaksi,
        count,
      }));
      return { rows, rowCount: rows.length };
    }
    const items = memoryStore.reaksi.filter((r) => r.karya_id === kid);
    return { rows: items, rowCount: items.length };
  }

  if (upper.startsWith('INSERT INTO REAKSI_SASTRA')) {
    const [karya_id, tipe_reaksi, user_id, nama_pengguna] = params;
    const kid = Number(karya_id);
    const newReaksi: ReaksiSastraItem = {
      id: ++memoryStore.nextId,
      karya_id: kid,
      tipe_reaksi: (tipe_reaksi || 'tersentuh') as 'tersentuh' | 'membakar' | 'hangat' | 'memukau',
      user_id: user_id ? String(user_id) : 'guest_user',
      nama_pengguna: nama_pengguna ? String(nama_pengguna) : 'Pembaca',
      created_at: new Date(),
    };
    memoryStore.reaksi.push(newReaksi);
    const targetKarya = memoryStore.karyas.find((k) => k.id === kid);
    if (targetKarya) {
      targetKarya.jumlah_suka = (targetKarya.jumlah_suka || 0) + 1;
    }
    return { rows: [newReaksi], rowCount: 1 };
  }

  // 12. TAFSIR BAIT
  if (upper.includes('FROM TAFSIR_BAIT')) {
    const kid = Number(params[0]);
    const items = memoryStore.tafsir
      .filter((t) => t.karya_id === kid)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: items, rowCount: items.length };
  }

  if (upper.startsWith('INSERT INTO TAFSIR_BAIT')) {
    const [karya_id, bait_index, potongan_bait, nama_pengguna, user_id, isi_tafsir] = params;
    const newTafsir: TafsirBaitItem = {
      id: ++memoryStore.nextId,
      karya_id: Number(karya_id),
      bait_index: Number(bait_index || 0),
      potongan_bait: String(potongan_bait || ''),
      nama_pengguna: String(nama_pengguna || 'Anonim'),
      user_id: user_id ? String(user_id) : 'guest_user',
      isi_tafsir: String(isi_tafsir || ''),
      created_at: new Date(),
    };
    memoryStore.tafsir.unshift(newTafsir);
    return { rows: [newTafsir], rowCount: 1 };
  }

  // 13. USER STREAK
  if (upper.includes('FROM USER_STREAK')) {
    const uid = String(params[0] || 'guest_user');
    const today = new Date().toISOString().slice(0, 10);
    let s = memoryStore.streaks.get(uid);
    if (!s) {
      s = {
        user_id: uid,
        streak_count: 3, // Mulai dari hari ke-3 saat login
        last_active_date: today,
        total_hari_aktif: 3,
        rekor_streak: 7,
        last_bonus_claimed_date: null,
        updated_at: new Date(),
      };
      memoryStore.streaks.set(uid, s);
    } else if (s.streak_count < 3) {
      s.streak_count = 3;
    }
    return { rows: [s], rowCount: 1 };
  }

  if (upper.startsWith('INSERT INTO USER_STREAK') || upper.startsWith('UPDATE USER_STREAK')) {
    const uid = String(params[0] || 'guest_user');
    const today = new Date().toISOString().slice(0, 10);
    const existing = memoryStore.streaks.get(uid);
    let streakCount = 3;
    let totalHari = 3;
    let rekor = 7;
    let lastBonus: string | null = null;

    if (existing) {
      const lastDate = existing.last_active_date;
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 0) {
        streakCount = Math.max(existing.streak_count, 3);
        totalHari = existing.total_hari_aktif;
      } else if (diffDays === 1) {
        streakCount = Math.max(existing.streak_count + 1, 3);
        totalHari = existing.total_hari_aktif + 1;
      } else {
        streakCount = 3; // Reset ke minimal 3
        totalHari = existing.total_hari_aktif + 1;
      }
      rekor = Math.max(existing.rekor_streak || 7, streakCount);
      lastBonus = existing.last_bonus_claimed_date || null;
    }

    if (upper.includes('LAST_BONUS_CLAIMED_DATE')) {
      lastBonus = today;
    }

    const updated: UserStreakItem = {
      user_id: uid,
      streak_count: streakCount,
      last_active_date: today,
      total_hari_aktif: totalHari,
      rekor_streak: rekor,
      last_bonus_claimed_date: lastBonus,
      updated_at: new Date(),
    };
    memoryStore.streaks.set(uid, updated);
    return { rows: [updated], rowCount: 1 };
  }

  // 14. BEDAH KARYA
  if (upper.includes('FROM BEDAH_KARYA')) {
    if (upper.includes('WHERE ID = $1')) {
      const id = Number(params[0]);
      const found = memoryStore.bedahKarya.find((b) => b.id === id);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    const sorted = [...memoryStore.bedahKarya].sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    return { rows: sorted, rowCount: sorted.length };
  }

  if (upper.startsWith('INSERT INTO BEDAH_KARYA')) {
    const [karya_id, judul, penulis_karya, kategori, kutipan_karya, mentor_nama, mentor_gelar, minggu_ke, ulasan_diksi, ulasan_rima, ulasan_rasa, ulasan_pesan, kesimpulan, rating_apresiasi] = params;
    const newBedah: BedahKaryaItem = {
      id: ++memoryStore.nextId,
      karya_id: karya_id ? Number(karya_id) : null,
      judul: String(judul || 'Telaah Sastra'),
      penulis_karya: String(penulis_karya || 'Penulis Sastra'),
      kategori: String(kategori || 'Puisi'),
      kutipan_karya: String(kutipan_karya || ''),
      mentor_nama: String(mentor_nama || 'Kurator Sastra'),
      mentor_gelar: String(mentor_gelar || 'Pemerhati Sastra'),
      minggu_ke: String(minggu_ke || 'Minggu Ini'),
      ulasan_diksi: String(ulasan_diksi || ''),
      ulasan_rima: String(ulasan_rima || ''),
      ulasan_rasa: String(ulasan_rasa || ''),
      ulasan_pesan: String(ulasan_pesan || ''),
      kesimpulan: String(kesimpulan || ''),
      rating_apresiasi: Number(rating_apresiasi || 5),
      created_at: new Date(),
    };
    memoryStore.bedahKarya.unshift(newBedah);
    return { rows: [newBedah], rowCount: 1 };
  }

  // 15. CHAT / CONVERSATIONS / MESSAGES FALLBACK
  if (upper.includes('FROM CONVERSATIONS')) {
    const userId = String(params[0] || '');
    // Ambil percakapan di mana user terlibat
    const userConvs = memoryStore.conversationMembers.filter((m: ChatConversationMemberItem) => m.user_id === userId);
    const convRows = userConvs.map((mSelf: ChatConversationMemberItem) => {
      const conv = memoryStore.conversations.find((c: ChatConversationItem) => c.id === mSelf.conversation_id) || {
        id: mSelf.conversation_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const otherMember = memoryStore.conversationMembers.find(
        (m: ChatConversationMemberItem) => m.conversation_id === mSelf.conversation_id && m.user_id !== userId
      );
      const otherUid = otherMember?.user_id || 'unknown';
      const prof = memoryStore.profil.get(otherUid);
      const msgs = memoryStore.messages.filter((msg: ChatMessageItem) => msg.conversation_id === conv.id && !msg.deleted_at);
      msgs.sort((a: ChatMessageItem, b: ChatMessageItem) => b.created_at.getTime() - a.created_at.getTime());
      const lastMsg = msgs[0];
      const unreadCount = msgs.filter((msg: ChatMessageItem) => msg.sender_user_id !== userId && msg.created_at > (mSelf.last_read_at || new Date(0))).length;

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_user_id: otherUid,
        other_user_name: prof?.nama || otherUid,
        other_user_foto: prof?.foto_url || '',
        last_message: lastMsg?.isi || '',
        last_message_at: lastMsg?.created_at || null,
        unread_count: unreadCount,
      };
    });
    return { rows: convRows, rowCount: convRows.length };
  }

  if (upper.includes('FROM CONVERSATION_MEMBERS')) {
    if (upper.includes('COUNT(M1.CONVERSATION_ID) = 2')) {
      const [u1, u2] = params;
      const m1Convs = memoryStore.conversationMembers.filter((m: ChatConversationMemberItem) => m.user_id === String(u1)).map((m: ChatConversationMemberItem) => m.conversation_id);
      const m2Convs = memoryStore.conversationMembers.filter((m: ChatConversationMemberItem) => m.user_id === String(u2)).map((m: ChatConversationMemberItem) => m.conversation_id);
      const shared = m1Convs.find((cid: number) => m2Convs.includes(cid));
      if (shared) {
        return { rows: [{ conversation_id: shared }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (upper.includes('WHERE CONVERSATION_ID = $1 AND USER_ID = $2')) {
      const [cid, uid] = params;
      const found = memoryStore.conversationMembers.find((m: ChatConversationMemberItem) => m.conversation_id === Number(cid) && m.user_id === String(uid));
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }
    if (upper.includes('WHERE CONVERSATION_ID = $1')) {
      const cid = Number(params[0]);
      const found = memoryStore.conversationMembers.filter((m: ChatConversationMemberItem) => m.conversation_id === cid);
      return { rows: found, rowCount: found.length };
    }
  }

  if (upper.startsWith('INSERT INTO CONVERSATIONS')) {
    const newConv: ChatConversationItem = {
      id: ++memoryStore.nextId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    memoryStore.conversations.push(newConv);
    return { rows: [{ id: newConv.id }], rowCount: 1 };
  }

  if (upper.startsWith('INSERT INTO CONVERSATION_MEMBERS')) {
    const [cid, u1, u2] = params;
    const convId = Number(cid);
    memoryStore.conversationMembers.push({
      conversation_id: convId,
      user_id: String(u1),
      last_read_at: new Date(),
      joined_at: new Date(),
    });
    if (u2) {
      memoryStore.conversationMembers.push({
        conversation_id: convId,
        user_id: String(u2),
        last_read_at: new Date(),
        joined_at: new Date(),
      });
    }
    return { rows: [], rowCount: 1 };
  }

  if (upper.includes('FROM MESSAGES')) {
    const cid = Number(params[0]);
    if (upper.includes('COUNT(*)') && upper.includes('INTERVAL')) {
      return { rows: [{ count: 0 }], rowCount: 1 };
    }
    const msgs = memoryStore.messages.filter((m: ChatMessageItem) => m.conversation_id === cid && !m.deleted_at);
    msgs.sort((a: ChatMessageItem, b: ChatMessageItem) => a.created_at.getTime() - b.created_at.getTime());
    return { rows: msgs, rowCount: msgs.length };
  }

  if (upper.startsWith('INSERT INTO MESSAGES')) {
    const [cid, sender, isi] = params;
    const newMsg: ChatMessageItem = {
      id: ++memoryStore.nextId,
      conversation_id: Number(cid),
      sender_user_id: String(sender),
      isi: String(isi),
      created_at: new Date(),
      edited_at: null,
      deleted_at: null,
    };
    memoryStore.messages.push(newMsg);
    const conv = memoryStore.conversations.find((c: ChatConversationItem) => c.id === Number(cid));
    if (conv) conv.updated_at = new Date();
    return { rows: [newMsg], rowCount: 1 };
  }

  if (upper.startsWith('UPDATE CONVERSATION_MEMBERS')) {
    const [cid, uid] = params;
    const member = memoryStore.conversationMembers.find((m: ChatConversationMemberItem) => m.conversation_id === Number(cid) && m.user_id === String(uid));
    if (member) member.last_read_at = new Date();
    return { rows: [], rowCount: 1 };
  }

  if (upper.includes('FROM USER_BLOCKS')) {
    const [u1, u2] = params;
    const blocked = memoryStore.userBlocks.some(
      (b: ChatUserBlockItem) =>
        (b.blocker_user_id === String(u1) && b.blocked_user_id === String(u2)) ||
        (b.blocker_user_id === String(u2) && b.blocked_user_id === String(u1))
    );
    return { rows: blocked ? [{ blocked: 1 }] : [], rowCount: blocked ? 1 : 0 };
  }

  if (upper.startsWith('INSERT INTO USER_BLOCKS')) {
    const [u1, u2] = params;
    memoryStore.userBlocks.push({
      blocker_user_id: String(u1),
      blocked_user_id: String(u2),
      created_at: new Date(),
    });
    return { rows: [], rowCount: 1 };
  }

  if (upper.startsWith('DELETE FROM USER_BLOCKS')) {
    const [u1, u2] = params;
    memoryStore.userBlocks = memoryStore.userBlocks.filter(
      (b: ChatUserBlockItem) => !(b.blocker_user_id === String(u1) && b.blocked_user_id === String(u2))
    );
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// PostgreSQL Pool dengan koneksi lazy untuk serverless (Vercel + Neon)
declare global {
  var _neonPgPool: Pool | undefined;
}

function getPool(): Pool | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  // Gunakan cache pool yang sudah ada di runtime yang sama (serverless warm container)
  if (globalThis._neonPgPool) {
    return globalThis._neonPgPool;
  }

  try {
    const isLocal =
      databaseUrl.includes('localhost') ||
      databaseUrl.includes('127.0.0.1');

    // Konfigurasi pool PostgreSQL optimal untuk arsitektur serverless Neon
    const poolConfig: {
      connectionString: string;
      max: number;
      idleTimeoutMillis: number;
      connectionTimeoutMillis: number;
      ssl?: boolean | { rejectUnauthorized?: boolean };
    } = {
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    // Nonaktifkan SSL hanya untuk database lokal tanpa parameter sslmode
    if (isLocal && !databaseUrl.includes('sslmode=')) {
      poolConfig.ssl = false;
    }

    const poolInstance = new Pool(poolConfig);

    poolInstance.on('error', (err) => {
      console.warn('[AI Studio DB] Idle pool notice:', err?.message || err);
    });

    globalThis._neonPgPool = poolInstance;
    return poolInstance;
  } catch (err) {
    console.warn('[AI Studio DB] Gagal inisialisasi Pool postgres, fallback in-memory aktif:', (err as Error)?.message || err);
    return null;
  }
}

export interface ClientConnection {
  query: <T = any>(text: string, params?: any[]) => Promise<{ rows: T[]; rowCount: number }>;
  release: () => void;
}

// Resilient pool wrapper dengan lazy execution (tidak menjalankan migration otomatis saat import / build)
const pool = {
  query: async <T = any>(text: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> => {
    const realPool = getPool();
    if (realPool) {
      try {
        const result = await realPool.query(text, params);
        return { rows: result.rows as T[], rowCount: result.rowCount ?? result.rows.length };
      } catch (err: unknown) {
        console.warn('[AI Studio DB] Remote DB query gagal, beralih ke in-memory store:', (err as Error)?.message || err);
      }
    }
    const res = await runMemoryQuery(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount };
  },

  connect: async (): Promise<ClientConnection> => {
    const realPool = getPool();
    if (realPool) {
      try {
        const client = await realPool.connect();
        return {
          query: async <T = any>(text: string, params?: any[]) => {
            try {
              const result = await client.query(text, params);
              return { rows: result.rows as T[], rowCount: result.rowCount ?? result.rows.length };
            } catch (queryErr) {
              console.warn('[AI Studio DB] Client transaction query fallback:', queryErr);
              const fallback = await runMemoryQuery(text, params);
              return { rows: fallback.rows as T[], rowCount: fallback.rowCount };
            }
          },
          release: () => {
            try {
              client.release();
            } catch {}
          },
        };
      } catch (err: unknown) {
        console.warn('[AI Studio DB] Real DB connect gagal, menggunakan in-memory client:', (err as Error)?.message || err);
      }
    }

    return {
      query: async <T = any>(text: string, params: any[] = []) => {
        const res = await runMemoryQuery(text, params);
        return { rows: res.rows as T[], rowCount: res.rowCount };
      },
      release: () => {},
    };
  },
};

export default pool;
