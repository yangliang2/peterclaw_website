import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { githubContentEntrySchema, githubContentLoader } from './lib/github-loader';

const sharedContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  contentType: z.enum(['journal', 'tutorial', 'toolbox', 'case-study', 'review']).optional(),
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** Optional custom cover. Omit or use /og-default.png to auto-generate /og/{collection}/{locale}/{slug}.png */
  ogImage: z.string().optional(),
  /** Filename under src/assets/blog/covers/, e.g. journal.svg */
  cover: z.string().optional(),
  coreIdea: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).default([]),
  stepCount: z.number().int().positive().optional(),
  toolchain: z.array(z.string()).default([]),
  toolCategory: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  recommendation: z.number().int().min(1).max(5).optional(),
  reviewedProduct: z
    .object({
      name: z.string().min(1),
      url: z.string().url(),
    })
    .optional(),
  useCases: z.array(z.string()).default([]),
  projectBackground: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  outcomeMetrics: z.array(z.string()).default([]),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  howTo: z.array(z.object({
    name: z.string(),
    text: z.string(),
    image: z.string().optional(),
    url: z.string().optional(),
  })).optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedContentSchema.extend({
    series: z.string().optional(),
    seriesNumber: z.number().int().positive().optional(),
    faq: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1)
    })).optional(),
    seriesOrder: z.number().int().positive().optional()
  })
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/knowledge' }),
  schema: sharedContentSchema.extend({
    area: z.enum(['architecture', 'operations', 'content', 'growth', 'design'])
  })
});

const product = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/product' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).min(1),
    pricing: z.array(z.object({
      name: z.string(),
      price: z.string(),
      cadence: z.string().optional(),
      description: z.string(),
      features: z.array(z.string()).default([]),
      featured: z.boolean().default(false)
    })).default([]),
    cta: z.object({
      title: z.string(),
      description: z.string(),
      label: z.string(),
      href: z.string().optional(),
      emailSignup: z.boolean().default(false)
    })
  })
});

const github = defineCollection({
  loader: githubContentLoader({
    projectRepositories: ['yangliang2/peterclaw_website'],
    fallbackFeaturedRepositories: [
      {
        name: 'peterclaw_website',
        full_name: 'yangliang2/peterclaw_website',
        description:
          'Personal website built with Astro, TypeScript, bilingual content, and AI-assisted publishing workflows.',
        html_url: 'https://github.com/yangliang2/peterclaw_website',
        stargazers_count: 0,
        forks_count: 0,
        language: 'Astro',
        fork: false,
        archived: false,
        private: false,
        updated_at: '2026-05-28T00:00:00.000Z',
      },
    ],
    fallbackRecentCommits: [
      {
        sha: '2d033a9',
        message: 'Search UX: tag browse, empty results, Ctrl/Cmd+K (#196)',
        repo: 'peterclaw_website',
        html_url:
          'https://github.com/yangliang2/peterclaw_website/commit/2d033a9e0c19e313358079daea1351f9c97a7b73',
        committed_at: '2026-05-27T22:02:27.000Z',
      },
    ],
    fallbackProjectRepositories: [
      {
        repo: 'yangliang2/peterclaw_website',
        description:
          'Personal website built with Astro, TypeScript, bilingual content, and AI-assisted publishing workflows.',
        stars: 0,
        forks: 0,
        language: 'Astro',
        updatedAt: '2026-05-28T00:00:00.000Z',
        url: 'https://github.com/yangliang2/peterclaw_website',
      },
    ],
  }),
  schema: githubContentEntrySchema,
});

export const collections = { blog, knowledge, product, github };
