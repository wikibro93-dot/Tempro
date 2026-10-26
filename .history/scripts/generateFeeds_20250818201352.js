// scripts/generateFeeds.js
import { Feed } from "feed";
import { glob } from "glob";
import fs from "fs";
import matter from "gray-matter";

const SITE_URL = "https://yourdomain.com"; // change to your real domain
const BLOG_DIR = "./src/content/articles";
const PUBLIC_DIR = "./public";

async function generateFeeds() {
  const files = glob.sync(`${BLOG_DIR}/*.md`);

  // Setup RSS feed
  const feed = new Feed({
    title: "TempMail Pro Blog",
    description: "Latest articles on temporary emails, burner accounts & privacy",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
  });

  let sitemapUrls = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, content } = matter(raw);

    const slug = file.split("/").pop().replace(".md", "");
    const url = `${SITE_URL}/blog/${slug}`;

    // Add to RSS
    feed.addItem({
      title: data.title || slug,
      id: url,
      link: url,
      description: data.description || content.slice(0, 160),
      date: data.date ? new Date(data.date) : new Date(),
    });

    // Add to sitemap
    sitemapUrls.push(`
      <url>
        <loc>${url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `);
  }

  // Write RSS
  fs.writeFileSync(`${PUBLIC_DIR}/rss.xml`, feed.rss2());

  // Write Sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapUrls.join("\n")}
  </urlset>`;

  fs.writeFileSync(`${PUBLIC_DIR}/sitemap.xml`, sitemap);

  console.log("✅ RSS and Sitemap generated!");
}

generateFeeds();
