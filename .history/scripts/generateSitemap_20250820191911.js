// scripts/generateSitemap.js
import fs from "fs";
import path from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import { Feed } from "feed";

// Change this to your deployed domain
const SITE_URL = "https://tempmailpk.com";

// Paths to put sitemap/rss
const publicDir = path.resolve("public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// 1) Define your site routes (or read dynamically from your blog files)
const routes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/blog", changefreq: "daily", priority: 0.9 },
];

// ========== Generate Sitemap ==========
async function generateSitemap() {
  const sitemapStream = new SitemapStream({ hostname: SITE_URL });

  routes.forEach((route) => sitemapStream.write(route));
  sitemapStream.end();

  const sitemap = await streamToPromise(sitemapStream).then((data) =>
    data.toString()
  );

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
  console.log("✅ sitemap.xml generated");
}

// ========== Generate RSS ==========
async function generateRSS() {
  const feed = new Feed({
    title: "My Blog Feed",
    description: "Latest posts from my blog",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} My Blog`,
  });

  // Example posts (replace with your actual markdown/blog data)
  const posts = [
    {
      title: "First Post",
      id: `${SITE_URL}/blog/first-post`,
      link: `${SITE_URL}/blog/first-post`,
      date: new Date(),
      description: "This is my first post",
    },
  ];

  posts.forEach((post) => {
    feed.addItem(post);
  });

  fs.writeFileSync(path.join(publicDir, "rss.xml"), feed.rss2(), "utf8");
  console.log("✅ rss.xml generated");
}

// Run both
(async () => {
  await generateSitemap();
  await generateRSS();
})();
