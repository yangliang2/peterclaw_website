import type { CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { collectionPath, localeFromId } from './i18n';

export interface BlogSeries {
  title: string;
  slug: string;
  locale: Locale;
  posts: CollectionEntry<'blog'>[];
  latestPost: CollectionEntry<'blog'>;
}

export function seriesSlug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, '-');
}

export function seriesPath(locale: Locale, slug: string): string {
  return `/${locale}/series/${slug}/`;
}

export function compareSeriesPosts(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) {
  const orderA = a.data.seriesOrder ?? Number.POSITIVE_INFINITY;
  const orderB = b.data.seriesOrder ?? Number.POSITIVE_INFINITY;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const dateDiff = a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return a.data.title.localeCompare(b.data.title);
}

export function buildSeries(posts: CollectionEntry<'blog'>[]): BlogSeries[] {
  const grouped = new Map<string, CollectionEntry<'blog'>[]>();

  for (const post of posts) {
    const title = post.data.series;
    if (!title) {
      continue;
    }

    const locale = localeFromId(post.id);
    const key = `${locale}:${title}`;
    grouped.set(key, [...(grouped.get(key) ?? []), post]);
  }

  return [...grouped.values()]
    .map((seriesPosts) => {
      const sortedPosts = [...seriesPosts].sort(compareSeriesPosts);
      const latestPost = [...seriesPosts].sort(
        (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
      )[0];
      const title = sortedPosts[0].data.series as string;
      const locale = localeFromId(sortedPosts[0].id);

      return {
        title,
        slug: seriesSlug(title),
        locale,
        posts: sortedPosts,
        latestPost,
      };
    })
    .sort((a, b) => b.latestPost.data.publishedAt.valueOf() - a.latestPost.data.publishedAt.valueOf());
}

export function findSeriesForPost(
  post: CollectionEntry<'blog'>,
  posts: CollectionEntry<'blog'>[]
): BlogSeries | undefined {
  if (!post.data.series) {
    return undefined;
  }

  return buildSeries(posts).find(
    (series) => series.locale === localeFromId(post.id) && series.title === post.data.series
  );
}

export function blogPostPath(post: CollectionEntry<'blog'>): string {
  const locale = localeFromId(post.id);
  return collectionPath(locale, 'blog', post.id);
}
