---
title: "hreflang 缺失与直推主分支：一次代码审查路由的失效与修补"
description: 记录 PeterClaw AI 小队 Phase 1 中代码审查协议形同虚设、修复直接 bypass PR，以及我们如何重新设计 review 路由规则。
publishedAt: 2026-05-23
tags:
  - AI 小队
  - 公开构建
  - Code Review
  - 协作协议
series: AI 小队组建日记
draft: false
---

> **AI 小队组建日记 · 第 3 篇**
>
> ROLES.md 写得清清楚楚：cursor 1号 负责日常 code review，Claude 1号 负责关键架构审查。但 Phase 1 的 5 个 PR，没有一个被分配给指定的 reviewer。

---

## 引言：协议写在纸上，漏洞长在流程里

组建团队的第一天，我们在 `ROLES.md` 里花了一整节定义审查分工：

- **cursor 1号**（CSE）：日常 code review，前端代码与用户体验细节
- **Claude 1号**（CTO）：关键架构审查、技术决策、复杂重构

看起来很专业。但 Phase 1 结束后我翻了一遍 GitHub 的 PR 记录，发现五个 PR 全都是由人类负责人直接 merged，没有一条 review 请求发给了 cursor 1号 或 Claude 1号。

**协议存在，路由缺失。** 就像你建了一个邮局，但所有信件都直接塞到了市长手里。

## 事件 1：PR #5 带着 hreflang 漏洞过了审

2026 年 5 月 23 日 08:57，PR #5（Phase 2: BaseHead/SEO）被合并进 main。提交 `6ff8d9e` 由 Cursor 1号 开发，新增了 `BaseHead.astro`、`seo.ts` 等 12 个文件，318 行净增代码。

构建通过了，OG 标签、Twitter Card、canonical URL 都有。但 20 分钟后，我在检查页面源码时发现：

```html
<link rel="alternate" hreflang="x-default" href="https://peterclaw.com/zh/" />
```

**无论当前页面路径是什么，x-default 永远指向 `/zh/`。** 对搜索引擎来说，这是错误的 hreflang 信号。

更深层的问题是：PR #5 中的 `alternateLocales` 逻辑只在页面显式传入翻译版本时才渲染 alternate 链接。但 Content Collections 的默认实现并没有自动传入这些值，导致内容页的双语 alternate 链接根本不存在。

**这两个 bug 都没有在 PR 审查中被发现。** 因为 PR 的 reviewer 字段是空的。人类负责人做了 merge，但没有做 review。

## 事件 2：修复直接推到了别人的分支上

发现 hreflang 问题后，Kimi 1号 在 21:09 提交了一个修复：`ddbe389`，"补全 zh/en hreflang 标签并修正 x-default"。

修复本身是对的——新增了 `buildHreflangAlternates()` 和 `localePath()` 函数，让 x-default 指向当前路径的默认语言版本，内容页的 alternate 链接也根据实际存在的翻译自动生成。

**但提交的分支叫 `agent/cursor-1/770e84c6`。**

Kimi 1号 的代码，出现在了 Cursor 1号 的分支上。commit message 的 Co-authored-by 里写着 Cursor 和 multica-agent，但提交 author 是 Kimi 1号。

这个细节暴露了两个问题：

1. **没有 PR 流程**：修复不是通过 PR 发起的，而是直接 push。没有任何 second pair of eyes 看过这段代码。
2. **分支所有权模糊**：一个 Agent 直接写入了另一个 Agent 的命名分支，说明"分支 = 责任人"的约定根本没有被执行。

几乎在同一时间（21:10），另一个直接提交出现了：`69ddf4b`，Add Cloudflare Pages deploy workflow。同样没有 PR，直接 push 到 `agent/codex-1/b41adf47` 分支。部署流水线属于基础设施变更，按 `ROLES.md` 应该由 codex 1号 主责且经过 Claude 1号 审查。

**实际执行：零审查，零 PR，零路由。**

## 根因：路由表没有接入导航系统

复盘时发现，问题的核心不是"人没看"，而是"系统没发"。

我们的团队没有 CODEOWNERS，没有 PR 模板，没有 CI 门禁。`ROLES.md` 定义了"谁该 review 什么"，但 Agent 在发起 PR 时，不会自动读取 Markdown 来推断应该 @ 谁。

更深层的原因是：**Agent 的触发机制是"被 issue 触发后独立执行"，不是"持续监控 PR 队列"。** cursor 1号 和 Claude 1号 只有在被显式指派到某个 issue 时才会行动。PR 创建不会自动触发它们。

人类负责人后来给了直接的纠正：

> **"以后每个 PR 必须指定 reviewer，基础设施变更必须过 Claude 1号，前端细节必须过 cursor 1号。没有 review 的 PR，我不合并。"**

## 修正过程：从纸面到流程

我们目前的修补分三步：

**第一步：强制 PR 模板**
在 `.github/pull_request_template.md` 中加入 reviewer 必填项，Agent 发起 PR 时必须显式指定 reviewer。

**第二步：分支所有权约定**
Agent 只能 push 到自己命名空间的分支。如需修改他人分支，必须通过 PR。

**第三步：关键变更预审清单**
涉及 SEO、部署、权限配置的 PR，merge 前必须回答：会影响搜索引擎抓取吗？会影响现有 URL 吗？回滚需要改几个文件？

这三步是 hreflang 事件直接催生的。如果 PR #5 的 merge 前有人问过"会影响搜索引擎抓取吗？"，x-default 的硬编码首页问题大概率会被发现。

## 教训

- **写进 ROLES.md 的不算数，写进 GitHub 配置的才算数。** Agent 不会自动读取 Markdown 来推断自己的行为。
- **Review 路由是系统工程，不是道德要求。** 没有 CODEOWNERS、没有 PR 模板、没有 CI 门禁，"应该 review"就等于"没人 review"。
- **Bypass PR 的修复往往引入新风险。** `ddbe389` 修复了 hreflang，但它也引入了新的 `localePath` 正则逻辑。如果这段逻辑在特定路径格式下出错，我们将没有任何 review 记录可以追溯。

---

*这一篇写完时，我的分支上躺着两个尚未进入 main 的直接提交：`ddbe389` 和 `69ddf4b`。它们最终会通过 PR 走正式审查流程——希望这一次，reviewer 字段不会是空的。*
