import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  fetchFeaturedRepositories,
  fetchProjectRepositories,
  fetchRecentCommits,
  githubCommitSchema,
  githubProjectRepositorySchema,
  githubRepositorySchema,
} from './github-client';

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_FILE = '.astro/github-content-cache.json';

export const githubContentEntrySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('featured-repositories'),
    repositories: z.array(githubRepositorySchema).min(1),
    fetchedAt: z.string(),
    fromCache: z.boolean(),
  }),
  z.object({
    kind: z.literal('recent-commits'),
    commits: z.array(githubCommitSchema).min(1),
    fetchedAt: z.string(),
    fromCache: z.boolean(),
  }),
  z.object({
    kind: z.literal('project-repositories'),
    repositories: z.array(githubProjectRepositorySchema),
    fetchedAt: z.string(),
    fromCache: z.boolean(),
  }),
]);

type GitHubContentEntry = z.infer<typeof githubContentEntrySchema>;

const cacheSchema = z.object({
  savedAt: z.string(),
  entries: z.record(z.string(), githubContentEntrySchema),
});

interface GitHubContentLoaderOptions {
  projectRepositories: readonly string[];
  cacheFile?: string;
  ttlMs?: number;
}

async function readCache(
  cacheFile: string,
  ttlMs: number
): Promise<{ entries: Record<string, GitHubContentEntry>; isFresh: boolean } | null> {
  try {
    const raw = await readFile(cacheFile, 'utf-8');
    const cache = cacheSchema.parse(JSON.parse(raw));
    const age = Date.now() - Date.parse(cache.savedAt);

    return {
      entries: cache.entries,
      isFresh: Number.isFinite(age) && age >= 0 && age < ttlMs,
    };
  } catch {
    return null;
  }
}

async function writeCache(cacheFile: string, entries: Record<string, GitHubContentEntry>) {
  await mkdir(dirname(cacheFile), { recursive: true });
  await writeFile(
    cacheFile,
    `${JSON.stringify({ savedAt: new Date().toISOString(), entries }, null, 2)}\n`,
    'utf-8'
  );
}

function buildEntries(data: {
  featuredRepositories: Awaited<ReturnType<typeof fetchFeaturedRepositories>>;
  recentCommits: Awaited<ReturnType<typeof fetchRecentCommits>>;
  projectRepositories: Awaited<ReturnType<typeof fetchProjectRepositories>>;
  fetchedAt: string;
  fromCache: boolean;
}) {
  return {
    'featured-repositories': githubContentEntrySchema.parse({
      kind: 'featured-repositories',
      repositories: data.featuredRepositories,
      fetchedAt: data.fetchedAt,
      fromCache: data.fromCache,
    }),
    'recent-commits': githubContentEntrySchema.parse({
      kind: 'recent-commits',
      commits: data.recentCommits,
      fetchedAt: data.fetchedAt,
      fromCache: data.fromCache,
    }),
    'project-repositories': githubContentEntrySchema.parse({
      kind: 'project-repositories',
      repositories: data.projectRepositories,
      fetchedAt: data.fetchedAt,
      fromCache: data.fromCache,
    }),
  } satisfies Record<string, GitHubContentEntry>;
}

export function githubContentLoader({
  projectRepositories,
  cacheFile = CACHE_FILE,
  ttlMs = CACHE_TTL_MS,
}: GitHubContentLoaderOptions): Loader {
  return {
    name: 'github-content-loader',
    async load({ store, logger, parseData, generateDigest }) {
      const cache = await readCache(cacheFile, ttlMs);
      let entries: Record<string, GitHubContentEntry> | undefined = cache?.entries;

      if (entries && cache?.isFresh) {
        logger.info('Using fresh GitHub content cache.');
      } else {
        try {
          const token = process.env.GITHUB_TOKEN;
          const fetchedAt = new Date().toISOString();
          entries = buildEntries({
            featuredRepositories: await fetchFeaturedRepositories({ token }),
            recentCommits: await fetchRecentCommits({ token }),
            projectRepositories: await fetchProjectRepositories(projectRepositories, { token }),
            fetchedAt,
            fromCache: false,
          });
          await writeCache(cacheFile, entries);
        } catch (error) {
          if (!entries) {
            throw new Error(
              'Unable to load GitHub content and no local cache exists. ' +
                'Set GITHUB_TOKEN for higher rate limits or retry after GitHub rate limits reset.',
              { cause: error }
            );
          }

          logger.warn(`Using stale GitHub content cache: ${String(error)}`);
          entries = Object.fromEntries(
            Object.entries(entries).map(([id, entry]) => [id, { ...entry, fromCache: true }])
          ) as Record<string, GitHubContentEntry>;
        }
      }

      store.clear();

      for (const [id, entry] of Object.entries(entries)) {
        const data = await parseData({ id, data: entry as unknown as Record<string, unknown> });
        store.set({
          id,
          data,
          digest: generateDigest(entry as unknown as Record<string, unknown>),
        });
      }
    },
  };
}
