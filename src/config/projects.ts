import aiExperimentsCover from '@/assets/projects/ai-experiments.svg';
import articleChatCover from '@/assets/projects/article-chat.svg';
import peterclawNowCover from '@/assets/projects/peterclaw-now.svg';
import peterclawSquadCover from '@/assets/projects/peterclaw-squad.svg';
import peterclawWebsiteCover from '@/assets/projects/peterclaw-website.svg';
import type { Locale } from '@/lib/i18n';
import type { ImageMetadata } from 'astro';

export type ProjectTag = 'AI' | 'Web' | 'Tool';
export type ProjectStatus = 'shipped' | 'experiment';

export interface Project {
  title: string;
  description: Record<Locale, string>;
  tags: ProjectTag[];
  status: ProjectStatus;
  coverImage: ImageMetadata;
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
    metaDescription:
      'PeterClaw 已交付的公开项目：个人网站、AI 协作工作流、/now 状态页、文章问答与 Build in Public 系列。',
    heroTitle: '作品集 / Projects',
    heroLede:
      '这里展示已经上线或可访问的 PeterClaw 项目——含技术栈、交付状态、GitHub 与站内链接，方便快速了解能力与实验方向。',
    all: '全部',
    filtersLabel: '项目筛选',
    stack: '技术栈',
    github: 'GitHub',
    visit: '查看项目',
    status: {
      shipped: '已发布',
      experiment: '实验中',
    },
    stars: 'Stars',
    forks: 'Forks',
    language: '主语言',
    updated: '最近更新',
    githubStatsLoading: '正在获取 GitHub 数据',
  },
  en: {
    pageTitle: 'Projects',
    metaDescription:
      'Shipped PeterClaw work: the personal site, AI squad workflow, /now status page, article Q&A, and build-in-public series.',
    heroTitle: 'Projects',
    heroLede:
      'A portfolio of live PeterClaw projects with stacks, delivery status, GitHub links, and on-site demos you can open right away.',
    all: 'All',
    filtersLabel: 'Project filters',
    stack: 'Stack',
    github: 'GitHub',
    visit: 'View project',
    status: {
      shipped: 'Shipped',
      experiment: 'Experiment',
    },
    stars: 'Stars',
    forks: 'Forks',
    language: 'Language',
    updated: 'Updated',
    githubStatsLoading: 'Loading GitHub data',
  },
};

export type ProjectsCopy = (typeof projectsCopy)[Locale];

export const projects: Project[] = [
  {
    title: 'PeterClaw Website',
    description: {
      zh: '个人品牌与 Build in Public 主站：博客、知识库、工具箱、作品集与双语 SEO。',
      en: 'The personal brand hub with blog, knowledge base, tools, portfolio, and bilingual SEO.',
    },
    tags: ['Web', 'Tool'],
    status: 'shipped',
    coverImage: peterclawWebsiteCover,
    coverAlt: {
      zh: 'PeterClaw 个人网站界面抽象预览图',
      en: 'Abstract preview of the PeterClaw personal website interface',
    },
    url: 'https://peterclaw-website.vercel.app/',
    stack: ['Astro', 'TypeScript', 'Content Collections', 'Vercel'],
    github: 'https://github.com/yangliang2/peterclaw_website',
    githubRepo: 'yangliang2/peterclaw_website',
  },
  {
    title: 'PeterClaw AI Squad',
    description: {
      zh: '面向独立开发者的 AI 协作工作流产品页：Issue 驱动分工、并行 PR 与可审核交付。',
      en: 'Product page for an AI-native squad workflow: issue-driven delegation, parallel PRs, and reviewable delivery.',
    },
    tags: ['AI', 'Tool'],
    status: 'shipped',
    coverImage: peterclawSquadCover,
    coverAlt: {
      zh: '七个 AI Agent 协作网络抽象插图',
      en: 'Abstract network of seven collaborating AI agents',
    },
    url: {
      zh: '/zh/product/peterclaw-ai-squad/',
      en: '/en/product/peterclaw-ai-squad/',
    },
    stack: ['Multica', 'AI Agents', 'Git Worktrees', 'GitHub PRs'],
    github: 'https://github.com/yangliang2/peterclaw_website',
  },
  {
    title: 'PeterClaw /now',
    description: {
      zh: '受 nownownow 启发的实时状态页：当前项目重心、GitHub 提交与 AI 工具栈一览。',
      en: 'A nownownow-inspired status page for current focus, recent GitHub commits, and the live AI toolkit.',
    },
    tags: ['Web', 'Tool'],
    status: 'shipped',
    coverImage: peterclawNowCover,
    coverAlt: {
      zh: '/now 状态页布局抽象预览图',
      en: 'Abstract preview of the /now status page layout',
    },
    url: {
      zh: '/zh/now/',
      en: '/en/now/',
    },
    stack: ['Astro', 'Edge API', 'GitHub Events', 'CSS Grid'],
  },
  {
    title: 'Article AI Q&A',
    description: {
      zh: '博客与知识库文章内置的上下文问答：读者就当前文章提问，由 Edge API 返回摘要式回答。',
      en: 'In-article Q&A on blog and knowledge pages: readers ask about the current post via an Edge API answer flow.',
    },
    tags: ['AI', 'Web'],
    status: 'shipped',
    coverImage: articleChatCover,
    coverAlt: {
      zh: '文章内 AI 问答对话界面抽象预览图',
      en: 'Abstract preview of the in-article AI Q&A chat interface',
    },
    url: {
      zh: '/zh/blog/ai-squad-launch-diary/',
      en: '/en/blog/ai-squad-launch-diary/',
    },
    stack: ['Astro', 'Anthropic API', 'Vercel Edge', 'TypeScript'],
    github: 'https://github.com/yangliang2/peterclaw_website',
  },
  {
    title: 'AI Squad Launch Diary',
    description: {
      zh: '公开记录 7 个 AI Agent 建站全过程的系列日志：角色分工、协作协议与交付复盘。',
      en: 'A build-in-public diary series documenting seven AI agents shipping this site: roles, protocols, and retros.',
    },
    tags: ['AI', 'Web'],
    status: 'shipped',
    coverImage: aiExperimentsCover,
    coverAlt: {
      zh: 'AI 小队建站日记系列抽象封面图',
      en: 'Abstract cover for the AI squad website build diary series',
    },
    url: {
      zh: '/zh/blog/ai-squad-launch-diary/',
      en: '/en/blog/ai-squad-launch-diary/',
    },
    stack: ['Astro Content', 'Markdown', 'Bilingual i18n'],
  },
];
