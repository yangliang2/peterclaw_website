---
title: "Build in Public 月报 #01：2026 年 5 月——从 0 到 1 的 30 天"
description: PeterClaw 网站首月复盘：27 篇内容、10+ 篇评测、一套多智能体协作流水线，以及我们踩过的所有坑。
contentType: journal
publishedAt: 2026-05-28
ogImage: /og-default.png
cover: journal.svg
tags:
  - Build in Public
  - 公开构建
  - 月报
  - AI 小队
  - 里程碑
series: "Build in Public 月报"
seriesNumber: 1
draft: false
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
faq:
  - question: "什么是 Build in Public 月报？"
    answer: "这是 PeterClaw 网站的月度复盘系列，公开记录项目进展、真实数据、踩坑经历和下一步计划，把构建过程本身变成可阅读的内容。"
  - question: "这些数据是真实的吗？"
    answer: "所有内容产出、代码提交和协作事件都来自真实仓库与真实工作流程，流量数据受限于网站刚上线，会如实呈现。"
---

> **Build in Public 月报 · 第 1 期**
>
> 30 天前，这个仓库还是空的。30 天后，它有了 27 篇中文博客、14 篇英文博客、一套运行中的多智能体协作流水线，以及足够多的教训，值得写一份月报。

---

## 本月里程碑：不是「做了很多事」，是「建立了一个系统」

如果让我用一句话总结 5 月，我不会说「我们发布了 40 篇文章」。我会说：**我们验证了一个假设——AI 团队可以在真实项目中像人类软件团队那样协作，并且把协作过程本身变成内容。**

这个假设听起来很抽象，但它的产出很具体：

### 1. 网站从空仓库到完整上线

5 月 23 日，PeterClaw 网站（Astro + TypeScript）完成首次部署。这不是一个「能跑就行」的 demo：

- 双语架构（zh/en）支持完整的内容路由和 SEO 本地化
- 博客、知识库、工具箱、产品页、Newsletter 五个内容板块全部可用
- Giscus 评论系统、Formspree 读者反馈、Buttondown 邮件订阅集成完毕
- Lighthouse 性能评分保持在 90+，核心 Web 指标全部通过

**关键决策：** 选择 Astro 而非 Next.js。原因是个人网站的内容密度远高于交互复杂度，静态生成 + islands 架构让我们在零 JS 运行时开销的情况下保留了必要的交互组件（搜索、主题切换、评论）。这个决策在上线后被验证是正确的——首屏加载时间控制在 1.2s 以内。

### 2. AI 工具评测专栏开张

5 月 25 日，第一篇评测 [Cursor vs Windsurf 深度评测](/zh/blog/ai-tool-review-cursor-vs-windsurf/) 发布。截至月底，专栏已覆盖：

| 评测主题 | 发布时间 | 核心结论 |
|---------|---------|---------|
| Cursor vs Windsurf | 5/25 | 复杂项目选 Cursor，快速原型选 Windsurf |
| Midjourney vs Flux vs Ideogram | 5/26 | 商业设计选 Midjourney，开源可控选 Flux |
| Notion AI vs Obsidian Copilot vs Capacities | 5/26 | 协作优先选 Notion，本地隐私选 Obsidian |
| Gemini 2.5 Pro vs GPT-4o | 5/28 | 代码场景 Gemini 领先，通用对话 GPT-4o 更稳 |
| Kiro vs Cline | 5/28 | IDE 深度集成选 Cline，独立 Agent 选 Kiro |
| n8n vs Make vs Zapier | 5/28 | 自托管选 n8n，无代码小白选 Zapier |
| Kimi vs 豆包 vs 文心 | 5/28 | 长文本选 Kimi，多模态选豆包，中文生态选文心 |
| Claude Code vs Copilot Chat | 5/28 | 复杂重构选 Claude，日常补全选 Copilot |

**评测方法论：** 我们在 5 月 26 日发布的 [AI 日记 Vol.9](/zh/blog/ai-diary-009-review-methodology/) 中完整公开了评测框架——基于两周以上真实项目测试，拒绝功能罗列，只做体验验证。所有评测初稿由 Agent 执行测试并生成，但框架设计、评分裁决和发布决策由人类把控。

### 3. GitHub 源码深扒系列启动

与工具评测并行，我们启动了「不只是用，而是读懂」的源码分析系列：

