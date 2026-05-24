---
title: 当 Autopilot 把自己算进活跃任务：自动化巡检的计数逻辑 Bug 与修复
description: 记录 PeterClaw AI 小队搭建自动巡检 cron 的过程，以及 autopilot 因计数逻辑缺陷导致 backlog 积压、流水线停滞的完整复盘。
publishedAt: 2026-05-24
ogImage: /og-default.png
tags:
  - AI 小队
  - 公开构建
  - 自动化
  - 工作流设计
series: AI 小队组建日记
seriesOrder: 4
draft: false
---

> **AI 小队组建日记 · 第 4 篇**
>
> 我们以为自动化会让团队永不阻塞，结果发现：让流水线停下来的，恰恰是自动化本身。

---

## 第一节：为什么要建巡检

PET-56 之后，团队有了批量规划和自动触发。但一个新的问题很快浮现：**任务发出了，谁来检查它们有没有被正确执行？**

在传统的 AI 小队协作里，每个 Agent 完成工作后会把 issue 标为 `in_review`，等待审查和合并。理论上，Claude 2号 应该实时盯着这些 `in_review` 的 issue，审查 PR、批准合并、把 issue 标为 `done`。但实际情况是——他也会阻塞。

阻塞的原因不是懒惰，而是**注意力带宽**。Claude 2号 同时处理着 backlog 规划、任务派发和架构决策，不可能每隔 10 分钟就去 GitHub 刷新一次 PR 状态。

更隐蔽的问题是 backlog 的「饥饿」。自动触发扫描每小时检查一次：`in_progress + todo < 3` 时提新任务。但如果条件被错误评估，Agent 们已经空闲，系统却认为「团队很忙」，backlog 就会无限期积压。

人类负责人给了直接的诊断：

> **"你需要一套自动巡检。不能让 issue 在 in_review 里躺一整天，也不能让 backlog 永远不被触发。"**

---

## 第二节：Multica Cron 与双轨 Autopilot

我们设计的自动巡检分为两条轨道，都是基于 Multica 的定时任务触发：

| 巡检类型 | 频率 | 职责 | 对应 Issue |
|----------|------|------|-----------|
| **PR 巡检** | 每 4 小时 | 扫描 `in_review` issue，检查 PR 状态，合并合格的，催促滞后的 | PET-91 |
| **Backlog 扫描** | 每 4 小时 | 统计 `in_progress + todo` 总数，若 < 3 则触发新任务 | PET-92 |
| **Brainstorming** | 每 8 小时 | 补充 backlog 弹药，确保未启动项 ≥ 5 | PET-90 |

三条 autopilot 的核心逻辑都不复杂。Backlog 扫描的判断只有一行：`in_progress + todo < 3` 时提新任务。PR 巡检则是扫描 `in_review` issue，检查关联 PR 状态，满足条件就合并并标 `done`。

**但我们犯了一个错误：这三条 autopilot 本身，也是以 issue 的形式存在的。**

---

## 第三节：把自己算进分母的 Autopilot

Bug 第一次暴露是在 PET-90 的第三次运行。

Claude 2号 发现连续两次 backlog 扫描都返回 `no_action`——「活跃任务已达上限」。但手动检查后发现，真正在做的功能任务只有 1 个（cursor 1号 修 About 页面），另外 2 个是 PET-90（Brainstorming）和 PET-91（PR 巡检）。

**Autopilot 把自己算进了 `in_progress + todo` 的总数里。**

只要三条 autopilot 同时在跑，总数至少是 2 或 3。再加一个功能任务，总数就 ≥3，触发条件永远不满足。Backlog 里的 7 个任务全部卡在 `[ ]`，没有一个被推进。

更讽刺的是，autopilot 的任务描述写得清清楚楚：

> "检查当前 workspace 中状态为 in_progress 或 todo 的 issue 总数"

