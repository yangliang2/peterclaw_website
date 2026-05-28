import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteUrl, siteConfig } from '@/config/site';
import { collectionPath, localeFromId, ui, type Locale } from '@/lib/i18n';

export async function GET(context: APIContext) {
  const { lang } = context.params;
  const locale = lang as Locale;
  const blog = await getCollection('blog', ({ id, data }) => !data.draft && localeFromId(id) === locale);

  const items = blog
    .map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: collectionPath(locale, 'blog', post.id),
    }))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: `${siteConfig.name} (${locale.toUpperCase()})`,
    description: ui[locale].tagline,
    site: context.site ?? getSiteUrl(),
    items,
  });
}

export function getStaticPaths() {
  return [
    { params: { lang: 'zh' } },
    { params: { lang: 'en' } },
  ];
}
