import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'src', 'content');
const publicRoot = path.join(repoRoot, 'public');
const collections = ['blog', 'knowledge'];
const requiredFrontmatter = ['title', 'description', 'publishedAt', 'tags'];
const staticRoutes = new Set([
  '/',
  '/zh', '/zh/',
  '/en', '/en/',
  '/zh/about', '/zh/about/',
  '/en/about', '/en/about/',
  '/zh/now', '/zh/now/',
  '/en/now', '/en/now/',
  '/zh/projects', '/zh/projects/',
  '/en/projects', '/en/projects/',
  '/zh/tools', '/zh/tools/',
  '/en/tools', '/en/tools/',
  '/zh/search', '/zh/search/',
  '/en/search', '/en/search/',
  '/zh/blog', '/zh/blog/',
  '/en/blog', '/en/blog/',
  '/zh/blog/series/ai-diary', '/zh/blog/series/ai-diary/',
  '/en/blog/series/ai-diary', '/en/blog/series/ai-diary/',
  '/zh/knowledge', '/zh/knowledge/',
  '/en/knowledge', '/en/knowledge/',
]);
const errors = [];
const warnings = [];
const externalChecks = [];

const markdownFiles = collections.flatMap((collection) => {
  const collectionRoot = path.join(contentRoot, collection);
  return walk(collectionRoot)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => ({ collection, file }));
});

const contentRoutes = buildContentRoutes(markdownFiles);

for (const entry of markdownFiles) {
  validateEntry(entry);
}

await Promise.all(externalChecks);

if (warnings.length > 0) {
  console.warn(formatMessages('Content quality warnings', warnings));
}

if (errors.length > 0) {
  console.error(formatMessages('Content quality failed', errors));
  process.exit(1);
}

console.log(`Content quality passed for ${markdownFiles.length} Markdown files.`);

function validateEntry({ collection, file }) {
  const relativePath = path.relative(repoRoot, file);
  const source = readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(source, relativePath);

  if (!parsed) return;

  const { data, rawKeys, body } = parsed;
  const isDraft = data.draft === true;

  for (const field of requiredFrontmatter) {
    if (!rawKeys.has(field)) {
      errors.push(`${relativePath}: missing required frontmatter field "${field}".`);
    }
  }

  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push(`${relativePath}: "title" must be a non-empty string.`);
  }

  if (typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push(`${relativePath}: "description" must be a non-empty string.`);
  }

  if (!isValidDate(data.publishedAt)) {
    errors.push(`${relativePath}: "publishedAt" must be a valid YYYY-MM-DD date.`);
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0 || data.tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
    errors.push(`${relativePath}: "tags" must be a non-empty list of strings.`);
  }

  if (collection === 'blog' && data.faq !== undefined) {
    validateFaq(data.faq, relativePath);
  }

  validateSlug(file, collection, relativePath);
  validateOgImage(data.ogImage, isDraft, relativePath);
  validateLinks(body, file, relativePath);
}

function validateFaq(faq, relativePath) {
  if (
    !Array.isArray(faq) ||
    faq.length === 0 ||
    faq.some((item) => (
      typeof item !== 'object' ||
      typeof item.question !== 'string' ||
      item.question.trim() === '' ||
      typeof item.answer !== 'string' ||
      item.answer.trim() === ''
    ))
  ) {
    errors.push(`${relativePath}: "faq" must be a non-empty list of question/answer objects.`);
  }
}

function validateSlug(file, collection, relativePath) {
  const collectionRoot = path.join(contentRoot, collection);
  const pathParts = path.relative(collectionRoot, file).split(path.sep);
  const locale = pathParts[0];
  const slugParts = pathParts.slice(1);
  const slug = slugParts.join('/').replace(/\.(md|mdx)$/i, '');
  const segmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!/^[a-z]{2}$/.test(locale)) {
    errors.push(`${relativePath}: content must live under a two-letter locale directory, e.g. zh/ or en/.`);
  }

  for (const segment of slug.split('/')) {
    if (!segmentPattern.test(segment)) {
      errors.push(`${relativePath}: slug segment "${segment}" must use lowercase kebab-case.`);
    }
  }
}