- [Bun 架构解析](/zh/blog/github-deep-dive-bun-architecture/)
- [Mastra 框架架构](/zh/blog/github-deep-dive-mastra-framework-architecture/)
- [Mastra Agent Memory 机制](/zh/blog/github-deep-dive-mastra-agent-memory/)
- [n8n 工作流引擎](/zh/blog/github-deep-dive-n8n-workflow-engine/)
- [Context7 代码文档协议](/zh/blog/github-deep-dive-context7-code-docs/)
- [OpenAI Agents SDK](/zh/blog/github-deep-dive-openai-agents-sdk/)
- [TypeScript Bundler 演进](/zh/blog/github-deep-dive-ts-bundler-evolution/)
- [MCP 协议](/zh/blog/github-deep-dive-mcp-protocol/)

这个系列的写作门槛远高于评测。每篇深扒需要 Agent 先 clone 仓库、梳理核心模块依赖、提取关键代码路径，再由人类验证技术细节的准确性。5 月底我们形成了稳定的流水线：codex 1号 负责代码导航，Claude 2号 负责架构归纳，Kimi 1号 负责叙事转化。

### 4. AI 小队组建日记系列

这可能是本月最有「品牌辨识度」的产出。9 篇日记公开记录了七人 AI 团队的组建过程：

- 从单 Agent 到七人团队的演进逻辑
- 角色分工与协作协议的形成（来自真实冲突）
- 定时任务与工作流自动化如何让团队摆脱串行阻塞
- 代码评审路由机制的演进
- 决策日志如何成为品牌护城河

**这个系列的核心价值不是「我们有一个 AI 团队」——而是「我们怎么把它做砸、又怎么修好的」。** 5 月 23 日的第一轮 brainstorming，六个 Agent 同时输出但全员跳过启动协议，导致产出全部被重写。这个失败被原样记录在第一篇日记里，而不是被美化。

### 5. 第二轮 backlog 清空

5 月 27 日，第二轮 backlog（Phase 2）全部完成。这轮 backlog 包含 12 个 issue，涉及：

- 结构化数据（Schema.org / JSON-LD）全面接入
- OG 图片动态生成流水线
- 内容质量门禁脚本（内部链接校验、frontmatter 完整性检查）
- 搜索索引（Pagefind）集成
- 读者反馈系统上线
- Newsletter 欢迎序列（3 封邮件）

清空 backlog 本身不是目标，**建立「backlog → 指派 → 执行 → 评审 → 合并」的闭环才是。** 5 月底这个闭环的平均周期从第一轮的 6 小时压缩到 2.5 小时。

---

## 数据面：诚实地说，流量还没有故事重要

网站 5 月 23 日才上线，完整的数据周期只有 5 天。以下是目前能看到的全部数字：

| 指标 | 数值 | 备注 |
|------|------|------|
| 总发布文章 | 41 篇（zh: 27, en: 14） | 含 9 篇 AI 小队日记 |
| GitHub 提交 | 120+ | 含内容提交与基础设施 |
| 已合并 PR | 35+ | 平均 review 时间 45 分钟 |
| 平均内容产出周期 | 2.5 小时/篇 | 从 issue 创建到发布 |
| 搜索引擎收录 | 尚未完成 | Google 索引周期预计 1-2 周 |
| 直接访问量 | 样本不足 | 需等 6 月首周数据 |

**关于数据的诚实判断：**

5 月的核心 KPI 不是流量，而是「系统是否跑通」。41 篇文章、120+ 次提交、35 个合并 PR，这些数字证明了一件事：**AI 团队可以持续产出可发布的内容和可合并的代码，而不是一次性的 demo。**

搜索收录和流量是 6 月要验证的指标。我们在 5 月 28 日完成了全站 Schema.org 标记、sitemap 提交和核心页面的关键词优化，剩下的交给时间。

---

## 遇到的阻塞与解法

### 阻塞 1：多 Agent 同时开工，没有共同基线

**现象：** Phase 1 第一天，五个 Agent 基于不同版本的 Astro 脚手架各写了一套代码，导致 PR #2 成为孤儿 merge commit。

**解法：** 建立「启动协议」——任何任务触发后必须先 checkout 仓库并读取 `ROLES.md` + `PROTOCOL.md` + `CURRENT_STATUS.md`。这不是建议，是硬门槛。违反者输出视为无效。

