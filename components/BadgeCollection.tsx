'use client';

import { useState } from 'react';

type Badge = {
  id: number;
  nama: string;
  deskripsi?: string | null;
  icon: string;
  rarity: string;
};

type Props = {
  badges: Badge[];
};

function getRarityStyle(
  rarity?: string | null
) {
  const safeRarity = String(rarity || 'common').toLowerCase();
  switch (safeRarity) {
    case 'legendary':
      return {
        card:
          'border-yellow-300 bg-yellow-50',
        label:
          'text-yellow-700 bg-yellow-100',
      };

    case 'epic':
      return {
        card:
          'border-purple-300 bg-purple-50',
        label:
          'text-purple-700 bg-purple-100',
      };

    case 'rare':
      return {
        card:
          'border-blue-300 bg-blue-50',
        label:
          'text-blue-700 bg-blue-100',
      };

    case 'uncommon':
      return {
        card:
          'border-emerald-300 bg-emerald-50',
        label:
          'text-emerald-700 bg-emerald-100',
      };

    case 'special':
      return {
        card:
          'border-rose-300 bg-rose-50',
        label:
          'text-rose-700 bg-rose-100',
      };

    default:
      return {
        card:
          'border-gray-200 bg-[#FAF8F5]',
        label:
          'text-gray-500 bg-gray-100',
      };
  }
}

export default function BadgeCollection({
  badges,
}: Props) {
  const [
    selectedBadge,
    setSelectedBadge,
  ] =
    useState<Badge | null>(
      null
    );

  if (
    badges.length === 0
  ) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5">

        <h3 className="font-serif font-bold text-[#2C2C2C] mb-3">
          Koleksi Badge
        </h3>

        <p className="text-xs text-gray-400 italic">
          Belum memiliki badge.
        </p>

      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#EAEAEA] rounded-3xl p-5">

        <div className="mb-4">

          <h3 className="font-serif font-bold text-[#2C2C2C]">
            Koleksi Badge
          </h3>

          <p className="text-[10px] text-gray-400 mt-1">
            Tekan badge untuk melihat detail dan benefit.
          </p>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {badges.map(
            (badge) => {

              const style =
                getRarityStyle(
                  badge.rarity
                );

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() =>
                    setSelectedBadge(
                      badge
                    )
                  }
                  className={`
                    ${style.card}
                    border
                    rounded-2xl
                    p-4
                    text-center
                    transition
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-md
                    active:scale-95
                    cursor-pointer
                  `}
                >

                  <div className="text-4xl mb-2">
                    {badge.icon}
                  </div>

                  <p className="font-bold text-xs text-[#2C2C2C]">
                    {badge.nama}
                  </p>

                  <span
                    className={`
                      ${style.label}
                      inline-block
                      mt-2
                      px-2
                      py-0.5
                      rounded-full
                      uppercase
                      text-[8px]
                      font-bold
                      tracking-wider
                    `}
                  >
                    {badge.rarity}
                  </span>

                  <p className="text-[9px] font-bold text-terracotta mt-3">
                    Lihat Detail →
                  </p>

                </button>
              );
            }
          )}

        </div>

      </div>


      {/* MODAL DETAIL BADGE */}

      {selectedBadge && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setSelectedBadge(
              null
            )
          }
        >

          <div
            className="relative bg-white max-w-sm w-full rounded-3xl shadow-2xl border border-[#EAEAEA] p-7"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setSelectedBadge(
                  null
                )
              }
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              aria-label="Tutup"
            >
              ✕
            </button>


            <div className="text-center">

              <div className="text-6xl mb-4">
                {
                  selectedBadge.icon
                }
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2C2C2C]">
                {
                  selectedBadge.nama
                }
              </h2>

              <p className="uppercase text-[10px] tracking-[0.2em] text-gray-400 font-bold mt-2">
                {
                  selectedBadge.rarity
                }
              </p>


              <div className="mt-6 bg-[#FAF8F5] border border-[#EAEAEA] rounded-2xl p-5 text-left">

                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A66D58] mb-2">
                  Tentang Badge
                </p>

                <p className="text-sm text-[#555555] font-serif leading-relaxed">
                  {
                    selectedBadge.deskripsi ||
                    'Deskripsi badge belum tersedia.'
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedBadge(
                    null
                  )
                }
                className="w-full mt-6 py-3 rounded-xl bg-[#2C2C2C] text-white text-sm font-bold hover:bg-black transition"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}