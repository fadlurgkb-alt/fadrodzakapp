import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Fadrodzak - Sastra & Aksara',
    short_name: 'Fadrodzak',
    description: 'Komunitas Aksara dan Sastra. Tempat di mana kata-kata menemukan rumahnya.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FAF8F5',
    theme_color: '#C85A32',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/fadrodzak-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