function validateOgImage(ogImage, isDraft, relativePath) {
  if (typeof ogImage === 'string' && ogImage.trim() !== '') {
    if (!ogImage.startsWith('/')) {
      errors.push(`${relativePath}: "ogImage" must be an absolute public path such as /og-default.png.`);
      return;
    }

    if (!existsSync(path.join(publicRoot, stripLeadingSlash(ogImage)))) {
      errors.push(`${relativePath}: "ogImage" points to a missing public asset: ${ogImage}.`);
    }

    return;
  }

  if (!isDraft && !existsSync(path.join(publicRoot, 'og-default.png'))) {
    errors.push(`${relativePath}: published content needs either an "ogImage" or the default /og-default.png asset.`);
  }
}

function validateLinks(body, file, relativePath) {
  const links = extractMarkdownLinks(body);

  for (const link of links) {
    const normalized = link.trim();

    if (
      normalized === '' ||
      normalized.startsWith('#') ||
      normalized.startsWith('mailto:') ||
      normalized.startsWith('tel:')
    ) {
      continue;
    }

    if (/^https?:\/\//i.test(normalized)) {
      validateExternalLink(normalized, relativePath);
      continue;
    }

    validateInternalLink(normalized, file, relativePath);
  }
}

function validateExternalLink(url, relativePath) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    errors.push(`${relativePath}: invalid external link URL: ${url}.`);
    return;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    errors.push(`${relativePath}: unsupported external link protocol: ${url}.`);
    return;
  }

  externalChecks.push(checkExternalLink(parsed.href, relativePath));
}

async function checkExternalLink(url, relativePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }

    if (response.status >= 400) {
      errors.push(`${relativePath}: external link returned HTTP ${response.status}: ${url}.`);
    }
  } catch (error) {
    errors.push(`${relativePath}: external link check failed for ${url}: ${error.message}.`);
  } finally {
    clearTimeout(timeout);
  }
}

function validateInternalLink(link, file, relativePath) {
  const withoutHash = link.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];

  if (withoutQuery === '') return;

  if (withoutQuery.startsWith('/')) {
    if (publicAssetExists(withoutQuery) || routeExists(withoutQuery)) return;
    errors.push(`${relativePath}: broken internal link target: ${link}.`);
    return;
  }

  const target = path.resolve(path.dirname(file), withoutQuery);

  if (!existsSync(target)) {
    errors.push(`${relativePath}: broken relative link target: ${link}.`);
  }
}

function slugifyTag(tag) {
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || encodeURIComponent(tag.trim());
}

