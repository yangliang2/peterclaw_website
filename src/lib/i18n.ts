export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function localeFromId(id: string): Locale {
  const [prefix] = id.split('/');
  if (!isLocale(prefix)) {
    throw new Error(`Content id "${id}" must start with a supported locale.`);
  }

  return prefix;
}

export function stripLocaleFromId(id: string, locale: Locale) {
  return id.replace(new RegExp(`^${locale}/`), '').replace(/\/index$/, '');
}

export function collectionPath(locale: Locale, collection: 'blog' | 'knowledge', id: string) {
  return `/${locale}/${collection}/${stripLocaleFromId(id, locale)}/`;
}

/** Swap the locale prefix on a canonical path (e.g. `/zh/blog/` → `/en/blog/`). */
export function localePath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const match = normalized.match(/^\/(zh|en)(?=\/|$)(\/.*)?$/);

  if (!match) {
    return `/${locale}${normalized === '/' ? '/' : normalized}`;
  }

  const suffix = match[2] ?? '/';
  return `/${locale}${suffix}`;
}

/** Hreflang alternates for every locale that shares this URL shape. */
export function buildHreflangAlternates(canonicalPath: string): { locale: Locale; path: string }[] {
  return locales.map((locale) => ({
    locale,
    path: localePath(canonicalPath, locale),
  }));
}

/** Hreflang alternates limited to locales where matching content exists. */
export function buildContentAlternateLocales(
  collection: 'blog' | 'knowledge',
  entryId: string,
  entryIds: Iterable<string>
): { locale: Locale; path: string }[] {
  const locale = localeFromId(entryId);
  const slug = stripLocaleFromId(entryId, locale);
  const idSet = new Set(entryIds);

  return locales
    .filter((targetLocale) => idSet.has(`${targetLocale}/${slug}`))
    .map((targetLocale) => ({
      locale: targetLocale,
      path: collectionPath(targetLocale, collection, `${targetLocale}/${slug}`),
    }));
}

export const ui = {
  zh: {
    siteTitle: 'PeterClaw',
    tagline: '一个由 AI 团队公开协作构建的网站。',
    about: '关于',
    now: '现在',
    projects: '作品集',
    blog: '博客',
    knowledge: '知识库',
    tools: '工具箱',
    latest: '最新内容',
    back: '返回',
    comments: '评论',
    search: '搜索',
    searchTitle: '全文搜索',
    searchDescription: '搜索博客与知识库文章。',
    searchPlaceholder: '输入关键词…',
    newsletterTitle: '订阅 Newsletter',
    newsletterDescription: '获取 AI 团队构建日志与更新，直接发送到你的邮箱。',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: '订阅',
    newsletterSubmitting: '提交中…',
    newsletterSuccess: '订阅成功！请查收确认邮件。',
    newsletterErrorInvalid: '请输入有效的邮箱地址。',
    newsletterErrorGeneric: '订阅失败，请稍后再试。'
  },
  en: {
    siteTitle: 'PeterClaw',
    tagline: 'A website built in public by an AI-native team.',
    about: 'About',
    now: 'Now',
    projects: 'Projects',
    blog: 'Blog',
    knowledge: 'Knowledge Base',
    tools: 'Toolkit',
    latest: 'Latest',
    back: 'Back',
    comments: 'Comments',
    search: 'Search',
    searchTitle: 'Site search',
    searchDescription: 'Search blog posts and knowledge base articles.',
    searchPlaceholder: 'Search keywords…',
    newsletterTitle: 'Subscribe to the Newsletter',
    newsletterDescription: 'Get build logs and updates from the AI squad in your inbox.',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: 'Subscribe',
    newsletterSubmitting: 'Submitting…',
    newsletterSuccess: 'You are subscribed! Check your inbox to confirm.',
    newsletterErrorInvalid: 'Please enter a valid email address.',
    newsletterErrorGeneric: 'Subscription failed. Please try again later.'
  }
} satisfies Record<Locale, Record<string, string>>;
