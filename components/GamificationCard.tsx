import {
  getLevelInfo,
} from '../lib/gamification';

type Props = {
  xp: number;
  role?: string;
  isDonatur?: boolean;
  reputasi?: number;
  badges?: unknown[];
};

export default function GamificationCard({
  xp = 0,
  role = 'user',
  isDonatur = false,
  reputasi = 0,
}: Props) {
  const safeXp = typeof xp === 'number' && !isNaN(xp) ? Math.max(0, xp) : 0;
  const safeReputasi = typeof reputasi === 'number' && !isNaN(reputasi) ? Math.max(0, reputasi) : 0;

  const level = getLevelInfo(safeXp);

  let progress = 100;

  if (level.nextXp) {
    progress =
      ((safeXp - level.minXp) /
        (level.nextXp - level.minXp)) *
      100;
  }

  progress = Math.max(0, Math.min(isNaN(progress) ? 0 : progress, 100));

  return (
    <section className="mt-6 space-y-5">

      {/* ================================
          LEVEL
      ================================= */}

      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-6 shadow-sm">

        <div className="flex justify-between items-start gap-3 mb-4">

          <div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
              Perjalanan Aksara
            </p>

            <h2 className="text-xl font-serif font-bold text-[#2C2C2C] mt-1">
              {level.icon}{' '}
              {level.nama}
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Level {level.level}
            </p>

          </div>

          <div
            className={`
              px-3
              py-1.5
              rounded-full
              border
              text-xs
              font-bold
              ${level.badgeColor}
            `}
          >
            {xp} XP
          </div>

        </div>


        {/* PROGRESS BAR */}

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

          <div
            className="h-full rounded-full bg-[#C95D32] transition-all duration-700"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        {level.nextXp ? (

          <div className="flex justify-between gap-3 mt-2 text-[11px] text-gray-400">

            <span>
              {xp} XP
            </span>

            <span className="text-right">
              {level.nextXp -
                xp}{' '}
              XP lagi menuju level berikutnya
            </span>

          </div>

        ) : (

          <p className="text-xs text-yellow-700 mt-3 font-semibold">
            👑 Level tertinggi telah tercapai.
          </p>

        )}

      </div>


      {/* ================================
          ROLE KHUSUS
      ================================= */}

      {(role !== 'user' ||
        isDonatur) && (

        <div className="flex flex-wrap gap-2">

          {role ===
            'admin' && (
            <span className="px-3 py-1.5 rounded-full bg-[#2C2C2C] text-white text-xs font-bold">
              🏛️ Penjaga Titah
            </span>
          )}

          {role ===
            'mentor' && (
            <span className="px-3 py-1.5 rounded-full bg-[#D48F48] text-white text-xs font-bold">
              📚 Guru Sastra
            </span>
          )}

          {isDonatur && (
            <span className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              ☕ Sahabat Aksara
            </span>
          )}

        </div>

      )}


      {/* ================================
          REPUTASI
      ================================= */}

      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5">

        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
          Reputasi Sastra
        </p>

        <div className="flex items-center gap-3">

          <span className="text-2xl">
            ⭐
          </span>

          <div>

            <p className="text-xl font-bold text-[#2C2C2C]">
              {safeReputasi.toFixed(1)}
            </p>

            <p className="text-xs text-gray-400">
              Penilaian kontribusi komunitas
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}