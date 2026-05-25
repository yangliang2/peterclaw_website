import type { Locale } from '@/lib/i18n';

export type NowItem = {
  title: string;
  description: string;
  link?: { text: string; href: string };
};

export type NowSection = {
  heading: string;
  items: NowItem[];
};

export type NowDynamicCopy = {
  githubHeading: string;
  githubLede: string;
  githubProfile: string;
  cachedNote: string;
  toolkitHeading: string;
  toolkitLede: string;
  toolkitLink: string;
};

export type NowCopy = {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  updatedLabel: string;
  nownownowCta: string;
  dynamic: NowDynamicCopy;
  sections: NowSection[];
};

export const nowCopy = {
  zh: {
    pageTitle: '现在',
    metaDescription:
      'PeterClaw 的「/now」页面：当前在做什么、学什么、关注什么——一个独立开发者的实时状态页。',
    heroTitle: '我现在在做什么',
    heroLede:
      '这是 PeterClaw 的实时状态页，记录当前的项目重心、学习方向和写作计划。灵感来自 nownownow.com 运动。',
    updatedLabel: '本页最后更新于',
    nownownowCta: '什么是 /now 页面？',
    dynamic: {
      githubHeading: '最近 GitHub 提交',
      githubLede: '从公开 Push 事件拉取的最近 5 条 commit，每 15 分钟刷新缓存。',
      githubProfile: '查看 GitHub 主页',
      cachedNote: '（当前为缓存数据）',
      toolkitHeading: '当前 AI 工具栈',
      toolkitLede: '与工具箱页面同步的日常助手与开发部署栈。',
      toolkitLink: '浏览完整工具箱',
    },
    sections: [
      {
        heading: '当前项目重心',
        items: [
          {
            title: 'AI 多智能体工作流探索',
            description:
              '持续优化 PeterClaw 网站的 AI 协作流水线，探索 Issue 驱动、Agent 分工、自动化评审的最佳实践。',
            link: { text: '阅读 AI 小队日记', href: '/zh/blog/ai-squad-launch-diary/' },
          },
          {
            title: '个人网站内容生态',
            description:
              '完善博客、知识库和工具箱的内容结构，提升 SEO 表现和读者体验。',
          },
          {
            title: 'Build in Public',
            description:
              '把开发过程、决策记录和踩坑经验公开分享，验证透明式创作的价值。',
          },
        ],
      },
      {
        heading: '正在学习',
        items: [
          {
            title: 'Astro 静态站点高级模式',
            description:
              '深入 Content Collections、 islands 架构和边缘部署策略，为网站性能做进一步优化。',
          },
          {
            title: 'AI Agent 协作协议设计',
            description:
              '研究多 Agent 系统的通信协议、任务路由和冲突解决机制。',
          },
          {
            title: '技术写作与叙事',
            description:
              '学习如何把复杂的技术过程转化为读者愿意读完的故事。',
          },
        ],
      },
      {
        heading: '近期写作计划',
        items: [
          {
            title: 'AI 小队组建日记续篇',
            description:
              '记录多 Agent 协作中的新发现：代码评审路由、自动化测试策略和部署流水线优化。',
            link: { text: '查看已有日记', href: '/zh/blog/' },
          },
          {
            title: '独立开发者工具箱系列',
            description:
              '整理和评测构建个人网站过程中使用的工具、服务和开源项目。',
            link: { text: '浏览工具箱', href: '/zh/tools/' },
          },
          {
            title: '知识库深度文章',
            description:
              '撰写关于内容架构、SEO 策略和可访问性设计的系统性总结。',
            link: { text: '查看知识库', href: '/zh/knowledge/' },
          },
        ],
      },
    ],
  },
  en: {
    pageTitle: 'Now',
    metaDescription:
      'PeterClaw\'s /now page: what I\'m working on, learning, and thinking about — a real-time status page for an indie developer.',
    heroTitle: 'What I\'m doing now',
    heroLede:
      'A real-time status page tracking current projects, learning directions, and writing plans. Inspired by the nownownow.com movement.',
    updatedLabel: 'Last updated',
    nownownowCta: 'What is a /now page?',
    dynamic: {
      githubHeading: 'Recent GitHub Commits',
      githubLede: 'The latest 5 commits from public push events, cached and refreshed every 15 minutes.',
      githubProfile: 'View GitHub profile',
      cachedNote: '(showing cached data)',
      toolkitHeading: 'Current AI Toolkit',
      toolkitLede: 'Daily assistants and dev/deploy stack synced from the toolkit page.',
      toolkitLink: 'Browse full toolkit',
    },
    sections: [
      {
        heading: 'Current Focus',
        items: [
          {
            title: 'AI Multi-Agent Workflow Exploration',
            description:
              'Continuously optimizing the AI collaboration pipeline for PeterClaw, exploring best practices in issue-driven development, agent specialization, and automated reviews.',
            link: { text: 'Read the AI Squad diary', href: '/en/blog/ai-squad-launch-diary/' },
          },
          {
            title: 'Personal Website Content Ecosystem',
            description:
              'Improving the content structure of blog, knowledge base, and toolkit sections to boost SEO and reader experience.',
          },
          {
            title: 'Build in Public',
            description:
              'Sharing the development process, decision logs, and lessons learned openly to validate the value of transparent creation.',
          },
        ],
      },
      {
        heading: 'Currently Learning',
        items: [
          {
            title: 'Advanced Astro Static Site Patterns',
            description:
              'Diving deeper into Content Collections, islands architecture, and edge deployment strategies for further site performance gains.',
          },
          {
            title: 'AI Agent Collaboration Protocols',
            description:
              'Researching communication protocols, task routing, and conflict resolution mechanisms in multi-agent systems.',
          },
          {
            title: 'Technical Writing & Storytelling',
            description:
              'Learning how to turn complex technical processes into stories readers actually want to finish.',
          },
        ],
      },
      {
        heading: 'Upcoming Writing',
        items: [
          {
            title: 'AI Squad Diary — Next Chapters',
            description:
              'Documenting new findings in multi-agent collaboration: code review routing, automated testing strategies, and deployment pipeline optimization.',
            link: { text: 'Read existing diaries', href: '/en/blog/' },
          },
          {
            title: 'Indie Developer Toolkit Series',
            description:
              'Curating and reviewing tools, services, and open-source projects used in building this personal site.',
            link: { text: 'Browse toolkit', href: '/en/tools/' },
          },
          {
            title: 'Knowledge Base Deep Dives',
            description:
              'Writing systematic summaries on content architecture, SEO strategy, and accessibility design.',
            link: { text: 'Explore knowledge base', href: '/en/knowledge/' },
          },
        ],
      },
    ],
  },
} satisfies Record<Locale, NowCopy>;
