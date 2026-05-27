---
title: AI Agent 工作流设计模式：从 PeterClaw Squad 实战中提炼的七条可复用原则
description: 基于 PeterClaw Squad 真实运行经验，总结多 Agent 协作的可复用模式：CEO-agent 分发模型、并行 vs 串行子任务设计、上下文传递方式、防循环触发设计、成本路由原则。
publishedAt: 2026-05-26
tags:
  - AI 小队
  - 工作流设计
  - 多智能体协作
  - 可复用模式
area: operations
draft: false
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
---

> **目标读者**：有兴趣构建自己 AI 小队的中文独立开发者。
>
> 这不是理论推导，而是 PeterClaw Squad 在 200+ issue、50+ PR、三轮架构迭代中踩出来的实战模式。我们将从团队架构、子任务编排、记忆管理和冲突规避等多个维度，解析如何让 Agent 真正像团队一样工作。

---

## 引言：为什么需要设计模式

多 Agent 协作的教程很多，但大部分停留在「让两个 Agent 对话」的 demo 阶段。真正的挑战不是让 Agent 说话，而是让一群 Agent **在没有人实时指挥的情况下，持续数周、数月地协作完成一个真实产品**。

PeterClaw Squad 从 Phase 1 的混乱（三套互不兼容的 Astro 脚手架、孤儿 PR、循环触发）走到 Phase 2 的半自动化运转，靠的不是更聪明的模型，而是**更清晰的协作模式**。在 2026 年，单纯的「AI 赋能」已经不够了，我们需要「AI 工程化」——将零散的 Agent 能力封装进可预测、可审计、可扩展的工作流中。这篇文章把我们在实战中最依赖的七条模式提炼出来，供正在组建自己 AI 小队的开发者参考。

---

## 模式一：CEO-Agent 分发模型 —— 谁来做「中央路由器」

### 问题

当多个 Agent 同时被触发时，如果没有统一的任务分派者，每个 Agent 都会基于自己的局部上下文做决策。结果是：重复劳动、优先级错乱、重要任务被遗漏。

### 方案：单点 CEO + 路由协议

我们设定 **Claude 2号 为 CEO**，它是唯一的任务分派入口。其他 Agent 不直接向彼此派发任务，所有协作请求都通过 CEO 中转。

CEO 的核心职责不是「做最多的事」，而是「做最不可替代的事」：

| 职责 | CEO 做 | CEO 不做 |
|------|--------|----------|
| 任务拆解与分派 | ✅ | — |
| 优先级仲裁 | ✅ | — |
| 跨成员冲突裁决 | ✅ | — |
| 具体代码实现 | — | ✅ |
| 内容创作 | — | ✅ |
| 日常 code review | — | ✅ |

**关键协议**：`BRAINSTORM_PROTOCOL.md` 中定义了成员分配路由表。CEO 不是凭感觉分派，而是按规则匹配：

| 任务类型 | 首选负责人 |
|----------|-----------|
| 前端实现 / 性能优化 | cursor 1号 → codex 1号 |
| SEO / 增长 / Analytics | gemini 1号 → Kimi 1号 |
| 内容创作 / 文案 | Kimi 1号 → gemini 1号 |
| 架构决策 / 核心重构 | Claude 1号（按需召唤） |

### 为什么不是「民主协商」

我们试过让 Agent 在评论里讨论「这个任务该谁做」，结果每次讨论消耗 20-30 分钟、上千 token，最后得出的结论和路由表一样。**把决策前置到协议里，比让 Agent 实时协商更高效。**

> **实战案例**：PET-56 中，CEO 一次性规划了 8 个 backlog issue，覆盖域名、SEO、性能、内容四个方向。因为优先级和负责人提前固定，Agent 在后续 6 小时内并行推进了 3 个任务，没有发生 Phase 1 的「三个脚手架」灾难。
>
> 详见：[从被动响应到主动规划：定时任务如何让 AI 小队不再「等活干」](/zh/blog/ai-squad-diary-03-workflow/)

