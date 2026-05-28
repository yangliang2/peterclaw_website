import { getFeaturedRepositories } from '../src/lib/github';

export const config = {
  runtime: 'edge',
};

const CACHE_SECONDS = 30 * 60;
const FALLBACK_REPOSITORIES = [
  {
    repo: 'yangliang2/peterclaw_website',
    stars: 0,
    forks: 0,
    language: 'TypeScript',
    updatedAt: '2026-05-24T12:00:00Z',
    url: 'https://github.com/yangliang2/peterclaw_website',
  },
  {
    repo: 'yangliang2/multica-agent-plugin',
    stars: 0,
    forks: 0,
    language: 'Shell',
    updatedAt: '2026-05-24T15:01:40Z',
    url: 'https://github.com/yangliang2/multica-agent-plugin',
  },
] as const;

type ApiRepository = {
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  url: string;
};

let responseCache: { data: ApiRepository[]; fetchedAt: number } | null = null;

function json(body: unknown, status = 200) {
  const cacheControl =
    status === 200
      ? `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`
      : 'no-store';

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      'CDN-Cache-Control': cacheControl,
    },
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const now = Date.now();
  if (responseCache && now - responseCache.fetchedAt < CACHE_SECONDS * 1000) {
    return json({ repositories: responseCache.data, fromCache: true });
  }

  try {
    const { repositories: featuredRepos } = await getFeaturedRepositories();
    const featured = featuredRepos.slice(0, 8).map<ApiRepository>((repo) => {
      const fullName = new URL(repo.html_url).pathname.replace(/^\//, '');
      return {
        repo: fullName,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updatedAt: repo.updated_at,
        url: repo.html_url,
      };
    });

    const data = featured.length ? featured : [...FALLBACK_REPOSITORIES];
    responseCache = { data, fetchedAt: now };
    return json({ repositories: data, fromCache: false });
  } catch (error) {
    if (responseCache) {
      return json({ repositories: responseCache.data, fromCache: true });
    }
    console.warn('Using fallback GitHub repositories for projects.', error);
    return json({ repositories: [...FALLBACK_REPOSITORIES], fromCache: true }, 200);
  }
}
