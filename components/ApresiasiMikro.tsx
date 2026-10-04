'use client';

import { useState, useTransition } from 'react';
import confetti from 'canvas-confetti';

export type ReaksiTipe = 'tersentuh' | 'membakar' | 'hangat' | 'memukau';

interface ReaksiData {
  tipe: ReaksiTipe;
  label: string;
  emoji: string;
  warna: string;
  count: number;
}

interface ApresiasiMikroProps {
  karyaId: number;
  initialCounts?: Record<string, number>;
  onReactAction?: (karyaId: number, tipe: ReaksiTipe) => Promise<void>;
}

export default function ApresiasiMikro({
  karyaId,
  initialCounts = {},
  onReactAction,
}: ApresiasiMikroProps) {
  const [counts, setCounts] = useState<Record<ReaksiTipe, number>>({
    tersentuh: initialCounts.tersentuh || 0,
    membakar: initialCounts.membakar || 0,
    hangat: initialCounts.hangat || 0,
    memukau: initialCounts.memukau || 0,
  });

  const [userSelected, setUserSelected] = useState<ReaksiTipe | null>(null);
  const [isPending, startTransition] = useTransition();

  const daftarReaksi: ReaksiData[] = [
    {
      tipe: 'tersentuh',
      label: 'Tersentuh',
      emoji: '🍂',
      warna: 'hover:border-amber-400 hover:bg-amber-50 text-amber-900',
      count: counts.tersentuh,
    },
    {
      tipe: 'membakar',
      label: 'Membakar Semangat',
      emoji: '🔥',
      warna: 'hover:border-red-400 hover:bg-red-50 text-red-900',
      count: counts.membakar,
    },
    {
      tipe: 'hangat',
      label: 'Hangat',
      emoji: '☕',
      warna: 'hover:border-orange-400 hover:bg-orange-50 text-orange-900',
      count: counts.hangat,
    },
    {
      tipe: 'memukau',
      label: 'Memukau',
      emoji: '✨',
      warna: 'hover:border-purple-400 hover:bg-purple-50 text-purple-900',
      count: counts.memukau,
    },
  ];

  const handlePilihReaksi = (tipe: ReaksiTipe, e: React.MouseEvent) => {
    // Efek partikel konfeti sastra mikro
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 24,
      spread: 60,
      origin: { x, y },
      colors: ['#C45A2C', '#D4AF37', '#8B5A2B', '#E5A93B'],
      disableForReducedMotion: true,
      scalar: 0.8,
    });

    setUserSelected(tipe);
    setCounts((prev) => ({
      ...prev,
      [tipe]: prev[tipe] + 1,
    }));

    if (onReactAction) {
      startTransition(async () => {
        try {
          await onReactAction(karyaId, tipe);
        } catch (err) {
          console.warn('Gagal mencatat apresiasi:', err);
        }
      });
    }
  };

  const totalApresiasi = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="py-4 border-y border-[#EDE4D8] my-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-serif font-bold text-[#7A6B63] uppercase tracking-wider">
          Apresiasi Rasa Sastra:
        </span>
        <span className="text-xs text-[#8E8E8E] font-serif">
          {totalApresiasi} Jejak Apresiasi
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {daftarReaksi.map((r) => {
          const isSelected = userSelected === r.tipe;
          return (
            <button
              key={r.tipe}
              type="button"
              onClick={(e) => handlePilihReaksi(r.tipe, e)}
              disabled={isPending}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all active:scale-95 text-left ${
                isSelected
                  ? 'border-[#C45A2C] bg-[#FAF0E6] text-[#C45A2C] ring-2 ring-[#C45A2C]/20 font-bold'
                  : `border-[#E5DDD2] bg-white ${r.warna}`
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl select-none" role="img" aria-label={r.label}>
                  {r.emoji}
                </span>
                <span className="text-xs font-serif font-medium line-clamp-1">
                  {r.label}
                </span>
              </div>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                isSelected ? 'bg-[#C45A2C] text-white' : 'bg-[#F4EFEA] text-[#555]'
              }`}>
                {r.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
