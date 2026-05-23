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
    blog: '博客',
    knowledge: '知识库',
    latest: '最新内容',
    back: '返回'
  },
  en: {
    siteTitle: 'PeterClaw',
    tagline: 'A website built in public by an AI-native team.',
    blog: 'Blog',
    knowledge: 'Knowledge Base',
    latest: 'Latest',
    back: 'Back'
  }
} satisfies Record<Locale, Record<string, string>>;