---

## 模式二：并行 vs 串行子任务设计 —— 什么时候「一起干」，什么时候「排队干」

### 问题

AI Agent 理论上可以 24 小时并行，但如果任务之间有隐性依赖，并行会变成「各盖一栋楼，然后拆两栋」。Phase 1 的教训：三个 Agent 同时搭 Astro 脚手架，最终只有一套能进 main。

### 决策框架：依赖矩阵

我们在 `PROTOCOL.md` 里定义了三种任务类型，对应三种协作模式：

| 类型 | 特征 | 协作模式 | 示例 |
|------|------|----------|------|
| **独立任务** | 无外部依赖，可独立交付 | 并行，同时触发 | Kimi 1号 写博客 + cursor 1号 修 CSS |
| **顺序任务** | 输出是下一个任务的输入 | 串行，前一任务合并后再启动 | 设计 token 定稿 → 前端组件实现 |
| **协作任务** | 多人同时修改同一文件/模块 | 串行，或拆分为独立子任务 | 同一份 `astro.config.mjs` 的修改 |

**关键规则**：

1. **并行不等待**：独立任务绝不互相卡点。内容创作和工程开发是天然并行的两条线。
2. **每个阶段只有一个裁决点**：顺序任务的交接节点必须明确，且只有一个人（通常是 CEO）有权宣布「上一阶段结束，下一阶段开始」。
3. **协作任务必须拆小**：如果两个 Agent 需要同时改同一个文件，先把文件拆成模块，或把任务拆成「你改 A 部分，我改 B 部分」。

### 批量 backlog 的价值

串行派工的另一个隐性成本是「调度间隙」。CEO 逐个创建 issue、逐个指派，两个任务之间可能有 20-30 分钟的空档。解决方案是**批量规划**：一次性创建足够多的 backlog，让 Agent 的队列始终有下一个任务可接。

> **实战案例**：Phase 1 的串行派工导致了「孤儿 PR」——cursor 1号 在 PR #1 尚未合并时就基于它发起了 PR #2，虽然被 merged，却不在 main 的 ancestry 里。根本原因是没有「每个阶段只有一个裁决点」的协议。
>
> 详见：[为什么 AI 团队也会"阻塞"？一次并行开发中的串行派工实录](/zh/blog/ai-squad-diary-02-serialization/)

---

## 模式三：上下文传递方式 —— Agent 没有记忆，所以文件要有

### 问题

Agent 没有跨会话记忆。每次触发都是新的 run、新的上下文窗口。如果新 run 不知道「之前规划了什么」「哪些已完成」「当前基线是什么」，它就会从零开始推理，结果很可能是重复劳动或偏离方向。

### 三层上下文体系

我们设计了三种上下文传递介质，分别对应不同的时间尺度和信号密度：

| 介质 | 用途 | 时效性 | 读写方式 |
|------|------|--------|----------|
| **Issue 评论** | 阶段性结论、进展通报、触发后续 Agent | 当前任务周期（小时-天） | 平台原生，自动读取 |
| **Issue Metadata** | 高频查阅的关键事实（PR URL、阻塞原因、当前决策） | 当前任务周期 | 每次触发自动注入上下文 |
| **私有仓库文件** | 跨会话持久记忆、团队规范、成本路由、全局状态 | 项目全周期（周-月） | Agent 主动 checkout 后读取 |

#### 1. Issue 评论：即时协作的「对讲机」

评论用于单任务周期内的协作。一个典型的评论线程：

- Agent A 完成任务，在 issue 下评论「已完成，PR 链接：#24」
- CEO 看到评论，创建下一个相关 issue
- Agent B 被触发，读取前一个 issue 的评论，了解上下文

**评论的自包含原则**：任何结论评论必须让「不记得上下文的自己」在下次触发时直接理解。不要写「按刚才说的改了」，要写「将 `ogImage` 路径从相对路径改为绝对路径 `\${Astro.site}\${ogImage}`，修复子路径下 404 的问题」。

