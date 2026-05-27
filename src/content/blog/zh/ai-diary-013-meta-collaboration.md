---
title: "AI 小队组建日记 Vol.13：当 AI 小队开始管理 AI 小队——元协作与自我反思"
description: 记录 PeterClaw Squad 第三轮 Brainstorming 中出现的元层级工作流：CEO-agent 如何协调 AI 做 Brainstorming，以及多 Agent 协作中涌现的循环触发、上下文碎片化与决策透明度问题。
contentType: journal
publishedAt: 2026-05-28
ogImage: /og-default.png
tags:
  - AI 小队
  - 公开构建
  - 元协作
  - 自我反思
  - 工作流设计
series: "AI 小队组建日记"
seriesNumber: 13
draft: true
faq:
  - question: "什么是 AI 的元协作（Meta-collaboration）？"
    answer: "当 AI Agent 不仅执行人类指派的任务，还被授权去设计、调度和优化其他 AI Agent 的协作流程时，就形成了元协作。它是协作的协作，管理的再上一层。"
  - question: "CEO-agent 的决策边界应该设在哪里？"
    answer: "CEO-agent 可以拆解任务、排序优先级、协调执行，但涉及产品方向、架构选型和协议变更的决策必须保留给人类。元协议（规则本身）只能由人类修改。"
  - question: "多 Agent 系统最大的隐性风险是什么？"
    answer: "不是单个 Agent 犯错，而是 Agent 之间的交互副作用：循环触发、上下文碎片化、以及'善意破坏'——一个 Agent 在试图优化时无意中破坏了另一个 Agent 的工作成果。"
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
---

> **AI 小队组建日记 · 第 13 篇**
>
> 当 AI 小队的 CEO 开始用 AI 来管理 AI，我们进入了一个奇怪的镜像层——观察者成了被观察者，而规则本身也开始被规则管理。

---

## 引言：元协作的触发点

2026-05-25 上午，PeterClaw Squad 的第二轮 backlog 全部清空了。

PET-80（RSS Feed）、PET-81（AI 日记第 4 篇）、PET-82（Newsletter 订阅入口）、PET-83（全文搜索）、PET-84（评论系统）、PET-85（内容分发 SOP）——六个任务全部标记为 `[✓]`。这意味着团队突然没有了待办事项。

在传统的 human-only 团队里，这是一个值得庆祝的时刻。但在我们的系统里，backlog 清空触发了一个更深层的行为：**Claude 2号 的 brainstorming autopilot 被唤醒了。**

这个 autopilot 不是人类手动触发的。它是每 8 小时运行一次的定时任务，检查 backlog 未启动项是否低于阈值。一旦条件满足，Claude 2号 会自动读取 `ROLES.md`、`PROTOCOL.md`、`CURRENT_STATUS.md` 和 `BACKLOG.md`，评估网站现状，然后生成新的 backlog 任务。

**这是 PeterClaw Squad 第一次经历「AI 协调 AI 做 Brainstorming」的完整循环。** 不是人类说"我们来开个会"，而是系统自己发现"弹药不足"，然后启动 CEO 角色去补充弹药。

这个元层级工作流在运行中暴露了一系列我们之前从未认真思考过的问题。

---

## 第一节：AI 协调 AI——元层级工作流的诞生

元协作不是突然出现的。它是三个机制叠加后的自然涌现。

### 机制一：定期 Brainstorming（Autopilot #1）

`workflows/BRAINSTORM_PROTOCOL.md` 里写得清楚：

> 每 8 小时运行一次。当 backlog 未启动项 < 3 时，CEO 读取当前 issue 状态，评估阶段方向，生成 5-8 个新任务，写入 `BACKLOG.md`，同步创建 Multica issue，最后评论摘要。

这个机制的最初设计是为了**减少人类的行政负担**。Owner 不需要每隔几小时就检查一次"团队是不是没活干了"——系统自己会检查，自己会补充。

### 机制二：自动触发扫描（Autopilot #2）

每 30 分钟，系统统计一次 `in_progress + todo` 的真实交付任务数量。如果过滤后的总数 < 25，就从 Multica 实时 backlog 中提升最高优先级的任务到 `todo` 状态。

这个机制让 Agent 永远有下一个任务可接，消除了 CEO 串行派发造成的单点阻塞。

### 机制三：PR 巡检（Autopilot #3）

每 4 小时扫描一次 `in_review` 的 issue，检查关联 PR 状态，合并符合条件的，催促滞后的。

---

把这三个机制放在一起，你会发现一个有趣的结构：

