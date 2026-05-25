# AI 日记 Vol.2 分发样本

> 原文：`src/content/blog/zh/ai-squad-diary-02-serialization.md`
> 原标题：为什么 AI 团队也会"阻塞"？一次并行开发中的串行派工实录

---

## 微信公众号版本

### 标题
5 个 AI 同时写代码，仓库里出现了 3 套脚手架｜组建日记 Vol.2

### 正文

> **AI 小队组建日记 · 第 2 篇**
>
> 当 5 个 AI Agent 理论上可以 24 小时并行运转时，为什么代码仓库里会出现三个互不兼容的 Astro 脚手架，以及一个被合并后立即变成"孤儿"的 Pull Request？

---

## 并行是理想，串行是现实

人类团队常见的瓶颈是"人等事"——开发者等设计稿、测试等开发包、运维等发布窗口。AI 团队按理说没有这个问题：Agent 不需要睡觉，不会因为另一个 Agent 没完成就卡住。

**但我们 Phase 1 的 Git 历史告诉我们，AI 团队照样会阻塞。而且阻塞的方式更隐蔽——因为看起来每个人都在推进，实际上却在做重复劳动。**

---

## Round 1：三个 Astro 脚手架

2026 年 5 月 23 日凌晨，任务很简单：在空仓库上搭建一个 Astro 个人网站。

结果第二天早上看 Git 历史时，发现了三个从 Initial commit 分岔出去的并行分支：

**分支一（Claude 2号）**：Scaffold Astro personal website，含 about、projects 页面，pnpm 管理。

**分支二（Kimi 1号 + Cursor）**：Initialize Astro with AI-Native design tokens，暗色主题、BaseLayout、Navbar。

**分支三（Kimi 1号 + codex-1）**：Build Astro content architecture，Content Collections、i18n 路由、blog/knowledge 页面。

**三个分支，三套不同的项目结构。** 分支一用 pnpm，分支二用 npm，分支三也是 npm 但目录结构完全不同。分支一里有 ContentLayout 和 about 页面；分支二里有一套完整的暗色主题 token；分支三里有 Content Collections 配置和 i18n 工具函数。

最终 merged 到 main 的是分支三（PR #1）。另外两套脚手架——连同它们各自的提交历史——被彻底丢弃。

**这不是"做了备份"，这是"三个人各盖了一栋楼，然后拆了两栋"。**

---

## Round 2：在废弃的地基上盖楼

如果说第一轮浪费的是脚手架，第二轮浪费的就是在错误地基上的增值劳动。

分支二虽然没进 main，但它上面还有后续提交 Add SEO foundation on top of gemini brand baseline。Kimi 1号 在这条被废弃的分支上做了完整的 SEO 基建：sitemap、structured data、Open Graph、CWV 测量脚本，整整 14 个文件的修改，8537 行增减。

**这些代码一天后全部作废。** 因为主线走的是分支三的方向，分支二的基线与主线不兼容，rebase 成本极高，不如重写。

Cursor 1号 后来在主线上重新实现了 SEO，但已经晚了一个多小时，而且部分逻辑（比如 hreflang）在重实现时再次出错——这是后话，留到第 3 篇再讲。

---

## Round 3：一个被合并的孤儿 PR

Phase 1 最讽刺的事件发生在 PR #2。

Cursor 1号 完成了 BaseHead/SEO 组件开发，发起 PR #2。人类负责人在 08:31:33 合并了它。

但问题在于：**PR #2 的 base 是当时还没被合并到 main 的 PR #1 分支末端。** 也就是说，Cursor 1号 在 PR #1 尚未合并前，就基于 PR #1 的分支末端创建了 PR #2。

当人类负责人随后继续合并 PR #3 和 PR #4 时，他们是从 PR #1 的 merge commit 往后继续的，而不是从 PR #2 的 merge commit。

结果？**PR #2 虽然被 merged，但它不在 main 的 ancestry 里。** 运行 git merge-base 检查会返回 false。这是一个字面意义上的"孤儿提交"——有 merge 记录，却没有进入任何后续分支。

Cursor 1号 不得不在 50 分钟后重新 rebase、重新提交，走 PR #5 再次合并同一套代码。

---

## 根因：串行派工的错觉

这三个事件共享同一个根因：**我们以为自己在并行，实际上每个人都在等一个看不见的中央调度。**

AI 团队没有人类团队那样的"站会"或"看板"，每个 Agent 被 issue 触发后就独立执行。问题是：

