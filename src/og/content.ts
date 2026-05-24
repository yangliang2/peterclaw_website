import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { localeFromId, stripLocaleFromId, type Locale } from '../lib/i18n.ts';

export type OgContentEntry = {
  id: string;
  locale: Locale;
  slug: string;
  title: string;
  publishedAt: Date;
  tags: string[];
  ogImage?: string;
};

type ContentCollection = 'blog' | 'knowledge';

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  throw new Error(`Invalid publishedAt value: ${String(value)}`);
}

export async function loadOgContentEntries(
  projectRoot: string,
  collection: ContentCollection,
): Promise<OgContentEntry[]> {
  const baseDir = join(projectRoot, 'src/content', collection);
  const files = await walkMarkdownFiles(baseDir);
  const entries: OgContentEntry[] = [];

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    const { data } = matter(source);

    if (data.draft === true) {
      continue;
    }

    const relative = filePath
      .slice(baseDir.length + 1)
      .replace(/\.(md|mdx)$/i, '');
    const id = relative;
    const locale = localeFromId(id);
    const slug = stripLocaleFromId(id, locale);

    entries.push({
      id,
      locale,
      slug,
      title: String(data.title ?? ''),
      publishedAt: parseDate(data.publishedAt),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      ogImage: typeof data.ogImage === 'string' ? data.ogImage : undefined,
    });
  }

  return entries;
}
