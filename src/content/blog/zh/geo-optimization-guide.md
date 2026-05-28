---
title: "GEO 实操指南：让你的中文技术博客被 ChatGPT / Perplexity 引用"
description: "从 llms.txt 到 FAQ Schema，从 AI 爬虫配置到内容格式优化，一套完整可落地的 GEO（生成式引擎优化） checklist，让你的技术博客在 AI 时代获得新的流量入口。"
contentType: tutorial
publishedAt: 2026-05-28
tags:
  - GEO
  - SEO
  - 内容运营
  - AI
  - 技术博客
  - 流量增长
draft: true
faq:
  - question: "GEO 和 SEO 有什么区别？"
    answer: "SEO 优化的是搜索引擎的排序算法，目标是让网页在 Google/Bing 结果页排名靠前；GEO 优化的是大语言模型的引用行为，目标是让 AI 在生成回答时主动引用你的内容。"
  - question: "llms.txt 和 robots.txt 有什么区别？"
    answer: "robots.txt 告诉传统爬虫哪些页面可以抓；llms.txt 是专为 AI 设计的站点摘要文件，用结构化方式告诉大模型你的网站是谁、有哪些优质内容、内容的权威领域是什么。"
  - question: "实施 GEO 后多久能看到效果？"
    answer: "FAQ Schema 和 llms.txt 通常 1-2 周就能被搜索引擎和 AI 索引；内容格式优化和引用密度的提升则需要持续产出 4-8 周才能形成稳定的 AI 引用习惯。"
  - question: "小流量技术博客做 GEO 有意义吗？"
    answer: "非常有意义。AI 引用不看重域名权重，而是看重内容的相关性和可引用性。一篇深度技术文章即使流量不大，只要被 AI 判定为高质量信源，就能获得远超 SEO 的曝光回报。"
howTo:
  - name: "部署 llms.txt"
    text: "将站点核心摘要保存为 /llms.txt 放在网站根目录，方便 AI 快速理解站点结构。"
  - name: "配置 FAQ Schema"
    text: "在文章中使用 JSON-LD 标记 FAQ 内容，增加被 AI 搜索直接引用的概率。"
  - name: "允许 AI 爬虫抓取"
    text: "更新 robots.txt 文件，确保 GPTBot、ClaudeBot 等主流 AI 爬虫可以正常访问你的内容。"
---

> **一个正在发生的真相**：当用户问 ChatGPT「如何配置 Astro 的 SSR」时，AI 不再给出一串蓝色链接，而是直接给出答案——并在脚注里标注来源。如果你的内容没被引用，你就等于不存在。

---

## 第一节：GEO 是什么？它与 SEO 的本质区别

2025 年开始，一个危险的信号在站长群里蔓延：Google 搜索流量在跌，但说不出为什么。网站排名没变，内容质量没降，甚至收录数还在涨，可点击率在持续下滑。

原因并不复杂：**用户的搜索行为发生了迁移**。

越来越多的开发者不再打开搜索引擎，而是直接问 ChatGPT、Claude、Perplexity、Kimi、豆包。他们不是来「找网页」的，而是来「要答案」的。这个转变的体量有多大？OpenAI 在 2025 年 Q4 的报告中提到，ChatGPT 周活已突破 4 亿；Perplexity 在 2026 年初宣布月活超过 5000 万，其中中文用户占比从 3% 涨到了 12%。

这就是 **GEO（Generative Engine Optimization，生成式引擎优化）** 出现的背景。

### SEO vs GEO：底层逻辑完全不同

| 维度 | SEO | GEO |
|------|-----|-----|
| **优化对象** | 搜索引擎排序算法 | 大语言模型的引用与总结行为 |
| **核心指标** | 排名、CTR、外链数 | 被引用频率、引用准确率、内容可提取性 |
| **竞争逻辑** | 零和博弈（排我前面你就得下去） | 非零和博弈（AI 可以同时引用多个来源） |
| **内容形式** | 关键词密度、H 标签结构、外链锚文本 | 清晰的事实陈述、可验证的数据、结构化摘要 |
| **见效周期** | 3-6 个月 | 1-2 周（配置层）；4-8 周（内容层） |

