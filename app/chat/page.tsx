'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/lib/chat-server';
import ChatList from '@/components/ChatList';
import NewChatModal from '@/components/NewChatModal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChatIndexPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch('/api/chat/conversations');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C85A32]" />
          <p className="font-serif text-amber-900/70 text-sm">Memuat ruang pesan sastra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <ChatList
        conversations={conversations}
        onNewChatClick={() => setIsNewModalOpen(true)}
      />
      <NewChatModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
}
