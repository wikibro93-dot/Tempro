import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// 1. High-contrast Brand SVG (Shield + Envelope + Lightning)
const brandSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4361ee" />
      <stop offset="100%" stop-color="#1d2d85" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4cc9f0" />
      <stop offset="100%" stop-color="#4361ee" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Shield Shape -->
  <path d="M 256 70 L 390 125 C 390 270 295 385 256 425 C 217 385 122 270 122 125 Z" 
        fill="rgba(255, 255, 255, 0.08)" stroke="#4cc9f0" stroke-width="8" stroke-linejoin="round" />

  <!-- Inner Envelope Body -->
  <g filter="url(#shadow)">
    <rect x="160" y="195" width="192" height="132" rx="18" fill="#ffffff" />
    
    <!-- Envelope Flap & Lines -->
    <path d="M 160 210 L 256 280 L 352 210" fill="none" stroke="#4361ee" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Central Lightning Spark -->
    <path d="M 264 165 L 230 235 L 260 235 L 244 295 L 288 225 L 258 225 Z" fill="#ffd166" stroke="#d97706" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- Pro Badge Pill -->
  <rect x="206" y="360" width="100" height="34" rx="17" fill="#ffd166" />
  <text x="256" y="384" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">PRO</text>
</svg>
`.trim();

// 2. Maskable SVG with Android 15% safe-zone margin
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="maskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4361ee" />
      <stop offset="100%" stop-color="#141f5c" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background -->
  <rect width="512" height="512" fill="url(#maskBg)" />

  <!-- Content scaled to 78% for safe zone (centered at 256, 256) -->
  <g transform="translate(56, 56) scale(0.78)">
    <path d="M 256 70 L 390 125 C 390 270 295 385 256 425 C 217 385 122 270 122 125 Z" 
          fill="rgba(255, 255, 255, 0.12)" stroke="#4cc9f0" stroke-width="10" stroke-linejoin="round" />

    <rect x="160" y="195" width="192" height="132" rx="18" fill="#ffffff" />
    <path d="M 160 210 L 256 280 L 352 210" fill="none" stroke="#4361ee" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 264 165 L 230 235 L 260 235 L 244 295 L 288 225 L 258 225 Z" fill="#ffd166" stroke="#d97706" stroke-width="3" stroke-linejoin="round" />
    
    <rect x="206" y="360" width="100" height="34" rx="17" fill="#ffd166" />
    <text x="256" y="384" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">PRO</text>
  </g>
</svg>
`.trim();

async function generate() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG source
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg);
  console.log('✓ Wrote public/icon.svg');

  // Generate 512x512 standard PNG
  await sharp(Buffer.from(brandSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Generated public/pwa-512x512.png');

  // Generate 192x192 standard PNG
  await sharp(Buffer.from(brandSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Generated public/pwa-192x192.png');

  // Generate 512x512 maskable PNG (with 15% safe zone margin)
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Generated public/pwa-maskable-512x512.png');

  // Generate 180x180 apple-touch-icon.png for iOS Safari
  await sharp(Buffer.from(brandSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated public/apple-touch-icon.png');
}

generate().catch((err) => {
  console.error('PWA icon generation failed:', err);
  process.exit(1);
});