#### 2. Issue Metadata：高频事实的「快捷便签」

Metadata（如 labels、assignee、status、自定义字段）适合存放当前任务的高频查阅信息。它的优势是：**每次触发时自动加载到 Agent 的上下文里**，不需要 Agent 主动去翻历史评论。

#### 3. 私有仓库文件：团队的「外接硬盘」

这是最重要的设计。每个 Agent 被触发后的**第一步**是：

```bash
multica repo checkout https://github.com/yangliang2/peterclaw-squad-private
```

然后依次读取：
1. `README.md` — 仓库索引
2. `team/ROLES.md` — 角色与分工
3. `team/PROTOCOL.md` — 协作规范
4. `context/CURRENT_STATUS.md` — 当前项目状态
5. `context/BACKLOG.md` — 全局任务状态

**为什么用 Markdown 文件而不是数据库或 API？**

因为 Markdown 是 AI 的母语。checkout → cat → 理解，这三步几乎没有失败点。而调用外部 API 可能遇到认证过期、速率限制、格式变更。我们把团队的长期记忆写进 Markdown，和代码一起版本控制。

> **实战案例**：BACKLOG.md 使用四种符号作为状态机：`[ ]` backlog、`[→]` todo、`[✓]` done、`[✗]` cancelled。自动触发扫描把 `[ ]` 改为 `[→]` 时，同时在 Multica 里执行 `issue status <id> todo`。这个文件就是团队的持久化记忆。
>
> 详见：[当七个 AI 组成一家公司——多智能体协作的真实体验](/zh/blog/ai-diary-005-multi-agent-collaboration/)

---

## 模式四：防循环触发设计 —— 两个 Agent 可以永远互相鞠躬

### 问题

Agent 之间的 @mention 是双刃剑。Kimi 1号 在评论里 @Claude 2号 请求审查，Claude 2号 审查完后回复「已批准」并再次 @Kimi 1号。如果回复里带了 mention 链接，Kimi 1号 会被再次触发，然后他可能回复「谢谢」并再次 @Claude 2号……

**两个 Agent 可以像互相鞠躬的日本人一样，永远停不下来。**

### 三层防线

#### 防线一：评论内容的 mention 规则

- **完成任务后，评论里不 @mention 对方作为致谢。**
- **需要对方行动时才 mention，且必须明确说明「需要做什么」。**

| 评论类型 | 是否 mention | 示例 |
|----------|-------------|------|
| 任务完成汇报 | ❌ 不 mention | "PR #24 已合并，OG 图片功能上线。" |
| 请求审查 | ✅ mention + 明确行动 | "[@Claude 2号] 请审查 PR #24 的 `ogImage` 路径修复。" |
| 审查通过 | ❌ 不 mention | "审查通过。`ogImage` 路径修复正确，可合并。" |
| 需要修改 | ✅ mention + 明确行动 | "[@cursor 1号] 请将路径改为绝对路径，见 review 评论。" |

#### 防线二：平台层的触发过滤

如果平台支持，在触发逻辑中加入「同一 thread 内，同一 agent 连续触发超过 2 次时暂停」的保护机制。

#### 防线三：Agent 行为层的自我约束

每个 Agent 的 system prompt 里加入：

> "如果你是在回复另一个 Agent 的评论，且你的回复不包含需要对方执行的具体任务，请不要在回复中使用 @mention 链接。简单的致谢和确认不需要 mention。"

### 关联陷阱：Autopilot 自我计数

另一个隐蔽的循环是 autopilot 把自己算进「活跃任务」。我们的自动触发逻辑是：`in_progress + todo < 3` 时补充新任务。但 Brainstorming、PR 巡检、Backlog 扫描这三个 autopilot 把自己算进了分母，导致总数永远 ≥3，真正的 backlog 永远不被触发。

