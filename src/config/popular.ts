import type { Locale } from '@/lib/i18n';

export interface PopularEntry {
  collection: 'blog' | 'knowledge';
  id: string;
}

/**
 * Manually curated popular articles per locale.
 * Update this list to refresh the ranking.
 */
export const popularArticles: Record<Locale, PopularEntry[]> = {
  zh: [
    { collection: 'blog', id: 'zh/ai-squad-launch-diary' },
    { collection: 'blog', id: 'zh/ai-diary-004-automation' },
    { collection: 'blog', id: 'zh/ai-diary-005-multi-agent-collaboration' },
    { collection: 'blog', id: 'zh/ai-squad-diary-02-serialization' },
    { collection: 'knowledge', id: 'zh/content-architecture' },
  ],
  en: [
    { collection: 'blog', id: 'en/ai-squad-launch-diary' },
    { collection: 'blog', id: 'en/ai-squad-diary-02-serialization' },
    { collection: 'blog', id: 'en/ai-squad-diary-03-code-review-routing' },
    { collection: 'knowledge', id: 'en/content-architecture' },
  ],
};
