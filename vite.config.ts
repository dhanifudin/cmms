import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "CMMS - Maintenance Management System",
        short_name: "CMMS",
        description: "Computerized Maintenance Management System for terminal operations",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.cmms\..*\/workorders/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "workorder-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.cmms\..*\/inventory/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "inventory-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ],
        // Clean up old caches on update
        cleanupOutdatedCaches: true,
        // Skip waiting for service worker activation
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group shadcn UI components together to avoid circular dependencies
          'shadcn-ui': [
            'src/components/ui/select/index.ts',
            'src/components/ui/select/Select.vue',
            'src/components/ui/select/SelectContent.vue',
            'src/components/ui/select/SelectItem.vue',
            'src/components/ui/select/SelectTrigger.vue',
            'src/components/ui/select/SelectValue.vue'
          ]
        }
      }
    }
  }
});
