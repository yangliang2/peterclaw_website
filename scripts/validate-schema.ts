import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { z } from 'zod';

const BlogPostingSchema = z.object({
  '@type': z.literal('BlogPosting'),
  headline: z.string().min(1),
  description: z.string().min(1),
  author: z.object({
    '@type': z.literal('Person'),
    name: z.string().min(1),
  }),
  datePublished: z.string(), // Some formats might not strictly match datetime() but should be valid
  image: z.array(z.string()).min(1),
}).passthrough();

const WebSiteSchema = z.object({
  '@type': z.literal('WebSite'),
  name: z.string().min(1),
  url: z.string().url(),
}).passthrough();

const PersonSchema = z.object({
  '@type': z.literal('Person'),
  name: z.string().min(1),
  url: z.string().url(),
}).passthrough();

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

  if (isHomePage) {
    const hasWebSite = schemas.some(s => s['@type'] === 'WebSite');
    const hasPerson = schemas.some(s => s['@type'] === 'Person');
    
    if (!hasWebSite) {
      console.warn(`[Warning] Missing WebSite schema in ${filePath}`);
    }
    if (!hasPerson) {
      console.error(`[Error] Missing Person schema in ${filePath}`);
      process.exit(1);
    }
  }

  for (const schema of schemas) {
    try {
      if (schema['@type'] === 'BlogPosting') {
        BlogPostingSchema.parse(schema);
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
