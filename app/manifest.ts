import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Barcelona Route',
    short_name:       'BCN Route',
    description:      'Your perfect Barcelona day, planned in 30 seconds',
    start_url:        '/',
    display:          'standalone',
    background_color: '#FAF7F2',
    theme_color:      '#1B2B4B',
    orientation:      'portrait',
    categories:       ['travel', 'navigation'],
    icons: [
      {
        src:     '/icons/icon-192x192.png',
        sizes:   '192x192',
        type:    'image/png',
      },
      {
        src:     '/icons/icon-512x512.png',
        sizes:   '512x512',
        type:    'image/png',
      },
    ],
  }
}