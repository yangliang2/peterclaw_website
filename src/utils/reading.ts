import type { Locale } from '@/lib/i18n';

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export interface TocEntry {
  level: 2 | 3;
  text: string;
  id: string;
}

export function stripFrontmatter(body: string): string {
  return body.replace(FRONTMATTER_RE, '');
}

/** Count CJK unified ideographs (Chinese-heavy content). */
export function countChineseCharacters(text: string): number {
  const matches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/gu);
  return matches?.length ?? 0;
}

/** Count Latin words after removing CJK segments. */
export function countEnglishWords(text: string): number {
  const latin = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/gu, ' ');
  const matches = latin.match(/\b[\p{L}\p{N}](?:['’][\p{L}\p{N}]|[\p{L}\p{N}-])*[\p{L}\p{N}]\b/gu);
  return matches?.length ?? 0;
}

export function estimateReadingMinutes(body: string): number {
  const content = stripFrontmatter(body);
  const chinese = countChineseCharacters(content);
  const english = countEnglishWords(content);
  const minutes = chinese / 300 + english / 200;
  return Math.max(1, Math.ceil(minutes));
}

export function slugifyHeading(text: string): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'section';
}

function uniqueHeadingId(baseSlug: string, slugCounts: Map<string, number>): string {
  const used = slugCounts.get(baseSlug) ?? 0;
  slugCounts.set(baseSlug, used + 1);
  return used === 0 ? baseSlug : `${baseSlug}-${used + 1}`;
}

export function extractTocFromMarkdown(body: string): TocEntry[] {
  const content = stripFrontmatter(body);
  const slugCounts = new Map<string, number>();
  const entries: TocEntry[] = [];

  for (const line of content.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) {
      continue;
    }

    const level = match[1].length as 2 | 3;
    const raw = match[2].replace(/\s*\{#[^}]+\}\s*$/, '').trim();
    const text = raw.replace(/[*_`[\]]/g, '').trim();

    if (!text) {
      continue;
    }

    const baseSlug = slugifyHeading(text);
    const id = uniqueHeadingId(baseSlug, slugCounts);
    entries.push({ level, text, id });
  }

  return entries;
}

export function formatReadingTime(minutes: number, locale: Locale): string {
  if (locale === 'zh') {
    return `预计阅读 ${minutes} 分钟`;
  }

  return `${minutes} min read`;
}
