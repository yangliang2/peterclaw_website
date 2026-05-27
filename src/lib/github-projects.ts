export interface RepositoryStats {
  repo: string;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string;
  url: string;
}

type GitHubRepoResponse = {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  html_url: string;
};

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'peterclaw-website-projects',
  };

  const token = import.meta.env.GITHUB_TOKEN;
  if (typeof token === 'string' && token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getRepositoryStats(repos: readonly string[]) {
  const uniqueRepos = Array.from(new Set(repos)).filter(Boolean);
  const statsByRepo = new Map<string, RepositoryStats>();

  if (uniqueRepos.length === 0) {
    return statsByRepo;
  }

  const headers = githubHeaders();

  const results = await Promise.allSettled(
    uniqueRepos.map(async (repo) => {
      const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
      if (!response.ok) {
        throw new Error(`GitHub repo request failed for ${repo}: ${response.status}`);
      }
      const data = (await response.json()) as GitHubRepoResponse;

      return {
        repo: data.full_name,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        pushedAt: data.pushed_at,
        url: data.html_url,
      } satisfies RepositoryStats;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      statsByRepo.set(result.value.repo, result.value);
    }
  }

  return statsByRepo;
}

