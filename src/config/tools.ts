import type { Locale } from '@/lib/i18n';

export type ToolItem = {
  name: string;
  url: string;
  description: string;
  review: string;
  rating: string;
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
        description: '基于 VS Code 的 AI 原生编辑器，支持 Composer 和 Agent 模式。',
        review: '当前 AI 编程的行业标杆。Composer 模式在多文件重构时极具优势，Agent 模式能自主执行复杂任务。详见[深度评测](/zh/blog/ai-tool-review-cursor-vs-windsurf/)。',
        rating: '5.0',
      },
      {
        name: 'Windsurf',
        url: 'https://codeium.com/windsurf',
        description: 'Codeium 推出的 Agentic IDE，主打独创的 "Flow" 上下文管理机制。',
        review: 'Cursor 的强力竞争者。其 Flow 特性能实现极流畅的人机协作，对上下文的自动感知非常敏锐。详见[深度评测](/zh/blog/ai-tool-review-cursor-vs-windsurf/)。',
        rating: '4.8',
      },
      {
        name: 'Claude Code',
        url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
        description: 'Anthropic 官方推出的命令行 Agent，能直接操作文件、运行命令并搜索代码库。',
        review: '终端「Vibe Coding」的神器。能够自主运行测试并修复错误，处理代码库全局修改时非常高效。详见[对比评测](/zh/blog/ai-tool-review-claude-code-vs-copilot-chat/)。',
        rating: '4.9',
      },
      {
        name: 'Cline (v3)',
        url: 'https://cline.bot',
        description: 'VS Code 开源 Agent 插件，支持多种 LLM 提供商和完全自主的工具调用。',
        review: '开源界的佼佼者。给予 Agent 极高的操作权限，适合喜欢折腾和追求极致自主性的开发者。详见[使用体验](/zh/blog/ai-tool-review-antigravity-kiro-cline/)。',
        rating: '4.7',
      },
    ],
  },
  {
    title: 'AI 写作与知识管理',
    items: [
      {
        name: 'Notion AI',
        url: 'https://www.notion.so/product/ai',
        description: '深度集成在 Notion 笔记中的 AI 助手，支持内容润色、脑暴和知识问答。',
        review: '内容日历和初稿撰写的核心。其 Q&A 功能能跨页面检索信息，让个人 Wiki 真正「活」了起来。',
        rating: '4.7',
      },
      {
        name: 'Obsidian Copilot',
        url: 'https://github.com/logancyang/obsidian-copilot',
        description: 'Obsidian 的本地 AI 助手插件，支持与本地库（Vault）进行对话。',
        review: '在保护隐私的同时赋予本地笔记 AI 能力。非常适合在 Obsidian 中进行碎片想法的串联和深度思考。',
        rating: '4.5',
      },
      {
        name: 'Claude.ai',
        url: 'https://claude.ai',
        description: 'Anthropic 的长上下文对话助手，擅长分析复杂文档和代码逻辑。',
        review: '小队的「数字大脑」。在处理长篇架构文档和需要极致推理能力的场景下，Claude 3.5 Sonnet 是首选。',
        rating: '5.0',
      },
      {
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'OpenAI 的旗舰模型，支持高级数据分析、DALL-E 3 绘图和自定义 GPTs。',
        review: '多面手。在需要快速原型验证、联网搜索或使用特定 GPTs 处理任务时表现依然稳健。',
        rating: '4.9',
      },
    ],
  },
  {
    title: '网站构建',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: '为内容驱动网站优化的现代 Web 框架，支持极速的静态生成和 Islands 架构。',
        review: 'PeterClaw 的技术基石。零 JS 默认和出色的 SEO 支持让它成为技术博客的最佳选择。',
        rating: '5.0',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: '前端托管与 Serverless 平台，提供无缝的 CI/CD 和极致的开发者体验。',
        review: '部署的最佳归宿。自动预览链接、边缘函数和极简的工作流，让开发者能专注于代码本身。',
        rating: '5.0',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: '原子类 CSS 框架，通过组合预设类名快速构建美观的界面。',
        review: '彻底改变了 UI 开发方式。在 HTML 里就能完成大部分样式工作，维护性和开发效率极高。',
        rating: '4.9',
      },
    ],
  },
  {
    title: 'Analytics & SEO',
    items: [
      {
        name: 'Plausible',
        url: 'https://plausible.io',
        description: '轻量、开源且注重隐私的网站分析工具，无 Cookie 且符合 GDPR。',
        review: 'Google Analytics 的优雅替代品。界面简洁，对性能几乎无影响，且完全尊重用户隐私。',
        rating: '4.8',
      },
      {
        name: 'Google Search Console',
        url: 'https://search.google.com/search-console',
        description: 'Google 官方提供的 SEO 工具，监控网站在搜索结果中的表现。',
        review: 'SEO 的北极星。通过它了解关键词排名、索引状态和抓取错误，是流量增长的必经之路。',
        rating: '5.0',
      },
      {
        name: 'Google Analytics 4',
        url: 'https://analytics.google.com',
        description: '功能最强大的网站流量与用户行为分析平台。',
        review: '虽然配置复杂，但在进行深度用户转化分析和多渠道归因时，GA4 依然是不可或缺的重型武器。',
        rating: '4.5',
      },
    ],
  },
  {
    title: '工作流与协作',
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: '全球领先的软件开发平台，集代码托管、CI/CD 与团队协作于一体。',
        review: '不仅仅是代码库，更是小队的数字化办公室。Actions 自动化流程大大减少了手动操作。',
        rating: '5.0',
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        description: '专为高性能团队设计的项目管理工具，以极致的速度和设计感著称。',
        review: '项目管理的艺术品。全键盘操作和极速响应，让任务跟踪不再成为负担，而是享受。',
        rating: '4.9',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: '全球网络安全与性能专家，提供 DNS、CDN 和边缘计算服务。',
        review: '网站的保护伞。其免费的 CDN 和 WAF 功能对个人开发者极其友好，DNS 解析速度也是业界顶尖。',
        rating: '5.0',
      },
      {
        name: 'Buttondown',
        url: 'https://buttondown.email',
        description: '极简且优雅的邮件通讯（Newsletter）分发服务。',
        review: 'Newsletter 的最佳选择。专注于内容写作，去除了复杂的营销功能，支持 Markdown，简洁而不简单。',
        rating: '4.7',
      },
    ],
  },
  {
    title: '硬件设备',
    items: [
      {
        name: 'MacBook Pro 14" (M3 Pro)',
        url: 'https://www.apple.com/macbook-pro/',
        description: 'Apple Silicon 芯片的专业笔记本，续航与性能的完美平衡。',
        review: '主力开发机。18GB 内存足以应对多个本地 Agent 运行和高负载编译。',
        rating: '5.0',
      },
      {
        name: 'Keychron Q1 Pro',
        url: 'https://www.keychron.com',
        description: '全铝客制化机械键盘，支持无线双模和 QMK/VIA 改键。',
        review: '手指的延伸。良好的打击反馈和自定义键位极大缓解了长时间编码的疲劳。',
        rating: '4.8',
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
        description: 'AI-native code editor built on VS Code, featuring Composer and Agent modes.',
        review: 'The gold standard for AI coding. Composer mode shines in multi-file refactors, and Agent mode autonomously handles complex tasks. See [Deep Review](/zh/blog/ai-tool-review-cursor-vs-windsurf/) (ZH).',
        rating: '5.0',
      },
      {
        name: 'Windsurf',
        url: 'https://codeium.com/windsurf',
        description: 'Agentic IDE by Codeium, featuring the unique "Flow" context management mechanism.',
        review: 'A strong Cursor competitor. Its Flow feature enables fluid human-AI collaboration with acute context awareness. See [Deep Review](/zh/blog/ai-tool-review-cursor-vs-windsurf/) (ZH).',
        rating: '4.8',
      },
      {
        name: 'Claude Code',
        url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
        description: 'Official CLI Agent by Anthropic that can manipulate files, run commands, and search codebases.',
        review: 'The ultimate tool for terminal "Vibe Coding." Autonomously runs tests and fixes bugs, making codebase-wide changes highly efficient. See [Comparison Review](/zh/blog/ai-tool-review-claude-code-vs-copilot-chat/) (ZH).',
        rating: '4.9',
      },
      {
        name: 'Cline (v3)',
        url: 'https://cline.bot',
        description: 'Open-source VS Code Agent extension supporting multiple LLM providers and full autonomy.',
        review: 'A standout in the open-source world. Gives the agent high permissions, perfect for developers who want extreme autonomy. See [User Experience](/zh/blog/ai-tool-review-antigravity-kiro-cline/) (ZH).',
        rating: '4.7',
      },
    ],
  },
  {
    title: 'AI Writing & Knowledge',
    items: [
      {
        name: 'Notion AI',
        url: 'https://www.notion.so/product/ai',
        description: 'AI assistant deeply integrated into Notion for polishing, brainstorming, and Q&A.',
        review: 'The core of our content calendar and first drafts. Its Q&A feature brings personal wikis to life by searching across all pages.',
        rating: '4.7',
      },
      {
        name: 'Obsidian Copilot',
        url: 'https://github.com/logancyang/obsidian-copilot',
        description: 'Local AI assistant plugin for Obsidian that interacts with your local vault.',
        review: 'Brings AI power to local notes without compromising privacy. Great for connecting fragmented ideas and deep thinking.',
        rating: '4.5',
      },
      {
        name: 'Claude.ai',
        url: 'https://claude.ai',
        description: 'Anthropic\'s long-context assistant, excels at analyzing complex documents and code logic.',
        review: 'Our squad\'s "Digital Brain." Claude 3.5 Sonnet is the go-to for long docs and extreme reasoning tasks.',
        rating: '5.0',
      },
      {
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'OpenAI\'s flagship model with advanced data analysis, DALL-E 3, and custom GPTs.',
        review: 'The versatile all-rounder. Still solid for quick prototyping, web searches, and specific GPT-driven tasks.',
        rating: '4.9',
      },
    ],
  },
  {
    title: 'Site Building',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: 'Modern web framework optimized for content-driven sites with SSG and Islands architecture.',
        review: 'PeterClaw\'s technical foundation. Zero JS by default and great SEO make it the best choice for tech blogs.',
        rating: '5.0',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Frontend hosting and serverless platform with seamless CI/CD and top-tier DX.',
        review: 'The ultimate home for deployments. Auto-previews, edge functions, and simple workflows let developers focus on code.',
        rating: '5.0',
      },
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: 'Utility-first CSS framework for building custom interfaces directly in your HTML.',
        review: 'Revolutionized UI development. Highly maintainable and efficient, allowing most styling work within the HTML.',
        rating: '4.9',
      },
    ],
  },
  {
    title: 'Analytics & SEO',
    items: [
      {
        name: 'Plausible',
        url: 'https://plausible.io',
        description: 'Lightweight, open-source, and privacy-focused analytics, cookie-less and GDPR-compliant.',
        review: 'An elegant Google Analytics alternative. Clean UI, minimal performance impact, and full respect for privacy.',
        rating: '4.8',
      },
      {
        name: 'Google Search Console',
        url: 'https://search.google.com/search-console',
        description: 'Google\'s official SEO tool to monitor site performance in search results.',
        review: 'The North Star for SEO. Essential for understanding keyword rankings, indexing status, and crawl errors.',
        rating: '5.0',
      },
      {
        name: 'Google Analytics 4',
        url: 'https://analytics.google.com',
        description: 'The most powerful platform for analyzing website traffic and user behavior.',
        review: 'While complex, it\'s still an indispensable heavy-duty tool for deep conversion analysis and multi-channel attribution.',
        rating: '4.5',
      },
    ],
  },
  {
    title: 'Workflow & Collaboration',
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: 'The world\'s leading developer platform for code hosting, CI/CD, and collaboration.',
        review: 'More than a code repo—it\'s our squad\'s digital office. Actions automation significantly reduces manual work.',
        rating: '5.0',
      },
      {
        name: 'Linear',
        url: 'https://linear.app',
        description: 'Project management built for high-performance teams, known for speed and design.',
        review: 'A masterpiece of project management. Keyboard-centric and lightning-fast, making tracking a joy, not a chore.',
        rating: '4.9',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: 'Global network expert providing DNS, CDN, and edge-computing services.',
        review: 'The site\'s umbrella. Free CDN and WAF are incredibly friendly for indie devs, and DNS is top-tier.',
        rating: '5.0',
      },
      {
        name: 'Buttondown',
        url: 'https://buttondown.email',
        description: 'Minimalist and elegant service for distributing newsletters.',
        review: 'The best choice for newsletters. Focused on writing, with Markdown support and no bloated marketing features.',
        rating: '4.7',
      },
    ],
  },
  {
    title: 'Hardware',
    items: [
      {
        name: 'MacBook Pro 14" (M3 Pro)',
        url: 'https://www.apple.com/macbook-pro/',
        description: 'Professional laptop with Apple Silicon, perfect balance of battery and performance.',
        review: 'Primary dev machine. 18GB RAM handles multiple local agents and heavy compilation with ease.',
        rating: '5.0',
      },
      {
        name: 'Keychron Q1 Pro',
        url: 'https://www.keychron.com',
        description: 'All-aluminum custom mechanical keyboard with wireless dual-mode and QMK/VIA.',
        review: 'An extension of my fingers. Great feedback and custom keymaps reduce long-coding fatigue.',
        rating: '4.8',
      },
    ],
  },
];

