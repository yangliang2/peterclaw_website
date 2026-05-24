import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteUrl, siteConfig } from '@/config/site';
import { collectionPath, localeFromId, ui } from '@/lib/i18n';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);

  const items = blog
    .map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: collectionPath(localeFromId(post.id), 'blog', post.id),
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: siteConfig.name,
    description: ui.en.tagline,
    site: context.site ?? getSiteUrl(),
    items,
  });
}
