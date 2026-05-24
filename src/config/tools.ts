import type { Locale } from '@/lib/i18n';

export type ToolItem = {
  name: string;
  url: string;
  description: string;
  review: string;
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
};

const categoriesZh: ToolCategory[] = [
  {
    title: 'AI 对话与编程助手',
    items: [
      {
        name: 'Claude',
        url: 'https://claude.ai',
        description: 'Anthropic 出品的长上下文 AI 助手，擅长分析、写作与复杂推理。',
        review: '小队里的「CEO」和「CTO」都是 Claude 实例。处理长文档和架构决策时，Claude 的上下文窗口和推理深度是首选。',
      },
      {
        name: 'Kimi',
        url: 'https://kimi.moonshot.cn',
        description: 'Moonshot AI 推出的长文本 AI 助手，中文理解和生成能力突出。',
        review: '中文内容架构和品牌叙事的主力。处理中文长文、知识库整理时，Kimi 的语义把握比多数模型更自然。',
      },
      {
        name: 'Cursor',
        url: 'https://cursor.com',
        description: '内置 AI 的代码编辑器，基于 VS Code，支持 Composer 和 Tab 补全。',
        review: '日常编码的默认环境。Composer 模式在多文件重构时省掉大量上下文切换，Tab 补全的准确率也在持续提升。',
      },
      {
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'OpenAI 的旗舰对话模型，支持代码解释器、联网搜索和自定义 GPT。',
        review: '快速验证想法和生成原型代码的便利工具。o 系列模型在数学和逻辑推理任务上表现突出。',
      },
    ],
  },
  {
    title: '网站开发与部署',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: '为内容驱动网站优化的静态站点生成器，支持 Islands 架构。',
        review: 'PeterClaw 的底层框架。内容站不需要太多客户端 JS，Astro 的零 JS 默认和 Markdown 原生支持恰到好处。',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: '前端托管与 Serverless 平台，支持自动预览部署和边缘函数。',
        review: '每次 PR 自动生成预览链接，审查体验极佳。与 Astro 和 GitHub 的集成几乎零配置。',
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: '代码托管、协作与 CI/CD 平台，Issues 和 Pull Requests 是团队工作流核心。',
        review: '不只放代码，更是整个 AI 小队的「办公室」。Issues 驱动开发、PR 做代码审查、Actions 跑自动化测试。',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: 'CDN、DNS 和边缘计算服务，提供全球加速与安全防护。',
        review: 'DNS 管理和免费 CDN 加速是标配。对于静态站点，Cloudflare Pages 也是 Vercel 之外的可靠备选。',
      },
    ],
  },
  {
    title: '自动化与工作流',
    items: [
      {
        name: 'n8n',
        url: 'https://n8n.io',
        description: '开源的工作流自动化工具，支持自托管和可视化节点编排。',
        review: '比 Zapier 更灵活，比写脚本更直观。内容发布后的多渠道分发、数据同步等场景用 n8n 搭流水线很顺手。',
      },
      {
        name: 'GitHub Actions',
        url: 'https://github.com/features/actions',
        description: 'GitHub 原生的 CI/CD 与工作流自动化服务。',
        review: 'Lighthouse CI 评分、自动构建检查、发布前的质量门禁——全部写在 YAML 里，和代码一起版本管理。',
      },
      {
        name: 'Make',
        url: 'https://www.make.com',
        description: '可视化自动化平台（原 Integromat），连接数百种 SaaS 服务。',
        review: '当 n8n 的自托管显得过重，Make 的云托管方案是轻量替代。适合快速搭建社交媒体或邮件自动化。',
      },
    ],
  },
  {
    title: '设计与媒体',
    items: [
      {
        name: 'Figma',
        url: 'https://figma.com',
        description: '基于浏览器的协作设计工具，支持原型、设计系统和开发者交付。',
        review: 'AI 小队也需要视觉规范。Figma 的 Dev Mode 让设计到代码的交接更顺畅，组件系统也减少了重复劳动。',
      },
      {
        name: 'Midjourney',
        url: 'https://midjourney.com',
        description: 'AI 图像生成工具，以艺术感和氛围感著称。',
        review: '网站封面图和博客配图的来源。提示词控制熟练后，能在几分钟内得到风格统一的视觉资产。',
      },
      {
        name: 'Canva',
        url: 'https://canva.com',
        description: '在线平面设计工具，提供模板、素材和团队协作功能。',
        review: '不需要从零设计时使用。社交媒体封面、Newsletter 头图等快速产出场景，Canva 的模板库省很多时间。',
      },
    ],
  },
  {
    title: '内容、知识与数据分析',
    items: [
      {
        name: 'Notion',
        url: 'https://notion.so',
        description: '集笔记、数据库、Wiki 和项目管理于一体的协作工作空间。',
        review: '内容日历、选题库和发布计划的管理中心。Notion AI 在整理会议纪要和生成初稿时也有不错表现。',
      },
      {
        name: 'Obsidian',
        url: 'https://obsidian.md',
        description: '基于本地 Markdown 的知识库工具，支持双向链接和插件生态。',
        review: '个人思考和大纲草稿的根据地。双向链接让碎片想法逐渐连成网络，后续再迁移到 Notion 或直接进入网站。',
      },
      {
        name: 'Google Analytics',
        url: 'https://analytics.google.com',
        description: '网站流量与用户行为分析平台。',
        review: 'SEO 效果的反馈回路。看哪些内容带来自然流量、用户在哪个页面离开——数据驱动下一批选题决策。',
      },
      {
        name: 'Pagefind',
        url: 'https://pagefind.app',
        description: '专为静态网站设计的开源搜索库，零配置、低带宽占用。',
        review: 'PeterClaw 站内搜索的实现方案。构建时自动索引，不需要外部服务，对静态站来说几乎是零成本。',
      },
    ],
  },
];

