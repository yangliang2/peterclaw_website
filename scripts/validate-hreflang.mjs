#!/usr/bin/env node
/**
 * Post-build check: locale-prefixed HTML must expose hreflang + x-default;
 * sitemap must include xhtml:link alternates when i18n is enabled.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const distRoot = new URL('../dist/client', import.meta.url).pathname;
const sitemapPath = join(distRoot, 'sitemap-0.xml');

function walkHtml(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkHtml(full, files);
    } else if (entry === 'index.html') {
      files.push(full);
    }
  }
  return files;
}

function localeFromPath(filePath) {
  const match = filePath.replace(distRoot, '').match(/^\/(zh|en)\//);
  return match?.[1] ?? null;
}

const htmlFiles = walkHtml(distRoot).filter((file) => localeFromPath(file));
const htmlErrors = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const locale = localeFromPath(file);
  const rel = file.replace(distRoot, '');

  if (!html.includes(`hreflang="${locale}"`)) {
    htmlErrors.push(`${rel}: missing hreflang="${locale}"`);
  }
  if (!html.includes('hreflang="x-default"')) {
    htmlErrors.push(`${rel}: missing hreflang="x-default"`);
  }
}

let sitemapErrors = [];
try {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('xhtml:link')) {
    sitemapErrors.push('sitemap-0.xml: no xhtml:link hreflang alternates');
  }
  if (sitemap.includes('<loc>https://peterclaw-website.vercel.app/</loc>')) {
    sitemapErrors.push('sitemap-0.xml: root redirect URL should be filtered out');
  }
} catch {
  sitemapErrors.push('sitemap-0.xml: file not found (run npm run build first)');
}

const errors = [...htmlErrors, ...sitemapErrors];

if (errors.length > 0) {
  console.error('hreflang validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log(`hreflang OK (${htmlFiles.length} locale pages, sitemap alternates present)`);
