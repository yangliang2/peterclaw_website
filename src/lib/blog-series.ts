import type { CollectionEntry } from 'astro:content';
import { blogSeriesBySlug, type BlogSeriesSlug } from '@/config/blog-series';
import { collectionPath, localeFromId, stripLocaleFromId, type Locale } from '@/lib/i18n';

type BlogEntry = CollectionEntry<'blog'>;

function seriesSlugForField(seriesField: string | undefined): BlogSeriesSlug | undefined {
  if (!seriesField) {
    return undefined;
  }

  for (const [slug, config] of Object.entries(blogSeriesBySlug) as [BlogSeriesSlug, (typeof blogSeriesBySlug)[BlogSeriesSlug]][]) {
    if (config.seriesField === seriesField) {
      return slug;
    }
  }

  return undefined;
}

function compareSeriesEntries(a: BlogEntry, b: BlogEntry, slugOrder: string[]) {
  const orderA = a.data.seriesNumber ?? slugOrder.indexOf(stripLocaleFromId(a.id, localeFromId(a.id)));
  const orderB = b.data.seriesNumber ?? slugOrder.indexOf(stripLocaleFromId(b.id, localeFromId(b.id)));
  const rankA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
  const rankB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const dateDiff = a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return stripLocaleFromId(a.id, localeFromId(a.id)).localeCompare(stripLocaleFromId(b.id, localeFromId(b.id)));
}

export function getSeriesPosts(
  posts: BlogEntry[],
  locale: Locale,
  seriesSlug: BlogSeriesSlug
): BlogEntry[] {
  const config = blogSeriesBySlug[seriesSlug];

  return posts
    .filter(
      (entry) =>
        localeFromId(entry.id) === locale &&
        !entry.data.draft &&
        entry.data.series === config.seriesField
    )
    .sort((a, b) => compareSeriesEntries(a, b, config.slugOrder));
}

export function getSeriesNeighbors(post: BlogEntry, posts: BlogEntry[]) {
  const seriesSlug = seriesSlugForField(post.data.series);
  if (!seriesSlug) {
    return { seriesSlug: undefined, previous: undefined, next: undefined };
  }

  const locale = localeFromId(post.id);
  const ordered = getSeriesPosts(posts, locale, seriesSlug);
  const index = ordered.findIndex((entry) => entry.id === post.id);

  if (index === -1) {
    return { seriesSlug, previous: undefined, next: undefined };
  }

  return {
    seriesSlug,
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined
  };
}

export function postHref(locale: Locale, entry: BlogEntry) {
  return collectionPath(locale, 'blog', entry.id);
}