const categoriesEn: ToolCategory[] = [
  {
    title: 'AI Chat & Coding Assistants',
    items: [
      {
        name: 'Claude',
        url: 'https://claude.ai',
        description: 'Anthropic\'s long-context AI assistant, strong at analysis, writing, and complex reasoning.',
        review: 'Our squad\'s "CEO" and "CTO" instances run on Claude. When handling long documents or architecture decisions, its context window and reasoning depth are the go-to.',
      },
      {
        name: 'Kimi',
        url: 'https://kimi.moonshot.cn',
        description: 'Moonshot AI\'s long-text assistant with standout Chinese comprehension and generation.',
        review: 'The main workhorse for Chinese content architecture and brand storytelling. Its grasp of Chinese semantics feels more natural than most models for long-form writing.',
      },
      {
        name: 'Cursor',
        url: 'https://cursor.com',
        description: 'AI-native code editor built on VS Code, featuring Composer and Tab completion.',
        review: 'My default daily editor. Composer mode saves tons of context switching during multi-file refactors, and Tab completion accuracy keeps improving.',
      },
      {
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'OpenAI\'s flagship conversational model with Code Interpreter, web search, and custom GPTs.',
        review: 'A convenient tool for quick idea validation and prototype code. The o-series models shine on math and logic-heavy tasks.',
      },
    ],
  },
  {
    title: 'Web Development & Deployment',
    items: [
      {
        name: 'Astro',
        url: 'https://astro.build',
        description: 'Static site generator optimized for content-driven sites with Islands architecture.',
        review: 'PeterClaw\'s underlying framework. Content sites don\'t need much client-side JS; Astro\'s zero-JS-by-default and native Markdown support are a perfect fit.',
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Frontend hosting and serverless platform with automatic preview deployments and edge functions.',
        review: 'Every PR gets an automatic preview link—fantastic review experience. The Astro and GitHub integrations are nearly zero-config.',
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        description: 'Code hosting, collaboration, and CI/CD platform. Issues and Pull Requests are the team workflow core.',
        review: 'More than code storage—it\'s the AI squad\'s "office." Issues drive development, PRs handle code review, and Actions run automated tests.',
      },
      {
        name: 'Cloudflare',
        url: 'https://cloudflare.com',
        description: 'CDN, DNS, and edge-computing services offering global acceleration and security.',
        review: 'DNS management and free CDN acceleration are standard. For static sites, Cloudflare Pages is also a solid alternative to Vercel.',
      },
    ],
  },
  {
    title: 'Automation & Workflow',
    items: [
      {
        name: 'n8n',
        url: 'https://n8n.io',
        description: 'Open-source workflow automation tool with self-hosting and visual node orchestration.',
        review: 'More flexible than Zapier, more visual than writing scripts. Great for building pipelines for multi-channel content distribution and data syncing.',
      },
      {
        name: 'GitHub Actions',
        url: 'https://github.com/features/actions',
        description: 'GitHub-native CI/CD and workflow automation service.',
        review: 'Lighthouse CI scoring, automated build checks, pre-release quality gates—all written in YAML and version-controlled alongside the code.',
      },
      {
        name: 'Make',
        url: 'https://www.make.com',
        description: 'Visual automation platform (formerly Integromat) connecting hundreds of SaaS services.',
        review: 'When n8n self-hosting feels heavy, Make\'s cloud-hosted option is a lighter alternative. Great for quickly wiring up social media or email automations.',
      },
    ],
  },
  {
    title: 'Design & Media',
    items: [
      {
        name: 'Figma',
        url: 'https://figma.com',
        description: 'Browser-based collaborative design tool supporting prototypes, design systems, and developer handoff.',
        review: 'Even an AI squad needs visual standards. Figma\'s Dev Mode makes design-to-code handoff smoother, and component systems cut down on repetitive work.',
      },
      {
        name: 'Midjourney',
        url: 'https://midjourney.com',
        description: 'AI image generation tool known for artistic quality and atmosphere.',
        review: 'Source of website cover images and blog illustrations. With practiced prompt control, you can get stylistically consistent visual assets in minutes.',
      },
      {
        name: 'Canva',
        url: 'https://canva.com',
        description: 'Online graphic design tool with templates, assets, and team collaboration.',
        review: 'Useful when you don\'t need to design from scratch. Social media covers, newsletter headers, and other quick-turnaround visuals—Canva\'s template library saves a lot of time.',
      },
    ],
  },
  {
    title: 'Content, Knowledge & Analytics',
    items: [
      {
        name: 'Notion',
        url: 'https://notion.so',
        description: 'All-in-one workspace for notes, databases, wikis, and project management.',
        review: 'The command center for content calendars, idea pipelines, and publishing schedules. Notion AI also does a decent job summarizing meeting notes and drafting first versions.',
      },
      {
        name: 'Obsidian',
        url: 'https://obsidian.md',
        description: 'Local Markdown-based knowledge base with bi-directional linking and a rich plugin ecosystem.',
        review: 'My territory for personal thinking and outline drafts. Bi-directional linking lets fragmented ideas gradually form a network before migrating to Notion or the site itself.',
      },
      {
        name: 'Google Analytics',
        url: 'https://analytics.google.com',
        description: 'Website traffic and user behavior analytics platform.',
        review: 'The feedback loop for SEO efforts. See which content brings organic traffic and where users drop off—data drives the next batch of topic decisions.',
      },
      {
        name: 'Pagefind',
        url: 'https://pagefind.app',
        description: 'Open-source search library built for static sites, zero-config and low bandwidth.',
        review: 'How PeterClaw\'s site search is implemented. Automatically indexes at build time, needs no external service, and is practically zero-cost for static sites.',
      },
    ],
  },
];

export const toolsCopy = {
  zh: {
    pageTitle: '工具箱',
    metaDescription:
      'PeterClaw 日常使用的 AI 工具、自动化平台和独立开发资源清单——从代码编辑器到设计、从部署到内容分发。',
    heroTitle: '我的 AI 工具箱',
    heroLede:
      '这份清单记录了 PeterClaw 团队日常依赖的工具与资源。没有付费推广，只有真实使用体验。',
    categories: categoriesZh,
    disclaimer:
      '部分链接可能包含联盟营销代码。所有评价均基于实际使用体验，不受商业合作影响。',
  },
  en: {
    pageTitle: 'Toolkit',
    metaDescription:
      'A curated list of AI tools, automation platforms, and indie developer resources used by the PeterClaw team daily.',
    heroTitle: 'My AI Toolkit',
    heroLede:
      'A living list of tools and resources the PeterClaw squad relies on. No paid placements—just honest usage notes.',
    categories: categoriesEn,
    disclaimer:
      'Some links may contain affiliate codes. All reviews are based on hands-on experience and are not influenced by commercial partnerships.',
  },
} satisfies Record<Locale, ToolsCopy>;
