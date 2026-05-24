import type { Locale } from '@/lib/i18n';

export type ProjectTag = 'AI' | 'Web' | 'Tool';

export interface Project {
  name: string;
  description: Record<Locale, string>;
  tags: ProjectTag[];
  stack: string[];
  github?: string;
  demo?: string | Record<Locale, string>;
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
    demo: 'Demo'
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
    demo: 'Demo'
  }
} satisfies Record<Locale, Record<string, string>>;

export const projects: Project[] = [
  {
    name: 'PeterClaw Website',
    description: {
      zh: '个人品牌与公开协作网站，承载博客、知识库、关于页和当前作品集。',
      en: 'The personal brand and build-in-public website that hosts the blog, knowledge base, about page, and this portfolio.'
    },
    tags: ['Web', 'Tool'],
    stack: ['Astro', 'TypeScript', 'Content Collections', 'Vercel'],
    github: 'https://github.com/yangliang2/peterclaw_website',
    demo: 'https://peterclaw.com'
  },
  {
    name: 'PeterClaw AI Squad',
    description: {
      zh: '基于 Multica 的多 Agent 协作工作流：Issue 驱动任务分发、角色分工、PR 评审与跨 Agent 交接协议。',
      en: 'A Multica-powered multi-agent workflow with issue-driven delegation, role boundaries, PR review, and cross-agent handoff protocols.'
    },
    tags: ['AI', 'Tool'],
    stack: ['Multica', 'AI Agents', 'Git Worktrees', 'GitHub PRs'],
    demo: {
      zh: '/zh/about/',
      en: '/en/about/'
    }
  },
  {
    name: 'AI Squad Launch Diary',
    description: {
      zh: '记录 AI 团队角色分工、协作协议和建站过程的系列内容实验。',
      en: 'A content experiment documenting AI team roles, collaboration protocols, and the website-building process.'
    },
    tags: ['AI', 'Web'],
    stack: ['Astro Content', 'Markdown', 'AI Workflow'],
    demo: {
      zh: '/zh/blog/ai-squad-launch-diary/',
      en: '/en/blog/'
    }
  },
  {
    name: 'Content Architecture Playbook',
    description: {
      zh: '面向网站内容生产的结构化知识库样板，用于沉淀发布流程和长期主题。',
      en: 'A structured knowledge-base playbook for content operations, publishing flow, and durable editorial themes.'
    },
    tags: ['Tool', 'Web'],
    stack: ['Knowledge Base', 'Markdown', 'Information Architecture'],
    demo: {
      zh: '/zh/knowledge/content-architecture/',
      en: '/en/knowledge/content-architecture/'
    }
  },
  {
    name: 'Multi-Agent Collaboration Notes',
    description: {
      zh: '围绕多 Agent 分工、路由和自动化的公开实验记录。',
      en: 'Public notes around multi-agent delegation, routing, and automation experiments.'
    },
    tags: ['AI', 'Tool'],
    stack: ['AI Agents', 'Workflow Design', 'Automation'],
    demo: {
      zh: '/zh/blog/ai-diary-005-multi-agent-collaboration/',
      en: '/en/blog/'
    }
  }
];
