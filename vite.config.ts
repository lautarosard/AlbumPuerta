import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // New deployments activate on the next load without asking; progress
      // lives in localStorage, so a reload never loses stickers.
      registerType: 'autoUpdate',
      // Registered from src/services/pwa.ts so the app can observe it.
      injectRegister: false,
      // public/ files (icons, favicon, artwork) are already matched by
      // workbox.globPatterns below; adding them again would duplicate entries.
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: 'Álbum Digital - Puerta 18',
        short_name: 'Álbum P18',
        description: 'Álbum de figuritas digital coleccionable de la Expo Puerta 18',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#121212',
        background_color: '#121212',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole app shell: HTML, every JS chunk (including the
        // lazily loaded scanner with html5-qrcode), CSS, self-hosted fonts,
        // icons and the stand artwork, so the album works offline after the
        // first visit.
        globPatterns: ['**/*.{html,js,css,woff2,svg,png,webp,jpg,jpeg,ico}'],
        // QR links land on /scan?t=... — serve the SPA shell for any
        // navigation offline, but never for the telemetry API.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Stand photos that are not part of the precache (e.g. added to
            // the data after a build): cache on first view, serve offline.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && url.pathname.startsWith('/images/stands/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'p18-stand-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
})
