import type { Locale } from '@/lib/i18n';

export type SquadMember = {
  name: string;
  title: string;
  summary: string;
};

type MissionPoint = {
  title: string;
  description: string;
};

type ContactLink = {
  label: string;
  href: string;
};

export type AboutCopy = {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  heroBadge: string;
  heroStats: { value: string; label: string }[];
  introHeading: string;
  introParagraphs: string[];
  squadHeading: string;
  squadLede: string;
  workflowHeading: string;
  workflowSteps: string[];
  missionHeading: string;
  missionLede: string;
  missionPoints: MissionPoint[];
  experimentHeading: string;
  experimentParagraph: string;
  diaryCta: string;
  diaryHref: string;
  contactHeading: string;
  contactParagraph: string;
  contactLinks: ContactLink[];
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
    heroLede: 'Peter Claw 与七位 AI Agent 在公开协作中写作、设计和交付产品：这是一个网站，也是一场持续发生的团队实验。',
    heroBadge: 'HUMAN DIRECTION / AI SQUAD DELIVERY',
    heroStats: [
      { value: '1', label: '人类发起人' },
      { value: '7', label: 'AI Squad 成员' },
      { value: '∞', label: '公开迭代' },
    ],
    introHeading: 'Peter Claw 为什么组建 AI 团队',
    introParagraphs: [
      'Peter Claw 想验证的不是「AI 能不能写一段代码」，而是它能否成为长期协作的创作团队：理解方向、分担专业角色、在反馈后重做，并持续交付读者真正会使用的内容与产品。',
      '因此，PeterClaw 不只是传统个人主页。人类负责人提出问题、设定边界并做最终判断；七位 Agent 在 Issue、分支、评审与部署中接力。每次选择、碰撞和修订，都构成这个站点的真实成长记录。',
    ],
    squadHeading: 'AI 小队成员',
    squadLede: 'PeterClaw Squad 像一支小型产品团队运作：七个清晰岗位覆盖方向拆解、技术落地、品牌传播与交付质量。',
    workflowHeading: '一项想法如何上线',
    workflowSteps: [
      '人类负责人定义问题、边界与验收标准。',
      'Squad 拆解任务，在独立分支实现、讨论与评审。',
      '通过构建和验证的成果合并发布，经验沉淀为公开内容。',
    ],
    missionHeading: '这个网站想传递什么',
    missionLede: '把 AI 协作从口号变成可观察、可检验、可复用的实践。',
    missionPoints: [
      {
        title: '公开过程',
        description: '展示决策、失败与修正，让读者看到成果背后的协作证据。',
      },
      {
        title: '可用交付',
        description: '以真实网站、工具与文章检验创意，而不是停留在演示与承诺。',
      },
      {
        title: '共享方法',
        description: '把工作流和经验整理成他人也能带走、改造和继续实验的知识。',
      },
    ],
    experimentHeading: '幕后故事在哪里',
    experimentParagraph:
      '如果你想知道「他们今天吵了什么」「为什么又 merge 了三个脚手架」，请阅读博客里的 AI 小队组建日记系列——那是这支小队的工作日志，而不是包装过的成功案例。',
    diaryCta: '阅读 AI 小队组建日记',
    diaryHref: '/zh/blog/ai-squad-launch-diary/',
    contactHeading: '和 PeterClaw 保持联系',
    contactParagraph: '关注构建进展、浏览源码，或从 RSS 获取最新文章。每一次反馈都会成为下一轮迭代的输入。',
    contactLinks: [
      { label: 'GitHub', href: 'https://github.com/yangliang2' },
      { label: 'X / Twitter', href: 'https://twitter.com/peterclaw' },
      { label: '赞助合作', href: '/zh/sponsor/' },
      { label: 'RSS', href: '/rss.xml' },
    ],
    members: squadZh,
  },
  en: {
    pageTitle: 'About',
    metaDescription:
      'PeterClaw is a public experiment: an AI squad building a personal site in the open. Meet the team and read the behind-the-scenes diary.',
    heroTitle: 'About PeterClaw',
    heroLede: 'Peter Claw and seven AI agents write, design, and ship in public. This is a website and an ongoing experiment in how a modern team can work.',
    heroBadge: 'HUMAN DIRECTION / AI SQUAD DELIVERY',
    heroStats: [
      { value: '1', label: 'Human founder' },
      { value: '7', label: 'AI squad members' },
      { value: '∞', label: 'Open iterations' },
    ],
    introHeading: 'Why Peter Claw formed an AI team',
    introParagraphs: [
      'Peter Claw is testing more than whether AI can write a snippet of code. The question is whether it can become a durable creative team: understanding direction, owning specialties, revising after feedback, and repeatedly shipping things readers can actually use.',
      'PeterClaw is therefore more than a conventional personal site. A human owner frames the problems, sets boundaries, and makes final calls; seven agents carry work through issues, branches, reviews, and deployment. Each choice, conflict, and revision is part of the story.',
    ],
    squadHeading: 'The AI squad',
    squadLede: 'PeterClaw Squad operates like a compact product studio: seven defined roles spanning direction, engineering, communication, and delivery quality.',
    workflowHeading: 'How an idea ships',
    workflowSteps: [
      'The human owner defines the problem, guardrails, and acceptance criteria.',
      'The squad decomposes the work, implementing and reviewing on dedicated branches.',
      'Validated work ships, while the lessons become public content for the next iteration.',
    ],
    missionHeading: 'What this site stands for',
    missionLede: 'Turning AI collaboration from a claim into an observable, testable, reusable practice.',
    missionPoints: [
      {
        title: 'Open process',
        description: 'Show decisions, failures, and revisions so the work behind each result remains visible.',
      },
      {
        title: 'Useful delivery',
        description: 'Test ideas through real pages, tools, and writing instead of stopping at demos or promises.',
      },
      {
        title: 'Shared methods',
        description: 'Distill workflows and lessons into knowledge others can adapt and build upon.',
      },
    ],
    experimentHeading: 'Where to read the backstage',
    experimentParagraph:
      'For the messy parts—parallel scaffolds, review gaps, workflow pivots—read the AI Squad diary series on the blog. It is a work log, not a polished success story.',
    diaryCta: 'Read the AI Squad diary (中文)',
    diaryHref: '/zh/blog/ai-squad-launch-diary/',
    contactHeading: 'Keep in touch with PeterClaw',
    contactParagraph: 'Follow the build, explore the source, or subscribe through RSS. Each piece of feedback can inform the next iteration.',
    contactLinks: [
      { label: 'GitHub', href: 'https://github.com/yangliang2' },
      { label: 'X / Twitter', href: 'https://twitter.com/peterclaw' },
      { label: 'Sponsorship', href: '/en/sponsor/' },
      { label: 'RSS', href: '/rss.xml' },
    ],
    members: squadEn,
  },
} satisfies Record<Locale, AboutCopy>;
