import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { z } from 'zod';

const ArticleLikeSchema = (schemaType: 'BlogPosting' | 'Article') =>
  z.looseObject({
    '@type': z.literal(schemaType),
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

function validateFile(filePath: string) {
  const html = readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll('script[type="application/ld+json"]');
  
  const schemas = Array.from(scripts).map(s => {
    try {
      return JSON.parse(s.textContent || '{}');
    } catch (e) {
      console.error(`Failed to parse JSON-LD in ${filePath}`);
      throw e;
    }
  });
  
  // Identify if it's a home page (language root)
  const relativePath = filePath.replace(distDir, '');
  const isHomePage = /^\/[a-z]{2}\/index\.html$/.test(relativePath);
  const isBlogPost = /^\/[a-z]{2}\/blog\/[^/]+\/index\.html$/.test(relativePath);
  const isKnowledgeArticle = /^\/[a-z]{2}\/knowledge\/[^/]+\/index\.html$/.test(relativePath);

  if (isHomePage) {
    const hasWebSite = schemas.some(s => s['@type'] === 'WebSite');
    const hasPerson = schemas.some(s => s['@type'] === 'Person');
    
    if (!hasWebSite) {
      console.error(`[Error] Missing WebSite schema in ${filePath}`);
      process.exit(1);
    }
    if (!hasPerson) {
      console.error(`[Error] Missing Person schema in ${filePath}`);
      process.exit(1);
    }
  }

  if (isBlogPost && !schemas.some(s => s['@type'] === 'BlogPosting')) {
    console.error(`[Error] Missing BlogPosting schema in ${filePath}`);
    process.exit(1);
  }

  if (isKnowledgeArticle && !schemas.some(s => s['@type'] === 'Article')) {
    console.error(`[Error] Missing Article schema in ${filePath}`);
    process.exit(1);
  }

  for (const schema of schemas) {
    try {
      if (schema['@type'] === 'BlogPosting') {
        ArticleLikeSchema('BlogPosting').parse(schema);
      } else if (schema['@type'] === 'Article') {
        ArticleLikeSchema('Article').parse(schema);
      } else if (schema['@type'] === 'WebSite') {
        WebSiteSchema.parse(schema);
      } else if (schema['@type'] === 'Person') {
        PersonSchema.parse(schema);
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
  readdirSync(dir).forEach(f => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walkDir(p, callback);
    else if (extname(p) === '.html') callback(p);
  });
}

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist directory not found. Run npm run build first.');
  process.exit(1);
}

console.log(`Validating schemas in ${distDir}...`);
walkDir(distDir, validateFile);
console.log('All schemas are valid!');
