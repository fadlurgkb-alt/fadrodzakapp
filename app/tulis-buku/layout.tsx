import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tambah Katalog Buku',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TulisBukuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