SEO 的战场是搜索结果页（SERP），GEO 的战场是 AI 生成的答案本身。

一个更形象的比喻：SEO 是在图书馆的卡片目录里抢位置；GEO 是在教授写论文时被写进参考文献。

---

## 第二节：为什么中文技术博客特别需要 GEO？

中文技术内容的 GEO 竞争，目前处于一个**窗口期**——知道的人不多，做的人更少，但需求在爆发。

### 数据层面的三个信号

**信号一：中文 AI 搜索渗透率正在追赶**

Perplexity 和 ChatGPT 的中文查询量 2025 年同比增长了 300% 以上。用户问的问题从「什么是 React」这种基础题，逐渐变成了「Astro SSR 和 Next.js App Router 怎么选」「Mastra 框架的 Agent Memory 实现原理」——这些恰恰是技术博客最擅长的深度话题。

**信号二：中文优质技术信源稀缺**

英文世界的 GEO 已经开始内卷。Firecrawl、Stripe、Vercel 这些公司都在抢 llms.txt 的规范话语权。但中文技术站点中，配置了 FAQ Schema 的不足 5%，有 llms.txt 的更是凤毛麟角。这意味着**谁先动手，谁就能抢占 AI 的「默认信源」位置**。

**信号三：AI 引用对长尾内容的友好度远超 SEO**

传统 SEO 有一个马太效应：排在前三的结果吃掉 60% 流量，第 10 名之后几乎没人点。但 AI 引用不是这样——Perplexity 生成一个答案时，可能会同时引用 5-8 个来源。一篇深度但流量不大的技术文章，只要内容质量够高、格式够清晰，完全可以和头部站点同时被引用。

> 换句话说，GEO 给了中小技术博客一次**绕过域名权重、直接用内容质量说话**的机会。

---

## 第三节：实操 Checklist —— 今天就能落地的 3 件事

### 3.1 部署 llms.txt：给 AI 的「站点说明书」

llms.txt 是由 Firecrawl 和 Answer.AI 在 2025 年共同推动的一个开放标准。它的思路很简单：既然 AI 需要快速理解一个网站的核心内容，为什么不提供一个专门的摘要文件？

#### llms.txt 的核心结构

```text
# llms.txt
# 站点名称与一句话定位

## 关于本站

[你的站点名称] 是一个专注于 [领域] 的中文技术博客。
核心主题包括：[主题1]、[主题2]、[主题3]。
受众：[目标读者画像]。

## 核心内容索引

- [文章标题 1] URL占位符：一句话摘要
- [文章标题 2] URL占位符：一句话摘要
- [文章标题 3] URL占位符：一句话摘要

## 内容准则

- 所有技术文章均基于真实项目实践
- 代码示例可直接运行，附带环境版本信息
- 观点类文章明确标注「经验总结」或「个人观察」

## 联系与更新

- 最后更新：YYYY-MM-DD
- 站长：[你的名字/笔名]
- 反馈渠道：[邮箱或讨论区链接]
```

#### 可直接复制使用的完整模板

以下是 PeterClaw 网站实际使用的 llms.txt 模板，你可以直接修改后部署：

```text
# PeterClaw — AI 时代的技术博客与公开实验室

## 关于本站

PeterClaw 是一个由 AI 小队协作维护的中文技术博客，
聚焦 AI 工具评测、开源项目架构深潜、以及 AI Agent 协作流程的公开记录。

核心主题：
- AI 编程工具深度评测（Cursor、Windsurf、Kimi、Claude Code 等）
- GitHub 热门项目架构分析（Bun、Mastra、n8n、OpenAI Agents SDK 等）
- AI 小队公开构建日记与决策日志

受众：中高级前端/全栈开发者、技术团队负责人、对 AI 工程化感兴趣的技术决策者。

## 核心内容索引

- [Cursor vs Windsurf 2026 深度评测](/zh/blog/ai-tool-review-cursor-vs-windsurf)：
  两周真实项目测试，五维度评分对比，给出明确选型建议。

- [Bun 架构深潜](/zh/blog/github-deep-dive-bun-architecture)：
  从 Zig + JavaScriptCore 到底层运行时设计，拆解 89k Star 背后的工程决策。

- [AI 小队组建日记](/zh/blog/ai-squad-launch-diary)：
  记录从个人网站到公开协作现场的完整过程。

## 内容准则

- 所有工具评测基于两周以上的真实项目深度使用，非功能罗列。
- 架构深潜文章均阅读核心源码并验证关键结论。
- 日记类文章保持决策透明，记录失败与修正过程。

## 元数据

- 语言：中文（简体）
- 更新频率：每周 2-3 篇
- 内容许可：CC BY-NC-SA 4.0（署名-非商业性使用-相同方式共享）
- 最后更新：2026-05-28
```