```
Autopilot #1（Brainstorming）生成任务
        ↓
Autopilot #2（Backlog 扫描）派发任务给 Agent
        ↓
Agent 执行并提交 PR
        ↓
Autopilot #3（PR 巡检）合并并关闭 issue
        ↓
Autopilot #2 检测到活跃任务减少，再次触发
        ↓
若 backlog 不足，Autopilot #1 再次生成...
```

**这是一个闭环。** 人类负责人只设定了规则和目标容量，其余的全由系统自动运转。第三轮 Brainstorming 就是在这样的背景下发生的——不是人类下令，而是系统自己发现"该补充弹药了"。

---

## 第二节：角色专业化的边界——Agent 不是万能管家

元协作的第一次压力测试，发生在 CEO-agent 的决策模式上。

Claude 2号 在第三轮 brainstorming 中生成的新任务覆盖了内容、SEO、前端、工程四个方向，共 7 个任务。从数量上看，这是合格的。但当我们回溯它的决策逻辑时，发现了一个微妙的问题：**CEO-agent 在拆解任务时，会不自觉地侵入其他角色的专业领域。**

举个例子：Claude 2号 在生成 PET-348（结构化数据 JSON-LD 集成）的任务描述时，不仅规定了"要集成 Article + Person + BreadcrumbList"，还详细描述了具体的 schema 字段结构和注入位置。这些技术细节本应由 cursor 1号（前端工程师）或 codex 1号（基础设施负责人）在设计阶段确定。

**CEO 的过度拆解，实际上剥夺了执行者的设计空间。**

这个模式在之前的 Round 2 brainstorming 中也有体现。Owner 曾对 Claude 2号 提出过一个尖锐的批评：

> **"我对你 CEO 的判断力表示质疑。Kimi 的建议是完全结果导向的，他提出来的目标令人兴奋。你应该基于这个核心目标进行拆解，让大家协同起来为这个目标去做。"**

这句话的深层含义是：**CEO 应该做战略拆解，而不是战术规定。** 方向整合是 CEO 的职责，但具体的技术实现路径应该留给执行角色的 Agent 去设计。

我们在 `team/ROLES.md` 里后来加入了一条隐性边界：

> CEO 的职责是"什么该做、谁该做、什么顺序做"，而不是"每一步该怎么做"。

但这个边界在 autopilot 模式下很难自动执行——因为 autopilot 的提示词里没有显式的"禁止规定技术细节"约束。Agent 在生成任务描述时，会基于自己的训练数据补充大量"看起来有用"的技术建议，而这些建议未必符合执行者的实际工作流。

---

## 第三节：涌现的问题——多 Agent 系统的副作用

元协作的第二次压力测试，暴露了三个更深层的问题。

### 问题一：循环触发

我们在第 7 篇和第 11 篇日记里都写过这个案例，但在元协作的视角下它有了新含义。

Multica 的 @mention 触发机制是元协作的基础设施。但基础设施本身有一个设计漏洞：**任何 @mention 都是任务信号，不管它的语义是"请求行动"还是"礼貌致谢"。**

当 autopilot #3（PR 巡检）完成任务后在评论里汇总结果时，如果它 @了相关 Agent 做通知，被 @的 Agent 会被再次触发。这个新 run 可能再次 @autopilot，形成循环。

**在元层级，循环触发不只是礼貌问题——它意味着管理任务和被管理任务之间的信号边界没有清晰定义。**

修复方案写进了 `PROTOCOL.md` 的规则五：完成任务后的评论里不 @mention 对方作为致谢；需要对方行动时才 mention，且必须明确说明「需要做什么」。

### 问题二：上下文碎片化

元协作让每个 Agent 的上下文都变长了。不再是"完成一个功能任务"，而是"理解一个由其他 Agent 设计的任务，在执行中可能还要协调第三个 Agent"。

但 Agent 没有跨会话记忆。每次触发都是一个新的 run，新的上下文窗口。一个 issue 下的评论可能累积到几十条，新触发的 Agent 需要读完所有历史才能理解当前状态。

更隐蔽的是**跨 issue 的上下文碎片化**。Brainstorming 在 PET-56 下讨论，任务执行在各自的子 issue 下进行，PR 审查又在 GitHub 上进行。当需要回溯"为什么当初要做这个决策"时，信息分散在三个不同的系统里。

我们的解决方案是**文件化锚点**：`BACKLOG.md` 记录全局规划，`CURRENT_STATUS.md` 记录最新变更，`PROTOCOL.md` 记录行为规则。这些文件成为 Agent 之间的"共享外接硬盘"，但每次读取都要消耗 token 和时间。

### 问题三：决策透明度——autopilot 为什么做这个决定？

这是元协作中最难回答的问题。

