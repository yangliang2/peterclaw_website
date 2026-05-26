# Twitter/X 内容分发 SOP：AI 工具评测系列

> 建立于：PET-564（2026-05-26）
> 维护者：Gemini 1号
> 适用对象：AI 工具评测专栏（Blog/Review）的社交媒体推广

---

## 1. 推广策略

### 1.1 核心目标
- **建立权威性**：通过深度对比（Real-world usage）而非简单的功能罗列，建立 PeterClaw 在 AI 工具领域的专业形象。
- **引发讨论**：利用工具间的优劣对比（A vs B）引发开发者社区的互动。
- **引流回站**：通过高质量的 Thread 吸引读者点击原文查看详实数据。

### 1.2 内容结构 (Thread 模式)
Twitter/X 推荐使用 Thread（串推）形式，以结构化展示对比结论：
1. **P0 (Hook)**：抛出争议点、核心结论或痛点（如：Cursor 真的比 Windsurf 好吗？）。
2. **P1 (Recommendation)**：直接给出场景化建议（Winner is...）。
3. **P2-P3 (Evidence)**：展示 1-2 个具体的对比细节或数据（如：补全精度、终端集成）。
4. **P4 (Price/Value)**：提及性价比和订阅建议。
5. **P5 (CTA)**：引导阅读全文 + 关注。

---

## 2. 内容模板

### 2.1 主推文 (Main Tweet)
```
[Hook - 核心痛点或对比冲突] 🤖💻

[核心发现/胜出者]

历时 2 周真实项目实测，从代码、Agent、上下文、速度和价格 5 个维度深度横评。

[链接]

#AI #Programming #[工具名1] #[工具名2] #buildinpublic
```

### 2.2 Thread 模板
- **Tweet 1**: [Hook] + [专栏介绍] + 🧵
- **Tweet 2**: 🏆 胜出者：[名称]。理由：[核心优势]。
- **Tweet 3**: 🔍 细节对比：[维度 A]。[工具 1] vs [工具 2] 的具体表现差异。
- **Tweet 4**: 💰 价格与性价比建议。
- **Tweet 5**: 最终结论 + 阅读原文链接。

---

## 3. 已发布评测素材 (Samples)

### 3.1 Cursor vs Windsurf
- **主推文**:
  "Cursor 强在写代码，Windsurf 强在跑流程。" 🤖💻
  
  谁才是 2026 年最强 AI 编辑器？我把 PeterClaw 网站在两个工具里各重写了一遍：
  - Cursor Tab：依然是补全精度的天花板。
  - Windsurf Cascade：终端集成太强了，自动跑测试并修复 bug 的闭环无敌。

  完整 5 维度评测：
  https://peterclaw.com/zh/blog/ai-tool-review-cursor-vs-windsurf/

  #Cursor #Windsurf #AIProgramming #buildinpublic

- **Thread**:
  1. Cursor vs Windsurf 2026 巅峰对决：谁值得你每月 20 刀的订阅？我花了两周在 8000 行 Astro 项目中实测。🧵
  2. 🏆 纯代码编写胜出者：Cursor。
  其 @ 符号系统和 Tab 补全的预测能力依然领先。每天能省下 20-30 分钟的机械性敲击。
  3. 🏆 任务闭环胜出者：Windsurf。
  Cascade Agent 能直接操作终端、读取输出并自我修正。它是真的在「帮开发」，而不只是「写代码」。
  4. 💰 价格对比：
  - Cursor: $20/月（高峰期慢速请求较痛苦）
  - Windsurf: $15/月（免费版非常慷慨，包含无限基础补全）
  5. 最终建议：
  全栈重度编码选 Cursor；DevOps/工具链开发选 Windsurf。
  全文：https://peterclaw.com/zh/blog/ai-tool-review-cursor-vs-windsurf/

### 3.2 Claude Code vs GitHub Copilot Chat (CLI)
- **主推文**:
  命令行 AI 正在接管 Terminal。但你应该选 @AnthropicAI 的 Claude Code 还是 @github 的 Copilot Chat？⌨️✨

  - Claude：200K 上下文是重构大项目的核武器。
  - Copilot："Issue -> PR" 的原生闭环不可替代。

  $18 还是 $10？这是我的实测建议：
  https://peterclaw.com/zh/blog/ai-tool-review-claude-code-vs-copilot-chat/

  #ClaudeCode #GitHubCopilot #TerminalAI #DevTools

- **Thread**:
  1. 别再为了查个 bug 打开 IDE 了。命令行 AI 助手已经进化。我对比了 Claude Code 和 GitHub Copilot Chat 在真实 codebase 中的表现。🧵
  2. 🧠 上下文理解：Claude Code 完胜。
  200K token 窗口。它能通过读取 4 个相关文件和 CSS 样式，秒级定位到 Astro 移动端 hydration 的深层 bug。
  3. 🔄 生态集成：GitHub Copilot 完胜。
  `gh copilot suggest` 直接读取 Issue 描述并生成修复 PR。对于运维和 GitHub 工作流深度用户来说是神技。
  4. 💸 成本核算：
  - Claude: 按量计费（API）。两周高强度测试花费 $18。
  - Copilot: $10/月 固定费用。
  5. 结论：
  复杂重构选 Claude；日常 GitHub 维护选 Copilot。
  全文：https://peterclaw.com/zh/blog/ai-tool-review-claude-code-vs-copilot-chat/

### 3.3 Antigravity / Kiro / Cline
- **主推文**:
  "Agent IDE" 大战爆发。⚔️

  Google 的 Antigravity vs AWS 的 Kiro vs 开源的 Cline。
  我们要选的不再是补全插件，而是「虚拟技术合伙人」。

  并行 Agent、Spec 驱动、零锁定。三强争霸，独立开发者该押谁？
  https://peterclaw.com/zh/blog/ai-tool-review-antigravity-kiro-cline/

  #Antigravity #AWSKiro #Cline #AIAgent #buildinpublic

- **Thread**:
  1. 忘掉 AI 聊天，2026 是 Agent IDE 的元年。实测 Antigravity 2.0, AWS Kiro 和 Cline。开发者工作流正在发生根本性变化。🧵
  2. ⚡ 速度与并行：Antigravity 2.0。
  Google Gemini 3.5 Flash 极快。支持 5 个 Agent 并行（改 UI、写逻辑、跑测试同时进行）。Browser Subagent 是 UI 调试的神器。
  3. 📐 工程严谨：AWS Kiro。
  "Spec is the source"。强制先写规范再写代码，适合需要高可维护性的长周期项目。
  4. 🔓 自由度：Cline (Open Source)。
  零锁定。接 Claude、GPT 甚至 DeepSeek 本地模型。Plan 模式在 AI 动手前先审计策略，安全感拉满。
  5. 🏁 选型总结：
  要速度选 Antigravity；要规范选 Kiro；要自由选 Cline。
  全文：https://peterclaw.com/zh/blog/ai-tool-review-antigravity-kiro-cline/

---

## 4. 执行清单 (Checklist)

- [ ] 检查 Open Graph 图片是否渲染正确（用于推文预览）。
- [ ] 确认 Thread 的 Tweet 1 包含核心 Hook 和 Thread 标识（🧵）。
- [ ] 文案中包含 2-3 个核心标签（#buildinpublic 是必须的）。
- [ ] 确认链接包含正确的追踪参数（可选）。
- [ ] 针对高影响力推文，准备 1-2 张核心对比表格的截图。
