import { z } from 'astro/zod';

export const githubUser = 'yangliang2';

const githubApiVersion = '2022-11-28';
const githubApiBaseUrl = 'https://api.github.com';
const urlSchema = z.url();

export const githubRepositorySchema = z.object({
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable(),
  html_url: urlSchema,
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  language: z.string().nullable(),
  fork: z.boolean(),
  archived: z.boolean(),
  private: z.boolean().optional(),
  pushed_at: z.string().nullable().optional(),
  updated_at: z.string(),
});

const githubPushEventSchema = z.object({
  type: z.string(),
  created_at: z.string(),
  repo: z.object({ name: z.string() }),
  payload: z.object({
    commits: z
      .array(
        z.object({
          sha: z.string(),
          message: z.string(),
          url: urlSchema,
        })
      )
      .optional(),
  }),
});

const githubRepositoryCommitSchema = z.object({
  sha: z.string(),
  html_url: urlSchema,
  commit: z.object({
    message: z.string(),
    author: z.object({
      date: z.string(),
    }),
  }),
});

export const githubCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  repo: z.string(),
  html_url: urlSchema,
  committed_at: z.string(),
});

export const githubProjectRepositorySchema = z.object({
  repo: z.string(),
  description: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  language: z.string().nullable(),
  updatedAt: z.string(),
  url: urlSchema,
});

export type GitHubRepository = z.infer<typeof githubRepositorySchema>;
export type GitHubCommit = z.infer<typeof githubCommitSchema>;
export type GitHubProjectRepository = z.infer<typeof githubProjectRepositorySchema>;

export interface GitHubClientOptions {
  token?: string;
  userAgent?: string;
  fetcher?: typeof fetch;
}

function githubHeaders({ token, userAgent = 'peterclaw-website' }: GitHubClientOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': githubApiVersion,
    'User-Agent': userAgent,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function githubJson(url: string, options: GitHubClientOptions = {}) {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(url, {
    headers: githubHeaders(options),
  });

  if (!response.ok) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');
    const resetAt = rateLimitReset
      ? new Date(Number(rateLimitReset) * 1000).toISOString()
      : 'unknown';

    throw new Error(
      `GitHub request failed for ${url} with ${response.status}. ` +
        `rateLimitRemaining=${rateLimitRemaining ?? 'unknown'} resetAt=${resetAt}`
    );
  }

  return response.json();
}

export function rankRepositories(repositories: GitHubRepository[]) {
  return repositories
    .filter((repository) => !repository.archived && !repository.private)
    .sort((left, right) => {
      const stars = right.stargazers_count - left.stargazers_count;
      return stars || Date.parse(right.updated_at) - Date.parse(left.updated_at);
    })
    .slice(0, 4);
}

export function parsePushEvents(events: unknown): GitHubCommit[] {
  const parsedEvents = z.array(githubPushEventSchema).parse(events);
  const commits: GitHubCommit[] = [];

  for (const event of parsedEvents) {
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

  return z.array(githubCommitSchema).parse(commits.slice(0, 5));
}

export async function fetchFeaturedRepositories(options: GitHubClientOptions = {}) {
  const repositories = await githubJson(
    `${githubApiBaseUrl}/users/${githubUser}/repos?per_page=100&type=public&sort=updated`,
    options
  );

  const parsed = z.array(githubRepositorySchema).parse(repositories);
  const featured = rankRepositories(parsed);

  if (featured.length === 0) {
    throw new Error('GitHub returned no public repositories for the featured repository list.');
  }

  return featured;
}

async function fetchRepositoryCommits(repository: string, options: GitHubClientOptions = {}) {
  const commits = await githubJson(
    `${githubApiBaseUrl}/repos/${repository}/commits?per_page=5`,
    options
  );
  const parsed = z.array(githubRepositoryCommitSchema).parse(commits);
  const repoName = repository.split('/').pop() ?? repository;

  return z.array(githubCommitSchema).parse(
    parsed.map((commit) => ({
      sha: commit.sha.slice(0, 7),
      message: commit.commit.message.split('\n')[0]?.trim() || commit.commit.message,
      repo: repoName,
      html_url: commit.html_url,
      committed_at: commit.commit.author.date,
    }))
  );
}

export async function fetchRecentCommits(options: GitHubClientOptions = {}) {
  const events = await githubJson(
    `${githubApiBaseUrl}/users/${githubUser}/events/public?per_page=30`,
    options
  );
  const commits = parsePushEvents(events);

  if (commits.length > 0) {
    return commits;
  }

  const repositoryCommits = await fetchRepositoryCommits(`${githubUser}/peterclaw_website`, options);

  if (repositoryCommits.length === 0) {
    throw new Error('GitHub returned no recent public commits.');
  }

  return repositoryCommits;
}

export async function fetchProjectRepositories(
  repositories: readonly string[],
  options: GitHubClientOptions = {}
) {
  const responses = await Promise.all(
    repositories.map(async (repository) => {
      const data = await githubJson(`${githubApiBaseUrl}/repos/${repository}`, options);
      const parsed = githubRepositorySchema.parse(data);

      if (parsed.private) {
        throw new Error(`Refusing to expose private repository metadata for ${parsed.full_name}.`);
      }

      return githubProjectRepositorySchema.parse({
        repo: parsed.full_name,
        description: parsed.description,
        stars: parsed.stargazers_count,
        forks: parsed.forks_count,
        language: parsed.language,
        updatedAt: parsed.updated_at,
        url: parsed.html_url,
      });
    })
  );

  return responses;
}
