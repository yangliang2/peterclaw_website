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
    slug: 'ai-squad-diary',
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
      en: 'How the PeterClaw site turns an AI squad\u2019s collaboration into product, content, and brand assets.',
    },
    intent: {
      zh: '公开记录真实协作中的决策、失败与修正，而不是 polished 的成功故事。',
      en: 'Document real collaboration\u2014decisions, failures, and fixes\u2014not a polished success story.',
    },
    updateFrequency: {
      zh: '由 AI 小队按事件驱动更新：有值得写的内容就发，不设固定排期，也不无限搁置。',
      en: 'Event-driven by the AI squad: publish when something is worth writing\u2014no fixed schedule, no indefinite shelving.',
    },
  },
  {
    slug: 'ai-tool-review',
    names: {
      zh: 'AI 工具评测专栏',
      en: 'AI Tool Review Series',
    },
    title: {
      zh: 'AI 工具评测专栏',
      en: 'AI Tool Review Series',
    },
    description: {
      zh: '在真实项目中深度评测 AI 编程工具、IDE 和生产力工具，给出独立开发者的选型建议。',
      en: 'In-depth reviews of AI coding tools, IDEs, and productivity tools in real projects, with clear recommendations for indie developers.',
    },
    intent: {
      zh: '拒绝参数对比表，用两周真实项目测试得出可落地的选型结论。',
      en: 'Reject spec-sheet comparisons; deliver actionable recommendations based on two weeks of real-project testing.',
    },
    updateFrequency: {
      zh: '按工具发布节奏更新，每季度至少一篇。',
      en: 'Updated on tool-release cadence, at least once per quarter.',
    },
  },
  {
    slug: 'github-deep-dive',
    names: {
      zh: 'GitHub 热门项目深潜',
      en: 'GitHub Deep Dive',
    },
    title: {
      zh: 'GitHub 热门项目深潜',
      en: 'GitHub Deep Dive',
    },
    description: {
      zh: '从架构设计、工程决策和演进路径三个维度，拆解 GitHub 上最具技术启发性的开源项目。',
      en: 'Deconstruct the most technically inspiring open-source projects on GitHub through architecture, engineering decisions, and evolution.',
    },
    intent: {
      zh: '不只是读源码，而是理解作者为什么这样设计、 trade-off 是什么、对实际工作有何启发。',
      en: 'Not just reading source code\u2014understanding why the authors designed it this way, what trade-offs were made, and what lessons apply to real work.',
    },
    updateFrequency: {
      zh: '按项目里程碑和社区热度更新，每月 1-2 篇。',
      en: 'Updated by project milestones and community interest, 1-2 posts per month.',
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
