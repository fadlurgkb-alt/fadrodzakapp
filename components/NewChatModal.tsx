'use client';

import { useState } from 'react';
import { Search, X, MessageSquare, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  user_id: string;
  nama: string;
  foto_url: string;
  status_badge: string;
  bio: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/chat/conversations?search=${encodeURIComponent(keyword)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function startChat(targetUserId: string) {
    setStartingUserId(targetUserId);
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data.conversation_id}`);
      }
    } catch {
    } finally {
      setStartingUserId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-2xl shadow-xl border border-amber-900/10 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-amber-900/10 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif font-bold text-lg text-[#2C2A29]">Mulai Pesan Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-100 text-[#2C2A29] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="p-4 border-b border-amber-900/10 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900/40" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama penulis atau bio..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-amber-900/20 text-[#2C2A29] placeholder:text-amber-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-sm font-medium hover:bg-[#b04d29] transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="text-center py-8 text-amber-900/50 text-sm">Mencari penulis...</div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-amber-900/50 text-sm">
              {keyword ? 'Penulis tidak ditemukan.' : 'Ketik nama penulis di atas untuk mulai mencari.'}
            </div>
          )}

          {!loading &&
            users.map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-900/10 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  {u.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.foto_url}
                      alt={u.nama}
                      className="w-10 h-10 rounded-full object-cover border border-amber-900/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center text-[#2C2A29] font-serif font-bold">
                      {u.nama ? u.nama.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-[#2C2A29] text-sm flex items-center gap-2">
                      {u.nama || 'Penulis Sastra'}
                      {u.status_badge && (
                        <span className="text-[10px] bg-amber-100 text-[#C85A32] px-2 py-0.5 rounded-full font-normal">
                          {u.status_badge}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-amber-900/60 line-clamp-1">{u.bio || 'Belum ada bio.'}</p>
                  </div>
                </div>

                <button
                  onClick={() => startChat(u.user_id)}
                  disabled={startingUserId === u.user_id}
                  className="px-3 py-1.5 bg-amber-100 text-[#C85A32] rounded-lg text-xs font-medium hover:bg-[#C85A32] hover:text-white transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {startingUserId === u.user_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  Chat
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
