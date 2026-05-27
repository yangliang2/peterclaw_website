import { fetchProjectRepositories } from '../src/lib/github-client';

export const config = {
  runtime: 'edge',
};

const CACHE_SECONDS = 30 * 60;
const REPOSITORIES = ['yangliang2/peterclaw_website'] as const;

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

  try {
    const repositories = await fetchProjectRepositories(REPOSITORIES, {
      token: process.env.GITHUB_TOKEN,
      userAgent: 'peterclaw-website-projects',
    });

    return json({ repositories });
  } catch (error) {
    console.error('GitHub projects API failed.', error);
    return json({ error: 'GitHub data is temporarily unavailable' }, 502);
  }
}
