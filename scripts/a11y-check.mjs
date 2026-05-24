#!/usr/bin/env node
/**
 * Run axe-core against key static pages via Playwright.
 * Expects `dist/` from `npm run build` and a static server on A11Y_BASE_URL.
 */
import { once } from 'node:events';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const PAGES = [
  { name: 'home (zh)', path: '/zh/' },
  { name: 'blog article (zh)', path: '/zh/blog/ai-squad-launch-diary/' },
];

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

function createStaticServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) {
        pathname += 'index.html';
      } else if (!path.extname(pathname)) {
        pathname = `${pathname}/index.html`;
      }

      const filePath = path.join(distDir, pathname);
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

async function waitForServer(port, timeoutMs = 15_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/zh/`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Static server did not become ready on port ${port}`);
}

async function runAxe(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const failures = [];

  try {
    for (const pageDef of PAGES) {
      const page = await context.newPage();
      const url = new URL(pageDef.path, baseUrl).href;
      await page.goto(url, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        // Third-party Giscus embed; contrast/labels are owned by giscus.app.
        .exclude('.giscus-section')
        .analyze();

      const blocking = results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact)
      );

      if (blocking.length > 0) {
        failures.push({ page: pageDef.name, url, violations: blocking });
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  return failures;
}

function printReport(failures) {
  if (failures.length === 0) {
    console.log('✓ axe: no critical or serious violations on key pages');
    return 0;
  }

  console.error('✗ axe: critical/serious violations found\n');
  for (const failure of failures) {
    console.error(`## ${failure.page} (${failure.url})`);
    for (const violation of failure.violations.sort(
      (a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact)
    )) {
      console.error(`- [${violation.impact}] ${violation.id}: ${violation.help}`);
      console.error(`  ${violation.helpUrl}`);
      for (const node of violation.nodes.slice(0, 3)) {
        console.error(`  → ${node.html}`);
      }
    }
    console.error('');
  }
  return 1;
}

async function main() {
  const externalBase = process.env.A11Y_BASE_URL;
  let server;
  let port;

  if (externalBase) {
    const failures = await runAxe(externalBase.endsWith('/') ? externalBase : `${externalBase}/`);
    process.exit(printReport(failures));
  }

  server = createStaticServer();
  await once(server.listen(0, '127.0.0.1'), 'listening');
  port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/`;

  await waitForServer(port);
  const failures = await runAxe(baseUrl);
  server.close();
  process.exit(printReport(failures));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
