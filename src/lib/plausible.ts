interface PlausibleQueryResult {
  dimensions: string[];
  metrics: number[];
}

interface PlausibleQueryResponse {
  results?: PlausibleQueryResult[];
}

type PageviewMap = Map<string, number>;

const PLAUSIBLE_QUERY_URL =
  import.meta.env.PLAUSIBLE_STATS_API_URL || 'https://plausible.io/api/v2/query';

const statsApiKey = import.meta.env.PLAUSIBLE_STATS_API_KEY;
const siteId = import.meta.env.PLAUSIBLE_SITE_ID || import.meta.env.PLAUSIBLE_DOMAIN;
const dateRange = import.meta.env.PLAUSIBLE_STATS_DATE_RANGE || 'all';

function pagePathVariants(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash =
    normalizedPath.length > 1 && normalizedPath.endsWith('/')
      ? normalizedPath.slice(0, -1)
      : normalizedPath;

  return Array.from(new Set([normalizedPath, withoutTrailingSlash]));
}

export function formatPageviews(pageviews: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    notation: pageviews >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: pageviews >= 1000 ? 1 : 0,
  }).format(pageviews);
}

export async function getPlausiblePageviews(paths: string[]) {
  if (!statsApiKey || !siteId || paths.length === 0) {
    return new Map<string, number>();
  }

  const requestedPaths = Array.from(new Set(paths.flatMap(pagePathVariants)));

  try {
    const response = await fetch(PLAUSIBLE_QUERY_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${statsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: siteId,
        metrics: ['pageviews'],
        date_range: dateRange,
        dimensions: ['event:page'],
        filters: [['is', 'event:page', requestedPaths]],
        pagination: {
          limit: requestedPaths.length,
          offset: 0,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[plausible] Stats API request failed: ${response.status}`);
      return new Map<string, number>();
    }

    const data = (await response.json()) as PlausibleQueryResponse;
    const byVariant = new Map<string, number>();

    for (const result of data.results ?? []) {
      const path = result.dimensions[0];
      const pageviews = result.metrics[0];

      if (path && typeof pageviews === 'number') {
        byVariant.set(path, pageviews);
      }
    }

    return paths.reduce<PageviewMap>((pageviewsByPath, path) => {
      const total = pagePathVariants(path).reduce(
        (sum, variant) => sum + (byVariant.get(variant) ?? 0),
        0
      );

      pageviewsByPath.set(path, total);

      return pageviewsByPath;
    }, new Map());
  } catch (error) {
    console.warn('[plausible] Stats API request failed', error);
    return new Map<string, number>();
  }
}
