'import client';
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function UnreadChatBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/chat/conversations');
        if (res.ok) {
          const data = await res.json();
          const total = (data.conversations || []).reduce(
            (acc: number, c: { unread_count?: number }) => acc + (c.unread_count || 0),
            0
          );
          setUnreadCount(total);
        }
      } catch {}
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/chat"
      className="relative p-2 rounded-full hover:bg-amber-100/50 text-[#2C2A29] transition flex items-center gap-2"
      title="Pesan Sastra"
    >
      <MessageSquare className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-serif">Pesan</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
