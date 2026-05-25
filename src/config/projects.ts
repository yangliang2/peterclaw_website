import type { Locale } from '@/lib/i18n';

export type ProjectTag = 'AI' | 'Web' | 'Tool';
export type ProjectStatus = 'shipped' | 'experiment';

export interface Project {
  title: string;
  description: Record<Locale, string>;
  tags: ProjectTag[];
  status: ProjectStatus;
  coverImage: string;
  coverAlt: Record<Locale, string>;
  url: string | Record<Locale, string>;
  stack: string[];
  github?: string;
  githubRepo?: string;
}

export const projectTags = ['AI', 'Web', 'Tool'] as const satisfies readonly ProjectTag[];

export const projectsCopy = {
  zh: {
    pageTitle: '作品集',
    metaDescription: 'PeterClaw 的项目与实验作品集，包含网站、AI 协作实验和生产力工具。',
    heroTitle: '作品集 / Projects',
    heroLede: '这里汇集 PeterClaw 已经落地的公开项目、AI 实验和工具原型，展示技术栈、交付形态和可访问链接。',
    all: '全部',
    filtersLabel: '项目筛选',
    stack: '技术栈',
    github: 'GitHub',
    visit: '查看项目',
    status: {
      shipped: '已发布',
      experiment: '实验中'
    },
    stars: 'Stars',
    forks: 'Forks',
    language: '主语言',
    updated: '最近更新',
    githubStatsLoading: '正在获取 GitHub 数据'
  },
  en: {
    pageTitle: 'Projects',
    metaDescription: 'A portfolio of PeterClaw projects and experiments across websites, AI collaboration, and productivity tools.',
    heroTitle: 'Projects',
    heroLede: 'A focused view of shipped PeterClaw work, AI-native experiments, and tool prototypes with their stacks and public links.',
    all: 'All',
    filtersLabel: 'Project filters',
    stack: 'Stack',
    github: 'GitHub',
    visit: 'View project',
    status: {
      shipped: 'Shipped',
      experiment: 'Experiment'
    },
    stars: 'Stars',
    forks: 'Forks',
    language: 'Language',
    updated: 'Updated',
    githubStatsLoading: 'Loading GitHub data'
  }
};

export type ProjectsCopy = (typeof projectsCopy)[Locale];

export const projects: Project[] = [
  {
    title: 'PeterClaw Website',
    description: {
      zh: '个人品牌与公开协作网站，承载博客、知识库、关于页和当前作品集。',
      en: 'The personal brand and build-in-public website that hosts the blog, knowledge base, about page, and this portfolio.'
    },
    tags: ['Web', 'Tool'],
    status: 'shipped',
    coverImage: '/projects/peterclaw-website.svg',
    coverAlt: {
      zh: 'PeterClaw Website 页面界面抽象插图',
      en: 'Abstract interface illustration for PeterClaw Website'
    },
    url: 'https://peterclaw.com',
    stack: ['Astro', 'TypeScript', 'Content Collections', 'Vercel'],
    github: 'https://github.com/yangliang2/peterclaw_website',
    githubRepo: 'yangliang2/peterclaw_website'
  },
  {
    title: 'PeterClaw Squad',
    description: {
      zh: '7 个 AI agents 协作开发网站的实验：Issue 驱动任务分发、角色分工、PR 评审与跨 Agent 交接。',
      en: 'An experiment in which seven AI agents build this website together through issue-driven delegation, PR review, and handoffs.'
    },
    tags: ['AI', 'Tool'],
    status: 'experiment',
    coverImage: '/projects/peterclaw-squad.svg',
    coverAlt: {
      zh: '七个 AI agents 协作网络抽象插图',
      en: 'Abstract network illustration of seven collaborating AI agents'
    },
    url: {
      zh: '/zh/about/',
      en: '/en/about/'
    },
    stack: ['Multica', 'AI Agents', 'Git Worktrees', 'GitHub PRs'],
  },
  {
    title: 'AI Squad Launch Diary',
    description: {
      zh: '记录 AI 团队角色分工、协作协议和建站过程的系列内容实验。',
      en: 'A content experiment documenting AI team roles, collaboration protocols, and the website-building process.'
    },
    tags: ['AI', 'Web'],
    status: 'shipped',
    coverImage: '/projects/ai-experiments.svg',
    coverAlt: {
      zh: 'AI 实验发布日志抽象插图',
      en: 'Abstract illustration for an AI experiment launch diary'
    },
    url: {
      zh: '/zh/blog/ai-squad-launch-diary/',
      en: '/en/blog/'
    },
    stack: ['Astro Content', 'Markdown', 'AI Workflow'],
  },
  {
    title: 'Content Architecture Playbook',
    description: {
      zh: '面向网站内容生产的结构化知识库样板，用于沉淀发布流程和长期主题。',
      en: 'A structured knowledge-base playbook for content operations, publishing flow, and durable editorial themes.'
    },
    tags: ['Tool', 'Web'],
    status: 'shipped',
    coverImage: '/projects/peterclaw-website.svg',
    coverAlt: {
      zh: '结构化内容页面抽象插图',
      en: 'Abstract illustration of structured content pages'
    },
    url: {
      zh: '/zh/knowledge/content-architecture/',
      en: '/en/knowledge/content-architecture/'
    },
    stack: ['Knowledge Base', 'Markdown', 'Information Architecture'],
  },
  {
    title: 'Multi-Agent Collaboration Notes',
    description: {
      zh: '围绕多 Agent 分工、路由和自动化的公开实验记录。',
      en: 'Public notes around multi-agent delegation, routing, and automation experiments.'
    },
    tags: ['AI', 'Tool'],
    status: 'experiment',
    coverImage: '/projects/ai-experiments.svg',
    coverAlt: {
      zh: '多 Agent 协作记录抽象插图',
      en: 'Abstract illustration of multi-agent collaboration notes'
    },
    url: {
      zh: '/zh/blog/ai-diary-005-multi-agent-collaboration/',
      en: '/en/blog/'
    },
    stack: ['AI Agents', 'Workflow Design', 'Automation'],
  }
];
