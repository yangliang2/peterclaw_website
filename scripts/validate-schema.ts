import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { z } from 'zod';

const BlogPostingSchema = z.looseObject({
  '@type': z.literal('BlogPosting'),
  headline: z.string().min(1),
  description: z.string().min(1),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.literal('PeterClaw'),
  }),
  datePublished: z.iso.datetime(),
  dateModified: z.iso.datetime(),
  url: z.url(),
  publisher: z.looseObject({
    '@type': z.literal('Organization'),
    name: z.string().min(1),
  }),
  image: z.array(z.url()).min(1),
});

const ArticleSchema = z.looseObject({
  '@type': z.literal('Article'),
  headline: z.string().min(1),
  description: z.string().min(1),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.literal('PeterClaw'),
  }),
  datePublished: z.iso.datetime(),
  dateModified: z.iso.datetime(),
  url: z.url(),
  publisher: z.looseObject({
    '@type': z.literal('Organization'),
    name: z.string().min(1),
  }),
  image: z.array(z.url()).min(1),
});

const WebSiteSchema = z.looseObject({
  '@type': z.literal('WebSite'),
  name: z.string().min(1),
  url: z.url(),
  potentialAction: z.object({
    '@type': z.literal('SearchAction'),
    target: z.object({
      '@type': z.literal('EntryPoint'),
      urlTemplate: z.string().includes('{search_term_string}'),
    }),
    'query-input': z.literal('required name=search_term_string'),
  }),
});

const PersonSchema = z.looseObject({
  '@type': z.literal('Person'),
  name: z.string().min(1),
  url: z.url(),
});

const FAQPageSchema = z.looseObject({
  '@type': z.literal('FAQPage'),
  mainEntity: z.array(z.object({
    '@type': z.literal('Question'),
    name: z.string().min(1),
    acceptedAnswer: z.object({
      '@type': z.literal('Answer'),
      text: z.string().min(1),
    }),
  })).min(1),
});

const BreadcrumbListSchema = z.looseObject({
  '@type': z.literal('BreadcrumbList'),
  itemListElement: z
    .array(
      z.looseObject({
        '@type': z.literal('ListItem'),
        position: z.number().int().positive(),
        name: z.string().min(1),
        item: z.url(),
      })
    )
    .min(2),
});

const ReviewSchema = z.looseObject({
  '@type': z.literal('Review'),
  name: z.string().min(1),
  reviewBody: z.string().min(1),
  url: z.url(),
  datePublished: z.iso.datetime(),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.literal('PeterClaw'),
  }),
  reviewRating: z.object({
    '@type': z.literal('Rating'),
    ratingValue: z.number().int().min(1).max(5),
    bestRating: z.literal(5),
    worstRating: z.literal(1),
  }),
  itemReviewed: z.object({
    '@type': z.literal('SoftwareApplication'),
    name: z.string().min(1),
    url: z.url(),
  }),
});

