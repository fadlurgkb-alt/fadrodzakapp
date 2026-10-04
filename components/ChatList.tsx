'use client';

import { Conversation } from '@/lib/chat-server';
import Link from 'next/link';
import { User, MessageSquare } from 'lucide-react';

interface ChatListProps {
  conversations: Conversation[];
  onNewChatClick: () => void;
}

export default function ChatList({ conversations, onNewChatClick }: ChatListProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C2A29]">Pesan Sastra</h1>
          <p className="text-sm text-amber-900/70 font-serif">Percakapan pribadi antar penulis dan pembaca</p>
        </div>
        <button
          onClick={onNewChatClick}
          className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-sm font-medium hover:bg-[#b04d29] transition shadow-sm flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Pesan Baru
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-amber-900/10 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-100/50 text-[#C85A32] rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2C2A29]">Belum ada percakapan</h3>
          <p className="text-sm text-amber-900/60 max-w-sm mx-auto font-serif">
            Mulai percakapan dengan mencari penulis di direktori atau dari halaman profil mereka.
          </p>
          <button
            onClick={onNewChatClick}
            className="px-4 py-2 bg-amber-100 text-[#C85A32] rounded-xl text-sm font-medium hover:bg-[#C85A32] hover:text-white transition inline-flex items-center gap-2"
          >
            Cari Penulis Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const timeStr = c.last_message_at
              ? new Date(c.last_message_at).toLocaleDateString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className="block bg-white rounded-2xl p-4 border border-amber-900/10 hover:border-[#C85A32]/40 hover:shadow-md transition relative"
              >
                <div className="flex items-center gap-4">
                  {c.other_user_foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.other_user_foto}
                      alt={c.other_user_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover border border-amber-900/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-200/50 flex items-center justify-center text-[#2C2A29] font-serif font-bold shrink-0">
                      {c.other_user_name ? c.other_user_name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif font-bold text-[#2C2A29] text-base truncate">
                        {c.other_user_name || 'Penulis Sastra'}
                      </h3>
                      {timeStr && <span className="text-xs text-amber-900/40 shrink-0">{timeStr}</span>}
                    </div>

                    <p className="text-sm text-amber-900/70 truncate font-serif">
                      {c.last_message || 'Belum ada pesan...'}
                    </p>
                  </div>

                  {c.unread_count && c.unread_count > 0 ? (
                    <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {c.unread_count}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
