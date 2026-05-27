import type { Locale } from '@/lib/i18n';

export type SearchFilterType = 'all' | 'blog' | 'knowledge' | 'review';
export type SearchResultCategory = 'blog' | 'knowledge' | 'review';

const FILTER_TYPES: SearchFilterType[] = ['all', 'blog', 'knowledge', 'review'];

export function isSearchFilterType(value: string | null | undefined): value is SearchFilterType {
  return value != null && FILTER_TYPES.includes(value as SearchFilterType);
}

export function parseSearchFilterType(value: string | undefined): SearchFilterType | null {
  return isSearchFilterType(value) ? value : null;
}

export function resolveSearchCategory(
  section: 'blog' | 'knowledge',
  contentType?: string | null
): SearchResultCategory {
  if (section === 'knowledge') return 'knowledge';
  if (contentType === 'review') return 'review';
  return 'blog';
}

export function searchFilterLabels(locale: Locale): Record<SearchFilterType, string> {
  if (locale === 'zh') {
    return {
      all: '全部',
      blog: '博客',
      knowledge: '知识库',
      review: 'AI 工具评测',
    };
  }

  return {
    all: 'All',
    blog: 'Blog',
    knowledge: 'Knowledge',
    review: 'AI reviews',
  };
}

export function searchCategoryBadgeLabel(locale: Locale, category: SearchResultCategory): string {
  return searchFilterLabels(locale)[category];
}

export function searchFiltersForType(type: SearchFilterType): Record<string, string[]> {
  switch (type) {
    case 'blog':
      return { section: ['blog'] };
    case 'knowledge':
      return { section: ['knowledge'] };
    case 'review':
      return { contentType: ['review'] };
    default:
      return {};
  }
}