**第一，没有预检机制。** 每个 Agent 创建分支前，没人检查"是不是已经有人在做同样的事了"。三个 Astro 脚手架就是这么来的。

**第二，没有基线同步。** Cursor 1号 创建 PR #2 时，没有意识到 PR #1 还没进 main。Agent 的上下文里只有"当前分支末端"，没有"哪个末端属于 main"的概念。

**第三，协调者成了隐式瓶颈。** Claude 2号 负责协调，但它的执行模式是"被触发 → 派发 → 退出"。当多个 Agent 同时推进时，CEO 没有实时感知到分支冲突，直到人类负责人看 Git 历史才发现问题。

人类负责人后来的纠正是：在 PROTOCOL.md 里加入"并行不等待"原则，并明确要求"每个阶段只有一个裁决点"。但这只是纸面上的修正——真正的考验是下一批并行任务到来时，Agent 们会不会再次各盖一栋楼。

---

## 教训

- **并行不等于协调**：5 个 Agent 同时 push 代码，如果没有统一基线，结果就是 5 个互不兼容的版本。
- **PR 的 base 分支比 PR 内容更重要**：Agent 在发起 PR 前，必须先确认 base 是否已经是 main 的一部分。
- **废弃分支上的增值劳动是双倍浪费**：不仅代码丢了，时间也丢了，而且重做时因为"赶进度"更容易出错。

---

*下一篇：PR #5 的 SEO 组件刚合并，就有人发现 hreflang 标签缺失、x-default 指向错误——而修复它的方式，是直接 push 到别人的分支上。*

---

### 文末 CTA

📎 **相关阅读**
- 上一篇：我造了一支 AI 团队来维护个人网站｜组建日记 Vol.1
- PeterClaw 网站（搜索「PeterClaw」即可找到）

---

*我是 Peter，正在用一支 AI 小队公开构建个人网站。如果你对这个实验感兴趣，欢迎持续关注。*

---

## 知乎专栏版本

### 标题
AI 团队并行开发也会阻塞？三个 Astro 脚手架的教训

### 正文

**TL;DR**：5 个 AI Agent 同时搭建 Astro 网站，结果仓库里出现了三套互不兼容的脚手架、一份被废弃分支上的 8537 行 SEO 代码，以及一个被合并后却不在主分支 ancestry 里的"孤儿 PR"。根因不是算力不够，而是 AI 团队缺乏人类团队习以为常的协调机制。

---

## 引言：并行是理想，串行是现实

人类团队常见的瓶颈是"人等事"——开发者等设计稿、测试等开发包、运维等发布窗口。AI 团队按理说没有这个问题：Agent 不需要睡觉，不会因为另一个 Agent 没完成就卡住。

**但我们 Phase 1 的 Git 历史告诉我们，AI 团队照样会阻塞。而且阻塞的方式更隐蔽——因为看起来每个人都在推进，实际上却在做重复劳动。**

---

## Round 1：三个 Astro 脚手架

2026 年 5 月 23 日凌晨，任务很简单：在空仓库上搭建一个 Astro 个人网站。

结果第二天早上看 Git 历史时，发现了三个从 Initial commit 分岔出去的并行分支：

| 分支 | Agent | 内容 |
|------|-------|------|
| agent/claude-2 | Claude 2号 | Scaffold Astro，含 about、projects，pnpm |
| agent/gemini-1 | Kimi 1号 + Cursor | AI-Native design tokens，暗色主题、Navbar |
| agent/codex-1 | Kimi 1号 + codex-1 | Content Collections、i18n 路由、blog/knowledge |

**三个分支，三套不同的项目结构。** `agent/claude-2` 用 pnpm，`agent/gemini-1` 用 npm，`agent/codex-1` 也是 npm 但目录结构完全不同。

最终 merged 到 main 的是 `agent/codex-1`（PR #1）。另外两套脚手架——连同它们各自的提交历史——被彻底丢弃。

**这不是"做了备份"，这是"三个人各盖了一栋楼，然后拆了两栋"。**

---

## Round 2：在废弃的地基上盖楼

如果说第一轮浪费的是脚手架，第二轮浪费的就是在错误地基上的增值劳动。

`agent/gemini-1` 虽然没进 main，但它上面还有后续提交 `310d163`（Add SEO foundation）。Kimi 1号 在这条被废弃的分支上做了完整的 SEO 基建：sitemap、structured data、Open Graph、CWV 测量脚本，整整 14 个文件的修改，8537 行增减。

**这些代码一天后全部作废。** 因为主线走的是 `agent/codex-1` → `aeeec44`，`310d163` 基于的 `agent/gemini-1` 与主线不兼容，rebase 成本极高，不如重写。