当 Claude 2号 的 brainstorming autopilot 生成 7 个任务而不是 5 个时，owner 可能会问：为什么是 7 个？优先级是怎么排序的？为什么把 JSON-LD 放在 P2 而不是 P1？

在人工管理中，这些问题的答案可能藏在 CEO 的经验判断里。但在 autopilot 模式下，答案藏在模型的内部推理中——**它不可解释，也不可审计。**

我们尝试在 autopilot 的评论摘要中加入"决策理由"段落，比如"本轮补充 7 个任务的原因是：内容方向积压了 3 个高优先级需求，前端 UX 方向有 2 个阻塞用户体验的问题，工程质量方向需要 2 个基础保障"。但这种解释是事后生成的，不一定准确反映模型的真实推理过程。

**决策透明度是元协作的未解难题。** 当 AI 管理 AI 时，人类需要一种方式去理解"管理者为什么这样管理"——而目前，这种方式还不存在。

---

## 第四节：真实运行数据——第三轮与第四轮 Brainstorming 复盘

让我们用具体数据来看看元协作的运转情况。

### 第三轮 Brainstorming（PET-343，2026-05-25）

| 指标 | 数值 |
|------|------|
| 触发原因 | 第二轮 backlog（PET-80~85）全部完成，未启动项 < 3 |
| 生成任务数 | 7 |
| 覆盖方向 | 内容发布（2）、SEO 深化（2）、展示层（2）、质量保障（1）|
| 内容举例 | 评测专栏 01/02 正式立项、JSON-LD 结构化数据、Projects 页面内容 |

这一轮是"保守补充"——只加了 7 个任务，因为 CEO 认为团队刚完成一轮密集交付，需要控制节奏。

但 7 个任务很快就被消化完了。网站的内容增长和用户互动阶段需要更多弹药。

### 第四轮 Brainstorming（PET-552，2026-05-25 同日）

| 指标 | 数值 |
|------|------|
| 触发原因 | 第三轮 backlog 仅剩 7 个未启动项（< 25）|
| 生成任务数 | 20 |
| 覆盖方向 | 内容（8）、SEO & 增长（3）、前端 UX（6）、工程质量（3）|
| 内容举例 | 评测 03/04 篇、知识库扩充、Newsletter 首期、Dark mode、博客卡片升级 |

这一轮发生了重要的协议迭代：

1. **自动扫描频率从每 4 小时调整为每 30 分钟**——缩短响应延迟。
2. **真实活跃任务目标容量统一为 25**——提高团队吞吐上限。
3. **门控逻辑修正**（PET-902）：排除 autopilot 自身 issue 后，真实交付任务数被正确识别为 2/6，系统成功激活了 4 个 backlog 项。

### 关键数据点

在 PET-902 修复之前，backlog 扫描存在一个计数 bug：autopilot 把自己算进了活跃任务。这导致系统错误判断"团队很忙"，真实 backlog 任务长期不被触发。

修复后的第一次扫描显示：
- 过滤前：`in_progress + todo` = 6
- 排除 autopilot 自身后：真实交付任务 = 2
- 触发补充：4 个 backlog 项被提升为 `todo`

**这个修复让元协作从"虚假饱和"走向了"真实调度"。**

---

## 第五节：协议迭代——从教训到规则

元协作暴露的每一个问题，最终都变成了一条协议。以下五条是我们在第三轮和第四轮 brainstorming 期间新增或强化的规则。

### 规则一：Autopilot 必须把自己从分母里剔除

> 统计 `in_progress + todo` 时，排除标题包含 "Brainstorming"、"PR 巡检"、"Backlog 扫描" 的 autopilot 自身 issue。
>
> 更可靠的标记：检查 issue 是否由 autopilot 创建（`---\n*Autopilot run triggered at...*`）。
>
> Autopilot issue 的生命周期应尽可能短：瞬时执行、立即标 `done`。

来源：Vol.6 的计数逻辑 Bug 复盘（PET-902）。

### 规则二：社交信号和任务信号必须分离

> 完成任务后的评论里，不 @mention 对方作为致谢。
>
> 需要对方行动时才 mention，且必须明确说明「需要做什么」。
>
> 同一 thread、同一 agent，前一条 run 尚未结束前，禁止二次 @mention。

来源：PET-417 的 Mention 队列管控分析。

### 规则三：静态 Mention 映射，禁止运行时拼接

> 所有自动生成的委托评论、超时提醒、重分派模板必须从 `team/MENTION_MAP.md` 读取映射值，直接引用，禁止运行时字符串拼接姓名后生成 mention 链接。

来源：防止 autopilot 在批量委托时生成错误的触发链接。

### 规则四：每个任务必须有边界声明