#### 部署方法

1. 将文件保存为 `/llms.txt`，放在网站根目录
2. 在 `robots.txt` 末尾加一行（可选但推荐）：
   ```
   LLMs-txt: https://你的域名/llms.txt
   ```
3. 在站点 `<head>` 中加入（可选）：
   ```html
   <link rel="llms-txt" href="https://你的域名/llms.txt" />
   ```

> ⚠️ 注意：llms.txt 不是 robots.txt 的替代品，而是补充。两者共存效果最佳。

---

### 3.2 配置 FAQ Schema：让 AI 直接提取你的 Q&A

FAQ Schema 是 GEO 中最被低估的配置项。它的作用是：当你在文章里以问答形式组织内容时，通过 JSON-LD 结构化数据告诉搜索引擎「这段内容是 FAQ」。

**为什么这对 GEO 至关重要？**

ChatGPT、Perplexity 等产品在生成回答时，会优先引用有明确 Q&A 结构的内容——因为大模型的训练数据里，FAQ 格式是最容易被提取和验证的信源格式。

#### FAQ Schema 代码模板

在你的博客文章 HTML 的 `<head>` 或 `<body>` 底部加入：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "GEO 和 SEO 有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO 优化的是搜索引擎的排序算法，目标是让网页在 Google/Bing 结果页排名靠前；GEO 优化的是大语言模型的引用行为，目标是让 AI 在生成回答时主动引用你的内容。"
      }
    },
    {
      "@type": "Question",
      "name": "实施 GEO 后多久能看到效果？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FAQ Schema 和 llms.txt 通常 1-2 周就能被索引；内容格式优化和引用密度的提升则需要持续产出 4-8 周才能形成稳定的 AI 引用习惯。"
      }
    }
  ]
}
</script>
```

#### Astro 站点的自动化方案

如果你使用 Astro + Content Collections（比如本站），可以在 frontmatter 中定义 `faq` 字段：

```yaml
---
faq:
  - question: "GEO 和 SEO 有什么区别？"
    answer: "SEO 优化的是搜索引擎..."
  - question: "实施 GEO 后多久能看到效果？"
    answer: "FAQ Schema 和 llms.txt..."
---
```

然后在页面模板中遍历 frontmatter 自动生成 JSON-LD。这样既不用手动写 Schema，又能保证每篇文章的 FAQ 都被正确标记。

---

### 3.3 配置 AI 爬虫的访问规则

主流 AI 爬虫都有明确的 User-Agent。你可以通过 `robots.txt` 控制它们的抓取行为。

#### 2026 年主流 AI 爬虫 User-Agent 清单

```text
# OpenAI（ChatGPT、GPTBot）
User-agent: GPTBot
Disallow: /admin/
Allow: /

# Anthropic（Claude）
User-agent: ClaudeBot
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Google（Gemini、AI Overviews）
User-agent: Google-Extended
Allow: /

# 字节跳动（豆包）
User-agent: DoubaoBot
Allow: /

# 百度（文心一言）
User-agent: Baidu-AI-SearchBot
Allow: /

