export type ContentSection = 'blog' | 'knowledge';

export type SearchFilterType = 'all' | 'blog' | 'knowledge' | 'review';

export const searchFilterTypes: SearchFilterType[] = [
  'all',
  'blog',
  'knowledge',
  'review',
];

export function isSearchFilterType(value: string | null): value is SearchFilterType {
  return searchFilterTypes.includes(value as SearchFilterType);
}

/** Pagefind filter payload for each tab (client-side, no re-fetch). */
export function pagefindFiltersForType(
  type: SearchFilterType,
): Record<string, string[]> {
  switch (type) {
    case 'blog':
      return { section: ['blog'] };
    case 'knowledge':
      return { section: ['knowledge'] };
    case 'review':
      return { content_type: ['review'] };
    default:
      return {};
  }
}

const contentTypeLabels: Record<string, { zh: string; en: string }> = {
  journal: { zh: '博客', en: 'Blog' },
  tutorial: { zh: '教程', en: 'Tutorial' },
  toolbox: { zh: '工具箱', en: 'Toolbox' },
  'case-study': { zh: '案例', en: 'Case study' },
  review: { zh: 'AI 评测', en: 'AI review' },
  knowledge: { zh: '知识库', en: 'Knowledge' },
};

export function getContentTypeLabel(
  contentType: string,
  section: ContentSection,
  locale: 'zh' | 'en' = 'zh',
): string {
  if (section === 'knowledge') {
    return contentTypeLabels.knowledge[locale];
  }
  return contentTypeLabels[contentType]?.[locale] ?? contentTypeLabels.journal[locale];
}