export const toolsCopy = {
  zh: {
    pageTitle: '/tools',
    metaDescription:
      'PeterClaw 的工具箱：精选 AI 开发工具推荐清单，涵盖 AI 编程助手、写作、网站构建及 SEO 工具。',
    heroTitle: 'PeterClaw 工具箱',
    heroLede:
      '工欲善其事，必先利其器。这里记录了 PeterClaw 团队精选的 AI 开发工具与日常装备，助你构建高效的 AI 工作流。',
    categories: categoriesZh,
    disclaimer:
      '部分链接可能包含联盟营销代码。所有评价均基于实际使用体验，不受商业合作影响。',
    lastUpdatedLabel: '本页最后更新于',
  },
  en: {
    pageTitle: '/tools',
    metaDescription:
      'PeterClaw\'s Toolbox: A curated list of AI development tools, including coding assistants, writing, site building, and SEO tools.',
    heroTitle: 'PeterClaw Toolbox',
    heroLede:
      'A curated collection of AI development tools and hardware the PeterClaw squad relies on to build efficient workflows.',
    categories: categoriesEn,
    disclaimer:
      'Some links may contain affiliate codes. All reviews are based on hands-on experience and are not influenced by commercial partnerships.',
    lastUpdatedLabel: 'Last updated',
  },
} satisfies Record<Locale, ToolsCopy>;

export const toolsLastUpdated = '2026-05-27';