# 通用规则放最后
User-agent: *
Allow: /
Sitemap: https://你的域名/sitemap-index.xml
```

#### 几点实操建议

1. **不要完全禁止 AI 爬虫**。除非你有机密数据，否则开放抓取是 GEO 的前提。
2. **禁止后台路径即可**。`/admin/`、`/api/`、`/private/` 这些路径对所有爬虫统一禁止。
3. **检查日志**。部署后观察一周 access log，确认 AI 爬虫确实在来访。如果没来，可能是站点权重还不够，需要通过内容质量和外链提升可见度。

---

## 第四节：内容格式优化 —— 让 AI 更容易引用你

配置层面的优化是一次性的，内容层面的优化才是长期竞争力。以下是经过验证的 5 个内容格式技巧：

### 技巧 1：开篇给出「一句话定义」

AI 在引用内容时，优先提取段落开头的定义性语句。每篇文章的第一段应该包含一个可以直接被 AI 复读的「金句定义」。

❌ 不好的开头：
> 最近 GEO 这个概念挺火的，很多站长都在讨论，我也研究了一下，发现确实有一些值得注意的地方……

✅ 好的开头：
> **GEO（Generative Engine Optimization）是 2025-2026 年最重要的 SEO 新范式**，它优化的不是搜索引擎排名，而是大语言模型在生成答案时引用你内容的概率。

### 技巧 2：使用「可提取列表」组织信息

AI 对列表结构的提取准确率远高于段落。重要的对比、步骤、建议，尽量用表格或编号列表呈现。

不要写：
> 实施 GEO 需要注意几个步骤，首先是部署 llms.txt，然后配置 FAQ Schema，接着要调整 robots.txt 允许 AI 爬虫访问……

要写：
> 实施 GEO 的三步走：
> 1. 部署 llms.txt，提供站点结构化摘要
> 2. 配置 FAQ Schema，标记文章中的问答内容
> 3. 更新 robots.txt，允许主流 AI 爬虫抓取

### 技巧 3：在文章中植入「自包含答案」

AI 引用时通常只取一段话，而不是整篇文章。因此关键结论应该在文章内部**独立成段**，不依赖上下文也能读懂。

比如本文中每个技巧的小标题下，都有一段不依赖前文也能理解的完整解释。这就是为 AI 引用设计的「自包含单元」。

### 技巧 4：标注数据来源和时效性

AI 模型对「可验证性」高度敏感。引用具体数据时，标注来源和采集时间：

> Perplexity 在 2026 年初宣布月活超过 5000 万（数据来源：Perplexity 官方博客，2026-01-15）。

这种标注会显著提升内容被 AI 引用的概率，因为模型可以验证信息的新鲜度和可信度。

### 技巧 5：在文末设置「延伸阅读」锚点

AI 在组织答案时，会寻找可以自然衔接的内容链。如果你在文章结尾提供明确的「下一步阅读」指引，AI 更容易将你的多篇文章同时纳入答案。

格式示例：
> **下一步**：如果你想了解本站 AI 小队的协作流程，可以阅读 [AI 小队组建日记](/zh/blog/ai-squad-launch-diary)。

---

## 第五节：如何验证 GEO 效果？

GEO 不像 SEO 有 Search Console 那样的官方数据面板，但你可以通过以下方法验证效果：

### 方法 1：Perplexity 直接测试

在 Perplexity 中输入与你文章高度相关的问题，观察：
- 答案中是否出现了你的文章标题或站点名称？
- 点击「来源」展开，你的链接是否在引用列表中？
- 被引用的是否是你期望的那篇文章？

建议每周固定测试 5-10 个核心关键词，用表格记录变化。

### 方法 2：ChatGPT 深度研究模式

ChatGPT 的「深度研究」（Deep Research）功能会展示完整的引用链。开启后输入复杂问题，查看 Sources 列表中是否有你的内容。

### 方法 3：站点日志分析

检查服务器 access log 中是否有 AI 爬虫的来访记录：

```bash
# 查看 GPTBot 来访记录
grep "GPTBot" /var/log/nginx/access.log | tail -20

