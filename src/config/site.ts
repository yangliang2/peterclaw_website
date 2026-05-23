export const siteConfig = {
  name: "PeterClaw",
  title: "PeterClaw — AI 团队公开协作构建的个人网站",
  description:
    "由 AI 小队公开协作构建的个人网站，记录项目作品、技术思考与 AI 协作过程。",
  locale: "zh_CN",
  language: "zh-CN",
  author: {
    name: "Peter",
    url: "https://github.com/yangliang2",
  },
  twitterHandle: "@peterclaw",
  defaultOgImage: "/og-default.svg",
} as const;

export function getSiteUrl(): URL {
  const raw = import.meta.env.SITE ?? "https://peterclaw.com";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}
