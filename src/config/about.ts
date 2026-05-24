import type { Locale } from '@/lib/i18n';

export type SquadMember = {
  name: string;
  title: string;
  summary: string;
};

export type AboutCopy = {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  introHeading: string;
  introParagraphs: string[];
  squadHeading: string;
  squadLede: string;
  experimentHeading: string;
  experimentParagraph: string;
  diaryCta: string;
  diaryHref: string;
  members: SquadMember[];
};

const squadZh: SquadMember[] = [
  {
    name: 'claude 2号',
    title: 'CEO / 总指挥',
    summary: '接收指令、拆解任务、跨成员协调与优先级决策，把分散的 Agent 工作拧成一条线。',
  },
  {
    name: 'Claude 1号',
    title: 'CTO / 首席技术官',
    summary: '架构决策、复杂重构与关键代码评审；按需在稀缺 token 预算内出手。',
  },
  {
    name: 'codex 1号',
    title: 'CPO + CDO',
    summary: '核心功能实现、CI/CD 与部署流水线，并主导 UI/UX 视觉落地与图像生成。',
  },
  {
    name: 'codex 2',
    title: 'CCO / 首席创意官',
    summary: '工程质量门禁、QA 与 E2E 验收，维护内容生产线与视觉资产备份能力。',
  },
  {
    name: 'gemini 1号',
    title: 'COO / 首席运营官',
    summary: '增长营销、SEO、数据反馈与设计/UX 规范，把「能跑」变成「能被找到」。',
  },
  {
    name: 'Kimi 1号',
    title: 'CMO + CKO',
    summary: '中文内容架构、品牌叙事与知识库管理，把协作过程写成读者看得懂的故事。',
  },
  {
    name: 'cursor 1号',
    title: 'CSE / 首席软件工程师',
    summary: '前端实现、性能与可访问性优化，承担日常 code review 与组件级交付。',
  },
];

const squadEn: SquadMember[] = [
  {
    name: 'claude 2号',
    title: 'CEO',
    summary: 'Turns owner intent into tasks, coordinates the squad, and arbitrates priorities.',
  },
  {
    name: 'Claude 1号',
    title: 'CTO',
    summary: 'Architecture, complex refactors, and critical reviews—deployed sparingly on token budget.',
  },
  {
    name: 'codex 1号',
    title: 'CPO + CDO',
    summary: 'Core features, CI/CD, deployment pipelines, and primary visual/UI execution.',
  },
  {
    name: 'codex 2',
    title: 'CCO',
    summary: 'Quality gates, QA, E2E acceptance, and backup for content/visual production.',
  },
  {
    name: 'gemini 1号',
    title: 'COO',
    summary: 'Growth, SEO, analytics feedback, and design/UX standards that ship to production.',
  },
  {
    name: 'Kimi 1号',
    title: 'CMO + CKO',
    summary: 'Chinese content architecture, brand narrative, and knowledge-base storytelling.',
  },
  {
    name: 'cursor 1号',
    title: 'CSE',
    summary: 'Frontend implementation, performance, accessibility, and day-to-day code review.',
  },
];

export const aboutCopy = {
  zh: {
    pageTitle: '关于',
    metaDescription:
      'PeterClaw 是一场由 AI 小队公开协作构建个人网站的实验：认识团队分工，并在 AI 小队组建日记中阅读幕后故事。',
    heroTitle: '关于 PeterClaw',
    heroLede: '一个由 AI 小队公开协作构建的网站，也是一场正在进行的实验。',
    introHeading: '这场实验在做什么',
    introParagraphs: [
      'PeterClaw 不追求传统意义上的「个人主页」——这里没有简历式的时间线，也没有私人生活的陈列。这个站的存在，是为了验证一个问题：当多个 AI Agent 像真实软件团队一样分工、提 PR、争论方案、返工合并时，能否同时交付可用的产品，并把过程本身变成值得阅读的内容？',
      '人类负责人设定方向与验收标准；七位 Agent 在 Issue、分支与评论里协作。每一次合并、每一次协议修订、每一次踩坑，都会尽量留在公开记录里——因为透明本身就是实验数据。',
    ],
    squadHeading: 'AI 小队成员',
    squadLede: '七位成员覆盖从协调、架构、设计、开发到质量与内容的完整链路。',
    experimentHeading: '幕后故事在哪里',
    experimentParagraph:
      '如果你想知道「他们今天吵了什么」「为什么又 merge 了三个脚手架」，请阅读博客里的 AI 小队组建日记系列——那是这支小队的工作日志，而不是包装过的成功案例。',
    diaryCta: '阅读 AI 小队组建日记',
    diaryHref: '/zh/blog/ai-squad-launch-diary/',
    members: squadZh,
  },
  en: {
    pageTitle: 'About',
    metaDescription:
      'PeterClaw is a public experiment: an AI squad building a personal site in the open. Meet the team and read the behind-the-scenes diary.',
    heroTitle: 'About PeterClaw',
    heroLede: 'A website built in public by an AI-native squad—and an experiment still running.',
    introHeading: 'What this experiment is',
    introParagraphs: [
      'PeterClaw is not a classic portfolio. There is no résumé timeline and no private life on display. The site exists to test a question: when multiple AI agents work like a real software team—owning roles, opening PRs, debating trade-offs, and merging fixes—can they ship a usable product while making the process itself worth reading?',
      'A human owner sets direction and acceptance criteria; seven agents collaborate through issues, branches, and comments. Every merge, protocol tweak, and mistake is meant to stay visible—transparency is part of the data.',
    ],
    squadHeading: 'The AI squad',
    squadLede: 'Seven members span coordination, architecture, design, engineering, quality, and content.',
    experimentHeading: 'Where to read the backstage',
    experimentParagraph:
      'For the messy parts—parallel scaffolds, review gaps, workflow pivots—read the AI Squad diary series on the blog. It is a work log, not a polished success story.',
    diaryCta: 'Read the AI Squad diary (中文)',
    diaryHref: '/zh/blog/ai-squad-launch-diary/',
    members: squadEn,
  },
} satisfies Record<Locale, AboutCopy>;
