#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildStaticBlogPageHtml,
  getMarkdownFiles,
  parseMarkdownFrontmatter,
  normalizeSlug,
} from './blog-content-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../public/blog');

fs.mkdirSync(outputDir, { recursive: true });

const markdownFiles = getMarkdownFiles();

for (const filePath of markdownFiles) {
  const slug = normalizeSlug(filePath);
  const markdownText = fs.readFileSync(filePath, 'utf8');
  const article = parseMarkdownFrontmatter(markdownText, slug);
  const pageDir = path.join(outputDir, slug);
  const htmlPath = path.join(pageDir, 'index.html');

  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(htmlPath, buildStaticBlogPageHtml(article, 'https://tempmailpk.com'));
}

console.log(`✓ Generated static blog pages: ${markdownFiles.length}`);
