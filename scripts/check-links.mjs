#!/usr/bin/env node
import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const outputFlagIndex = process.argv.indexOf('--output');
const outputPath = outputFlagIndex >= 0 ? process.argv[outputFlagIndex + 1] : 'link-health-report.md';
const distRoot = path.resolve(process.env.LINK_CHECK_DIST ?? 'dist/client');
const deploymentConfigPath = path.resolve('.vercel/output/config.json');
const siteUrl = new URL(process.env.LINK_CHECK_SITE_URL ?? 'https://peterclaw-website.vercel.app');
const externalThreshold = Number.parseInt(process.env.LINK_CHECK_EXTERNAL_THRESHOLD ?? '5', 10);
const externalTimeoutMs = Number.parseInt(process.env.LINK_CHECK_TIMEOUT_MS ?? '8000', 10);
const shouldCheckExternal = process.env.LINK_CHECK_EXTERNAL !== 'false';
const internalSelectors = [
  ['a[href]', 'href'],
  ['img[src]', 'src'],
  ['link[href]', 'href'],
  ['script[src]', 'src'],
  ['source[src]', 'src'],
];

const htmlFiles = await walkFiles(distRoot, (file) => file.endsWith('.html'));
if (htmlFiles.length === 0) {
  throw new Error(`No rendered HTML found under ${distRoot}. Run npm run build first.`);
}

const dynamicRoutes = await readDynamicRoutes();
const internalReferences = new Map();
const externalReferences = new Map();
const documents = new Map();

for (const file of htmlFiles) {
  const pagePath = path.relative(distRoot, file);
  const pageUrl = routeUrlForFile(file);
  const document = await documentForFile(file);

  for (const [selector, attribute] of internalSelectors) {
    for (const element of document.querySelectorAll(selector)) {
      const rawLink = element.getAttribute(attribute)?.trim();
      if (!rawLink || isIgnoredLink(rawLink)) continue;
      // ArticleToc reconciles IDs with rendered headings at runtime.
      if (selector === 'a[href]' && element.hasAttribute('data-toc-link')) continue;

      let url;
      try {
        url = new URL(rawLink, pageUrl);
      } catch {
        addReference(internalReferences, rawLink, pagePath, 'invalid URL');
        continue;
      }

      if (!['http:', 'https:'].includes(url.protocol)) continue;

      if (url.origin === siteUrl.origin) {
        const issue = await validateInternalUrl(url);
        if (issue) addReference(internalReferences, displayInternalUrl(url), pagePath, issue);
      } else if (selector === 'a[href]') {
        addExternalReference(normalizeExternalProbeUrl(url), pagePath);
      }
    }
  }
}

const externalResults = shouldCheckExternal
  ? await checkExternalUrls([...externalReferences.keys()])
  : [];
const brokenInternal = [...internalReferences.entries()].map(([url, reference]) => ({
  url,
  ...reference,
}));
const brokenExternal = externalResults.filter((result) => !result.ok);
const externalWarns = brokenExternal.length > externalThreshold;

for (const broken of brokenInternal) {
  console.error(
    `::error file=${broken.pages[0]}::Broken internal link ${broken.url} (${broken.reason})`,
  );
}
if (externalWarns) {
  console.warn(
    `::warning::${brokenExternal.length} external links failed validation; advisory threshold is ${externalThreshold}.`,
  );
}

const report = renderReport({
  pages: htmlFiles.length,
  brokenInternal,
  brokenExternal,
  checkedExternal: externalResults.length,
  externalWarns,
});
await writeFile(outputPath, report);
process.stdout.write(report);

if (brokenInternal.length > 0) {
  process.exitCode = 1;
}

function routeUrlForFile(file) {
  const relativePath = path.relative(distRoot, file).split(path.sep).join('/');
  let pathname = `/${relativePath}`;
  if (pathname.endsWith('/index.html')) pathname = pathname.slice(0, -'index.html'.length);
  if (pathname === '/index.html') pathname = '/';
  return new URL(pathname, siteUrl);
}

async function validateInternalUrl(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (!isWithinSite(pathname)) return 'path escapes site root';

  const targetFile = await findBuiltTarget(pathname);
  if (!targetFile) {
    if (dynamicRoutes.some((route) => route.test(pathname))) return null;
    return 'target is not present in the built site';
  }

  if (!url.hash || !targetFile.endsWith('.html')) return null;

  const targetDocument = await documentForFile(targetFile);
  const fragment = decodeURIComponent(url.hash.slice(1));
  return targetDocument.getElementById(fragment) ? null : `missing fragment #${fragment}`;
}

