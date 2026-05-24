import type { CollectionEntry } from 'astro:content';
import { collectionPath, localeFromId, stripLocaleFromId, type Locale } from '@/lib/i18n';

export type BlogPost = CollectionEntry<'blog'>;

export interface SeriesSummary {
  title: string;
  slug: string;
  posts: BlogPost[];
  latestPost: BlogPost;
}

export function seriesSlug(title: string) {
  return title
    .trim()
    .normalize('NFKC')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .toLowerCase();
}

export function sortSeriesPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const orderA = a.data.seriesOrder;
    const orderB = b.data.seriesOrder;

    if (orderA !== undefined || orderB !== undefined) {
      if (orderA === undefined) return 1;
      if (orderB === undefined) return -1;
      if (orderA !== orderB) return orderA - orderB;
    }

    return a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
  });
}

export function collectSeries(posts: BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const title = post.data.series?.trim();
    if (!title) continue;

    groups.set(title, [...(groups.get(title) ?? []), post]);
  }

  return [...groups.entries()]
    .map(([title, groupPosts]): SeriesSummary => {
      const sortedPosts = sortSeriesPosts(groupPosts);
      const latestPost = [...groupPosts].sort(
        (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
      )[0];

      return {
        title,
        slug: seriesSlug(title),
        posts: sortedPosts,
        latestPost,
      };
    })
    .sort((a, b) => b.latestPost.data.publishedAt.valueOf() - a.latestPost.data.publishedAt.valueOf());
}

export function findPostSeries(post: BlogPost, posts: BlogPost[]) {
  const title = post.data.series?.trim();
  if (!title) return undefined;

  return collectSeries(posts).find((series) => series.title === title);
}

export function seriesPath(locale: Locale, slug: string) {
  return `/${locale}/series/${slug}/`;
}

export function postSeriesLabel(post: BlogPost, locale: Locale) {
  const slug = stripLocaleFromId(post.id, locale);
  return `${post.data.seriesOrder ? `${post.data.seriesOrder}. ` : ''}${slug}`;
}

export function postPath(locale: Locale, post: BlogPost) {
  return collectionPath(locale, 'blog', post.id);
}

export function postLocale(post: BlogPost) {
  return localeFromId(post.id);
}
