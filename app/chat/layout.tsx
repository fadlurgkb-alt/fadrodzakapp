import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesan Merpati Sastra',
  description: 'Percakapan pribadi antar penulis dan pembaca di Fadrodzak.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
