import type { CollectionEntry } from 'astro:content';
import type { SeriesDefinition } from '@/config/series';
import { localeFromId } from '@/lib/i18n';

export function postsInSeries(
  posts: CollectionEntry<'blog'>[],
  series: SeriesDefinition,
  locale: ReturnType<typeof localeFromId>
): CollectionEntry<'blog'>[] {
  const seriesName = series.names[locale];

  return posts
    .filter((entry) => localeFromId(entry.id) === locale && !entry.data.draft && entry.data.series === seriesName)
    .sort(compareSeriesPosts);
}

export function compareSeriesPosts(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>): number {
  const volA = a.data.seriesNumber ?? Number.MAX_SAFE_INTEGER;
  const volB = b.data.seriesNumber ?? Number.MAX_SAFE_INTEGER;

  if (volA !== volB) {
    return volA - volB;
  }

  const dateDiff = a.data.publishedAt.valueOf() - b.data.publishedAt.valueOf();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return a.id.localeCompare(b.id);
}

export function findAdjacentInSeries(
  ordered: CollectionEntry<'blog'>[],
  currentId: string
): { previous?: CollectionEntry<'blog'>; next?: CollectionEntry<'blog'> } {
  const index = ordered.findIndex((entry) => entry.id === currentId);
  if (index === -1) {
    return {};
  }

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}
