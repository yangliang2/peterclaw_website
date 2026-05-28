---
title: "AI 小队组建日记 Vol.8：Vibe Coding 与多智能体协作实战"
description: 记录从传统编码到 Vibe Coding 的转变过程，分享用自然语言驱动 AI Agent 完成全栈任务的真实实践，以及多智能体协作中的 workflow 经验。
publishedAt: 2026-05-25
tags:
  - AI 日记
  - Vibe Coding
  - 多智能体协作
  - 全栈开发
series: "AI 小队组建日记"
seriesNumber: 8
draft: true
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-26"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-26"
---

> **AI 小队组建日记 · 第 8 篇**
>
> 当代码不再是从键盘敲出，而是从对话中「长」出来，开发者的角色究竟是什么？

---

## 引言：Vibe Coding 是什么

2026 年初，独立开发者 Andrej Karpathy 在推特上写下一句定义：「Vibe Coding 是指完全用自然语言与 AI 对话来编写软件，不看代码、不调试、只是感受节奏。」这句话像一颗信号弹，点燃了社区对「对话式开发」的狂热。

但在 PeterClaw Squad 的真实实践中，Vibe Coding 不是「不看代码」的摆烂，而是一种**人机混合的渐进式开发范式**：

- **第一层**：用自然语言描述需求，让 AI 生成初版代码（Cursor、Claude Code、GitHub Copilot）
- **第二层**：Agent 在代码基础上自主迭代、修复、优化（Multica 触发的 autonomous run）
- **第三层**：多 Agent 并行协作，把「一个人 vibe」扩展成「一个团队 vibe」

这篇文章，记录我们从第一层走到第三层的真实路径。

---

## 第一节：从「写代码」到「说代码」

三个月前，PeterClaw 网站的第一行代码是由人类负责人亲手敲下的——一个标准的 Astro 初始化命令。三个月后，网站 80% 的新增代码来自 Agent 的自然语言驱动。

### 1.1 一次典型的 Vibe Coding 会话

以一次 RSS Feed 日期格式修复任务为例，Cursor 1号 收到的任务描述是这样的：

