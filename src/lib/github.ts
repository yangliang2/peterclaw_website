import { getEntry } from 'astro:content';
import { githubUser, type GitHubCommit, type GitHubProjectRepository, type GitHubRepository } from './github-client';

export type { GitHubCommit, GitHubProjectRepository, GitHubRepository } from './github-client';

export const githubProfile = {
  user: githubUser,
  url: `https://github.com/${githubUser}`,
  contributionChartUrl: `https://ghchart.rshah.org/2563eb/${githubUser}`,
} as const;

async function requireGitHubEntry(id: 'featured-repositories' | 'recent-commits' | 'project-repositories') {
  const entry = await getEntry('github', id);

  if (!entry) {
    throw new Error(`GitHub content entry "${id}" is missing. Run Astro content sync/build to load it.`);
  }

  return entry.data;
}

export async function getFeaturedRepositories(): Promise<{
  repositories: GitHubRepository[];
  fromCache: boolean;
}> {
  const entry = await requireGitHubEntry('featured-repositories');

  if (entry.kind !== 'featured-repositories') {
    throw new Error('GitHub content entry "featured-repositories" has an unexpected shape.');
  }

  return {
    repositories: entry.repositories,
    fromCache: entry.fromCache,
  };
}

export async function getRecentCommits(): Promise<{
  commits: GitHubCommit[];
  fromCache: boolean;
}> {
  const entry = await requireGitHubEntry('recent-commits');

  if (entry.kind !== 'recent-commits') {
    throw new Error('GitHub content entry "recent-commits" has an unexpected shape.');
  }

  return {
    commits: entry.commits,
    fromCache: entry.fromCache,
  };
}

export async function getProjectRepositoryStats(): Promise<{
  repositories: GitHubProjectRepository[];
  fromCache: boolean;
}> {
  const entry = await requireGitHubEntry('project-repositories');

  if (entry.kind !== 'project-repositories') {
    throw new Error('GitHub content entry "project-repositories" has an unexpected shape.');
  }

  return {
    repositories: entry.repositories,
    fromCache: entry.fromCache,
  };
}