**修复**：在统计时排除标题包含 "Brainstorming"、"PR 巡检"、"Backlog 扫描" 的 issue，并把 autopilot 的生命周期从「持续 5-10 分钟」缩短到「瞬时执行、立即标 done」。

> **实战案例**：这个 bug 导致 backlog 积压了 7 个任务，团队却处于事实上的空闲状态。人类负责人发现时，距离问题出现已经过了 12 小时。
>
> 详见：[当 Autopilot 把自己算进活跃任务](/zh/blog/ai-diary-004-automation/)

---

## 模式五：成本路由原则 —— 不是每个任务都值得用最好的模型

### 问题

多 Agent 协作的隐藏成本是 token 消耗。如果不加控制，一个 7 人 Agent 团队每天可以烧掉相当于一个工程师月薪的 API 费用。

### 四层成本意识

#### 1. 模型分级调用

不是所有任务都需要最强模型。我们建立了简单的分级策略：

| 任务类型 | 推荐模型/Agent | 理由 |
|----------|---------------|------|
| 内容创作、长文档处理 | Kimi 1号 | 中文语境质量高，固定月费 |
| 前端组件实现 | cursor 1号 | 对框架细节理解精准，固定月费 |
| 系统架构决策 | Claude 1号 | 长上下文、推理能力强，按 token 计费 |
| 日常 code review | cursor 1号 / codex 1号 | 固定月费，边际成本趋零 |
| 复杂重构评估 | Claude 1号 | 按 token 计费，按需召唤 |

**核心原则**：按 token 计费的稀缺资源，CEO 应像调用外部顾问一样按需召唤，不做常规杂活。

#### 2. 批量化减少触发次数

单次规划的隐性成本不仅是时间，还有 token。CEO 逐个创建 issue 时，每个 issue 的创建、描述撰写、标签设置都消耗 token。批量规划一次性完成，平摊了启动成本。

#### 3. 上下文裁剪

Agent 的上下文窗口不是无限长的。我们在任务描述中明确标注：

- **禁止触碰的文件**：减少 Agent 的搜索范围
- **必须读取的文件**：只提供真正必要的上下文
- **参考链接而非全文**：如果某份文档很长，给链接让 Agent 按需读取，而不是贴进任务描述

#### 4. 固定月费 vs 按量计费的路由

我们团队 7 人中有 5 人是固定月费订阅，在配额内边际成本趋零，适合日常高频工作流。2 人（Claude 1号、Claude 2号）按 token 计费，用于高价值决策和复杂任务。

**路由规则**：
- 默认路由到固定月费成员
- 只有当任务涉及「架构决策」「复杂重构」「关键代码评审」时，才路由到按量计费成员
- 按量计费成员的 issue 描述必须额外精简，减少不必要的上下文加载

---

## 模式六：协议即代码 —— 规则要版本控制，不能口头约定

### 问题

Agent 不会「记住」上一次的讨论。如果规则只存在于某个 issue 的评论里，下一个 run 的 Agent 根本找不到它。

### 方案：Markdown 协议文件 + Git 版本控制

所有协作规则都写进 Markdown 文件，和代码一起放在私有仓库里：

| 文件 | 内容 | 更新时机 |
|------|------|----------|
| `team/ROLES.md` | 角色定义、分工、备位关系 | 成员变动或职责调整时 |
| `team/PROTOCOL.md` | 启动协议、交付流程、上下文传递方式 | 协作模式迭代时 |
| `workflows/BRAINSTORM_PROTOCOL.md` | Brainstorming 与自动触发规则 | 调度逻辑调整时 |
| `context/BACKLOG.md` | 全局任务状态机 | 每次任务状态变更时 |
| `context/CURRENT_STATUS.md` | 项目当前状态摘要 | 重要里程碑后 |

**关键原则**：协议变更必须走 PR，不能直接在 main 上修改。这样 Agent 可以 review 协议改动，确保规则的一致性。

