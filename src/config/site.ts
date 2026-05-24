import type { Locale } from '@/lib/i18n';

export const siteConfig = {
  name: 'PeterClaw',
  twitterHandle: '@peterclaw',
  defaultOgImage: '/og-default.png',
  author: {
    name: 'Peter',
    url: 'https://github.com/yangliang2',
  },
  ogLocale: {
    zh: 'zh_CN',
    en: 'en_US',
  } satisfies Record<Locale, string>,
} as const;

export function getSiteUrl(): URL {
  const raw = import.meta.env.SITE ?? 'https://peterclaw.com';
  return new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw);
}
