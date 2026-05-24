import type { CollectionEntry } from 'astro:content';
import { collectionPath, localeFromId, type Locale } from '@/lib/i18n';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogSeries {
  title: string;
  slug: string;
  locale: Locale;
  posts: BlogPost[];
}

export function seriesSlug(series: string): string {
  return series
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function seriesPath(locale: Locale, slug: string): string {
  return `/${locale}/series/${slug}/`;
}

export function compareSeriesPosts(a: BlogPost, b: BlogPost): number {
  const orderA = a.data.seriesOrder;
  const orderB = b.data.seriesOrder;

  if (orderA !== undefined || orderB !== undefined) {
    const orderDiff = (orderA ?? Number.MAX_SAFE_INTEGER) - (orderB ?? Number.MAX_SAFE_INTEGER);
    if (orderDiff !== 0) {
      return orderDiff;
    }
  }

  return a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf() || a.id.localeCompare(b.id);
}

export function buildBlogSeries(posts: BlogPost[]): BlogSeries[] {
  const seriesByKey = new Map<string, BlogSeries>();

  for (const post of posts) {
    if (!post.data.series) {
      continue;
    }

    const locale = localeFromId(post.id);
    const slug = seriesSlug(post.data.series);
    const key = `${locale}/${slug}`;
    const series = seriesByKey.get(key) ?? {
      title: post.data.series,
      slug,
      locale,
      posts: [],
    };

    series.posts.push(post);
    seriesByKey.set(key, series);
  }

  return [...seriesByKey.values()]
    .map((series) => ({
      ...series,
      posts: [...series.posts].sort(compareSeriesPosts),
    }))
    .sort((a, b) => b.posts.length - a.posts.length || a.title.localeCompare(b.title));
}

export function relatedSeriesPosts(post: BlogPost, posts: BlogPost[]): BlogPost[] {
  if (!post.data.series) {
    return [];
  }

  return posts
    .filter(
      (entry) =>
        entry.id !== post.id &&
        entry.data.series === post.data.series &&
        localeFromId(entry.id) === localeFromId(post.id)
    )
    .sort(compareSeriesPosts);
}

export function blogPostPath(post: BlogPost): string {
  return collectionPath(localeFromId(post.id), 'blog', post.id);
}
