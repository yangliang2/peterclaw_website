import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteUrl } from '@/config/site';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ id, data }) => !data.draft && id.startsWith('zh/'));
  const knowledge = await getCollection('knowledge', ({ id }) => id.startsWith('zh/'));
  
  const siteUrl = getSiteUrl().toString().replace(/\/$/, '');
  
  const urls = [
    `${siteUrl}/zh/`,
    `${siteUrl}/zh/blog/`,
    `${siteUrl}/zh/knowledge/`,
    ...blog.map(post => `${siteUrl}/zh/blog/${post.id.replace('zh/', '').replace(/\/index$/, '')}/`),
    ...knowledge.map(entry => `${siteUrl}/zh/knowledge/${entry.id.replace('zh/', '').replace(/\/index$/, '')}/`),
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
