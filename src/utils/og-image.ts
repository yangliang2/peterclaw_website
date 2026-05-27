import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n';

const WIDTH = 1200;
const HEIGHT = 630;
const FONT_FAMILY = 'Noto Sans SC';

type BlogOgImageInput = {
  title: string;
  publishedAt: Date;
  tags: string[];
  contentType?: string;
  locale: Locale;
};

const regularFontPath = new URL(
  '../../node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff',
  import.meta.url
);
const boldFontPath = new URL(
  '../../node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff',
  import.meta.url
);

let fontDataPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined;

async function loadFonts() {
  fontDataPromise ??= Promise.all([readFile(regularFontPath), readFile(boldFontPath)]).then(
    ([regular, bold]) => ({
      regular: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength),
      bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength),
    })
  );

  return fontDataPromise;
}

function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function labelForContentType(contentType: string | undefined, locale: Locale) {
  if (!contentType) {
    return locale === 'zh' ? '文章' : 'Article';
  }

  const labels: Record<string, Record<Locale, string>> = {
    journal: { zh: 'AI 日记', en: 'AI Diary' },
    tutorial: { zh: '教程', en: 'Tutorial' },
    toolbox: { zh: '工具箱', en: 'Toolbox' },
    'case-study': { zh: '案例', en: 'Case Study' },
    review: { zh: 'AI 评测', en: 'AI Review' },
  };

  return labels[contentType]?.[locale] ?? contentType;
}

function titleFontSize(title: string) {
  const length = Array.from(title).length;

  if (length > 72) return 48;
  if (length > 54) return 54;
  if (length > 38) return 62;
  return 70;
}

function createElement(input: BlogOgImageInput) {
  const category = input.tags[0] ?? labelForContentType(input.contentType, input.locale);
  const secondaryTags = input.tags.slice(1, 4);
  const date = formatDate(input.publishedAt, input.locale);

  return {
    type: 'div',
    props: {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px 54px',
        color: '#fff7ed',
        backgroundImage: 'linear-gradient(135deg, #062c30 0%, #0b4f4a 44%, #d97706 100%)',
        fontFamily: FONT_FAMILY,
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: '620px',
              height: '620px',
              borderRadius: '310px',
              right: '-160px',
              top: '-210px',
              background: 'rgba(255, 247, 237, 0.16)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: '520px',
              height: '520px',
              borderRadius: '260px',
              left: '-210px',
              bottom: '-260px',
              background: 'rgba(6, 44, 48, 0.38)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '30px',
                    fontWeight: 700,
                    letterSpacing: '0',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '20px',
                          height: '20px',
                          borderRadius: '10px',
                          background: '#facc15',
                        },
                      },
                    },
                    siteConfig.name,
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    padding: '12px 22px',
                    borderRadius: '999px',
                    background: 'rgba(255, 247, 237, 0.18)',
                    border: '1px solid rgba(255, 247, 237, 0.36)',
                    fontSize: '24px',
                    fontWeight: 700,
                  },
                  children: category,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '28px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              flex: 1,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    maxWidth: '930px',
                    maxHeight: '286px',
                    overflow: 'hidden',
                    fontSize: `${titleFontSize(input.title)}px`,
                    lineHeight: 1.12,
                    fontWeight: 700,
                    textWrap: 'balance',
                  },
                  children: input.title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: '14px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  },
                  children: secondaryTags.map((tag) => ({
                    type: 'div',
                    props: {
                      style: {
                        padding: '9px 16px',
                        borderRadius: '999px',
                        background: 'rgba(6, 44, 48, 0.3)',
                        border: '1px solid rgba(255, 247, 237, 0.2)',
                        fontSize: '20px',
                      },
                      children: tag,
                    },
                  })),
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
              color: '#ffedd5',
              fontSize: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  children: date,
                },
              },
              {
                type: 'div',
                props: {
                  children: 'peterclaw.com',
                },
              },
            ],
          },
        },
      ],
    },
  } as const;
}

export async function renderBlogOgImage(input: BlogOgImageInput) {
  const fonts = await loadFonts();
  const svg = await satori(createElement(input), {
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
  });

  return new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  })
    .render()
    .asPng();
}
