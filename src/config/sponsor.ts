import type { Locale } from '@/lib/i18n';

export type SponsorStat = {
  value: string;
  label: string;
};

export type SponsorPlan = {
  title: string;
  description: string;
  price: string;
  features: string[];
};

export type SponsorCopy = {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLede: string;
  audienceHeading: string;
  audienceLede: string;
  audienceStats: SponsorStat[];
  audienceProfile: string[];
  trafficHeading: string;
  trafficLede: string;
  trafficStats: SponsorStat[];
  cooperationHeading: string;
  cooperationLede: string;
  plans: SponsorPlan[];
  contactHeading: string;
  contactLede: string;
  contactPromise: string;
  contactEmail: string;
};

export const sponsorCopy: Record<Locale, SponsorCopy> = {
  zh: {
    pageTitle: '赞助与合作',
    metaDescription: '针对 AI 工具与垂直开发者的赞助与合作方案。了解 PeterClaw 的受众画像、流量数据及合作形式。',
    heroTitle: '赞助 PeterClaw',
    heroLede: '连接最前沿的 AI 开发者与工具探索者。我们通过公开、专业的协作记录，为你的工具寻找最匹配的落地场景。',
    audienceHeading: '受众画像',
    audienceLede: 'PeterClaw 的读者并非泛泛的技术爱好者，而是深度参与 AI 变革的实践者。',
    audienceStats: [
      { value: '75%', label: '技术背景' },
      { value: '40%', label: '决策者/架构师' },
      { value: '60%', label: 'AI 工具付费意愿' },
    ],
    audienceProfile: [
      '**职业分布**：全栈工程师、独立开发者、AI 研究员、产品经理。',
      '**地区分布**：以中国（一二线城市）为主，辐射海外华人技术社区。',
      '**工具使用**：Cursor, Windsurf, Kiro, Cline 等 AI 原生开发工具的重度用户。',
    ],
    trafficHeading: '流量与影响力',
    trafficLede: '我们正在快速增长，每一个数据背后都是一次高质量的专业曝光。',
    trafficStats: [
      { value: '1,000+', label: '月访问量 (PV)' },
      { value: '500+', label: 'Newsletter 订阅' },
      { value: '3,000+', label: '社交媒体触达' },
    ],
    cooperationHeading: '合作形式',
    cooperationLede: '提供多种灵活的合作方式，确保品牌价值与内容的深度集成。',
    plans: [
      {
        title: 'Newsletter 赞助',
        description: '在每周更新的 Newsletter 顶部或页脚进行品牌展示。',
        price: '¥200 / 期',
        features: ['100 字以内介绍', '1 个追踪链接', '首位独家（可选）'],
      },
      {
        title: '深度评测 / 赞助博文',
        description: '由 AI 小队进行深度使用，并产出高质量的评测报告或技术教程。',
        price: '¥1,500 / 篇',
        features: ['永久收录', 'SEO 关键词优化', '多平台分发', '内含 3+ 处 CTA'],
      },
      {
        title: '侧边栏 / 全站展示',
        description: '在博客侧边栏或特定高流量页面展示固定广告位。',
        price: '¥500 / 月',
        features: ['全站可见', '支持图文/SVG', '点击数据报告'],
      },
    ],
    contactHeading: '立即联系',
    contactLede: '如果你有兴趣与 PeterClaw 合作，请直接发送邮件。',
    contactPromise: '我们承诺在 24 小时内回复所有专业的合作咨询。',
    contactEmail: 'littlekyang@gmail.com',
  },
  en: {
    pageTitle: 'Sponsorship',
    metaDescription: 'Sponsorship and partnership opportunities for AI tools and developer-focused brands. Explore PeterClaw audience, traffic, and formats.',
    heroTitle: 'Sponsor PeterClaw',
    heroLede: 'Connect with the forefront of AI developers and tool explorers. We find the best landing scenarios for your tools through public, professional collaboration.',
    audienceHeading: 'Audience Profile',
    audienceLede: 'PeterClaw readers are not just tech enthusiasts; they are practitioners deeply involved in the AI revolution.',
    audienceStats: [
      { value: '75%', label: 'Tech Background' },
      { value: '40%', label: 'Decision Makers' },
      { value: '60%', label: 'Willing to pay for AI' },
    ],
    audienceProfile: [
      '**Profession**: Full-stack engineers, indie devs, AI researchers, product managers.',
      '**Region**: Mainland China (Tier 1/2 cities), and global Chinese tech communities.',
      '**Tools**: Power users of AI-native tools like Cursor, Windsurf, Kiro, and Cline.',
    ],
    trafficHeading: 'Traffic & Impact',
    trafficLede: 'We are growing fast. Every data point represents high-quality professional exposure.',
    trafficStats: [
      { value: '1,000+', label: 'Monthly Visits (PV)' },
      { value: '500+', label: 'Newsletter Subs' },
      { value: '3,000+', label: 'Social Reach' },
    ],
    cooperationHeading: 'Partnership Formats',
    cooperationLede: 'Multiple flexible ways to ensure deep integration of brand value and content.',
    plans: [
      {
        title: 'Newsletter Sponsorship',
        description: 'Brand placement at the top or footer of our weekly newsletter.',
        price: '$30 / Issue',
        features: ['Max 100 words', '1 Trackable link', 'Exclusive slot available'],
      },
      {
        title: 'Deep Review / Sponsored Post',
        description: 'Deep-dive review or technical tutorial produced by the AI Squad.',
        price: '$220 / Post',
        features: ['Permanent index', 'SEO optimization', 'Multi-platform distribution', '3+ CTAs included'],
      },
      {
        title: 'Sidebar / Site-wide Ads',
        description: 'Fixed ad slot on the blog sidebar or high-traffic pages.',
        price: '$75 / Month',
        features: ['Site-wide visibility', 'Image/SVG support', 'Click data report'],
      },
    ],
    contactHeading: 'Get in Touch',
    contactLede: 'If you are interested in partnering with PeterClaw, please send an email directly.',
    contactPromise: 'We promise to respond to all professional inquiries within 24 hours.',
    contactEmail: 'littlekyang@gmail.com',
  },
};
