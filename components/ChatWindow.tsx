'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/lib/chat-server';
import { Send, ArrowLeft, ShieldAlert, CheckCircle2, User, Loader2, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface ChatWindowProps {
  conversationId: number;
  currentUserId: string;
  otherUser: {
    user_id: string;
    nama: string;
    foto_url: string;
    status_badge: string;
  };
  initialMessages: Message[];
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  otherUser,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBlockedState, setIsBlockedState] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark as read on mount and periodic poll
  useEffect(() => {
    async function markRead() {
      try {
        await fetch('/api/chat/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId }),
        });
      } catch {}
    }
    markRead();

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/messages?conversation_id=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          markRead();
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    if (content.length > 2000) {
      setErrorMsg('Pesan maksimal 2000 karakter.');
      return;
    }

    setSending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          isi: content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      setMessages((prev) => [...prev, data.message]);
      setInput('');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  }

  async function handleBlockToggle() {
    const shouldBlock = !isBlockedState;
    try {
      const res = await fetch('/api/chat/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: otherUser.user_id,
          block: shouldBlock,
        }),
      });
      if (res.ok) {
        setIsBlockedState(shouldBlock);
        setShowMenu(false);
      }
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-[#FAF8F5] border-x border-amber-900/10 shadow-sm">
      {/* Header */}
      <div className="p-4 bg-white border-b border-amber-900/10 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="p-2 rounded-full hover:bg-amber-100/50 text-[#2C2A29] transition"
            title="Kembali ke Daftar Pesan"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {otherUser.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={otherUser.foto_url}
              alt={otherUser.nama}
              className="w-10 h-10 rounded-full object-cover border border-amber-900/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center text-[#2C2A29] font-serif font-bold">
              {otherUser.nama ? otherUser.nama.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
          )}

          <div>
            <h2 className="font-serif font-bold text-[#2C2A29] text-base flex items-center gap-2">
              {otherUser.nama || 'Penulis Sastra'}
              {otherUser.status_badge && (
                <span className="text-[10px] bg-amber-100 text-[#C85A32] px-2 py-0.5 rounded-full font-normal">
                  {otherUser.status_badge}
                </span>
              )}
            </h2>
            <p className="text-xs text-amber-900/60 font-serif">Percakapan Pribadi</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-amber-100/50 text-[#2C2A29] transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-amber-900/10 py-1 z-20">
              <button
                onClick={handleBlockToggle}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
              >
                <ShieldAlert className="w-4 h-4" />
                {isBlockedState ? 'Buka Blokir Penulis' : 'Blokir Penulis'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-amber-900/50 font-serif text-sm">
            Belum ada pesan dalam percakapan ini. Kirim salam atau sapaan pertama!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_user_id === currentUserId;
            const timeStr = new Date(m.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-xs font-serif ${
                    isMe
                      ? 'bg-[#C85A32] text-white rounded-tr-xs'
                      : 'bg-white text-[#2C2A29] border border-amber-900/10 rounded-tl-xs'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.isi}</p>
                  <div
                    className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                      isMe ? 'text-white/80' : 'text-amber-900/40'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMe && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-amber-900/10 shrink-0">
        {isBlockedState ? (
          <div className="text-center py-2 text-red-600 text-sm font-serif">
            Anda telah memblokir pengguna ini. Buka blokir untuk melanjutkan pesan.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pesan sastra... (maks 2000 karakter)"
              className="flex-1 px-4 py-3 rounded-xl bg-[#FAF8F5] border border-amber-900/20 text-[#2C2A29] placeholder:text-amber-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 font-serif"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="p-3 bg-[#C85A32] text-white rounded-xl hover:bg-[#b04d29] transition disabled:opacity-50 shadow-sm flex items-center justify-center"
              title="Kirim Pesan"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
