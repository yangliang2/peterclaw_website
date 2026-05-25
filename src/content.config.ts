import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sharedContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  contentType: z.enum(['journal', 'tutorial', 'toolbox', 'case-study', 'review']).optional(),
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  /** Absolute path from site root, e.g. /og-default.png or /images/post-cover.png */
  ogImage: z.string().optional(),
  coreIdea: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).default([]),
  stepCount: z.number().int().positive().optional(),
  toolchain: z.array(z.string()).default([]),
  toolCategory: z.string().optional(),
  recommendation: z.number().int().min(1).max(5).optional(),
  useCases: z.array(z.string()).default([]),
  projectBackground: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  outcomeMetrics: z.array(z.string()).default([]),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedContentSchema.extend({
    series: z.string().optional(),
    seriesNumber: z.number().int().positive().optional()
  })
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/knowledge' }),
  schema: sharedContentSchema.extend({
    area: z.enum(['architecture', 'operations', 'content', 'growth', 'design'])
  })
});

export const collections = { blog, knowledge };
