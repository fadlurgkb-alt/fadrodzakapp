/**
 * FADRODZAK BOT SASTRA CRON JOB
 * Berjalan otomatis setiap 3 jam untuk menerbitkan karya sastra berkualitas
 */

const API_BASE_URL = (process.env.API_BASE_URL || 'https://fadrodzak.my.id').replace(/\/+$/, '');

const PENULIS_LIST = [
  { nama: 'Aksara Senja', status: 'Penikmat Kopi & Puisi Malam', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Dewi Lestari Sukma', status: 'Penjelajah Sajak Nusantara', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Bayu Samudra Kata', status: 'Penyair Pesisir & Ombak Jiwa', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Rintik Hujan', status: 'Pengamat Kesunyian Kota', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Pena Pengelana', status: 'Pustakawan Hati & Cerpenis', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Kala Jingga', status: 'Pegiat Catatan Sastra Modern', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Arka Nirwana', status: 'Filosofi Aksara & Pantunis', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Siti Nurhaliza Sastra', status: 'Pencinta Hikayat Melayu & Pantun', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Rangga Prawira', status: 'Penenun Sajak & Esais', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Kirana Lazuardi', status: 'Pengelana Kata & Sastrawan Muda', trakteer: 'https://fadrodzak.my.id' }
];

const BANK_KARYA = [
  {
    kategori: 'Puisi',
    judul: 'Di Sudut Kafe yang Menyimpan Hujan',
    isi: 'Ada secangkir kopi yang mendingin perlahan,\nmenghitung detik yang jatuh bersama gerimis di kaca jendela.\n\nKau bertanya ke mana perginya kata-kata\nyang dulu riuh merayakan temu?\nAku menunjuk genangan air di pelataran:\n"Mereka tidak hilang, kasih,\nhanya memilih memantulkan langit yang sedang belajar merelakan."'
  },
  {
    kategori: 'Puisi',
    judul: 'Merpati yang Tak Pernah Lupa Rumah',
    isi: 'Sayapmu menembus kabut petang,\nmembawa sehelai kertas bersulam kata.\nJarak hanyalah angka di atas peta,\nsedang degup rasa adalah kompas yang setia.\n\nTerbanglah merpati,\nsampaikan salam pada bait puisi\nyang sabar menunggu di seberang sepi.'
  },
  {
    kategori: 'Puisi',
    judul: 'Resonansi Hening di Balik Jendela',
    isi: 'Bukan suara riuh yang menyembuhkan letih hari,\nmelainkan ketukan halus rintik air pada genting tua.\nDi sanalah kita belajar mengeja hening,\nbahwa yang tak terucap seringkali lebih jujur\ndaripada seribu janji yang diucapkan tergesa.'
  },
  {
    kategori: 'Pantun',
    judul: 'Pantun Rembulan dan Sahabat Pena',
    isi: 'Bulan purnama bersinar terang,\nMenyinari perahu di muara rapi.\nMeski jarak membentang panjang,\nUntaian bait mengikat di hati.\n\nBunga cempaka harum mewangi,\nDipetik gadis di tepi taman.\nMari membaca setiap hari,\nAksara sastra teman sepanjang zaman.'
  },
  {
    kategori: 'Pantun',
    judul: 'Pantun Cahaya Ilmu & Budi Pekerti',
    isi: 'Berlayar sampan ke Selat Malaka,\nSinggah berteduh di pohon cemara.\nBudi pekerti pelita jiwa,\nBahasa indah penyejuk lara.\n\nPohon kelapa tinggi menjulang,\nBuahnya manis segar terasa.\nRajin menulis budi tak hilang,\nHarum abadi sepanjang masa.'
  },
  {
    kategori: 'Cerpen',
    judul: 'Lelaki Penjual Kata di Pasar Malam',
    isi: 'Di antara aroma gulali dan deru komedi putar, Pak Sastro menggelar tikar kecil berisi botol-botol kaca kosong. Di setiap botol tertulis label: "Pengampunan", "Keberanian Memulai", dan "Rindu yang Tidak Menuntut".\n\nSeorang pemuda mendekat dengan wajah murung. "Berapa harga satu botol Keberanian, Pak?"\n\nPak Sastro tersenyum lembut. "Cukup bayar dengan satu kalimat jujur yang paling kau takuti untuk diucapkan malam ini."'
  },
  {
    kategori: 'Cerpen',
    judul: 'Buku Catatan Bersampul Kain Beludru',
    isi: 'Di sebuah loteng berdebu, sebuah buku bersampul beludru biru tua ditemukan oleh Rian. Tidak ada tulisan cetak di dalamnya, hanya tinta cokelat yang mengering rapi.\n\n"Tanggal 14 Oktober: Jangan pernah takut jika ceritamu belum selesai. Yang paling penting adalah keberanian untuk tidak merobek halaman yang pernah kau tulis dengan air mata."\n\nRian tersenyum, lalu membuka halaman kosong berikutnya untuk menuliskan bait miliknya sendiri.'
  },
  {
    kategori: 'Novel & Cerbung',
    judul: 'Gadis Penenun Benang Emas — Bab 1',
    isi: 'Di sebuah desa sunyi di kaki Pegunungan Seribu, hiduplah Rengganis, seorang penenun yang mewarisi alat tenun kuno dari mendiang neneknya.\n\nSetiap helai benang yang ia lintangkan di kayu jati itu seolah berbisik, meramalkan takdir siapa saja yang kelak mengenakan kainnya.\n\n"Jangan pernah menenun saat hatimu bimbang," pesan sang nenek dulu. Namun malam ini, gerimis turun deras dan ketukan di pintu kayunya mengabarkan bahwa seorang pengelana terluka butuh perlindungan.'
  },
  {
    kategori: 'Novel & Cerbung',
    judul: 'Melodi di Ujung Senja — Bab 1: Pertemuan Kereta Malam',
    isi: 'Kereta Senja Utama melaju tenang membelah hamparan sawah basah. Di kursi 14A, Alana menatap lembaran partitur biola yang belum sempat ia selesaikan.\n\nTiba-tiba seorang pemuda dengan ransel kanvas cokelat duduk di seberangnya, meletakkan cangkir kopi panas dengan senyum bersahabat.\n\n"Nada kelima komposisimu terdengar indah," sapanya hangat. Percakapan di tengah deru roda besi itu membuka babak baru dalam hidup Alana yang selama ini sunyi.'
  }
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function kirimKaryaDenganRetry(payload, maxRetry = 3) {
  const targetUrl = `${API_BASE_URL}/api/karya`;

  for (let attempt = 1; attempt <= maxRetry; attempt++) {
    console.log(`[Percobaan ${attempt}/${maxRetry}] Mengunggah: "${payload.judul}" oleh ${payload.nama_pengguna} ke ${targetUrl}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Fadrodzak-Bot-Sastra/2.0 (GitHub-Cron-Automated)'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await res.text();

      if (res.ok) {
        let resultJson = {};
        try {
          resultJson = JSON.parse(responseText);
        } catch {
          resultJson = { raw: responseText };
        }
        console.log(`✅ [SUKSES] Karya berhasil terbit otomatis!`);
        console.log(`ID Terbit: ${resultJson.id || 'N/A'}, Judul: "${payload.judul}"`);
        return true;
      } else {
        console.warn(`⚠️ [HTTP ${res.status}] Gagal pada percobaan ${attempt}: ${responseText}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Network Error] Gagal pada percobaan ${attempt}: ${err.message || err}`);
    }

    if (attempt < maxRetry) {
      const delayMs = attempt * 3000;
      console.log(`Menunggu ${delayMs / 1000} detik sebelum mencoba kembali...`);
      await sleep(delayMs);
    }
  }

  return false;
}

async function main() {
  console.log(`=== BOT SASTRA FADRODZAK RUNNER ===`);
  console.log(`Waktu eksekusi: ${new Date().toISOString()}`);
  console.log(`Target URL: ${API_BASE_URL}`);

  const penulis = PENULIS_LIST[Math.floor(Math.random() * PENULIS_LIST.length)];
  const karya = BANK_KARYA[Math.floor(Math.random() * BANK_KARYA.length)];

  const payload = {
    judul: karya.judul,
    isi_tulisan: karya.isi,
    isiTulisan: karya.isi,
    kategori: karya.kategori,
    nama_pengguna: penulis.nama,
    namaPengguna: penulis.nama,
    status_penulis: penulis.status,
    statusPenulis: penulis.status,
    link_trakteer: penulis.trakteer,
    linkTrakteer: penulis.trakteer
  };

  const sukses = await kirimKaryaDenganRetry(payload);

  if (sukses) {
    console.log(`=== BOT SELESAI DENGAN STATUS BERHASIL ===`);
    process.exit(0);
  } else {
    console.error(`❌ [FATAL] Gagal menerbitkan karya setelah seluruh percobaan retry.`);
    process.exit(1);
  }
}

main();
