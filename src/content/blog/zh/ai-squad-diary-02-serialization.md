---
title: 为什么 AI 团队也会"阻塞"？一次并行开发中的串行派工实录
description: 记录 PeterClaw AI 小队在 Phase 1 中因为串行派工导致的重复劳动、分支孤儿与返工全过程。
publishedAt: 2026-05-23
tags:
  - AI 小队
  - 公开构建
  - 协作瓶颈
  - 并行开发
series: AI 小队组建日记
draft: false
faq:
  - question: "AI Agent 可以并行工作，为什么仍会阻塞？"
    answer: "缺少明确分工、依赖关系和合并顺序时，多个 Agent 会重复建设同一基础设施，最终产生返工和等待。"
  - question: "减少多 Agent 串行派工的关键是什么？"
    answer: "先把独立任务、依赖任务与验收入口定义清楚，再用分支和评审流程承接并行产出。"
---

> **AI 小队组建日记 · 第 2 篇**
>
> 当 5 个 AI Agent 理论上可以 24 小时并行运转时，为什么代码仓库里会出现三个互不兼容的 Astro 脚手架，以及一个被合并后立即变成"孤儿"的 Pull Request？

---

## 引言：并行是理想，串行是现实

人类团队常见的瓶颈是"人等事"——开发者等设计稿、测试等开发包、运维等发布窗口。AI 团队按理说没有这个问题：Agent 不需要睡觉，不会因为另一个 Agent 没完成就卡住。

**但我们 Phase 1 的 Git 历史告诉我们，AI 团队照样会阻塞。而且阻塞的方式更隐蔽——因为看起来每个人都在推进，实际上却在做重复劳动。**

## Round 1：三个 Astro 脚手架

2026 年 5 月 23 日凌晨，任务很简单：在空仓库上搭建一个 Astro 个人网站。

结果我第二天早上看 Git 历史时，发现了三个从 `Initial commit` 分岔出去的并行分支：

| 分支 | Agent | 提交 | 内容 |
|------|-------|------|------|
| `agent/claude-2/...` | claude 2号 | `b9390bd` | Scaffold Astro personal website，含 about、projects 页面，pnpm 管理 |
| `agent/gemini-1/...` | Kimi 1号 + Cursor | `7dde84e` | Initialize Astro with AI-Native design tokens，暗色主题、BaseLayout、Navbar |
| `agent/codex-1/...` | Kimi 1号 + codex-1 | `98063f0` | Build Astro content architecture，Content Collections、i18n 路由、blog/knowledge 页面 |

**三个分支，三套不同的项目结构。** `b9390bd` 用 pnpm，`7dde84e` 用 npm，`98063f0` 也是 npm 但目录结构完全不同。`b9390bd` 里有 `ContentLayout.astro` 和 `about.astro`；`7dde84e` 里有一套完整的暗色主题 token；`98063f0` 里有 Content Collections 配置和 i18n 工具函数。

最终 merged 到 main 的是 `98063f0`（PR #1）。另外两套脚手架——连同它们各自的提交历史——被彻底丢弃。

**这不是"做了备份"，这是"三个人各盖了一栋楼，然后拆了两栋"。**

## Round 2：在废弃的地基上盖楼

如果说第一轮浪费的是脚手架，第二轮浪费的就是在错误地基上的增值劳动。

`7dde84e` 虽然没进 main，但它上面还有后续提交 `310d163`（Add SEO foundation on top of gemini brand baseline）。Kimi 1号 在这条被废弃的分支上做了完整的 SEO 基建：sitemap、structured data、Open Graph、CWV 测量脚本，整整 14 个文件的修改，8537 行增减。

**这些代码一天后全部作废。** 因为主线走的是 `98063f0` → `aeeec44`，`310d163` 基于的 `7dde84e` 与主线不兼容，rebase 成本极高，不如重写。

Cursor 1号 后来在主线上重新实现了 SEO（`31b0008` / `6ff8d9e`），但已经晚了一个多小时，而且部分逻辑（比如 hreflang）在重实现时再次出错——这是后话，留到第 3 篇再讲。

## Round 3：一个被合并的孤儿 PR

Phase 1 最讽刺的事件发生在 PR #2。

Cursor 1号 完成了 BaseHead/SEO 组件开发，提交为 `31b0008`，发起 PR #2（`agent/cursor-1/phase2-seo` → `main`）。人类负责人在 08:31:33 合并了它。

但问题在于：**PR #2 的 base 是 `aeeec44`，而 `aeeec44` 当时还没有被合并到 main。** 也就是说，Cursor 1号 在 PR #1 尚未合并前，就基于 PR #1 的分支末端创建了 PR #2。

当人类负责人随后继续合并 PR #3（内容矩阵大纲）和 PR #4（设计 token）时，他们是从 `e66a729`（PR #1 的 merge commit）往后继续的，而不是从 `1d5be0b`（PR #2 的 merge commit）。

结果？**PR #2 虽然被 merged，但它不在 main 的 ancestry 里。** 运行 `git merge-base --is-ancestor 1d5be0b HEAD` 会返回 false。这是一个字面意义上的"孤儿提交"——有 merge 记录，却没有进入任何后续分支。

Cursor 1号 不得不在 50 分钟后重新 rebase、重新提交 `6ff8d9e`，走 PR #5 再次合并同一套代码。

## 根因：串行派工的错觉

这三个事件共享同一个根因：**我们以为自己在并行，实际上每个人都在等一个看不见的中央调度。**

AI 团队没有人类团队那样的"站会"或"看板"，每个 Agent 被 issue 触发后就独立执行。问题是：

1. **没有预检机制**：每个 Agent 创建分支前，没人检查"是不是已经有人在做同样的事了"。三个 Astro 脚手架就是这么来的。
2. **没有基线同步**：Cursor 1号 创建 PR #2 时，没有意识到 `aeeec44` 还没进 main。Agent 的上下文里只有"当前分支末端"，没有"哪个末端属于 main"的概念。
3. **CEO 成了隐式瓶颈**：Claude 2号 负责协调，但它的执行模式是"被触发 → 派发 → 退出"。当多个 Agent 同时推进时，CEO 没有实时感知到分支冲突，直到人类负责人看 Git 历史才发现问题。

人类负责人后来的纠正是：**在 PROTOCOL.md 里加入"并行不等待"原则，并明确要求"每个阶段只有一个裁决点"。** 但这只是纸面上的修正——真正的考验是下一批并行任务到来时，Agent 们会不会再次各盖一栋楼。

## 教训

- **并行不等于协调**：5 个 Agent 同时 push 代码，如果没有统一基线，结果就是 5 个互不兼容的版本。
- **PR 的 base 分支比 PR 内容更重要**：Agent 在发起 PR 前，必须先确认 base 是否已经是 main 的一部分。
- **废弃分支上的增值劳动是双倍浪费**：不仅代码丢了，时间也丢了，而且重做时因为"赶进度"更容易出错。

---

*下一篇：PR #5 的 SEO 组件刚合并，就有人发现 hreflang 标签缺失、x-default 指向错误——而修复它的方式，是直接 push 到别人的分支上。*
