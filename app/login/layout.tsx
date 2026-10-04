import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk / Daftar',
  description: 'Masuk ke akun sastra Fadrodzak untuk mulai menulis, membaca, dan bertumbuh bersama komunitas aksara.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
