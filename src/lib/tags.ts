import type { CollectionEntry } from 'astro:content';
import { localeFromId, type Locale } from '@/lib/i18n';

export function slugifyTag(tag: string): string {
  const slug = tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || encodeURIComponent(tag.trim());
}

export function tagPath(locale: Locale, tag: string): string {
  return `/${locale}/blog/tags/${slugifyTag(tag)}/`;
}

export function collectTagsByLocale(
  posts: CollectionEntry<'blog'>[]
): Map<Locale, Map<string, string>> {
  const result = new Map<Locale, Map<string, string>>();

  for (const post of posts) {
    if (post.data.draft) continue;

    const locale = localeFromId(post.id);
    const tags = result.get(locale) ?? new Map<string, string>();
    result.set(locale, tags);

    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      if (!tags.has(slug)) {
        tags.set(slug, tag);
      }
    }
  }

  return result;
}

export function postsForTag(
  posts: CollectionEntry<'blog'>[],
  locale: Locale,
  tagSlug: string
): CollectionEntry<'blog'>[] {
  return posts
    .filter(
      (post) =>
        !post.data.draft &&
        localeFromId(post.id) === locale &&
        post.data.tags.some((tag) => slugifyTag(tag) === tagSlug)
    )
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}