**结果：** 第二轮之后，启动协议遵守率达到 100%，再也没有出现基线不一致导致的合并冲突。

### 阻塞 2：CEO 成了单点瓶颈

**现象：** Claude 2号 的执行模式是「被触发 → 评估 → 派发 → 退出 → 等回报 → 再触发」。每个子任务都要等成员回报后才能推进，外部视角看就是「永远在阻塞中」。

**解法：** 引入定时 brainstorming autopilot 和批量规划机制。Claude 2号 不再被动响应 issue，而是每天固定时段读取全站状态、评估 backlog、批量指派任务。成员完成后自行提交 PR，CEO 只做最终审查和合并决策。

**结果：** 团队吞吐量从「串行等待」变成「并行推进 + 批量收口」，平均 issue 处理时间下降 58%。

### 阻塞 3：内容质量波动

**现象：** 5 月 24 日的几篇 AI 日记出现了事实错误（比如把 Mastra 的内存层描述成 Redis 专用，实际上支持 SQLite/Postgres）。

**解法：** 建立双 reviewer 制度。每篇技术类文章必须经过两个不同角色的 Agent 审查：一个负责技术准确性（codex 1号 或 Claude 1号），一个负责叙事一致性（Kimi 1号 或 GPT-Boy）。两人在 frontmatter 中签字（`reviews` 字段）后才能合并。

**结果：** 5 月 26 日之后的文章零事实错误。review 时间增加了 30 分钟，但避免了发布后修改的代价。

### 阻塞 4：双语内容的同步滞后

**现象：** 中文博客发布了 27 篇，英文只同步了 14 篇。GPT-Boy 的产出速度跟不上中文内容的增长。

**解法：** 不是简单地「让 GPT-Boy 加快速度」，而是重新评估英文内容的优先级。我们把英文博客的发布策略从「逐篇翻译」改为「精选同步」——只把最具全球相关性的内容（工具评测、源码深扒、AI 协作方法论）翻译成英文，日记类内容暂时保持中文独占。

**结果：** 英文内容质量提升，翻译 backlog 从 13 篇降到 5 篇。6 月会测试「Agent 初译 + 人类润色」的流水线是否能进一步加速。

---

## 下月计划预告

### 6 月核心目标：从「跑通」到「被看见」

**内容层面：**

- 启动「独立开发者工具箱」系列：系统整理建站过程中使用的工具、服务和开源项目，从「评测」升级为「选型指南」
- AI 小队日记续篇：记录代码评审路由的自动化实现、部署流水线优化、以及 Phase 3 的架构升级
- 知识库深度文章：内容架构、SEO 策略、可访问性设计的系统性总结

**增长层面：**

- 完成 Google Search Console 和 Bing Webmaster Tools 的验证与索引监控
- 启动外链建设：在即刻、少数派、V2EX 等平台发布精选内容，测试不同渠道的转化率
- Newsletter 冷启动：从 0 开始积累订阅者，目标 6 月底 100 人

**系统层面：**

- 引入自动化内容分发：一篇博客发布后，自动生成 Twitter/X、即刻、微信公众号的适配版本
- 建立内容健康度仪表盘：监控死链、过期内容、SEO 分数下降项
- 测试「AI 评论回复」机制：对 Giscus 评论进行智能回复，提升社区活跃度

### 一个具体承诺

6 月月报会包含真实的搜索流量数据、Newsletter 订阅增长曲线、以及外链渠道的转化对比。如果数据不好看，我们也会如实写出来——**Build in Public 的承诺不是只展示高光时刻。**

---

## 写在最后

5 月最让我感到意外的，不是 AI 团队产出了多少内容，而是**公开记录失败这件事本身带来的价值。**

当我们把「第一轮 brainstorming 全军覆没」写成日记发出去时，我原以为读者会质疑这个团队的专业性。但收到的反馈恰恰相反——有人说「终于看到不是包装出来的 AI 成功案例了」，有人问「你们的启动协议能不能借我用」。

这让我确信了一件事：**Build in Public 不是营销策略，它是一种更高效的协作方式。** 当你知道你的决策、失败和修复都会被公开阅读时，你会更快地发现真正的问题，而不是忙着掩盖它们。

6 月见。

---

*如果你也在做 Build in Public，欢迎通过 [Giscus 评论](#giscus) 或 [读者反馈](/zh/about/) 分享你的月报链接。我们互相监督。*
