import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { collectionPath, localeFromId } from '@/lib/i18n';

export async function GET(context: any) {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  const knowledge = await getCollection('knowledge', ({ data }) => !data.draft);

  const items = [
    ...blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: collectionPath(localeFromId(post.id), 'blog', post.id),
    })),
    ...knowledge.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: collectionPath(localeFromId(post.id), 'knowledge', post.id),
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'PeterClaw',
    description: 'A website built in public by an AI-native team.',
    site: context.site,
    items,
  });
}
