import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'src', 'content');
const markdownPattern = /\.(md|mdx)$/i;
const staleWindowDays = 90;
const now = new Date();

const files = walk(contentRoot).filter((file) => markdownPattern.test(file));
const draftEntries = [];
const staleNoindexConflicts = [];
const unreadableEntries = [];

for (const file of files) {
  const relativePath = path.relative(repoRoot, file);
  const source = readFileSync(file, 'utf8');
  const frontmatter = parseFrontmatter(source);

  if (!frontmatter) {
    unreadableEntries.push(relativePath);
    continue;
  }

  if (frontmatter.draft === true) {
    draftEntries.push(relativePath);
  }

  if (frontmatter.noindex === true && isOlderThan(frontmatter.publishedAt, staleWindowDays)) {
    staleNoindexConflicts.push({
      file: relativePath,
      publishedAt: frontmatter.publishedAt,
    });
  }
}

const summary = [
  '# Content Health',
  '',
  `Scanned ${files.length} Markdown/MDX files under \`src/content\`.`,
  '',
  '## Draft Content',
  '',
  formatList(
    draftEntries,
    'No `draft: true` entries found.',
    (file) => `- \`${file}\``
  ),
  '',
  `## Published Content Older Than ${staleWindowDays} Days With \`noindex: true\``,
  '',
  formatList(
    staleNoindexConflicts,
    'No stale published content has a `noindex: true` conflict.',
    (entry) => `- \`${entry.file}\` (publishedAt: ${entry.publishedAt})`
  ),
  '',
  '## Files Without Parseable Frontmatter',
  '',
  formatList(
    unreadableEntries,
    'All scanned content files have parseable YAML frontmatter blocks.',
    (file) => `- \`${file}\``
  ),
  '',
].join('\n');

console.log(summary);

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) return null;

  const endIndex = source.indexOf('\n---', 4);
  if (endIndex === -1) return null;

  const raw = source.slice(4, endIndex);
  const data = {};

  for (const line of raw.split('\n')) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!field) continue;

    const [, key, rawValue] = field;
    data[key] = parseScalar(rawValue);
  }

  return data;
}

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  return trimmed.replace(/^['"]|['"]$/g, '');
}

function isOlderThan(value, days) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const publishedAt = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(publishedAt.valueOf())) return false;

  const ageMs = now.valueOf() - publishedAt.valueOf();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

function formatList(items, emptyMessage, formatItem) {
  if (items.length === 0) return emptyMessage;

  return items.map(formatItem).join('\n');
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}
