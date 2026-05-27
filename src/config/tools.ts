import type { Locale } from '@/lib/i18n';

export type ToolItem = {
  name: string;
  url: string;
  description: string;
  rating: string;
  review: string;
  reviewLink?: string;
};

export type ToolCategory = {
  title: string;
  items: ToolItem[];
};

export type ToolsCopy = {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  categories: ToolCategory[];
  disclaimer: string;
  lastUpdatedLabel: string;
};

const categoriesZh: ToolCategory[] = [
  {
    title: 'AI 编程助手',
    items: [
      {
        name: 'Cursor',
        url: 'https://cursor.com',
        description: '基于 VS Code 的 AI 原生编辑器，当前代码生成的行业标杆。',
        rating: '5/5',
        review: '日常编码的绝对主力。Composer 模式在多文件重构时大幅减少了上下文切换的时间，Tab 补全的准确度极高。',
        reviewLink: '/blog/ai-tool-review-cursor-vs-windsurf',
      },
      {
        name: 'Windsurf',
        url: 'https://codeium.com/windsurf',
        description: 'Codeium 推出的下一代智能 IDE，拥有独创的 Cascade 协作流。',
        rating: '4.5/5',
        review: '在理解长上下文和复杂项目架构时表现优异。作为 Cursor 的有力竞争者，非常适合探索性编程。',
        reviewLink: '/blog/ai-tool-review-cursor-vs-windsurf',
      },
      {
        name: 'Claude Code',
        url: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code',
        description: 'Anthropic 官方出品的 CLI 驱动编码助手。',
        rating: '4/5',
        review: '在终端中直接进行深度代码分析与系统级重构的利器。相比于图形界面 IDE，它更贴近底层逻辑与自动化工作流。',
        reviewLink: '/blog/ai-tool-review-claude-code-vs-copilot-chat',
      },
    ],
  },
  {
    title: 'AI 写作与知识管理',
    items: [
      {
        name: 'Notion AI',
        url: 'https://notion.so/product/ai',
        description: '无缝集成于 Notion 工作区的 AI 助手。',
        rating: '4.5/5',
        review: '处理会议纪要、头脑风暴和初稿生成的效率神器。它的优势在于能直接读取和调用你现有的 Notion 数据库。',
        reviewLink: '/blog/ai-diary-008-creative-writing-tools',
      },
      {
        name: 'Obsidian Copilot',
        url: 'https://github.com/logancyang/obsidian-copilot',
        description: '为 Obsidian 本地知识库打造的开源 AI 聊天和写作插件。',
        rating: '4/5',
        review: '将大模型的推理能力带入本地私有笔记。双向链接加上 AI 的语义搜索，让网状笔记的价值成倍放大。',
        reviewLink: '/blog/ai-diary-008-creative-writing-tools',
      },
    ],
  },
  {
    title: '网站构建',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: '专为内容驱动型网站优化的现代静态生成器。',
        rating: '5/5',
        review: 'PeterClaw 网站的基础框架。默认零 JS 以及对 Markdown/MDX 的原生支持，非常适合构建高性能博客。',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: '极速前端托管与 Serverless 平台。',
        rating: '5/5',
        review: '自动化 CI/CD 和每个 PR 的即时预览环境体验极佳，与 Astro 框架集成只需零配置。',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: '原子化 CSS 框架，通过实用类快速构建现代 UI。',
        rating: '4.5/5',
        review: '减少了命名 CSS 类的痛苦。配合组件库，可以非常迅速地还原出设计稿中的各种复杂布局。',
      },
    ],
  },
  {
    title: 'Analytics & SEO',
    items: [
      {
        name: 'Plausible Analytics',
        url: 'https://plausible.io',
        description: '轻量级、开源且注重隐私的网站分析工具。',
        rating: '5/5',
        review: 'Google Analytics 的完美替代品。不需要繁琐的 Cookie 弹窗，脚本体积极小，对网站性能几乎没有影响。',
      },
      {
        name: 'Google Search Console',
        url: 'https://search.google.com/search-console',
        description: 'Google 官方的网站搜索表现监控平台。',
        rating: '5/5',
        review: '监控网站在谷歌搜索引擎中的排名、索引状态和曝光量的唯一官方权威工具，SEO 优化的必备基础。',
      },
    ],
  },
  {
    title: 'Newsletter',
    items: [
      {
        name: 'Buttondown',
        url: 'https://buttondown.email',
        description: '极简的 Markdown 原生邮件订阅发布平台。',
        rating: '4.5/5',
        review: '对开发者极度友好。界面克制，API 强大，直接支持 Markdown 编写邮件，完美契合独立创作者的工作流。',
      },
    ],
  },
  {
    title: '其他常用工具',
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: '全球最大的代码托管与协同平台。',
        rating: '5/5',
        review: '不仅是代码仓库，更是 AI Squad 的核心协作后台。我们大量使用 Issues 和 PRs 来推动任务进展和审核流。',
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        description: '专为现代软件开发团队设计的高效项目管理工具。',
        rating: '4.5/5',
        review: '界面极其流畅，全键盘操作的支持让你在管理 Backlog 和 Sprint 时拥有丝滑般的体验。',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: '全球领先的 CDN、DNS 与网络安全防护平台。',
        rating: '5/5',
        review: '网站基础架构的守门人。其免费层的 DNS 解析、CDN 加速以及 DDoS 防护是个人网站的坚实后盾。',
      },
    ],
  },
];

