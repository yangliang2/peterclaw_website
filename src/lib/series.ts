import type { CollectionEntry } from 'astro:content';
import type { SeriesDefinition } from '@/config/series';
import { collectionPath, localeFromId, type Locale } from '@/lib/i18n';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogSeries {
  title: string;
  slug: string;
  posts: BlogPost[];
  latestPost: BlogPost;
}

export function postsInSeries(
  posts: BlogPost[],
  series: SeriesDefinition,
  locale: Locale
): BlogPost[] {
  const seriesName = series.names[locale];

  return posts
    .filter((entry) => localeFromId(entry.id) === locale && !entry.data.draft && entry.data.series === seriesName)
    .sort(compareSeriesPosts);
}

export function compareSeriesPosts(a: BlogPost, b: BlogPost): number {
  const orderA = a.data.seriesOrder ?? a.data.seriesNumber ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.data.seriesOrder ?? b.data.seriesNumber ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const dateDiff = a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return a.id.localeCompare(b.id);
}

export function findAdjacentInSeries(
  ordered: BlogPost[],
  currentId: string
): { previous?: BlogPost; next?: BlogPost } {
  const index = ordered.findIndex((entry) => entry.id === currentId);
  if (index === -1) {
    return {};
  }

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export function seriesSlug(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, '-');
}

export function seriesPath(locale: Locale, slug: string) {
  return `/${locale}/series/${slug}/`;
}

export function defaultSeriesPath(slug: string) {
  return `/series/${slug}/`;
}

export function sortSeriesPosts(posts: BlogPost[]) {
  return [...posts].sort(compareSeriesPosts);
}

export function buildBlogSeries(posts: BlogPost[]): BlogSeries[] {
  const grouped = new Map<string, BlogPost[]>();

  for (const post of posts) {
    if (!post.data.series || post.data.draft) {
      continue;
    }

    const existing = grouped.get(post.data.series) ?? [];
    existing.push(post);
    grouped.set(post.data.series, existing);
  }

  return [...grouped.entries()]
    .map(([title, seriesPosts]) => {
      const sortedPosts = sortSeriesPosts(seriesPosts);
      const latestPost = [...sortedPosts].sort(
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
  if (!post.data.series) {
    return undefined;
  }

  return buildBlogSeries(posts).find((series) => series.title === post.data.series);
}

export function blogPostPath(post: BlogPost) {
  const locale = localeFromId(post.id);
  return collectionPath(locale, 'blog', post.id);
}