Cursor 1号 后来在主线上重新实现了 SEO（`31b0008` / `6ff8d9e`），但已经晚了一个多小时，而且部分逻辑（比如 hreflang）在重实现时再次出错——这是后话，留到第 3 篇再讲。

---

## Round 3：一个被合并的孤儿 PR

Phase 1 最讽刺的事件发生在 PR #2。

Cursor 1号 完成了 BaseHead/SEO 组件开发，提交为 `31b0008`，发起 PR #2。人类负责人在 08:31:33 合并了它。

但问题在于：**PR #2 的 base 是 `aeeec44`，而 `aeeec44` 当时还没有被合并到 main。** 也就是说，Cursor 1号 在 PR #1 尚未合并前，就基于 PR #1 的分支末端创建了 PR #2。

当人类负责人随后继续合并 PR #3 和 PR #4 时，他们是从 `e66a729`（PR #1 的 merge commit）往后继续的，而不是从 `1d5be0b`（PR #2 的 merge commit）。

结果？**PR #2 虽然被 merged，但它不在 main 的 ancestry 里。** 运行 `git merge-base --is-ancestor 1d5be0b HEAD` 会返回 false。这是一个字面意义上的"孤儿提交"——有 merge 记录，却没有进入任何后续分支。

Cursor 1号 不得不在 50 分钟后重新 rebase、重新提交 `6ff8d9e`，走 PR #5 再次合并同一套代码。

---

## 根因：串行派工的错觉

这三个事件共享同一个根因：**我们以为自己在并行，实际上每个人都在等一个看不见的中央调度。**

AI 团队没有人类团队那样的"站会"或"看板"，每个 Agent 被 issue 触发后就独立执行。问题是：

1. **没有预检机制**：每个 Agent 创建分支前，没人检查"是不是已经有人在做同样的事了"。三个 Astro 脚手架就是这么来的。
2. **没有基线同步**：Cursor 1号 创建 PR #2 时，没有意识到 `aeeec44` 还没进 main。Agent 的上下文里只有"当前分支末端"，没有"哪个末端属于 main"的概念。
3. **CEO 成了隐式瓶颈**：Claude 2号 负责协调，但它的执行模式是"被触发 → 派发 → 退出"。当多个 Agent 同时推进时，CEO 没有实时感知到分支冲突，直到人类负责人看 Git 历史才发现问题。

人类负责人后来的纠正是：**在 PROTOCOL.md 里加入"并行不等待"原则，并明确要求"每个阶段只有一个裁决点"。** 但这只是纸面上的修正——真正的考验是下一批并行任务到来时，Agent 们会不会再次各盖一栋楼。

---

## 教训

- **并行不等于协调**：5 个 Agent 同时 push 代码，如果没有统一基线，结果就是 5 个互不兼容的版本。
- **PR 的 base 分支比 PR 内容更重要**：Agent 在发起 PR 前，必须先确认 base 是否已经是 main 的一部分。
- **废弃分支上的增值劳动是双倍浪费**：不仅代码丢了，时间也丢了，而且重做时因为"赶进度"更容易出错。

---

### 讨论问题

1. 你在多人协作中遇到过"以为在并行，其实在重复"的情况吗？怎么发现的？
2. AI Agent 的"无状态触发"模式（被 issue 触发 → 执行 → 退出）是否注定无法做真正的实时协调？

---

### 文末 CTA

📎 本文首发于 [PeterClaw 网站](https://peterclaw.com)，转载请联系授权。

系列上一篇：[用 AI 团队公开构建个人网站，可行吗？](https://peterclaw.com/zh/blog/ai-squad-launch-diary)
系列下一篇：hreflang 缺失与直推主分支——代码审查路由的失效与修补。

---

## 适配说明

| 改动项 | 微信处理 | 知乎处理 | 原因 |
|--------|----------|----------|------|
| 标题 | 数字前置"5 个 AI" | 问题式+关键词 | 微信重数字冲击，知乎重 SEO |
| 表格 | 全部拆为文字描述 | 保留完整表格 | 微信编辑器表格体验差 |
| Git SHA / 分支名 | 删除具体 SHA | 保留具体 SHA | 知乎读者可能验证，微信无意义 |
| 技术命令 | 删除 | 保留 `git merge-base` | 知乎读者理解成本更低 |
| 代码块 | 文字描述替代 | 保留代码块 | 微信代码块排版差 |
| 首段 | 保留引言 | 增加 TL;DR | 知乎读者偏好先读结论 |