function extractBlogMeta(source) {
  if (!source.startsWith('---\n')) return null;

  const endIndex = source.indexOf('\n---', 4);
  if (endIndex === -1) return null;

  const block = source.slice(4, endIndex);
  const tags = [];
  let inTags = false;
  let isDraft = false;

  for (const line of block.split('\n')) {
    if (line.trim() === '') continue;

    if (/^draft:\s*true\s*$/.test(line)) {
      isDraft = true;
      continue;
    }

    if (/^tags:\s*$/.test(line)) {
      inTags = true;
      continue;
    }

    if (inTags) {
      const match = line.match(/^\s+-\s+(.*)$/);
      if (match) {
        tags.push(match[1].trim().replace(/^['"]|['"]$/g, ''));
        continue;
      }

      if (/^[A-Za-z]/.test(line)) {
        inTags = false;
      }
    }
  }

  return { tags, isDraft };
}

function buildContentRoutes(files) {
  const routes = new Set();

  for (const { collection, file } of files) {
    const collectionRoot = path.join(contentRoot, collection);
    const pathParts = path.relative(collectionRoot, file).split(path.sep);
    const locale = pathParts[0];
    const slug = pathParts.slice(1).join('/').replace(/\.(md|mdx)$/i, '');
    routes.add(`/${locale}/${collection}/${slug}`);
    routes.add(`/${locale}/${collection}/${slug}/`);

    if (collection === 'blog') {
      const source = readFileSync(file, 'utf8');
      const meta = extractBlogMeta(source);

      if (meta && !meta.isDraft) {
        for (const tag of meta.tags) {
          const tagSlug = slugifyTag(tag);
          routes.add(`/${locale}/blog/tags/${tagSlug}`);
          routes.add(`/${locale}/blog/tags/${tagSlug}/`);
        }
      }
    }
  }

  routes.add('/zh/blog');
  routes.add('/zh/blog/');
  routes.add('/en/blog');
  routes.add('/en/blog/');
  routes.add('/zh/knowledge');
  routes.add('/zh/knowledge/');
  routes.add('/en/knowledge');
  routes.add('/en/knowledge/');

  return routes;
}

function routeExists(route) {
  return staticRoutes.has(route) || contentRoutes.has(route);
}

function publicAssetExists(link) {
  return existsSync(path.join(publicRoot, stripLeadingSlash(link)));
}

function parseFrontmatter(source, relativePath) {
  if (!source.startsWith('---\n')) {
    errors.push(`${relativePath}: missing YAML frontmatter block.`);
    return null;
  }

  const endIndex = source.indexOf('\n---', 4);

  if (endIndex === -1) {
    errors.push(`${relativePath}: frontmatter block is not closed.`);
    return null;
  }

  const raw = source.slice(4, endIndex);
  const body = source.slice(endIndex + 4);
  const data = {};
  const rawKeys = new Set();
  let activeArrayKey = null;
  let activeObjectItem = null;

  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;

    const objectArrayItem = line.match(/^\s+-\s+([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (objectArrayItem && activeArrayKey === 'faq') {
      const [, key, rawValue] = objectArrayItem;
      activeObjectItem = { [key]: parseScalar(rawValue) };
      data[activeArrayKey].push(activeObjectItem);
      continue;
    }

    const objectField = line.match(/^\s+([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (objectField && activeArrayKey === 'faq' && activeObjectItem) {
      const [, key, rawValue] = objectField;
      activeObjectItem[key] = parseScalar(rawValue);
      continue;
    }

    const arrayItem = line.match(/^\s+-\s+(.*)$/);
    if (arrayItem && activeArrayKey) {
      data[activeArrayKey].push(parseScalar(arrayItem[1]));
      continue;
    }

    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!field) {
      warnings.push(`${relativePath}: unsupported frontmatter line was ignored: ${line}`);
      activeArrayKey = null;
      activeObjectItem = null;
      continue;
    }

    const [, key, rawValue] = field;
    rawKeys.add(key);

    if (rawValue === '') {
      data[key] = [];
      activeArrayKey = key;
      activeObjectItem = null;
    } else {
      data[key] = parseScalar(rawValue);
      activeArrayKey = null;
      activeObjectItem = null;
    }
  }

  return { data, rawKeys, body };
}

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^\[.*\]$/.test(trimmed)) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item))
      .filter((item) => item !== '');
  }

  return trimmed.replace(/^['"]|['"]$/g, '');
}

function extractMarkdownLinks(body) {
  const links = [];
  const inlineLinkPattern = /(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const referenceLinkPattern = /^\s*\[[^\]]+\]:\s+(\S+)/gm;
  let match;

  while ((match = inlineLinkPattern.exec(body)) !== null) {
    links.push(match[1]);
  }

  while ((match = referenceLinkPattern.exec(body)) !== null) {
    links.push(match[1]);
  }

  return links;
}

function isValidDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf());
}

function stripLeadingSlash(value) {
  return value.replace(/^\/+/, '');
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function formatMessages(title, messages) {
  return [`\n${title}:`, ...messages.map((message) => `- ${message}`)].join('\n');
}
