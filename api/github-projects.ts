export const config = {
  runtime: 'edge',
};

const CACHE_SECONDS = 30 * 60;
const REPOSITORIES = ['yangliang2/peterclaw_website'] as const;

interface GitHubRepository {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
}

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

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'peterclaw-website-projects',
  };
  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const responses = await Promise.all(
      REPOSITORIES.map((repository) =>
        fetch(`https://api.github.com/repos/${repository}`, { headers }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      return json({ error: 'GitHub data is temporarily unavailable' }, 502);
    }

    const repositories = await Promise.all(
      responses.map(async (response) => {
        const repository = (await response.json()) as GitHubRepository;

        return {
          repo: repository.full_name,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          language: repository.language,
          updatedAt: repository.updated_at,
          url: repository.html_url,
        };
      }),
    );

    return json({ repositories });
  } catch {
    return json({ error: 'GitHub data is temporarily unavailable' }, 502);
  }
}