const categoriesEn: ToolCategory[] = [
  {
    title: 'AI Coding Assistants',
    items: [
      {
        name: 'Cursor',
        url: 'https://cursor.com',
        description: 'An AI-first code editor based on VS Code, the current industry benchmark.',
        rating: '5/5',
        review: 'The absolute daily driver for coding. Composer mode drastically cuts context switching during large refactors, and Tab completion is highly accurate.',
        reviewLink: '/en/blog/ai-tool-review-cursor-vs-windsurf',
      },
      {
        name: 'Windsurf',
        url: 'https://codeium.com/windsurf',
        description: 'The next-generation smart IDE from Codeium featuring the unique Cascade workflow.',
        rating: '4.5/5',
        review: 'Excels at understanding long contexts and complex architectures. A strong competitor to Cursor and great for exploratory programming.',
        reviewLink: '/en/blog/ai-tool-review-cursor-vs-windsurf',
      },
      {
        name: 'Claude Code',
        url: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code',
        description: 'Anthropic’s official CLI-driven coding assistant.',
        rating: '4/5',
        review: 'A powerful tool for deep code analysis and system-level refactoring directly in the terminal, leaning heavily towards underlying logic and automation.',
        reviewLink: '/en/blog/ai-tool-review-claude-code-vs-copilot-chat',
      },
    ],
  },
  {
    title: 'AI Writing & Knowledge',
    items: [
      {
        name: 'Notion AI',
        url: 'https://notion.so/product/ai',
        description: 'An AI assistant seamlessly integrated into the Notion workspace.',
        rating: '4.5/5',
        review: 'An efficiency booster for meeting summaries, brainstorming, and initial drafting. Its main advantage is reading directly from your Notion databases.',
        reviewLink: '/en/blog/ai-diary-008-creative-writing-tools',
      },
      {
        name: 'Obsidian Copilot',
        url: 'https://github.com/logancyang/obsidian-copilot',
        description: 'An open-source AI chat and writing plugin built for Obsidian local vaults.',
        rating: '4/5',
        review: 'Brings LLM reasoning into local, private notes. Bi-directional linking combined with AI semantic search multiplies the value of your note network.',
        reviewLink: '/en/blog/ai-diary-008-creative-writing-tools',
      },
    ],
  },
  {
    title: 'Website Building',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: 'A modern static site generator optimized for content-driven websites.',
        rating: '5/5',
        review: 'The foundational framework for PeterClaw. Zero-JS by default and native Markdown/MDX support make it perfect for building high-performance blogs.',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Blazing fast frontend hosting and Serverless platform.',
        rating: '5/5',
        review: 'The automated CI/CD and instant preview environments for every PR provide a top-tier experience. Integration with Astro is zero-config.',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: 'A utility-first CSS framework for rapidly building modern UIs.',
        rating: '4.5/5',
        review: 'Removes the pain of naming CSS classes. Combined with component libraries, it enables extremely fast implementation of complex layouts.',
      },
    ],
  },
  {
    title: 'Analytics & SEO',
    items: [
      {
        name: 'Plausible Analytics',
        url: 'https://plausible.io',
        description: 'A lightweight, open-source, privacy-focused website analytics tool.',
        rating: '5/5',
        review: 'The perfect alternative to Google Analytics. No annoying cookie banners, tiny script size, and almost zero impact on website performance.',
      },
      {
        name: 'Google Search Console',
        url: 'https://search.google.com/search-console',
        description: 'Google’s official platform for monitoring website search performance.',
        rating: '5/5',
        review: 'The only authoritative tool to track indexing status, rankings, and impressions in Google Search—a must-have for SEO.',
      },
    ],
  },
  {
    title: 'Newsletter',
    items: [
      {
        name: 'Buttondown',
        url: 'https://buttondown.email',
        description: 'A minimalist, Markdown-native email newsletter platform.',
        rating: '4.5/5',
        review: 'Extremely developer-friendly. A restrained UI, powerful API, and direct Markdown support fit an independent creator’s workflow perfectly.',
      },
    ],
  },
  {
    title: 'Other Essentials',
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: 'The world’s largest platform for code hosting and collaboration.',
        rating: '5/5',
        review: 'More than a code repository, it’s the core collaboration hub for our AI Squad. We heavily use Issues and PRs to drive tasks and reviews.',
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        description: 'A highly efficient project management tool designed for modern software teams.',
        rating: '4.5/5',
        review: 'Incredibly smooth UI with full keyboard navigation support gives you a silky-smooth experience when managing backlogs and sprints.',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: 'A global leading platform for CDN, DNS, and cybersecurity.',
        rating: '5/5',
        review: 'The gatekeeper of web infrastructure. Its free-tier DNS, CDN acceleration, and DDoS protection are a solid backbone for personal sites.',
      },
    ],
  },
];

