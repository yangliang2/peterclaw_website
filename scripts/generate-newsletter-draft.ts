import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildWeeklyNewsletterDraft, createButtondownDrafts, type NewsletterEntry } from '../src/lib/newsletter';
import type { Locale } from '../src/lib/i18n';

const repoRoot = process.cwd();
const blogRoot = path.join(repoRoot, 'src', 'content', 'blog');
const outputRoot = path.join(repoRoot, 'newsletter', 'drafts');
const locales = ['zh', 'en'] as const satisfies readonly Locale[];
const lookbackDays = parseIntegerFlag('--days') ?? 7;
const shouldPush = process.argv.includes('--push');
const shouldWrite = !process.argv.includes('--no-write');
const now = new Date();

const drafts = locales.map((locale) => {
  const entries = collectEntries(locale);
  return buildWeeklyNewsletterDraft(locale, entries, {
    now,
    lookbackDays,
    siteUrl: process.env.SITE_URL,
  });
});

for (const draft of drafts) {
  console.log(`[${draft.locale}] ${draft.subject} (${draft.entryCount} entries)`);

  if (shouldWrite) {
    const fileName = `weekly-${formatDateSlug(now)}-${draft.locale}.md`;
    const filePath = path.join(outputRoot, fileName);
    writeFileSync(filePath, draft.body);
    console.log(`Wrote ${path.relative(repoRoot, filePath)}`);
  }
}

if (shouldPush) {
  const results = await createButtondownDrafts(drafts, {
    defaultApiKey: process.env.BUTTONDOWN_API_KEY,
    apiKeysByLocale: {
      zh: process.env.BUTTONDOWN_ZH_API_KEY,
      en: process.env.BUTTONDOWN_EN_API_KEY,
    },
  });

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

function collectEntries(locale: Locale): NewsletterEntry[] {
  return walk(path.join(blogRoot, locale))
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .reduce<NewsletterEntry[]>((entries, file) => {
      const source = readFileSync(file, 'utf8');
      const parsed = parseFrontmatter(source);

      if (!parsed || parsed.draft === true) return entries;
      if (!isDateString(parsed.publishedAt)) return entries;

      const slug = path.relative(path.join(blogRoot, locale), file).replace(/\.(md|mdx)$/i, '');
      const title = String(parsed.title ?? '');
      const description = String(parsed.description ?? '');

      if (!title || !description) return entries;

      entries.push({
        title,
        description,
        publishedAt: new Date(`${parsed.publishedAt}T00:00:00Z`),
        url: `/${locale}/blog/${slug}/`,
        contentType: typeof parsed.contentType === 'string' ? parsed.contentType : undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      });

      return entries;
    }, []);
}

function parseFrontmatter(source: string) {
  if (!source.startsWith('---\n')) return null;

  const endIndex = source.indexOf('\n---', 4);
  if (endIndex === -1) return null;

  const raw = source.slice(4, endIndex);
  const data: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;

  for (const line of raw.split('\n')) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (field) {
      const [, key, rawValue] = field;
      currentArrayKey = null;

      if (rawValue.trim() === '') {
        data[key] = [];
        currentArrayKey = key;
        continue;
      }

      data[key] = parseScalar(rawValue);
      continue;
    }

    const arrayItem = line.match(/^\s{2}-\s+(.+)$/);
    if (arrayItem && currentArrayKey && Array.isArray(data[currentArrayKey])) {
      const arrayValue = data[currentArrayKey] as unknown[];
      arrayValue.push(parseScalar(arrayItem[1]));
    }
  }

  return data;
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  return trimmed.replace(/^['"]|['"]$/g, '');
}

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function parseIntegerFlag(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;

  const value = Number.parseInt(process.argv[index + 1] ?? '', 10);
  return Number.isInteger(value) && value > 0 ? value : undefined;
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateSlug(date: Date) {
  return date.toISOString().slice(0, 10);
}
