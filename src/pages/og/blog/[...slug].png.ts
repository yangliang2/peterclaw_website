import { getCollection, type CollectionEntry } from 'astro:content';
import { localeFromId } from '@/lib/i18n';
import { blogOgImagePath } from '@/utils/og';
import { renderBlogOgImage } from '@/utils/og-image';

export const prerender = true;

type Props = {
  post: CollectionEntry<'blog'>;
};

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return posts.map((post) => ({
    params: {
      slug: blogOgImagePath(post.id).replace(/^\/og\/blog\//, '').replace(/\.png$/, ''),
    },
    props: {
      post,
    },
  }));
}

export async function GET({ props }: { props: Props }) {
  const { post } = props;
  const image = await renderBlogOgImage({
    title: post.data.title,
    publishedAt: post.data.publishedAt,
    tags: post.data.tags,
    contentType: post.data.contentType,
    locale: localeFromId(post.id),
  });
  const body = image.buffer.slice(
    image.byteOffset,
    image.byteOffset + image.byteLength
  ) as ArrayBuffer;

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
