import { ImageResponse } from '@vercel/og';
import type { APIRoute } from 'astro';
import notoSansScBoldUrl from '@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff?url';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n';

export const prerender = false;

type OgElement = {
  type: string;
  props: Record<string, unknown>;
};

type Section = 'blog' | 'knowledge' | 'review' | 'product';

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_TITLE_LENGTH = 92;
const MAX_DESCRIPTION_LENGTH = 138;
const MAX_CATEGORY_LENGTH = 28;
let fontPromise: Promise<ArrayBuffer> | undefined;

const sectionLabels: Record<Locale, Record<Section, string>> = {
  zh: {
    blog: '博客文章',
    knowledge: '知识库',
    review: 'AI 工具评测',
    product: '产品',
  },
  en: {
    blog: 'Blog',
    knowledge: 'Knowledge Base',
    review: 'AI Tool Review',
    product: 'Product',
  },
};

const sectionColors: Record<Section, { accent: string; band: string }> = {
  blog: { accent: '#0f766e', band: '#ccfbf1' },
  knowledge: { accent: '#2563eb', band: '#dbeafe' },
  review: { accent: '#c2410c', band: '#ffedd5' },
  product: { accent: '#7c3aed', band: '#ede9fe' },
};

const localFontUrl = new URL(
  '../../../node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff',
  import.meta.url
);

function h(type: string, props: Record<string, unknown>, ...children: Array<OgElement | string>) {
  return {
    type,
    props:
      children.length === 0
        ? props
        : {
            ...props,
            children: children.length === 1 ? children[0] : children,
          },
  };
}

function truncate(value: string, maxLength: number) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function param(url: URL, key: string, fallback = '') {
  return truncate(
    url.searchParams.get(key) ?? fallback,
    key === 'title' ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH
  );
}

async function loadFont(url: URL) {
  fontPromise ??= import.meta.env.DEV
    ? readFile(fileURLToPath(localFontUrl)).then((buffer) => {
        const arrayBuffer = new ArrayBuffer(buffer.byteLength);
        new Uint8Array(arrayBuffer).set(buffer);
        return arrayBuffer;
      })
    : fetch(new URL(notoSansScBoldUrl, url.origin)).then((response) =>
        response.arrayBuffer()
      );
  return fontPromise;
}

export const GET: APIRoute = async ({ url }) => {
  const locale: Locale = url.searchParams.get('locale') === 'en' ? 'en' : 'zh';
  const sectionParam = url.searchParams.get('section') as Section | null;
  const section: Section =
    sectionParam && sectionParam in sectionLabels[locale] ? sectionParam : 'blog';
  const palette = sectionColors[section];
  const title = param(url, 'title', siteConfig.name);
  const description = param(
    url,
    'description',
    locale === 'zh' ? 'AI、产品与独立开发实践' : 'AI, product, and indie building notes'
  );
  const category = truncate(
    url.searchParams.get('category') ?? sectionLabels[locale][section],
    MAX_CATEGORY_LENGTH
  );

  return new ImageResponse(
    h(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 68px',
          color: '#111827',
          backgroundColor: '#f8fafc',
          backgroundImage:
            'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 48%, #ecfeff 100%)',
          fontFamily: 'Noto Sans SC',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 25,
              fontWeight: 700,
              color: palette.accent,
            },
          },
          h('div', {
            style: {
              width: 18,
              height: 18,
              borderRadius: 999,
              backgroundColor: palette.accent,
            },
          }),
          siteConfig.name
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              padding: '12px 20px',
              color: palette.accent,
              backgroundColor: palette.band,
              fontSize: 23,
              fontWeight: 700,
            },
          },
          category
        )
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
            width: '100%',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              maxWidth: 990,
              fontSize: locale === 'zh' ? 68 : 64,
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: 0,
            },
          },
          title
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              maxWidth: 900,
              fontSize: 31,
              lineHeight: 1.45,
              color: '#4b5563',
            },
          },
          description
        )
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            color: '#6b7280',
            fontSize: 24,
          },
        },
        h('div', { style: { display: 'flex' } }, sectionLabels[locale][section]),
        h('div', { style: { display: 'flex' } }, siteConfig.author.url.replace(/^https?:\/\//, ''))
      )
    ) as never,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Noto Sans SC',
          data: await loadFont(url),
          weight: 700,
          style: 'normal',
        },
      ],
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
};
