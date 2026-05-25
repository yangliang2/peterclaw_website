export interface GitHubRepository {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  repo: string;
  html_url: string;
  committed_at: string;
}

type GitHubPushEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
      url: string;
    }>;
  };
};

const githubUser = 'yangliang2';

const fallbackRepositories: GitHubRepository[] = [
  {
    name: 'multica-agent-plugin',
    description: 'Multica agent plugin for Claude Code with PRD story tracking and verification workflows.',
    html_url: `https://github.com/${githubUser}/multica-agent-plugin`,
    stargazers_count: 0,
    language: 'Shell',
    fork: false,
    archived: false,
    updated_at: '2026-05-24T15:01:40Z',
  },
  {
    name: 'vibe-kanban',
    description: 'Get more out of Claude Code, Codex, or any coding agent.',
    html_url: `https://github.com/${githubUser}/vibe-kanban`,
    stargazers_count: 0,
    language: null,
    fork: true,
    archived: false,
    updated_at: '2026-03-29T11:26:41Z',
  },
  {
    name: 'antigravity-awesome-skills',
    description: 'An installable GitHub library of agentic skills and workflows.',
    html_url: `https://github.com/${githubUser}/antigravity-awesome-skills`,
    stargazers_count: 0,
    language: null,
    fork: true,
    archived: false,
    updated_at: '2026-03-29T11:26:38Z',
  },
  {
    name: 'claude-code-router',
    description: 'Route Claude Code requests across model providers and workflows.',
    html_url: `https://github.com/${githubUser}/claude-code-router`,
    stargazers_count: 0,
    language: null,
    fork: true,
    archived: false,
    updated_at: '2026-03-29T11:26:35Z',
  },
];

export const githubProfile = {
  user: githubUser,
  url: `https://github.com/${githubUser}`,
  contributionChartUrl: `https://ghchart.rshah.org/2563eb/${githubUser}`,
} as const;

const GITHUB_CACHE_TTL_MS = 15 * 60 * 1000;

const fallbackCommits: GitHubCommit[] = [
  {
    sha: 'ae18e19',
    message: 'Add bilingual reader feedback form (#85)',
    repo: 'peterclaw_website',
    html_url: 'https://github.com/yangliang2/peterclaw_website/commit/ae18e19',
    committed_at: '2026-05-24T12:00:00Z',
  },
  {
    sha: '5aa2391',
    message: 'feat: add GitHub activity module to homepage (#87)',
    repo: 'peterclaw_website',
    html_url: 'https://github.com/yangliang2/peterclaw_website/commit/5aa2391',
    committed_at: '2026-05-23T10:30:00Z',
  },
  {
    sha: 'c5b067c',
    message: 'feat: add /now page with bilingual support (#73)',
    repo: 'peterclaw_website',
    html_url: 'https://github.com/yangliang2/peterclaw_website/commit/c5b067c',
    committed_at: '2026-05-22T08:15:00Z',
  },
  {
    sha: 'multica',
    message: 'Multica agent plugin: PRD story tracking and verification workflows',
    repo: 'multica-agent-plugin',
    html_url: `https://github.com/${githubUser}/multica-agent-plugin`,
    committed_at: '2026-05-21T16:45:00Z',
  },
  {
    sha: 'vibe-kb',
    message: 'vibe-kanban: agent workflow improvements',
    repo: 'vibe-kanban',
    html_url: `https://github.com/${githubUser}/vibe-kanban`,
    committed_at: '2026-05-20T14:00:00Z',
  },
];

let commitCache: { data: GitHubCommit[]; fetchedAt: number } | null = null;

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = import.meta.env.GITHUB_TOKEN;
  if (typeof token === 'string' && token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parsePushEvents(events: GitHubPushEvent[]): GitHubCommit[] {
  const commits: GitHubCommit[] = [];

  for (const event of events) {
    if (event.type !== 'PushEvent' || !event.payload.commits?.length) {
      continue;
    }

    const repoName = event.repo.name.split('/').pop() ?? event.repo.name;

    for (const commit of event.payload.commits) {
      commits.push({
        sha: commit.sha.slice(0, 7),
        message: commit.message.split('\n')[0]?.trim() || commit.message,
        repo: repoName,
        html_url: commit.url,
        committed_at: event.created_at,
      });
    }

    if (commits.length >= 5) {
      break;
    }
  }

  return commits.slice(0, 5);
}

function rankRepositories(repositories: GitHubRepository[]) {
  return repositories
    .filter((repository) => !repository.archived)
    .sort((left, right) => {
      const stars = right.stargazers_count - left.stargazers_count;
      return stars || Date.parse(right.updated_at) - Date.parse(left.updated_at);
    })
    .slice(0, 4);
}

export async function getRecentCommits(): Promise<{
  commits: GitHubCommit[];
  fromCache: boolean;
}> {
  const now = Date.now();
  if (commitCache && now - commitCache.fetchedAt < GITHUB_CACHE_TTL_MS) {
    return { commits: commitCache.data, fromCache: true };
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUser}/events/public?per_page=30`,
      { headers: githubHeaders() }
    );

    if (!response.ok) {
      throw new Error(`GitHub events request failed with ${response.status}`);
    }

    const events = (await response.json()) as GitHubPushEvent[];
    const commits = parsePushEvents(events);
    const data = commits.length >= 2 ? commits : fallbackCommits;

    commitCache = { data, fetchedAt: now };
    return { commits: data, fromCache: false };
  } catch (error) {
    console.warn('Using cached or fallback GitHub commits.', error);
    if (commitCache) {
      return { commits: commitCache.data, fromCache: true };
    }
    return { commits: fallbackCommits, fromCache: true };
  }
}

export async function getFeaturedRepositories(): Promise<GitHubRepository[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUser}/repos?per_page=100&type=public&sort=updated`,
      {
        headers: githubHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub request failed with ${response.status}`);
    }

    const repositories = (await response.json()) as GitHubRepository[];
    const featured = rankRepositories(repositories);
    return featured.length >= 2 ? featured : rankRepositories(fallbackRepositories);
  } catch (error) {
    console.warn('Using fallback GitHub repositories during static build.', error);
    return rankRepositories(fallbackRepositories);
  }
}
