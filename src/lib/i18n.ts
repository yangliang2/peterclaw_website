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
    consulting: '咨询',
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
    searchFilterAll: '全部',
    searchFilterBlog: '博客',
    searchFilterKnowledge: '知识库',
    searchFilterReview: 'AI 评测',
    searchBrowseByTag: '按标签浏览',
    searchEmptyTitle: '没有找到匹配结果',
    searchEmptyDescription: '试试换个关键词，或者从热门文章和相关标签继续探索。',
    searchEmptyTagsTitle: '相关标签',
    notFoundTitle: '页面走丢了',
    notFoundDescription: '这个链接可能已失效，或者我们还没写好这一页。别慌，下面几条路可以帮你回到正轨。',
    notFoundHome: '返回首页',
    notFoundSearchHint: '试试搜索你想找的内容',
    notFoundRecommended: '推荐阅读',
    themeToggleToDark: '切换到深色模式',
    themeToggleToLight: '切换到浅色模式',
    themeToggleToSystem: '切换到跟随系统',
    themeModeSystem: '跟随系统主题',
    newsletterTitle: '订阅 Newsletter',
    newsletterDescription: '获取 AI 团队构建日志与更新，直接发送到你的邮箱。',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: '订阅',
    newsletterSubmitting: '提交中…',
    newsletterSuccess: '订阅成功！请查收确认邮件。',
    newsletterSocialProof: '加入 1,000+ 位 AI 读者的协作实验',
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
    chatContextHint: '基于文章内容',
    chatSuggest1: '总结这篇文章',
    chatSuggest2: '这篇文章的核心观点是什么？',
    chatSuggest3: '读完这篇我该了解什么？',
    chatYou: '你',
    chatAI: 'AI',
    chatClearHistory: '清除对话',
    tocTitle: '目录',
    tocToggle: '展开文章目录',
    popular: '热门文章',
    ctaTitle: '喜欢这篇内容吗？',
    ctaDescription: '订阅以获取最新的 AI 团队协作协议与实践。',
    ctaNewsletter: '订阅 Newsletter',
    ctaRSS: '订阅 RSS',
    ctaFollow: '关注 Twitter',
    ctaSupport: '在爱发电支持我们',
    newsletterPageTitle: '订阅 Newsletter',
    newsletterPageDescription: '获取 AI 团队构建日志、协作协议与最新实践，直接发送到你的邮箱。',
    newsletterPageHeroTitle: '连接 AI 协作的未来',
    newsletterPageHeroLede: '我们正在公开构建一个 AI 原生团队。订阅我们的周报，获取深度的实验报告、Prompt 技巧与幕后故事。',
    newsletterFeatureWeeklyTitle: '每周更新',
    newsletterFeatureWeeklyDesc: '每周一封邮件，总结当周最核心的 AI 协作实验与进展。',
    newsletterFeaturePromptTitle: 'Prompt 技巧',
    newsletterFeaturePromptDesc: '分享我们在实际项目中打磨的 Prompt 模板与工程实践。',
    newsletterFeatureNoAdsTitle: '无广告干扰',
    newsletterFeatureNoAdsDesc: '纯粹的技术与协作分享，没有任何赞助商广告与废话。',
    blogChatTitle: '问问 AI',
    blogChatDescription: '用自然语言查询所有博客内容，AI 会找到相关文章并回答你的问题。',
    blogChatPlaceholder: '例如：AI 小队是如何协作的？',
    blogChatSubmit: '提问',
    blogChatSubmitting: '搜索中…',
    blogChatErrorInvalid: '请输入你的问题。',
    blogChatErrorRateLimit: '每日提问次数已达上限（20 次），明天再来吧。',
    blogChatErrorGeneric: '出了点问题，请稍后再试。',
    blogChatErrorNotReady: '博客 AI 搜索功能尚未配置，请稍后再试。',
    blogChatSources: '参考文章',
    blogChatSuggest1: 'AI 小队是如何协作的？',
    blogChatSuggest2: '这个网站用了哪些技术？',
    blogChatSuggest3: '有哪些关于 AI Agent 的内容？',
    blogChatClear: '清除',
  },
  en: {
    siteTitle: 'PeterClaw',
    tagline: 'A website built in public by an AI-native team.',
    about: 'About',
    now: 'Now',
    projects: 'Projects',
    products: 'Products',
    consulting: 'Consulting',
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
    searchFilterAll: 'All',
    searchFilterBlog: 'Blog',
    searchFilterKnowledge: 'Knowledge',
    searchFilterReview: 'AI reviews',
    searchBrowseByTag: 'Browse by tag',
    searchEmptyTitle: 'No results found',
    searchEmptyDescription: 'Try different keywords, or explore popular articles and related tags below.',
    searchEmptyTagsTitle: 'Related tags',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This link may be broken, or we have not published this page yet. Here are a few ways to get back on track.',
    notFoundHome: 'Back to home',
    notFoundSearchHint: 'Try searching for what you need',
    notFoundRecommended: 'Recommended reading',
    themeToggleToDark: 'Switch to dark mode',
    themeToggleToLight: 'Switch to light mode',
    themeToggleToSystem: 'Switch to system theme',
    themeModeSystem: 'Using system theme',
    newsletterTitle: 'Subscribe to the Newsletter',
    newsletterDescription: 'Get build logs and updates from the AI squad in your inbox.',
    newsletterPlaceholder: 'your@email.com',
    newsletterSubmit: 'Subscribe',
    newsletterSubmitting: 'Submitting…',
    newsletterSuccess: 'You are subscribed! Check your inbox to confirm.',
    newsletterSocialProof: 'Join 1,000+ AI-native readers',
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
    chatContextHint: 'Based on this article',
    chatSuggest1: 'Summarize this article',
    chatSuggest2: 'What is the main argument?',
    chatSuggest3: 'What should I take away from this?',
    chatYou: 'You',
    chatAI: 'AI',
    chatClearHistory: 'Clear chat',
    tocTitle: 'On this page',
    tocToggle: 'Show table of contents',
    popular: 'Popular',
    ctaTitle: 'Enjoyed this content?',
    ctaDescription: 'Subscribe for the latest AI team collaboration protocols and practices.',
    ctaNewsletter: 'Subscribe to Newsletter',
    ctaRSS: 'Subscribe via RSS',
    ctaFollow: 'Follow on Twitter',
    ctaSupport: 'Support us on Afdian',
    newsletterPageTitle: 'Subscribe to Newsletter',
    newsletterPageDescription: 'Get build logs, collaboration protocols, and latest practices from the AI squad in your inbox.',
    newsletterPageHeroTitle: 'Connect with the Future of AI Collaboration',
    newsletterPageHeroLede: 'We are building an AI-native team in public. Subscribe to our newsletter for deep experiment reports, prompt tips, and behind-the-scenes stories.',
    newsletterFeatureWeeklyTitle: 'Weekly Updates',
    newsletterFeatureWeeklyDesc: 'One email per week, summarizing the core AI collaboration experiments and progress.',
    newsletterFeaturePromptTitle: 'Prompt Engineering',
    newsletterFeaturePromptDesc: 'Share the prompt templates and engineering practices we refined in real projects.',
    newsletterFeatureNoAdsTitle: 'No Ads',
    newsletterFeatureNoAdsDesc: 'Pure technical and collaboration sharing, no sponsored ads or fluff.',
    blogChatTitle: 'Ask AI',
    blogChatDescription: 'Ask questions about all blog posts in natural language. AI finds relevant content and answers.',
    blogChatPlaceholder: 'e.g. How does the AI squad collaborate?',
    blogChatSubmit: 'Ask',
    blogChatSubmitting: 'Searching…',
    blogChatErrorInvalid: 'Please enter your question.',
    blogChatErrorRateLimit: 'Daily limit reached (20 queries). Come back tomorrow.',
    blogChatErrorGeneric: 'Something went wrong. Please try again.',
    blogChatErrorNotReady: 'Blog AI search is not configured yet. Please try again later.',
    blogChatSources: 'Sources',
    blogChatSuggest1: 'How does the AI squad collaborate?',
    blogChatSuggest2: 'What tech stack does this website use?',
    blogChatSuggest3: 'What articles are there about AI agents?',
    blogChatClear: 'Clear',
  }
} satisfies Record<Locale, Record<string, string>>;
