// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import { markdown } from "vite-plugin-markdown"
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
//   const siteUrl = "http://localhost:5173" // change to your domain later

//   // --- Sitemap ---
//   const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${routes
//     .map(
//       (r) => `<url>
//   <loc>${siteUrl}${r}</loc>
//   <changefreq>weekly</changefreq>
// </url>`
//     )
//     .join("\n")}
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
//     markdown({ mode: ["react"] }), // ✅ correct usage
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

//   closeBundle() {
//     generateSitemapAndRSS()
//   },
// })











import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import markdownPlugin from "vite-plugin-markdown";

import { resolve } from "path"
import fs from "fs"

// --- Collect blog routes from Markdown files ---
function generateRoutesFromMarkdown() {
  const articlesDir = resolve(__dirname, "src/content/articles")
  if (!fs.existsSync(articlesDir)) return []

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md"))
  return files.map((file) => `/blog/${file.replace(".md", "")}`)
}

// --- Generate Sitemap + RSS ---
function generateSitemapAndRSS() {
  const routes = generateRoutesFromMarkdown()
  const siteUrl = "http://localhost:5173" // ✅ for local testing
  // 🔴 change to your actual domain when deploying

  // --- Sitemap ---
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
      .map(
        (r) => `<url>
  <loc>${siteUrl}${r}</loc>
  <changefreq>weekly</changefreq>
</url>`
      )
      .join("\n")}
</urlset>`

  fs.writeFileSync(resolve(__dirname, "public", "sitemap.xml"), sitemap)

  // --- RSS ---
  const rssItems = routes
    .map(
      (r) => `
<item>
  <title>${r.replace("/blog/", "").replace(/-/g, " ")}</title>
  <link>${siteUrl}${r}</link>
  <description>Read about ${r.replace("/blog/", "").replace(/-/g, " ")}</description>
</item>`
    )
    .join("\n")

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Your Blog Feed</title>
  <link>${siteUrl}</link>
  <description>Latest blog posts</description>
  ${rssItems}
</channel>
</rss>`

  fs.writeFileSync(resolve(__dirname, "public", "rss.xml"), rss)
}

// --- Final Vite Config ---
export default defineConfig({
  plugins: [
    react(),
    markdownPlugin.default({
      mode: ["html", "toc"], // parses markdown into HTML + table of contents
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  closeBundle() {
    generateSitemapAndRSS();
  },
});
