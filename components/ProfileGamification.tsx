'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  getGamificationProfile,
} from '../app/actions/gamification';

import GamificationCard
  from './GamificationCard';

type GamificationData = {
  xp: number;

  role: string;

  isDonatur: boolean;

  reputasi: number;

  badges: {
    id: number;
    kode: string;
    nama: string;
    deskripsi:
      string | null;
    icon: string;
    rarity: string;
  }[];
};

type Props = {
  userId: string;
};

export default function ProfileGamification({
  userId,
}: Props) {
  const [
    data,
    setData,
  ] =
    useState<GamificationData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    let aktif = true;

    async function ambilData() {
      setLoading(true);

      const hasil =
        await getGamificationProfile(
          userId
        );

      if (
        aktif &&
        hasil
      ) {
        setData(
          hasil as GamificationData
        );
      }

      if (aktif) {
        setLoading(false);
      }
    }

    if (userId) {
      ambilData();
    }

    return () => {
      aktif = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="mt-6 bg-white border border-[#EAEAEA] rounded-3xl p-6 text-center">
        <p className="text-sm text-gray-400">
          Memuat perjalanan aksara...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 bg-white border border-[#EAEAEA] rounded-3xl p-6 text-center">
        <p className="text-sm text-gray-400">
          Data gamifikasi belum tersedia.
        </p>
      </div>
    );
  }

  return (
    <GamificationCard
      xp={data.xp}
      role={data.role}
      isDonatur={
        data.isDonatur
      }
      reputasi={
        data.reputasi
      }
      badges={
        data.badges
      }
    />
  );
}