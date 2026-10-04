import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/seo';

export const metadata: Metadata = {
  title: 'Tentang Kami — Mengenal Fadrodzak',
  description:
    'Mengenal Fadrodzak: wadah literasi, ruang apresiasi karya sastra independen, dan komunitas aksara untuk merayakan puisi, cerpen, serta sastra Nusantara.',
  alternates: {
    canonical: `${SITE_URL}/tentang-kami`,
  },
  openGraph: {
    title: 'Tentang Kami — Mengenal Fadrodzak',
    description:
      'Mengenal Fadrodzak: wadah literasi, ruang apresiasi karya sastra independen, dan komunitas aksara untuk merayakan puisi, cerpen, serta sastra Nusantara.',
    url: `${SITE_URL}/tentang-kami`,
    type: 'website',
  },
};

export default function TentangKamiPage() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto pb-28 bg-[#FAF8F5]">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <Link href="/profil" className="text-xs text-gray-500 hover:text-terracotta transition font-serif flex items-center gap-1">
          &larr; Kembali ke Profil
        </Link>
      </div>

      <header className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-terracotta font-bold">Tentang Kami</span>
        <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] mt-2 mb-3">Fadrodzak</h1>
        <p className="italic text-gray-600 font-serif text-sm">
          &ldquo;Tempat di mana kata-kata menemukan rumahnya.&rdquo;
        </p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#EAEAEA] space-y-6 text-[#444444] font-serif leading-relaxed text-sm">
        <section>
          <h2 className="font-bold text-lg text-[#2C2C2C] font-sans mb-2">🌿 Ruang Sastra & Aksara</h2>
          <p>
            <strong>Fadrodzak</strong> adalah wadah literasi dan ruang apresiasi karya sastra independen yang didirikan untuk merayakan kekayaan kata-kata, puisi, pantun, serta cerita fiksi Nusantara. Kami percaya setiap rasa berhak memiliki ruang ungkap, dan setiap baris aksara berhak menemukan pembaca yang meresapinya.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg text-[#2C2C2C] font-sans mb-2">✨ Misi Kami</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menyediakan ekosistem literasi yang inklusif, hangat, dan nyaman bagi para penulis pemula maupun kawakan.</li>
            <li>Menjembatani karya sastra dalam bentuk digital yang mudah diakses baik melalui website maupun aplikasi Android.</li>
            <li>Mengembangkan katalog <em>Book Corner</em> sebagai rujukan apresiasi dan telaah literatur terpilih.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg text-[#2C2C2C] font-sans mb-2">🤝 Dukungan Komunitas</h2>
          <p className="mb-3">
            Platform ini terus berkembang berkat dedikasi pegiat aksara dan dukungan sukarela para pembaca setia melalui sarana apresiasi. Terima kasih telah menjadi bagian dari perjalanan kata-kata kami.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://trakteer.id/ahmad_rahman7/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-900/15 text-xs text-[#C85A32] font-semibold hover:bg-amber-100 transition"
            >
              <span>☕</span>
              <span>Dukung via Trakteer &rarr;</span>
            </a>
            <a
              href="https://www.instagram.com/fadrodzak_el_fa?stkn=M2tlYXhuZWhpMHdq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold hover:bg-stone-100 hover:text-[#C85A32] transition"
            >
              <span>💬</span>
              <span>Kritik &amp; Saran (@fadrodzak_el_fa) &rarr;</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}