async function findBuiltTarget(pathname) {
  const localPath = pathname.replace(/^\/+/, '');
  const absolutePath = path.join(distRoot, localPath);
  const candidates = pathname.endsWith('/')
    ? [path.join(absolutePath, 'index.html')]
    : [absolutePath, `${absolutePath}.html`, path.join(absolutePath, 'index.html')];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

function isWithinSite(pathname) {
  const resolved = path.resolve(distRoot, `.${pathname}`);
  return resolved === distRoot || resolved.startsWith(`${distRoot}${path.sep}`);
}

function displayInternalUrl(url) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function addReference(references, url, page, reason) {
  const reference = references.get(url) ?? { reason, pages: [] };
  if (!reference.pages.includes(page)) reference.pages.push(page);
  references.set(url, reference);
}

function addExternalReference(url, page) {
  const pages = externalReferences.get(url) ?? [];
  if (!pages.includes(page)) pages.push(page);
  externalReferences.set(url, pages);
}

function normalizeExternalProbeUrl(url) {
  const probeUrl = new URL(url);
  probeUrl.hash = '';
  const isShareEndpoint =
    (probeUrl.hostname === 'twitter.com' && probeUrl.pathname === '/intent/tweet') ||
    (probeUrl.hostname === 'x.com' && probeUrl.pathname === '/intent/post') ||
    (probeUrl.hostname === 'www.linkedin.com' && probeUrl.pathname === '/sharing/share-offsite/');
  if (isShareEndpoint) probeUrl.search = '';
  return probeUrl.href;
}

async function documentForFile(file) {
  if (!documents.has(file)) {
    documents.set(file, new JSDOM(await readFile(file, 'utf8')).window.document);
  }
  return documents.get(file);
}

async function readDynamicRoutes() {
  try {
    const config = JSON.parse(await readFile(deploymentConfigPath, 'utf8'));
    return config.routes
      .filter((route) => route.dest === '_render' && route.src)
      .map((route) => new RegExp(route.src));
  } catch {
    return [];
  }
}

async function checkExternalUrls(urls) {
  const queue = [...urls];
  const results = [];
  const workers = Array.from({ length: Math.min(6, urls.length) }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      results.push(await checkExternalUrl(url));
    }
  });
  await Promise.all(workers);
  return results.sort((left, right) => left.url.localeCompare(right.url));
}

async function checkExternalUrl(url) {
  try {
    let response = await request(url, 'HEAD');
    if ([403, 405].includes(response.status)) {
      response = await request(url, 'GET');
    }
    const ok = response.status >= 200 && response.status < 400;
    return { url, ok, result: `HTTP ${response.status}`, pages: externalReferences.get(url) };
  } catch (error) {
    const result = error.name === 'TimeoutError' ? 'timeout' : error.message;
    return { url, ok: false, result, pages: externalReferences.get(url) };
  }
}

function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(externalTimeoutMs),
    headers: { 'user-agent': 'PeterClawLinkHealth/1.0 (+https://peterclaw-website.vercel.app)' },
  });
}

function renderReport({
  pages,
  brokenInternal,
  brokenExternal,
  checkedExternal,
  externalWarns,
}) {
  const internalStatus = brokenInternal.length === 0 ? 'PASS' : 'FAIL';
  const externalStatus = !shouldCheckExternal
    ? 'SKIPPED'
    : externalWarns
      ? 'WARN'
      : 'PASS';
  const lines = [
    '## Rendered site link health',
    '',
    `Scanned ${pages} rendered HTML pages. Internal links include local pages and assets; external checks cover outbound anchors only.`,
    '',
    '| Gate | Checked | Failed | Result |',
    '| --- | ---: | ---: | --- |',
    `| Internal links | built output | ${brokenInternal.length} | ${internalStatus} |`,
    `| External links (advisory threshold: > ${externalThreshold}) | ${shouldCheckExternal ? checkedExternal : 'disabled'} | ${shouldCheckExternal ? brokenExternal.length : '-'} | ${externalStatus} |`,
    '',
    '### Broken internal links',
    '',
  ];

  if (brokenInternal.length === 0) {
    lines.push('No broken internal links found.', '');
  } else {
    lines.push('| Link | Reason | Referenced from |', '| --- | --- | --- |');
    for (const issue of brokenInternal) {
      lines.push(`| \`${issue.url}\` | ${issue.reason} | ${formatPages(issue.pages)} |`);
    }
    lines.push('');
  }

  lines.push('### Broken external links (advisory)', '');
  if (!shouldCheckExternal) {
    lines.push('External checks disabled for this run.', '');
  } else if (brokenExternal.length === 0) {
    lines.push('No broken external links found.', '');
  } else {
    lines.push('| Link | Result | Referenced from |', '| --- | --- | --- |');
    for (const issue of brokenExternal) {
      lines.push(`| ${issue.url} | ${issue.result} | ${formatPages(issue.pages)} |`);
    }
    lines.push('');
  }

  lines.push(
    '_Internal failures block CI. External failures are reported and produce a workflow warning only when more than five unique targets fail._',
    '',
  );
  return lines.join('\n');
}

function formatPages(pages) {
  const shown = pages.slice(0, 3).map((page) => `\`${page}\``);
  if (pages.length > shown.length) shown.push(`+${pages.length - shown.length} more`);
  return shown.join(', ');
}

function isIgnoredLink(link) {
  return /^(?:#?$|mailto:|tel:|javascript:|data:|blob:)/i.test(link);
}

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(directory, include) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(file, include));
    else if (include(file)) files.push(file);
  }
  return files;
}
