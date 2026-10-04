export type LevelInfo = {
  level: number;
  nama: string;
  icon: string;

  minXp: number;
  nextXp: number | null;

  ringColor: string;
  badgeColor: string;
};

export function getLevelInfo(
  xp: number
): LevelInfo {
  if (xp >= 1500) {
    return {
      level: 5,

      nama: 'Maestro Sastra',

      icon: '👑',

      minXp: 1500,

      nextXp: null,

      ringColor:
        'ring-yellow-400 shadow-yellow-300',

      badgeColor:
        'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900 border-yellow-300',
    };
  }

  if (xp >= 700) {
    return {
      level: 4,

      nama: 'Pujangga',

      icon: '🔮',

      minXp: 700,

      nextXp: 1500,

      ringColor:
        'ring-purple-500 shadow-purple-300',

      badgeColor:
        'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  if (xp >= 300) {
    return {
      level: 3,

      nama: 'Penenun Kisah',

      icon: '🌊',

      minXp: 300,

      nextXp: 700,

      ringColor:
        'ring-blue-400 shadow-blue-200',

      badgeColor:
        'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  if (xp >= 100) {
    return {
      level: 2,

      nama: 'Perajin Aksara',

      icon: '🌿',

      minXp: 100,

      nextXp: 300,

      ringColor:
        'ring-emerald-400 shadow-emerald-200',

      badgeColor:
        'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  return {
    level: 1,

    nama: 'Peramu Kata',

    icon: '🍂',

    minXp: 0,

    nextXp: 100,

    ringColor:
      'ring-gray-300 shadow-gray-200',

    badgeColor:
      'bg-gray-100 text-gray-600 border-gray-200',
  };
}