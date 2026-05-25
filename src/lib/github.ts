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

function rankRepositories(repositories: GitHubRepository[]) {
  return repositories
    .filter((repository) => !repository.archived)
    .sort((left, right) => {
      const stars = right.stargazers_count - left.stargazers_count;
      return stars || Date.parse(right.updated_at) - Date.parse(left.updated_at);
    })
    .slice(0, 4);
}

export async function getFeaturedRepositories(): Promise<GitHubRepository[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUser}/repos?per_page=100&type=public&sort=updated`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
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
