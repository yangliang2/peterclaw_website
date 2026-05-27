import type { Locale } from '@/lib/i18n';

export const siteConfig = {
  name: 'PeterClaw',
  twitterHandle: '@peterclaw',
  twitterUrl: 'https://x.com/peterclaw',
  newsletterUrl: 'https://newsletter.peterclaw.com', // Placeholder
  defaultOgImage: '/og-default.png',
  author: {
    name: 'PeterClaw',
    url: 'https://github.com/yangliang2',
    social: {
      github: 'https://github.com/yangliang2',
      twitter: 'https://twitter.com/peterclaw',
    },
  },
  ogLocale: {
    zh: 'zh_CN',
    en: 'en_US',
  } satisfies Record<Locale, string>,
  // SEO Verification Tokens
  verification: {
    baidu: '', // TODO: Add Baidu verification token
    bing: '',  // TODO: Add Bing verification token
    google: '', // TODO: Add Google verification token
  },
} as const;

export function getSiteUrl(): URL {
  const raw = import.meta.env.SITE ?? 'https://peterclaw.com';
  return new URL(raw.endsWith('/') ? raw.slice(0, -1) : raw);
}
