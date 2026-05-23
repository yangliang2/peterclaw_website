import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sharedContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedContentSchema.extend({
    series: z.string().optional()
  })
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/knowledge' }),
  schema: sharedContentSchema.extend({
    area: z.enum(['architecture', 'operations', 'content', 'growth', 'design'])
  })
});

export const collections = { blog, knowledge };
