import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n';

export const prerender = false;

type Section = 'blog' | 'knowledge' | 'review' | 'product';

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_TITLE_LENGTH = 92;
const MAX_DESCRIPTION_LENGTH = 138;
const MAX_CATEGORY_LENGTH = 28;
const FONT_FAMILY = 'Noto Sans SC';

const regularFontPath = resolve(
  process.cwd(),
  'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff'
);
const boldFontPath = resolve(
  process.cwd(),
  'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff'
);

let fontPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined;

async function loadFonts() {
  fontPromise ??= Promise.all([readFile(regularFontPath), readFile(boldFontPath)]).then(
    ([regular, bold]) => ({
      regular: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength),
      bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength),
    })
  );
  return fontPromise;
}

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

function h(type: string, props: Record<string, unknown>, ...children: Array<unknown>) {
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

  const fonts = await loadFonts();

  const svg = await satori(
    h(
      'div',
      {
        style: {
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 68px',
          color: '#111827',
          backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 48%, #ecfeff 100%)',
          fontFamily: FONT_FAMILY,
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
              gap: '14px',
              fontSize: '25px',
              fontWeight: 700,
              color: palette.accent,
            },
          },
          h('div', {
            style: {
              width: '18px',
              height: '18px',
              borderRadius: '999px',
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
              borderRadius: '999px',
              padding: '12px 20px',
              color: palette.accent,
              backgroundColor: palette.band,
              fontSize: '23px',
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
            gap: '26px',
            width: '100%',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              maxWidth: '990px',
              fontSize: locale === 'zh' ? '68px' : '64px',
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
              maxWidth: '900px',
              fontSize: '31px',
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
            fontSize: '24px',
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
          name: FONT_FAMILY,
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: FONT_FAMILY,
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  const image = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  }).render();

  const pngBuffer = image.asPng();
  const body = pngBuffer.buffer.slice(
    pngBuffer.byteOffset,
    pngBuffer.byteOffset + pngBuffer.byteLength
  ) as ArrayBuffer;

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