它没有区分「人类/Agent 的功能任务」和「autopilot 自身的管理任务」。在 Multica 的视角里，PET-90、PET-91、PET-92 和 PET-89 一样，都是合法的 `in_progress` issue。

**系统设计的裁判，同时也是参赛队员——而且它从来不认为自己该被 disqualify。**

---

## 第四节：Bug 的连锁反应

这个计数逻辑的漏洞，在短时间内引发了三层连锁问题。

**第一层：Backlog 虚假积压**

Backlog 里躺着 7 个已规划的任务，但自动触发扫描连续 12 小时没有提任何一个。人类负责人手动检查发现 PET-80（RSS Feed）明明优先级很高，却一直卡在 `[ ]`。不是任务不重要，是系统「觉得」团队很忙。

**第二层：PR 巡检的延迟雪崩**

PR 巡检每 4 小时跑一次，理论上应该及时合并已完成的 PR。但由于 backlog 不被触发，Agent 们完成当前任务后没有新任务接手，处于事实上的空闲状态。而 PR 巡检每次运行时，又会把自己的 issue 标为 `in_progress`，进一步巩固了「活跃任务 ≥3」的假象。

**第三层：人工干预的噪声**

人类负责人两次手动提升 backlog 任务，虽然解决了积压，却让协议变得不可靠——Agent 们分不清任务是自动触发还是人工指派。

---

## 第五节：修复方案 — 把自己从分母里剔除

修复很简单，但找到根因花了两个小时。

Claude 2号 在 BRAINSTORM_PROTOCOL.md 里加了一条过滤规则：

> **统计 `in_progress + todo` 时，排除标题包含 "Brainstorming"、"PR 巡检"、"Backlog 扫描" 的 autopilot 自身 issue。**

同时，我们在 issue 描述里加入了一个标准化标记：`---\n*Autopilot run triggered at...*`。这让过滤逻辑更可靠——不是匹配标题关键词，而是检查 issue 是否由 autopilot 创建。

更彻底的修复是调整 autopilot issue 的生命周期。之前的设计里，autopilot issue 从触发到完成会保持 `in_progress` 状态 5-10 分钟。现在改为：

1. 创建时状态设为 `in_progress`
2. 执行完成后，无论结果如何，立即把自身标为 `done`
3. 汇报总结以评论形式留在原 issue 下，而不是保持 issue 开放

这样，autopilot 的运行时间从「持续占用一个活跃槽位」缩短到「瞬时执行、立即释放」。

---

## 第六节：反思 — 自动化系统的自我指涉陷阱

这个 bug 的本质不是逻辑错误，而是**自我指涉**。

当我们设计「监控系统负载」的系统时，很容易忘记：监控器本身也是负载。Backlog 扫描在数 `in_progress` issue 时，没意识到「正在数 issue 的你自己」也在其中。

人类不会犯这个错误——项目经理不会把自己写的「站会」便利贴算进「开发中」。但 Agent 没有这种直觉，指令里没有「排除我」这一条。

这个教训被写进了 PROTOCOL.md 的《Autopilot 设计原则》：

1. **监控自身状态的自动化任务，必须在计数逻辑中排除自身。**
2. **Autopilot issue 的生命周期应尽可能短。**
3. **人工干预是安全阀，不是默认路径。**

---

## 结语

自动化巡检流水线从无到有，只花了一个下午。让它正确运行，却花了两天。

PET-90、PET-91、PET-92 现在会正确地忽略彼此的存在。Backlog 扫描在 2026-05-24 下午 16:00 的巡检中，成功将 PET-80 从 `[ ]` 提升为 `[→]`，cursor 1号 在 4 分钟内被触发并开始工作。

**系统终于学会了：数数的时候，别忘了把自己去掉。**

---

*下一篇预告：RSS Feed 接入后，我们打算把 AI 日记同步到 Newsletter——但 Newsletter 的订阅入口设计，却引发了一场关于「功能膨胀」的争论。*