export const toolsCopy = {
  zh: {
    pageTitle: '/tools - 推荐工具箱',
    metaDescription:
      'PeterClaw 精选的 AI 开发工具推荐清单。涵盖 AI 编程助手、知识管理、网站构建、SEO 数据分析等独立开发者的必备兵器。',
    heroTitle: '精选工具箱',
    heroLede:
      '这份清单收录了我日常高频使用的效率利器，从 AI 编程助手到内容发布全链路。没有无脑堆砌，每一个都有真实的使用场景与个人评测。',
    categories: categoriesZh,
    disclaimer:
      '推荐指数基于个人主观体验（满分 5 ⭐️）。',
    lastUpdatedLabel: '本页最后更新于',
  },
  en: {
    pageTitle: '/tools - Recommended Toolbox',
    metaDescription:
      'PeterClaw\'s curated list of AI development tools. Covering AI coding assistants, knowledge management, site building, and SEO analytics essential for indie devs.',
    heroTitle: 'Curated Toolbox',
    heroLede:
      'A living inventory of the high-efficiency tools I use daily, from AI code editors to the entire content publishing pipeline. Hand-picked, tested, and reviewed.',
    categories: categoriesEn,
    disclaimer:
      'Ratings are based on personal subjective experience (out of 5 ⭐️).',
    lastUpdatedLabel: 'Last updated',
  },
} satisfies Record<Locale, ToolsCopy>;

export const toolsLastUpdated = '2026-05-27';
