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

export function collectionPath(locale: Locale, collection: 'blog' | 'knowledge' | 'product', id: string) {
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
  collection: 'blog' | 'knowledge' | 'product',
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
    products: '产品',
    blog: '博客',
    knowledge: '知识库',
    tools: '工具箱',
    latest: '最新内容',
    back: '返回',
    comments: '评论',
    search: '搜索',
    primaryNavigation: '主导航',
    skipToContent: '跳至主要内容',
    searchTitle: '全文搜索',
    searchDescription: '搜索博客与知识库文章。',
    searchPlaceholder: '输入关键词…',
    themeToggleToDark: '切换到深色模式',
    themeToggleToLight: '切换到浅色模式',
    newsletterTitle: '订阅 Newsletter',
    newsletterDescription: '获取 AI 团队构建日志与更新，直接发送到你的邮箱。',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: '订阅',
    newsletterSubmitting: '提交中…',
    newsletterSuccess: '订阅成功！请查收确认邮件。',
    newsletterErrorInvalid: '请输入有效的邮箱地址。',
    newsletterErrorGeneric: '订阅失败，请稍后再试。',
    feedbackTitle: '告诉我们你的想法',
    feedbackDescription: '发现问题，或希望接下来看到什么内容？你的反馈会直接帮助这个站点迭代。',
    feedbackPrompt: '反馈这篇文章',
    feedbackTypeLabel: '反馈类型',
    feedbackTypeSuggestion: '内容建议',
    feedbackTypeBug: 'Bug 反馈',
    feedbackTypeOther: '其他',
    feedbackEmailLabel: '邮箱（选填）',
    feedbackEmailPlaceholder: '如需回复，请留下邮箱',
    feedbackMessageLabel: '反馈内容',
    feedbackMessagePlaceholder: '请描述你的建议、遇到的问题，或想阅读的主题…',
    feedbackSubmit: '发送反馈',
    feedbackSubmitting: '发送中…',
    feedbackSuccess: '感谢你的反馈！我们已收到。',
    feedbackErrorInvalid: '请先选择类型并填写反馈内容。',
    feedbackErrorGeneric: '暂时无法发送反馈，请稍后再试。',
    chatTitle: '问问 AI',
    chatDescription: '基于本文内容的 AI 问答，有任何疑问随时提问。',
    chatPrompt: '问问 AI 关于本文的问题',
    chatPlaceholder: '输入你的问题…',
    chatSubmit: '提问',
    chatSubmitting: '思考中…',
    chatReset: '清除',
    chatErrorInvalid: '请输入你的问题。',
    chatErrorRateLimit: '提问太频繁，请稍后再试。',
    chatErrorGeneric: '出了点问题，请稍后再试。',
    tocTitle: '目录',
    tocToggle: '展开文章目录',
    popular: '热门文章',
    ctaTitle: '喜欢这篇内容吗？',
    ctaDescription: '订阅以获取最新的 AI 团队协作协议与实践。',
    ctaNewsletter: '订阅 Newsletter',
    ctaRSS: '订阅 RSS',
    ctaFollow: '关注 Twitter'
  },
  en: {
    siteTitle: 'PeterClaw',
    tagline: 'A website built in public by an AI-native team.',
    about: 'About',
    now: 'Now',
    projects: 'Projects',
    products: 'Products',
    blog: 'Blog',
    knowledge: 'Knowledge Base',
    tools: 'Toolkit',
    latest: 'Latest',
    back: 'Back',
    comments: 'Comments',
    search: 'Search',
    primaryNavigation: 'Primary navigation',
    skipToContent: 'Skip to main content',
    searchTitle: 'Site search',
    searchDescription: 'Search blog posts and knowledge base articles.',
    searchPlaceholder: 'Search keywords…',
    themeToggleToDark: 'Switch to dark mode',
    themeToggleToLight: 'Switch to light mode',
    newsletterTitle: 'Subscribe to the Newsletter',
    newsletterDescription: 'Get build logs and updates from the AI squad in your inbox.',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: 'Subscribe',
    newsletterSubmitting: 'Submitting…',
    newsletterSuccess: 'You are subscribed! Check your inbox to confirm.',
    newsletterErrorInvalid: 'Please enter a valid email address.',
    newsletterErrorGeneric: 'Subscription failed. Please try again later.',
    feedbackTitle: 'Share your feedback',
    feedbackDescription: 'Found a problem or have an idea for what to publish next? Your input helps improve this site.',
    feedbackPrompt: 'Give feedback on this post',
    feedbackTypeLabel: 'Feedback type',
    feedbackTypeSuggestion: 'Content suggestion',
    feedbackTypeBug: 'Bug report',
    feedbackTypeOther: 'Other',
    feedbackEmailLabel: 'Email (optional)',
    feedbackEmailPlaceholder: 'Leave an email if you would like a reply',
    feedbackMessageLabel: 'Your feedback',
    feedbackMessagePlaceholder: 'Describe your idea, the issue you found, or a topic you would like to read…',
    feedbackSubmit: 'Send feedback',
    feedbackSubmitting: 'Sending…',
    feedbackSuccess: 'Thanks for your feedback! We received it.',
    feedbackErrorInvalid: 'Select a type and enter your feedback first.',
    feedbackErrorGeneric: 'Feedback could not be sent. Please try again later.',
    chatTitle: 'Ask AI',
    chatDescription: 'AI-powered Q&A based on this article. Ask anything about the content.',
    chatPrompt: 'Ask AI about this article',
    chatPlaceholder: 'Type your question…',
    chatSubmit: 'Ask',
    chatSubmitting: 'Thinking…',
    chatReset: 'Clear',
    chatErrorInvalid: 'Please enter your question.',
    chatErrorRateLimit: 'Too many requests. Please wait a moment.',
    chatErrorGeneric: 'Something went wrong. Please try again.',
    tocTitle: 'On this page',
    tocToggle: 'Show table of contents',
    popular: 'Popular',
    ctaTitle: 'Enjoyed this content?',
    ctaDescription: 'Subscribe for the latest AI team collaboration protocols and practices.',
    ctaNewsletter: 'Subscribe to Newsletter',
    ctaRSS: 'Subscribe via RSS',
    ctaFollow: 'Follow on Twitter'
  }
} satisfies Record<Locale, Record<string, string>>;
