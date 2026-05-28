import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteUrl } from '@/config/site';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ id, data }) => !data.draft && id.startsWith('en/'));
  const knowledge = await getCollection('knowledge', ({ id }) => id.startsWith('en/'));
  
  const siteUrl = getSiteUrl().toString().replace(/\/$/, '');
  
  const urls = [
    `${siteUrl}/en/`,
    `${siteUrl}/en/blog/`,
    `${siteUrl}/en/knowledge/`,
    ...blog.map(post => `${siteUrl}/en/blog/${post.id.replace('en/', '').replace(/\/index$/, '')}/`),
    ...knowledge.map(entry => `${siteUrl}/en/knowledge/${entry.id.replace('en/', '').replace(/\/index$/, '')}/`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
