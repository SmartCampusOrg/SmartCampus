import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import packageJson from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  server: {
    proxy: {
      '/api/harmonogram': {
        target: 'https://wu.pansim.edu.pl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/harmonogram/, '/wsrest/rest/phz/harmonogram')
      }
    }
  },
  plugins: [
    react(), 
    viteCompression({ algorithm: 'brotliCompress' }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Smart Campus',
        short_name: 'Smart Campus',
        description: 'Aplikacja Smart Campus',
        theme_color: '#183447',
        background_color: '#183447',
        display_override: ['window-controls-overlay', 'standalone'],
        categories: ["education", "productivity"],
        shortcuts: [
          {
            name: "Panel Główny",
            short_name: "Panel",
            description: "Otwórz panel główny",
            url: "/Panel",
            icons: [{ src: "/shortcut-panel.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Plan Zajęć",
            short_name: "Plan",
            description: "Otwórz plan zajęć",
            url: "/PlanZajec",
            icons: [{ src: "/shortcut-plan.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Mapa Kampusu",
            short_name: "Mapa",
            description: "Otwórz mapę kampusu",
            url: "/MapaKampusu",
            icons: [{ src: "/shortcut-map.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "E-learning",
            short_name: "E-learn",
            description: "Otwórz platformę edukacyjną",
            url: "/Elearning",
            icons: [{ src: "/shortcut-elearning.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Feed",
            short_name: "Feed",
            description: "Otwórz aktualności",
            url: "/Feed",
            icons: [{ src: "/shortcut-feed.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Ustawienia",
            short_name: "Opcje",
            description: "Otwórz ustawienia konta",
            url: "/Ustawienia",
            icons: [{ src: "/shortcut-ustawienia.png", sizes: "96x96", type: "image/png" }]
          }
        ],
        share_target: {
          action: "/Share",
          method: "GET",
          enctype: "application/x-www-form-urlencoded",
          params: {
            title: "title",
            text: "text",
            url: "url"
          }
        },
        file_handlers: [
          {
            action: "/Open",
            accept: {
              "application/vnd.smartcampus": [".campus"]
            }
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'pwa-banner-mobile.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'pwa-banner-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@app': path.resolve(import.meta.dirname, './src/app'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@features': path.resolve(import.meta.dirname, './src/features'),
      '@assets': path.resolve(import.meta.dirname, './src/assets'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@styles': path.resolve(import.meta.dirname, './src/styles'),
      '@icons': path.resolve(import.meta.dirname, './src/assets/icons'),
    },
  },
  build: {
    cssTarget: 'chrome123',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('@fortawesome')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            return 'vendor-common';
          }
        }
      }
    }
  }
})