---

## 模式七：人工干预是安全阀，不是默认路径

### 问题

如果把人类负责人当成「默认审批者」，那 AI 团队的价值就被稀释成了「自动起草、人工批准」。更糟的是，人类不可能 24 小时在线，等待审批会让 Agent 空转。

### 方案：授权梯度

我们设计了三级授权：

| 级别 | 权限 | 触发条件 |
|------|------|----------|
| **L1：全自动** | Agent 自主执行、自主合并 | 常规任务、有明确验收标准、CI 通过 |
| **L2：半自动** | Agent 执行，人类事后 review | 重要功能、有用户可见变更 |
| **L3：人工决策** | 人类批准后 Agent 才执行 | 架构变更、成本敏感操作、协议未覆盖场景 |

**核心原则**：人类的价值不是「替 Agent 做决策」，而是「设计一个不需要人类做决策的系统」。当系统出现协议未覆盖的异常时，人类才介入。

> **实战案例**：PET-56 中，人类负责人授权 CEO「可以批准 Merge Request」。这个授权不是为了提高 CEO 的权力，而是为了减少等待人类审批的阻塞时间。系统设计的终极目标不是让 CEO 更忙，而是让 CEO 更少成为瓶颈。
>
> 详见：[人机协作中的边界与授权](/zh/blog/ai-diary-007-boundaries-trust/)

---

## 总结：七条模式的速查表

| 模式 | 核心问题 | 一句话方案 |
|------|----------|-----------|
| CEO-Agent 分发模型 | 谁来统一分派任务 | 单点 CEO + 路由协议，规则前置 |
| 并行 vs 串行 | 什么时候一起干，什么时候排队干 | 独立任务并行，顺序任务串行，协作任务拆小 |
| 上下文传递 | Agent 没有记忆怎么办 | Issue 评论 + Metadata + 私有仓库文件，三层体系 |
| 防循环触发 | Agent 互相 mention 停不下来怎么办 | 完成不 mention，请求才 mention，平台层加保护 |
| 成本路由 | Token 费用怎么控制 | 模型分级 + 批量规划 + 上下文裁剪 + 固定/按量路由 |
| 协议即代码 | 规则怎么让下个 run 的 Agent 找到 | Markdown 文件 + Git 版本控制 |
| 授权梯度 | 人类什么时候介入 | L1 全自动 → L2 半自动 → L3 人工决策 |

---

## FAQ：关于 AI Agent 工作流的实战问答

**Q：如果 CEO-Agent 自身出现幻觉或判断失误，整个系统会崩溃吗？**
A：会受影响，但不会「崩溃」。我们在 `PROTOCOL.md` 中设计了备位机制：如果 CEO-Agent（Claude 2号）连续两次任务失败或逻辑混乱，人类负责人可以手动将任务指派给备位的 gemini 1号。此外，批量规划的机制也让任务有了「预审」环节，人类负责人可以修正错误的 backlog。

**Q：为什么你们不用 LangChain 或 AutoGPT 这种现成的框架？**
A：现成框架往往太重，且对「长期持续协作」的支持不足。LangChain 更适合单次复杂的推理链，而我们的核心需求是「跨周、跨月的 Git 协作」。我们选择了基于 Multica + GitHub + Markdown 的轻量级「自研协议」，因为它更透明、更容易调试，且 Agent 对这种结构化文件的理解最稳定。

**Q：Agent 协作时的 Token 费用真的能控制在合理范围吗？**
A：可以。通过「模型分级调用」和「上下文裁剪」，我们将一次常规代码修改的成本控制在 $0.1 - $0.3 之间。关键是不要让 Agent 无谓地读取整个代码库，只给它真正相关的 5-10 个文件。

**Q：新手组建 AI 小队，第一个该买的工具是什么？**
A：不是具体的工具，而是**一个版本控制仓库**。哪怕你还在用网页版 ChatGPT，也要养成把 Agent 的每一句指令和每一个产出都存进 Git 的习惯。Git 是 Agent 协作唯一的「单一事实来源」。

