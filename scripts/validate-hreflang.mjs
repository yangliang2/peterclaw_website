#!/usr/bin/env node
/**
 * Post-build check: locale-prefixed HTML must expose hreflang + x-default;
 * sitemap must include xhtml:link alternates when i18n is enabled.
 * Also reports warn-only zh/en content symmetry gaps for localized content.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const repoRoot = new URL('..', import.meta.url).pathname;
const distRoot = new URL('../dist/client', import.meta.url).pathname;
const sitemapPath = join(distRoot, 'sitemap-0.xml');
const contentSymmetryExemptionsPath = join(repoRoot, 'scripts', 'content-symmetry-exemptions.json');
const contentPairs = [
  {
    label: 'blog',
    zhDir: join(repoRoot, 'src', 'content', 'blog', 'zh'),
    enDir: join(repoRoot, 'src', 'content', 'blog', 'en'),
  },
  {
    label: 'knowledge',
    zhDir: join(repoRoot, 'src', 'content', 'knowledge', 'zh'),
    enDir: join(repoRoot, 'src', 'content', 'knowledge', 'en'),
  },
];
const contentExtensions = new Set(['.md', '.mdx']);

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

function walkContent(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkContent(full, files);
    } else if (contentExtensions.has(extname(entry).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function localeFromPath(filePath) {
  const match = filePath.replace(distRoot, '').match(/^\/(zh|en)\//);
  return match?.[1] ?? null;
}

function contentKey(rootDir, filePath) {
  const rel = relative(rootDir, filePath).replaceAll('\\', '/');
  return rel.replace(/\.(md|mdx)$/i, '');
}

function loadContentSymmetryExemptions() {
  if (!existsSync(contentSymmetryExemptionsPath)) return {};

  try {
    return JSON.parse(readFileSync(contentSymmetryExemptionsPath, 'utf8'));
  } catch (error) {
    console.warn(
      `content symmetry warning: could not parse ${relative(repoRoot, contentSymmetryExemptionsPath)} (${error.message})`
    );
    return {};
  }
}

function sortedDifference(left, right, exemptions) {
  return [...left].filter((key) => !right.has(key) && !exemptions.has(key)).sort();
}

function scanContentSymmetry() {
  const configuredExemptions = loadContentSymmetryExemptions();

  return contentPairs.map(({ label, zhDir, enDir }) => {
    const zhKeys = new Set(walkContent(zhDir).map((file) => contentKey(zhDir, file)));
    const enKeys = new Set(walkContent(enDir).map((file) => contentKey(enDir, file)));
    const exemptions = new Set(configuredExemptions[label] ?? []);

    return {
      label,
      missingEN: sortedDifference(zhKeys, enKeys, exemptions),
      missingZH: sortedDifference(enKeys, zhKeys, exemptions),
    };
  });
}

function printContentSymmetryReport() {
  const reports = scanContentSymmetry();
  const hasWarnings = reports.some((report) => report.missingEN.length > 0 || report.missingZH.length > 0);

  if (!hasWarnings) {
    console.log('content symmetry OK (blog and knowledge zh/en files match, after exemptions)');
    return;
  }

  console.warn('content symmetry warnings (warn-only):');
  for (const { label, missingEN, missingZH } of reports) {
    if (missingEN.length === 0 && missingZH.length === 0) continue;

    console.warn(`${label}:`);
    console.warn(`  Missing EN: ${JSON.stringify(missingEN)}`);
    console.warn(`  Missing ZH: ${JSON.stringify(missingZH)}`);
  }
}

printContentSymmetryReport();

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
