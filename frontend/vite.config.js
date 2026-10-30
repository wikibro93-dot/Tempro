import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import markdownPlugin from "vite-plugin-markdown";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path"

export default defineConfig({
  plugins: [
    react(),
    markdownPlugin.default({
      mode: ["html", "toc"],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png'
      ],
      manifest: {
        id: '/',
        name: 'TempMail Pro – Free Disposable Temporary Email',
        short_name: 'TempMail Pro',
        description: 'Free disposable temporary email app with multi-inbox management, custom durations, and instant OTP detection.',
        theme_color: '#4361ee',
        background_color: '#0b0f19',
        display: 'standalone',
        start_url: '/',
        scope: '/',
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
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\/.*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-jsdelivr-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Mail content must never be served stale for 7 days: network only.
            // Offline reading still works via the app's localStorage cache.
            urlPattern: /\/api\/inbox\/content\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/api\/(inbox|accounts)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-mailbox-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes, not 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
    hmr: false,
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:10000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "ES2020",
    minify: "esbuild",
    reportCompressedSize: false,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks(id) {
          // Core vendor chunks - small, always needed
          if (id.includes("node_modules/react-dom")) {
            return "vendor-react-dom";
          }
          if (id.includes("node_modules/react/")) {
            return "vendor-react";
          }
          
          // Router - needed early for navigation
          if (id.includes("node_modules/react-router-dom")) {
            return "vendor-router";
          }
          
          // Blog-only: markdown rendering (lazy loaded)
          if (id.includes("node_modules/react-markdown") || 
              id.includes("node_modules/remark") || 
              id.includes("node_modules/rehype")) {
            return "vendor-markdown";
          }
          
          // HTTP client
          if (id.includes("node_modules/axios")) {
            return "vendor-axios";
          }
          
          // SEO - keep in main bundle to avoid init order issues
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  base: "/",
});


// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import markdownPlugin from "vite-plugin-markdown";

// import { resolve } from "path"
// import fs from "fs"

// // --- Collect blog routes from Markdown files ---
// function generateRoutesFromMarkdown() {
//   const articlesDir = resolve(__dirname, "src/content/articles")
//   if (!fs.existsSync(articlesDir)) return []

//   const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md"))
//   return files.map((file) => `/blog/${file.replace(".md", "")}`)
// }

// // --- Generate Sitemap + RSS ---
// function generateSitemapAndRSS() {
//   const routes = generateRoutesFromMarkdown()
//   // const siteUrl = "http://localhost:5173" // ✅ for local testing
//   const siteUrl = "https://tempmailpk.com" // ✅ for local testing
//   // 🔴 change to your actual domain when deploying

//   // --- Sitemap ---
//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${routes
//       .map(
//         (r) => `<url>
//   <loc>${siteUrl}${r}</loc>
//   <changefreq>weekly</changefreq>
// </url>`
//       )
//       .join("\n")}
// </urlset>`

//   fs.writeFileSync(resolve(__dirname, "public", "sitemap.xml"), sitemap)

//   // --- RSS ---
//   const rssItems = routes
//     .map(
//       (r) => `
// <item>
//   <title>${r.replace("/blog/", "").replace(/-/g, " ")}</title>
//   <link>${siteUrl}${r}</link>
//   <description>Read about ${r.replace("/blog/", "").replace(/-/g, " ")}</description>
// </item>`
//     )
//     .join("\n")

//   const rss = `<?xml version="1.0" encoding="UTF-8" ?>
// <rss version="2.0">
// <channel>
//   <title>Your Blog Feed</title>
//   <link>${siteUrl}</link>
//   <description>Latest blog posts</description>
//   ${rssItems}
// </channel>
// </rss>`

//   fs.writeFileSync(resolve(__dirname, "public", "rss.xml"), rss)
// }

// // --- Final Vite Config ---
// export default defineConfig({
//   plugins: [
//     react(),
//     markdownPlugin.default({
//       mode: ["html", "toc"], // parses markdown into HTML + table of contents
//     }),
//   ],
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:5000",
//         changeOrigin: true,
//       },
//     },
//   },
//   build: {
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, "index.html"),
//       },
//     },
//   },
//   base: "/",  // ✅ Add this
//   closeBundle() {
//     generateSitemapAndRSS();
//   },
// });