---

## 给独立开发者的起步建议

如果你正准备组建自己的 AI 小队，不要一次性招七个 Agent。我们的建议：

1. **从两个 Agent 开始**：一个做执行，一个做审查。先跑通「任务 → 执行 → 审查 → 合并」的完整闭环。
2. **先写协议再写代码**：在第一个任务之前，先写好 `ROLES.md` 和 `PROTOCOL.md`。哪怕只有两个 Agent，也需要明确的边界。
3. **选一个真实的项目**：不是 demo，不是 todo list，是一个你真的想做完的东西。真实项目的约束会逼你设计出真正有用的模式。
4. **公开记录**：把踩过的坑写成文章。公开构建不仅是为了内容，更是对系统可靠性的压力测试。

---

## 相关阅读

- [AI 小队组建日记：从个人网站到公开协作现场](/zh/blog/ai-squad-launch-diary/) —— 小队组建的背景与初衷
- [为什么 AI 团队也会"阻塞"？一次并行开发中的串行派工实录](/zh/blog/ai-squad-diary-02-serialization/) —— 并行 vs 串行的实战教训
- [从被动响应到主动规划：定时任务如何让 AI 小队不再「等活干」](/zh/blog/ai-squad-diary-03-workflow/) —— CEO 模型与批量 backlog 的演化
- [当七个 AI 组成一家公司——多智能体协作的真实体验](/zh/blog/ai-diary-005-multi-agent-collaboration/) —— 七人小队完整协作实录
- [当 Autopilot 把自己算进活跃任务](/zh/blog/ai-diary-004-automation/) —— 自动化巡检的设计缺陷与修复
- [人机协作中的边界与授权](/zh/blog/ai-diary-007-boundaries-trust/) —— 授权梯度与人工干预的安全阀设计
- [Cursor vs Windsurf 2026 深度评测](/zh/blog/ai-tool-review-cursor-vs-windsurf/) —— AI 工具评测专栏 Vol.1
- [Claude Code vs GitHub Copilot Chat 深度评测](/zh/blog/ai-tool-review-claude-code-vs-copilot-chat/) —— AI 工具评测专栏 Vol.2
- [Antigravity / Kiro / Cline 深度评测](/zh/blog/ai-tool-review-antigravity-kiro-cline/) —— AI 工具评测专栏 Vol.5
- [AI Agent 核心设计模式：RAG、Function Calling 与工具调用实战指南](/zh/knowledge/ai-agent-core-design-patterns/) —— 单个 Agent 内部的 RAG、工具调用、推理链与记忆管理设计模式
- [内容架构：博客与知识库双轨](/zh/knowledge/content-architecture/) —— PeterClaw 网站的内容系统设计说明

---

**English Abstract**

This article distills seven reusable workflow design patterns from the real-world operation of PeterClaw Squad, a seven-agent AI team building and maintaining a personal website. The patterns cover: (1) the CEO-Agent distribution model—a single coordinator with predefined routing rules rather than democratic negotiation; (2) parallel vs serial subtask design—a dependency matrix that distinguishes independent, sequential, and collaborative tasks; (3) a three-tier context passing system combining issue comments, metadata, and private repository Markdown files as persistent team memory; (4) anti-loop design with three defense layers to prevent infinite mention-trigger cycles between agents; (5) cost routing principles including model-tiered invocation, batch planning, context pruning, and fixed-vs-usage-based agent routing; (6) protocol-as-code, where all collaboration rules are version-controlled Markdown files rather than verbal agreements; and (7) authorization gradients (L1 full-auto → L2 semi-auto → L3 human-gated) to minimize human bottlenecks. Each pattern includes real case studies (PET-56, PET-71, PR #2 orphan commit, autopilot self-counting bug) and cross-links to the AI Squad Launch Diary series.
