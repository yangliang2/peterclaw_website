import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n';
import type { OgContentType } from '@/utils/og';

const WIDTH = 1200;
const HEIGHT = 630;
const FONT_FAMILY = 'Noto Sans SC';
const AUTO_OG_PLACEHOLDERS = new Set(['/og-default.png', '/og-default.svg']);

export function isAutoOgPlaceholder(path: string | undefined): boolean {
  return !path || AUTO_OG_PLACEHOLDERS.has(path);
}

export function generatedOgPath(type: Extract<OgContentType, 'blog' | 'knowledge'>, locale: Locale, slug: string): string {
  return `/og/${type}/${locale}/${slug}.png`;
}

type BlogOgImageInput = {
  title: string;
  publishedAt: Date;
  tags: string[];
  contentType?: string;
  locale: Locale;
};

type OgImageInput = {
  title: string;
  subtitle?: string;
  type: OgContentType;
  locale?: Locale;
};

type OgTemplate = {
  label: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  backgroundImage: string;
  foreground: string;
  muted: string;
  accent: string;
  softAccent: string;
  pattern: string;
};

const templates: Record<OgContentType, OgTemplate> = {
  blog: {
    label: { zh: '博客文章', en: 'Blog' },
    eyebrow: { zh: 'PeterClaw Blog', en: 'PeterClaw Blog' },
    backgroundImage: 'linear-gradient(135deg, #062c30 0%, #0b4f4a 48%, #d97706 100%)',
    foreground: '#fff7ed',
    muted: '#ffedd5',
    accent: '#facc15',
    softAccent: 'rgba(255, 247, 237, 0.18)',
    pattern: 'rgba(6, 44, 48, 0.38)',
  },
  knowledge: {
    label: { zh: 'AI 知识库', en: 'Knowledge' },
    eyebrow: { zh: 'PeterClaw Knowledge', en: 'PeterClaw Knowledge' },
    backgroundImage: 'linear-gradient(135deg, #102a43 0%, #25636b 46%, #65a30d 100%)',
    foreground: '#f8fafc',
    muted: '#dbeafe',
    accent: '#bef264',
    softAccent: 'rgba(219, 234, 254, 0.18)',
    pattern: 'rgba(15, 23, 42, 0.34)',
  },
  reviews: {
    label: { zh: 'AI 工具评测', en: 'AI Review' },
    eyebrow: { zh: 'PeterClaw Reviews', en: 'PeterClaw Reviews' },
    backgroundImage: 'linear-gradient(135deg, #2b1a42 0%, #7c2d12 45%, #0f766e 100%)',
    foreground: '#fff7ed',
    muted: '#fde68a',
    accent: '#2dd4bf',
    softAccent: 'rgba(253, 230, 138, 0.18)',
    pattern: 'rgba(43, 26, 66, 0.42)',
  },
};

const regularFontPath = resolve(
  process.cwd(),
  'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff'
);
const boldFontPath = resolve(
  process.cwd(),
  'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff'
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

function subtitleFontSize(subtitle: string) {
  const length = Array.from(subtitle).length;

  if (length > 120) return 26;
  if (length > 82) return 30;
  return 34;
}

function createElement(input: BlogOgImageInput) {
  const type = input.contentType === 'review' ? 'reviews' : 'blog';
  const template = templates[type];
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
        color: template.foreground,
        backgroundImage: template.backgroundImage,
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
              background: template.pattern,
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
                          background: template.accent,
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
                    background: template.softAccent,
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
                        background: template.pattern,
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
              color: template.muted,
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

function createDynamicElement(input: OgImageInput) {
  const locale = input.locale ?? 'zh';
  const template = templates[input.type];
  const subtitle = input.subtitle?.trim();

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
        color: template.foreground,
        backgroundImage: template.backgroundImage,
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
              width: '680px',
              height: '680px',
              borderRadius: '340px',
              right: '-220px',
              top: '-260px',
              background: template.softAccent,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: '560px',
              height: '560px',
              borderRadius: '280px',
              left: '-230px',
              bottom: '-290px',
              background: template.pattern,
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
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '20px',
                          height: '20px',
                          borderRadius: '10px',
                          background: template.accent,
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
                    background: template.softAccent,
                    border: '1px solid rgba(255, 247, 237, 0.34)',
                    fontSize: '24px',
                    fontWeight: 700,
                  },
                  children: template.label[locale],
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
              gap: subtitle ? '24px' : '0',
              textAlign: 'center',
              position: 'relative',
              flex: 1,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    maxWidth: '940px',
                    maxHeight: subtitle ? '236px' : '320px',
                    overflow: 'hidden',
                    fontSize: `${titleFontSize(input.title)}px`,
                    lineHeight: 1.12,
                    fontWeight: 700,
                  },
                  children: input.title,
                },
              },
              subtitle
                ? {
                    type: 'div',
                    props: {
                      style: {
                        maxWidth: '900px',
                        maxHeight: '92px',
                        overflow: 'hidden',
                        color: template.muted,
                        fontSize: `${subtitleFontSize(subtitle)}px`,
                        lineHeight: 1.35,
                        fontWeight: 400,
                      },
                      children: subtitle,
                    },
                  }
                : null,
            ].filter(Boolean),
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
              color: template.muted,
              fontSize: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  children: template.eyebrow[locale],
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

async function renderElement(element: ReturnType<typeof createElement> | ReturnType<typeof createDynamicElement>) {
  const fonts = await loadFonts();
  const svg = await satori(element as any, {
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

export async function renderBlogOgImage(input: BlogOgImageInput) {
  return renderElement(createElement(input));
}

export async function renderOgImage(input: OgImageInput) {
  return renderElement(createDynamicElement(input));
}