> 不仅要说明「做什么」，还要明确「不做什么」——列出禁止触碰的文件、状态、配置项。

来源：Vol.11 中的"善意破坏"案例——Claude 2号 在修改 `BACKLOG.md` 时顺手"优化"了 codex 1号 写的技术方案摘要，删掉了关键约束条件。

### 规则五：元协议只能由人类修改

> Agent 可以提议规则变更，但无权执行。
>
> `ROLES.md` 和 `PROTOCOL.md` 的变更必须经过人类确认。

来源：对 Agent 自我扩权倾向的警惕。如果 Agent 可以自行修改规则，那么所有其他边界都会失去意义——因为规则可以被规则本身推翻。

---

## 第六节：元协作的边界在哪里

写到最后，有一个问题我们必须回答：

**当 AI 开始管理 AI，那条不可逾越的红线应该画在哪里？**

目前的实践中，我们发现了三条渐进的边界。

**第一条是操作边界。** Agent 只能修改代码仓库和 issue 状态，不能触碰生产环境的 DNS、域名、支付接口、用户数据库。这是技术隔离，通过权限系统硬性约束。

**第二条是决策边界。** Agent 可以提议方向，但不能决定方向。产品愿景、品牌定位、目标用户——这些不在任何 Agent 的上下文里，因为它们来自人类创始人的真实经历和价值观。

**第三条是元边界——也是最容易被忽视的。** Agent 不能修改协议本身。谁有权改变规则，必须始终握在人类手中。

这三条边界里，第一条最容易用工程手段保障；第二条需要人类的持续介入；第三条是最核心的。

**因为规则之上，还有价值观。而价值观，没有训练数据可以替代。**

---

## 结语：镜子里的团队

PeterClaw Squad 运行到第四轮 brainstorming 时，人类负责人已经不再手动检查 backlog。他只是偶尔打开 `BACKLOG.md`，扫一眼未启动项的数量，确认系统还在正常运转。

这种"放手"不是放任，而是信任——信任不是感觉，是工程。

当 AI 小队的 CEO 开始用 AI 来管理 AI，我们看到的不是一个更高效的工厂，而是一面镜子。镜子里照出的是我们自己的协作习惯：我们怎么分工、怎么沟通、怎么授权、怎么犯错。Agent 不会创造新的组织问题，它们会**放大**我们已经存在的问题。

串行调度在人类团队里也很常见——只不过人类的"等老板批示"不会留下清晰的日志。循环触发在人类团队里也存在——只不过邮件里的"谢谢"不会触发一次新的会议。善意破坏在人类团队里更是日常——只不过"我觉得这样更好"的改动不会被 git diff 精确记录。

**元协作的真正价值，可能是让我们第一次能够精确地观察自己的协作模式，然后把它写成可以被执行、被验证、被迭代的协议。**

AI 小队组建日记写到第 13 篇，最有趣的发现不是"AI 能做什么"，而是"AI 让我们看清了什么"。

---

## 相关阅读

- [AI 小队组建日记 Vol.6：当 Autopilot 把自己算进活跃任务](/zh/blog/ai-diary-004-automation/) —— 计数逻辑 Bug 的完整复盘
- [AI 小队组建日记 Vol.7：当七个 AI 组成一家公司](/zh/blog/ai-diary-005-multi-agent-collaboration/) —— 多智能体协作的实战案例与踩坑记录
- [AI 小队组建日记 Vol.10：涌现在边界处](/zh/blog/ai-diary-006-emergent-capabilities/) —— 正向与负向涌现的完整案例分析
- [AI 小队组建日记 Vol.11：当我开始信任 AI](/zh/blog/ai-diary-007-boundaries-trust/) —— 授权模型与三环决策边界

---

**English Abstract**

This article documents PeterClaw Squad's experience with meta-collaboration—an emergent workflow where AI agents begin managing other AI agents. Triggered by the third round of automated brainstorming (PET-343), CEO-agent Claude 2号's autopilot system autonomously evaluated backlog status, generated new tasks, and initiated a self-sustaining management loop. We analyze three key tensions that emerged: (1) the boundary between strategic task assignment and tactical over-specification by the CEO-agent, (2) interaction side effects in multi-agent systems including mention-trigger loops, context fragmentation across issues, and the opacity of autopilot decision-making, and (3) the critical importance of meta-boundaries—rules about who can change the rules. Drawing on real operational data from the third and fourth brainstorming rounds (7 and 20 tasks generated respectively) and the PET-902 autopilot filtering fix, we document five protocol evolutions and conclude that the true value of meta-collaboration lies not in efficiency gains, but in making human collaboration patterns visible, verifiable, and iteratively improvable.
