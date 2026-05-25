import type { Locale } from '@/lib/i18n';

export type SeriesDefinition = {
  /** URL slug under /{lang}/blog/series/{slug}/ */
  slug: string;
  /** Value of frontmatter `series` per locale */
  names: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  intent: Record<Locale, string>;
  updateFrequency: Record<Locale, string>;
};

export const seriesCatalog: SeriesDefinition[] = [
  {
    slug: 'ai-diary',
    names: {
      zh: 'AI 小队组建日记',
      en: 'AI Squad Launch Diary',
    },
    title: {
      zh: 'AI 小队组建日记',
      en: 'AI Squad Launch Diary',
    },
    description: {
      zh: '记录 PeterClaw 网站如何把一支 AI 小队的协作过程变成产品、内容与品牌资产。',
      en: 'How the PeterClaw site turns an AI squad’s collaboration into product, content, and brand assets.',
    },
    intent: {
      zh: '公开记录真实协作中的决策、失败与修正，而不是 polished 的成功故事。',
      en: 'Document real collaboration—decisions, failures, and fixes—not a polished success story.',
    },
    updateFrequency: {
      zh: '由 AI 小队按事件驱动更新：有值得写的内容就发，不设固定排期，也不无限搁置。',
      en: 'Event-driven by the AI squad: publish when something is worth writing—no fixed schedule, no indefinite shelving.',
    },
  },
];

export function getSeriesBySlug(slug: string): SeriesDefinition | undefined {
  return seriesCatalog.find((entry) => entry.slug === slug);
}

export function getSeriesForPost(seriesName: string | undefined, locale: Locale): SeriesDefinition | undefined {
  if (!seriesName) {
    return undefined;
  }

  return seriesCatalog.find((entry) => entry.names[locale] === seriesName);
}

export function seriesArchivePath(locale: Locale, slug: string): string {
  return `/${locale}/blog/series/${slug}/`;
}
