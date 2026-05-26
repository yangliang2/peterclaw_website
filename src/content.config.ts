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
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedContentSchema.extend({
    series: z.string().optional(),
    seriesNumber: z.number().int().positive().optional(),
    faq: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1)
    })).optional()
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

export const collections = { blog, knowledge, product };
