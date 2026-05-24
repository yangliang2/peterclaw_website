import type { Locale } from '@/lib/i18n';

export type BlogSeriesSlug = 'ai-diary';

export type BlogSeriesConfig = {
  /** Matches blog frontmatter `series` value */
  seriesField: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  /** Content slug order (without locale prefix); used when `seriesNumber` is absent */
  slugOrder: string[];
};

export const blogSeriesBySlug: Record<BlogSeriesSlug, BlogSeriesConfig> = {
  'ai-diary': {
    seriesField: 'AI 小队组建日记',
    title: {
      zh: 'AI 小队组建日记',
      en: 'AI Squad Build Diary'
    },
    description: {
      zh: '记录 PeterClaw 网站如何把 AI 团队的协作过程变成产品、内容和品牌资产。',
      en: 'How an AI-native team builds PeterClaw in public — process, pitfalls, and fixes.'
    },
    slugOrder: [
      'ai-squad-launch-diary',
      'ai-squad-diary-02-serialization',
      'ai-squad-diary-03-code-review-routing',
      'ai-squad-diary-03-workflow',
      'ai-diary-004-automation',
      'ai-diary-005-multi-agent-collaboration'
    ]
  }
};

export function seriesPath(locale: Locale, seriesSlug: BlogSeriesSlug) {
  return `/${locale}/blog/series/${seriesSlug}/`;
}