function validateFile(filePath: string, distRoot: string) {
  const html = readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');

  const schemas = Array.from(scripts).map((s) => {
    try {
      return JSON.parse(s.textContent || '{}');
    } catch (e) {
      console.error(`Failed to parse JSON-LD in ${filePath}`);
      throw e;
    }
  });

  const relativePath = filePath.replace(distRoot, '');
  const isHomePage = /^\/[a-z]{2}\/index\.html$/.test(relativePath);
  const isBlogList = /^\/[a-z]{2}\/blog\/index\.html$/.test(relativePath);
  const isBlogPost = /^\/[a-z]{2}\/blog\/[^/]+\/index\.html$/.test(relativePath);
  const isReviewPost = /\/blog\/ai-tool-review-/.test(relativePath);
  const isKnowledgeList = /^\/[a-z]{2}\/knowledge\/index\.html$/.test(relativePath);
  const isKnowledgePost = /^\/[a-z]{2}\/knowledge\/[^/]+\/index\.html$/.test(relativePath);
  const isToolsPage = /^\/[a-z]{2}\/tools\/index\.html$/.test(relativePath);

  if (isHomePage) {
    const hasWebSite = schemas.some((s) => s['@type'] === 'WebSite');
    const hasPerson = schemas.some((s) => s['@type'] === 'Person');

    if (!hasWebSite) {
      console.error(`[Error] Missing WebSite schema in ${filePath}`);
      process.exit(1);
    }
    if (!hasPerson) {
      console.error(`[Error] Missing Person schema in ${filePath}`);
      process.exit(1);
    }
  }

  if (isBlogList && !schemas.some((s) => s['@type'] === 'BreadcrumbList')) {
    console.error(`[Error] Missing BreadcrumbList schema in ${filePath}`);
    process.exit(1);
  }

  if (isBlogPost) {
    if (!schemas.some((s) => s['@type'] === 'BlogPosting')) {
      console.error(`[Error] Missing BlogPosting schema in ${filePath}`);
      process.exit(1);
    }
    if (!schemas.some((s) => s['@type'] === 'BreadcrumbList')) {
      console.error(`[Error] Missing BreadcrumbList schema in ${filePath}`);
      process.exit(1);
    }
  }

  if (isReviewPost && !schemas.some((s) => s['@type'] === 'Review')) {
    console.error(`[Error] Missing Review schema in ${filePath}`);
    process.exit(1);
  }

  if (isKnowledgeList && !schemas.some((s) => s['@type'] === 'BreadcrumbList')) {
    console.error(`[Error] Missing BreadcrumbList schema in ${filePath}`);
    process.exit(1);
  }

  if (isToolsPage && !schemas.some((s) => s['@type'] === 'BreadcrumbList')) {
    console.error(`[Error] Missing BreadcrumbList schema in ${filePath}`);
    process.exit(1);
  }

  if (isKnowledgePost) {
    if (!schemas.some((s) => s['@type'] === 'Article')) {
      console.error(`[Error] Missing Article schema in ${filePath}`);
      process.exit(1);
    }
    if (!schemas.some((s) => s['@type'] === 'BreadcrumbList')) {
      console.error(`[Error] Missing BreadcrumbList schema in ${filePath}`);
      process.exit(1);
    }
  }

  for (const schema of schemas) {
    try {
      if (schema['@type'] === 'BlogPosting') {
        BlogPostingSchema.parse(schema);
      } else if (schema['@type'] === 'Article') {
        ArticleSchema.parse(schema);
      } else if (schema['@type'] === 'WebSite') {
        WebSiteSchema.parse(schema);
      } else if (schema['@type'] === 'Person') {
        PersonSchema.parse(schema);
      } else if (schema['@type'] === 'FAQPage') {
        FAQPageSchema.parse(schema);
      } else if (schema['@type'] === 'BreadcrumbList') {
        BreadcrumbListSchema.parse(schema);
      } else if (schema['@type'] === 'Review') {
        ReviewSchema.parse(schema);
      }
    } catch (e) {
      console.error(`Validation failed for ${schema['@type']} in ${filePath}`);
      if (e instanceof z.ZodError) {
        console.error(JSON.stringify(e.issues, null, 2));
      } else {
        console.error(e);
      }
      process.exit(1);
    }
  }
}

function walkDir(dir: string, callback: (path: string) => void) {
  if (!existsSync(dir)) return;
  readdirSync(dir).forEach((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walkDir(p, callback);
    else if (extname(p) === '.html') callback(p);
  });
}

function resolveDistDir(): string {
  const clientDir = join(process.cwd(), 'dist', 'client');
  if (existsSync(clientDir)) {
    return clientDir;
  }

  const distDir = join(process.cwd(), 'dist');
  if (!existsSync(distDir)) {
    console.error('dist directory not found. Run npm run build first.');
    process.exit(1);
  }

  return distDir;
}

const distDir = resolveDistDir();
console.log(`Validating schemas in ${distDir}...`);
walkDir(distDir, (filePath) => validateFile(filePath, distDir));
console.log('All schemas are valid!');