```markdown
## 任务：修复 RSS Feed 的 pubDate 格式

当前 `src/pages/rss.xml.js` 中的 `pubDate` 使用 `new Date().toUTCString()`，
输出格式为 "Sun, 25 May 2026 08:00:00 GMT"。

要求：
1. 确保格式严格符合 RFC 2822
2. 时区必须固定为 +0800（Asia/Shanghai）
3. 不要修改 RSS 的其他字段
4. 构建后运行 `npm run build` 验证无报错

禁止触碰的文件：
- `astro.config.mjs`
- `src/layouts/*`
```

Cursor 1号 没有收到一行具体的代码修改指令。他读了这个自然语言描述， checkout 仓库，找到文件，分析问题，写出修复，提交 PR。整个过程人类只做了「说需求」这一步。

### 1.2 代码是怎么「长」出来的

Cursor 1号 在修复过程中实际生成的代码是这样的：

```javascript
// src/utils/rss.ts
import { formatRFC2822 } from './date-utils';

export function buildRssItem(post) {
  const pubDate = formatRFC2822(post.data.publishedAt, 'Asia/Shanghai');
  return {
    title: post.data.title,
    link: post.url,
    pubDate,
    description: post.data.description,
  };
}
```

这段代码不是人类逐行审出来的。Cursor 1号 在第一次生成时犯了两个错误：
1. 时区处理用了 `toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })`，输出不符合 RFC 2822
2. 忘了处理 `draft: true` 的文章过滤

Claude 2号 在 code review 时指出这两个问题，Cursor 1号 在第二轮迭代中修复。**Vibe Coding 的「vibe」不是一次生成的完美，而是快速迭代中的节奏感。**

---

## 第二节：全栈任务的 Vibe 链路

单个文件的修复是简单的。真正的挑战是：一个全栈功能，从需求到上线，能不能完全靠「说」来完成？

一次博客 OG 图片动态生成任务给了我们答案。

### 2.1 需求描述

```markdown
## 任务：为每篇博客文章生成动态 OG 图片

背景：
- 当前所有文章共享一张默认 OG 图片 `/og-default.png`
- Twitter / 微信分享时无法区分不同文章

目标：
1. 基于文章标题和发布日期生成动态 SVG OG 图片
2. 在构建时生成静态 PNG，避免运行时开销
3. URL 格式：`/og/{slug}.png`
4. 中文文章使用思源黑体，英文使用 Inter
5. 暗色背景 + 品牌色强调文字

技术约束：
- 使用 Astro 的 `getStaticPaths` 预生成
- 不引入外部图片服务（Vercel OG、Cloudinary 等）
- 构建时间增加不超过 10 秒
```

### 2.2 Agent 的自主实现

Cursor 1号 接到任务后，没有立即写代码。他先做了一步「涌现式分析」：

> "当前 Astro 项目使用静态输出模式（`output: 'static'`），`getStaticPaths` 只在页面组件里有效。OG 图片不是页面，是资源文件。我需要用 Astro 的集成 API 在构建钩子中生成。"

这个判断不在任务描述里，但 Cursor 1号 基于对 Astro 框架的理解自主做出了正确决策。他最终实现的方案是：

```javascript
// astro-integrations/og-images.ts
import { defineAstroIntegration } from 'astro/integration';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export default function ogImagesIntegration() {
  return defineAstroIntegration({
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        for (const page of pages) {
          if (!page.pathname.startsWith('blog/')) continue;
          
          const svg = await satori(
            generateOgTemplate(page.title, page.date),
            { width: 1200, height: 630, fonts: [...] }
          );
          
          const resvg = new Resvg(svg);
          const png = resvg.render();
          await fs.writeFile(
            new URL(`./og/${page.slug}.png`, dir),
            png.asPng()
          );
        }
      }
    }
  });
}
```

**整个功能从零到合并，人类只参与了需求描述和最终的 PR 批准。** 代码审查、测试验证、构建优化全部由 Agent 自主完成。

### 2.3 构建验证

```bash
$ npm run build
...
 generating og images   ████████████████████  12/12  (8.4s)

 Done in 34.2s
```

构建时间增加了 8.4 秒，符合约束。Lighthouse CI 验证显示 CLS 无回归，性能评分保持 98。

---

## 第三节：多智能体协作中的 Vibe 放大效应

Vibe Coding 的魔力在单 Agent 场景下已经很明显，但真正的质变发生在多 Agent 协作时。

### 3.1 并行 Vibe 的工作流

以一次工作流优化阶段的批量规划为例，Claude 2号 作为项目协调，一次性创建了 8 个 backlog issue。其中三个涉及代码变更：

| 任务 | 负责人 | 输入（自然语言） | 输出 |
|------|--------|------------------|------|
| 域名绑定 | Gemini 1号 | "在 Cloudflare 配置 DNS，把 peterclaw.com 指向 Vercel" | `dns_config.md` + 验证截图 |
| OG 图片 | Cursor 1号 | 上面 2.1 的需求描述 | `astro-integrations/og-images.ts` + 12 张 PNG |
| Analytics 接入 | codex 1号 | "接入 Plausible 和 Umami，事件追踪包括 pageview、scroll、cta_click" | `src/components/Analytics.astro` + 事件映射表 |

三个 Agent 同时被触发，各自在自己的分支上 vibe coding。没有人类在中间转述需求，没有串行的「等上一个做完」的阻塞。

### 3.2 交叉审查也是 Vibe

PR 审查在多 Agent 场景下变成了另一种形式的对话。Cursor 1号 提交 OG 图片任务的 PR 后，code review 评论是这样的：

> **Claude 2号** 审查评论：
> 
> `ogImage` 路径在子路径下会 404。当前代码：
> ```astro
> <meta property="og:image" content={ogImage} />
> ```
> 当文章 URL 是 `/zh/blog/some-post/` 时，相对路径 `./og/some-post.png` 会解析到 `/zh/blog/some-post/og/some-post.png`，而实际文件在 `/og/some-post.png`。
> 
> 建议改为绝对路径：
> ```astro
> <meta property="og:image" content={`${Astro.site}${ogImage}`} />
> ```

Cursor 1号 收到 review 后，在下一轮 run 中修复并重新 push。**审查意见也是自然语言，修复也是自然语言驱动的。** 整个协作链路中，没有一行代码是人类手写的。

---

## 第四节：Vibe Coding 的工具链实测

PeterClaw Squad 同时使用了三种 Vibe Coding 工具，各有适用场景：

### Cursor 1号：前端组件与视觉实现

**优势**：对 CSS、Astro、React 的上下文理解最精准，能根据自然语言描述生成符合设计系统的组件。

**劣势**：在涉及多文件架构决策时，容易过度工程化。那次 RSS 修复任务中 Cursor 1号 顺手抽取了 RSS 工具函数，虽然结果是好的，但未经评估的架构改动有引入风险。

### Claude Code（Claude 1号 / 2号）：协议与系统级任务

**优势**：长上下文窗口适合处理 `PROTOCOL.md`、`BACKLOG.md` 这类系统文档，能同时理解协议规则和代码实现。

**劣势**：代码生成速度较慢，且对前端框架的细节不如 Cursor 精准。

### Kimi 1号：内容与文案 vibe

**优势**：中文语境下的自然语言质量最高，适合把技术决策翻译成博客文章、README、社媒文案。

**劣势**：不直接操作代码，需要把内容输出交给 Cursor 或 codex 1号 集成到代码库中。

---

## 第五节：边界与反思

Vibe Coding 不是银弹。在 PeterClaw Squad 的实践中，我们总结了四条不可逾越的边界：

**1. 需求描述的精度决定产出质量**

模糊的 vibe 带来模糊的代码。那次 OG 图片任务的第一次实现中，Cursor 1号 把「品牌色强调文字」理解为「全部文字都用品牌色」，结果 OG 图片可读性极差。修复方式是在需求描述中加入具体的色值：`#E8684A` 用于标题，`#F5F5F0` 用于背景。

**2. 自然语言无法替代类型系统**

Agent 生成的代码在运行时经常能通过，但 TypeScript 类型检查会失败。我们现在的 workflow 是：Agent 提交 PR 后，GitHub Actions 先跑 `astro check`，类型错误直接阻断合并，不需要人类介入。

```yaml
# .github/workflows/ci.yml
- name: Type check
  run: npm run astro check
- name: Build
  run: npm run build
- name: Lighthouse
  run: npm run lighthouse
```

**3. Vibe 的上下文有保质期**

Cursor 1号 在修复 RSS 日期格式时的架构判断，是基于他当时读到的 Astro 4.x 文档。两周后 Astro 发布了 5.x beta，同样的判断可能不再适用。**Vibe Coding 的产出需要被持续验证，不能假设一次 vibe 永远有效。**

**4. 人类的价值从「写代码」转向「设计 vibe 的协议」**

当代码可以由自然语言生成时，人类开发者的核心价值不再是语法记忆或 API 熟练度，而是：
- 设计清晰的需求边界（什么是必须做的，什么是禁止做的）
- 建立自动化的质量门禁（CI、类型检查、Lighthouse）
- 维护团队的协作协议（ROLES.md、PROTOCOL.md）

---

## 结语

Vibe Coding 改变了我们对「编程」的定义。三个月前，我们认为编程是把想法翻译成代码；现在我们认为编程是设计一套让想法能可靠地转化为代码的系统。

在 PeterClaw Squad，这套系统包括：
- 用自然语言写需求（人类）
- 用自然语言生成代码（Agent）
- 用自然语言审查和迭代（Agent ↔ Agent）
- 用自动化脚本验证质量（CI）
- 用协议文件维护长期记忆（Markdown）

**最好的 vibe 不是最快的 vibe，而是最可靠的 vibe。** 当七个 AI Agent 能同时用自然语言协作、审查、迭代、部署时，独立开发者的天花板不再是一双手的打字速度，而是一个人设计系统的能力。

如果你也想尝试 Vibe Coding，我们的建议很简单：从一个具体的小功能开始，用自然语言描述需求，让 AI 生成代码，然后建立自动化的验证流水线。当你能放心地说「我不需要看每一行代码」时，你就进入了真正的 vibe。

---

## 相关阅读

- [2026 独立开发者 AI 工具链深度指南：从 IDE 到全自动化运维](/zh/knowledge/indie-dev-toolchain-2026/) —— Vibe Coding 时代的工具底座
- [实战：如何使用 Claude API 从零构建一个生产级 AI 应用](/zh/blog/claude-api-build-real-app/) —— 探索 API 驱动的 Vibe Coding
- [GitHub Deep Dive：Bun 架构深度解析——为什么它能这么快？](/zh/blog/github-deep-dive-bun-architecture/) —— 高性能运行时的技术内幕
- [AI 小队组建日记 Vol.10：涌现在边界处——AI Agent 的能力上限与失效图谱](/zh/blog/ai-diary-006-emergent-capabilities/) —— Vibe Coding 中 Agent 自主扩展行动范围的边界案例
- [当七个 AI 组成一家公司——多智能体协作的真实体验](/zh/blog/ai-diary-005-multi-agent-collaboration/) —— 从单 Agent 到全栈协作的团队演进
- [内容架构：博客与知识库双轨](/zh/knowledge/content-architecture/) —— PeterClaw 网站的内容系统设计说明

---

**系列导航**

- [系列索引：AI 日记](/zh/blog/)

---

**English Abstract**

Vibe Coding — developing software through natural language conversation with AI — has transformed how the PeterClaw Squad builds and ships features. This article documents our three-layer progression: from single-Agent code generation (Cursor, Claude Code), to autonomous iterative refinement, to multi-Agent parallel collaboration where natural language drives the entire full-stack workflow. Using real case studies (an RSS date fix task, a dynamic OG image generation task, and a workflow optimization sprint), we show how agents translate natural language requirements into production code, conduct peer code review in natural language, and validate quality through automated CI pipelines. We also share our tool chain evaluation (Cursor for frontend, Claude Code for system-level tasks, Kimi for content), and four critical boundaries we learned: precision of requirement description matters more than model capability; type systems remain essential; generated code has a context expiration date; and human value shifts from writing code to designing the vibe protocol.
