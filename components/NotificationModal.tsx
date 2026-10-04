'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles, Check, CheckCircle2, Send } from 'lucide-react';

interface NotifItem {
  id: number;
  kategori: 'apresiasi' | 'streak' | 'tantangan' | 'redaksi';
  judul: string;
  pesan: string;
  waktu: string;
  icon: string;
  bgColor: string;
  textColor: string;
  link: string;
  isRead?: boolean;
}

const INITIAL_NOTIF_DATA: NotifItem[] = [
  {
    id: 1,
    kategori: 'apresiasi',
    judul: 'Apresiasi Rasa Sastra 🍂',
    pesan: 'Seseorang menitipkan apresiasi "🍂 Tersentuh" pada bait sajakmu.',
    waktu: '15 menit lalu',
    icon: '🍂',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    link: '/karya/1',
    isRead: false,
  },
  {
    id: 2,
    kategori: 'streak',
    judul: 'Pena Tak Padam 🔥',
    pesan: 'Streak membacamu telah mencapai 3 hari! Teruskan membaca bait hari ini.',
    waktu: '3 jam lalu',
    icon: '🔥',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    link: '/',
    isRead: false,
  },
  {
    id: 3,
    kategori: 'redaksi',
    judul: 'Secangkir Aksara Sore ☕',
    pesan: 'Secangkir aksara menunggumu sore ini. Ada karya baru dari Aisyah Rahma...',
    waktu: 'Kemarin',
    icon: '☕',
    bgColor: 'bg-[#FAF0E6]',
    textColor: 'text-[#C45A2C]',
    link: '/karya/2',
    isRead: false,
  },
  {
    id: 4,
    kategori: 'tantangan',
    judul: 'Tantangan Harian Baru ✨',
    pesan: 'Tema hari ini: "Surat Tak Pernah Terkirim" menanti sentuhan penamu.',
    waktu: '2 hari lalu',
    icon: '✍️',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    link: '/tulis?tema=Surat%20Tak%20Pernah%20Terkirim&kategori=Puisi',
    isRead: true,
  },
];

export default function NotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'semua' | 'apresiasi' | 'tantangan'>('semua');
  const [permissionState, setPermissionState] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [notifList, setNotifList] = useState<NotifItem[]>(INITIAL_NOTIF_DATA);

  const unreadCount = notifList.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          sendTestNotification();
        }
      } catch {}
    }
  };

  const sendTestNotification = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          reg.showNotification('Fadrodzak — Ruang Sastra', {
            body: 'Pengingat sastra aktif. Secangkir aksara akan menyapamu setiap fajar dan senja.',
            icon: '/pwa-192x192.png',
            badge: '/fadrodzak-logo.svg',
          });
          return;
        }
      }
      new Notification('Fadrodzak — Ruang Sastra', {
        body: 'Pengingat sastra aktif. Secangkir aksara akan menyapamu setiap fajar dan senja.',
        icon: '/pwa-192x192.png',
      });
    } catch {}
  };

  const filteredNotifs = notifList.filter((n) => {
    if (filter === 'semua') return true;
    return n.kategori === filter;
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 text-[#2C2C2C] hover:bg-[#FAF0E6] rounded-2xl transition bg-white border border-[#DECBC0] shadow-xs"
        aria-label="Lihat Notifikasi"
      >
        <Bell className="w-5 h-5 text-[#C45A2C]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#C45A2C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#E0D5C7] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC0] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#C45A2C] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#2C2C2C]">
                    Warta & Notifikasi Sastra
                  </h2>
                  <p className="text-[11px] text-[#7A6B63] font-serif">
                    Sapaan karya, apresiasi pembaca, dan tantangan harian
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs font-bold text-[#555]"
              >
                ✕
              </button>
            </div>

            {/* Filter Tab & Tandai Baca */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex gap-1.5 bg-[#EDE4D8] p-1 rounded-xl text-xs font-serif">
                <button
                  type="button"
                  onClick={() => setFilter('semua')}
                  className={`px-3 py-1 rounded-lg transition font-bold ${
                    filter === 'semua'
                      ? 'bg-[#C45A2C] text-white shadow-xs'
                      : 'text-[#7A6B63] hover:text-[#2C2C2C]'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('apresiasi')}
                  className={`px-3 py-1 rounded-lg transition font-bold ${
                    filter === 'apresiasi'
                      ? 'bg-[#C45A2C] text-white shadow-xs'
                      : 'text-[#7A6B63] hover:text-[#2C2C2C]'
                  }`}
                >
                  Apresiasi
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('tantangan')}
                  className={`px-3 py-1 rounded-lg transition font-bold ${
                    filter === 'tantangan'
                      ? 'bg-[#C45A2C] text-white shadow-xs'
                      : 'text-[#7A6B63] hover:text-[#2C2C2C]'
                  }`}
                >
                  Tantangan
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-serif text-[#C45A2C] hover:underline font-bold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Tandai Dibaca
                </button>
              )}
            </div>

            {/* Daftar Notifikasi Puitis */}
            <div className="space-y-3 mb-5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredNotifs.length === 0 ? (
                <p className="text-center text-xs text-[#8E8E8E] italic font-serif py-8">
                  Tidak ada warta di kategori ini.
                </p>
              ) : (
                filteredNotifs.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link}
                    onClick={() => setIsOpen(false)}
                    className={`p-3.5 rounded-2xl border transition flex gap-3 items-start block ${
                      notif.isRead
                        ? 'bg-white border-[#EAE0D3] hover:border-[#C45A2C]/40'
                        : 'bg-white border-[#C45A2C]/40 shadow-xs ring-1 ring-[#C45A2C]/10'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base ${notif.bgColor} ${notif.textColor}`}
                    >
                      {notif.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-serif font-bold text-xs text-[#2C2C2C]">
                          {notif.judul}
                        </h3>
                        <span className="text-[10px] text-[#8E8E8E] font-serif">
                          {notif.waktu}
                        </span>
                      </div>
                      <p className="text-xs text-[#555] font-serif italic leading-relaxed">
                        {notif.pesan}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Opsi Izin Pengingat Web Push Sastra */}
            <div className="pt-3 border-t border-[#E8DEC0] flex items-center justify-between text-xs font-serif">
              {permissionState === 'granted' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[#3D634C] flex items-center gap-1 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Notifikasi Aktif
                  </span>
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    className="text-[10px] text-[#C45A2C] hover:underline font-serif flex items-center gap-0.5 cursor-pointer"
                    title="Uji kirim notifikasi"
                  >
                    <Send className="w-2.5 h-2.5" />
                    Uji
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="text-[#C45A2C] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Aktifkan Notifikasi Harian
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[#C45A2C] text-white px-5 py-2 rounded-xl font-bold font-serif hover:bg-[#A8451D] transition shadow-xs cursor-pointer"
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
