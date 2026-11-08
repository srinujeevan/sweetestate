#!/usr/bin/env node
/**
 * Post-build SEO step (runs automatically after `npm run build`).
 *
 * - Copies the prerendered 404 page to /404.html (used by most static hosts).
 * - Writes robots.txt (admin disallowed).
 * - Writes sitemap.xml from the prerendered pages — ONLY when the production
 *   domain is known. Set it via `siteUrl` in src/environments/environment.prod.ts
 *   or the SITE_URL environment variable. Without it, no sitemap is written
 *   (a sitemap with a guessed domain would be wrong).
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist', 'sweetestate', 'browser');
const EXCLUDE = new Set(['404', 'admin']);

if (!existsSync(dist)) {
  console.error(`[seo] Build output not found at ${dist}. Run "ng build" first.`);
  process.exit(1);
}

function readSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const env = readFileSync(join(root, 'src', 'environments', 'environment.prod.ts'), 'utf8');
  const match = env.match(/siteUrl:\s*['"`]([^'"`]+)['"`]/);
  return match ? match[1] : null;
}

function findPages(dir) {
  const pages = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const rel = relative(dist, full).split(sep).join('/');
      if (EXCLUDE.has(rel.split('/')[0])) continue;
      if (existsSync(join(full, 'index.html'))) pages.push('/' + rel);
      pages.push(...findPages(full));
    }
  }
  return pages;
}

// 404.html
const notFound = join(dist, '404', 'index.html');
if (existsSync(notFound)) {
  copyFileSync(notFound, join(dist, '404.html'));
  console.log('[seo] Wrote 404.html');
}

const siteUrl = readSiteUrl()?.replace(/\/$/, '') ?? null;
const pages = ['/', ...findPages(dist)].filter((p, i, a) => a.indexOf(p) === i).sort();

const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', ''];
if (siteUrl) robots.push(`Sitemap: ${siteUrl}/sitemap.xml`, '');
writeFileSync(join(dist, 'robots.txt'), robots.join('\n'));
console.log('[seo] Wrote robots.txt');

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => `  <url><loc>${siteUrl}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  console.log(`[seo] Wrote sitemap.xml with ${pages.length} URLs for ${siteUrl}`);
} else {
  console.warn(
    `[seo] siteUrl not configured — sitemap.xml NOT written (${pages.length} pages found). ` +
      'Set siteUrl in src/environments/environment.prod.ts or SITE_URL=https://your-domain npm run build.',
  );
}