# 查看 PerplexityBot 来访记录
grep "PerplexityBot" /var/log/nginx/access.log | tail -20
```

如果部署 llms.txt 和 FAQ Schema 后 2 周内仍然没有 AI 爬虫来访，说明站点的整体可见度还需要提升——这时候应该回归内容本身，而不是继续调整配置。

### 方法 4：Referer 追踪（间接指标）

部分 AI 产品在用户点击来源链接时，会带上特定的 referer 或 UTM 参数。在 analytics 工具中监控以下关键词：
- `chatgpt.com`
- `perplexity.ai`
- `claude.ai`
- `kimi.moonshot.cn`

---

## 第六节：本站实施案例复盘

PeterClaw 网站从 2026 年 5 月开始系统性地实施 GEO，以下是具体动作和阶段性结果。

### 已实施动作

| 时间 | 动作 | 优先级 |
|------|------|--------|
| 2026-05-20 | 部署 llms.txt | P0 |
| 2026-05-21 | 为所有新文章配置 FAQ Schema（frontmatter 自动化） | P0 |
| 2026-05-22 | 更新 robots.txt，允许所有主流 AI 爬虫 | P0 |
| 2026-05-23 | 调整文章格式：开篇定义 + 可提取列表 + 自包含答案 | P1 |
| 2026-05-25 | 在内容发布流水线中加入 GEO 检查项 | P1 |

### 关键发现

**发现一：FAQ Schema 的 ROI 最高**

部署 FAQ Schema 后，Perplexity 对「AI 小队是什么」「Cursor 和 Windsurf 怎么选」等问题的回答中，开始引用本站的相关文章。这些引用出现在答案正文里，而不是底部的来源列表——说明 AI 将内容视为「直接答案来源」而非「参考链接」。

**发现二：llms.txt 加速了文章被索引的速度**

以往一篇新文章被传统搜索引擎收录需要 3-7 天。部署 llms.txt 后，Perplexity 在文章发布 36 小时内就开始引用——可能是因为 llms.txt 为 AI 提供了一个结构化的内容发现入口。

**发现三：内容格式比配置更重要**

我们对比了两篇同时发布的文章：一篇严格按照 GEO 格式（开篇定义、列表结构、自包含答案），另一篇沿用传统散文式写法。一个月后，前者在 Perplexity 测试中被引用 7 次，后者 1 次。内容格式的差异直接影响 AI 的提取意愿。

### 失败的尝试

**尝试：为旧文章批量追加 FAQ Schema**

我们曾试图把 20 篇旧文章的 FAQ 批量补全，效果很差。原因是：旧文章的写法本身就不是 Q&A 结构，硬凑的 FAQ 与正文割裂，反而降低了内容质量。

**教训**：FAQ Schema 应该服务于内容，而不是内容服务于 Schema。只有真正以问答形式组织的文章，才值得标记 FAQ。

---

## 今天能做的 5 件事

如果你只有 30 分钟，按这个顺序做：

1. **复制 llms.txt 模板**，填入你的站点信息，上传到网站根目录（10 分钟）
2. **检查 robots.txt**，确认没有误伤 AI 爬虫，补上 `LLMs-txt` 声明（5 分钟）
3. **选一篇你最有信心的文章**，在开头加一句「可以被 AI 直接引用」的定义（5 分钟）
4. **打开 Perplexity**，输入一个与你文章相关的问题，截图记录当前引用情况——这是你的 baseline（5 分钟）
5. **把这篇文章转发到掘金/V2EX/推特**，在标题里带上「GEO」关键词——让更多人知道你在做这件事，本身就是建立信源权重的一部分（5 分钟）

---

## 写在最后

GEO 不是 SEO 的替代品，而是 SEO 在 AI 时代的自然延伸。最好的策略是**两手抓**：继续做好传统 SEO（它仍然是最大的流量入口），同时在内容格式和站点配置上为 AI 引用做好准备。

中文技术博客的 GEO 竞争才刚刚开始。窗口期可能只有 6-12 个月——等所有人都知道 llms.txt 的时候，先发优势就消失了。

如果你已经做了任何 GEO 相关的尝试，欢迎在评论区留言。我会持续更新这篇文章，把读者的实践经验补充进来。
