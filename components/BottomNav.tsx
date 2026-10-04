'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBeranda,
  IconBelajar,
  IconTulis,
  IconProfil,
} from './NavIcons';

export default function BottomNav() {
  const pathname = usePathname();

  // Menu Utama berestetika sastra dengan ikon ilustrasi khas Fadrodzak
  const navItems = [
    {
      name: 'Beranda',
      path: '/',
      renderIcon: (isActive: boolean) => <IconBeranda size={24} isActive={isActive} />,
    },
    {
      name: 'Belajar',
      path: '/belajar',
      renderIcon: (isActive: boolean) => <IconBelajar size={24} isActive={isActive} />,
    },
    {
      name: 'Tulis',
      path: '/tulis',
      renderIcon: (isActive: boolean) => <IconTulis size={24} isActive={isActive} />,
    },
    {
      name: 'Profil',
      path: '/profil',
      renderIcon: (isActive: boolean) => <IconProfil size={24} isActive={isActive} />,
    },
  ];

  return (
    <>
      {/* Memberi jarak di bagian bawah halaman agar konten tidak tertutup menu */}
      <div className="h-20"></div>

      {/* Navigasi Bawah */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-amber-900/15 pb-safe z-50 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-2 sm:py-2.5">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`group flex flex-col items-center gap-1 min-w-[62px] px-2 py-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#C85A32] font-bold bg-[#C85A32]/8 shadow-2xs'
                    : 'text-stone-500 hover:text-[#2C2A29] hover:bg-amber-900/5'
                }`}
              >
                <div className="h-6 flex items-center justify-center">
                  {item.renderIcon(isActive)}
                </div>
                <span
                  className={`text-[10px] tracking-wider uppercase font-serif transition-colors ${
                    isActive ? 'text-[#C85A32] font-black' : 'text-stone-500 group-hover:text-stone-800'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
