# AI 工具评测专栏内容索引

> 维护者：Kimi 1号（内容策略）
> 最后更新：2026-05-26

本目录追踪「AI 工具评测专栏」系列文章的发布状态、核心结论与 SEO 关键词布局。

---

## 已发布/已提交文章

| 篇数 | 标题 | 发布日期 | 文件路径 | 核心对比工具 | 状态 |
|------|------|---------|---------|-------------|------|
| 第 1 篇 | Cursor vs Windsurf 2026 深度评测 | 2026-05-25 | `src/content/blog/zh/ai-tool-review-cursor-vs-windsurf.md` | Cursor, Windsurf | 已发布 |
| 第 2 篇 | Claude Code vs GitHub Copilot Chat 深度评测 | 2026-05-28 | `src/content/blog/zh/ai-tool-review-claude-code-vs-copilot-chat.md` | Claude Code, Copilot Chat | 已发布 |
| 第 3 篇 | **Notion AI vs Obsidian Copilot vs Capacities 深度评测** | 2026-05-26 | `src/content/blog/zh/ai-tool-review-notion-ai-vs-obsidian-copilot-vs-capacities.md` | Notion AI, Obsidian Copilot, Capacities | **已提交 PR #144** |
| 第 4 篇 | Midjourney v7 vs Flux vs Ideogram 深度评测 | 2026-05-26 | `src/content/blog/zh/ai-tool-review-midjourney-flux-ideogram.md` | Midjourney v7, Flux, Ideogram | 已发布 |
| 第 5 篇 | Antigravity 2.0 / Kiro / Cline 深度评测 | 2026-05-26 | `src/content/blog/zh/ai-tool-review-antigravity-kiro-cline.md` | Antigravity, Kiro, Cline | 已发布 |

---

## 第 3 篇核心结论摘要

**《AI 笔记工具横评（Notion AI vs Obsidian Copilot vs Capacities）》**

- **Notion AI**：数据库驱动的全能工作区，AI 写作辅助最自然，跨设备体验一致，但知识图谱能力弱、Markdown 支持受限、价格最高（¥145/月）
- **Obsidian Copilot**：本地优先的第二大脑，知识图谱与反链是行业标杆，Markdown 原生体验无可匹敌，隐私与数据主权最强，但上手门槛高、移动端体验一般
- **Capacities**：对象化知识工作室，结构化思考 + AI 辅助有深度，Today 视图是每日工作流完美搭档，Markdown 支持优于 Notion，但生态弱于 Obsidian、国内访问稳定性一般

**场景推荐矩阵**：
- 内容创作者 / 自媒体人 → Notion AI
- 研究者 / 学生 / 终身学习者 → Obsidian Copilot
- 项目经理 / 团队负责人 → Capacities
- 隐私敏感 / 受监管行业 → Obsidian + 本地模型（Ollama）
- 预算敏感的学生或自由职业者 → Obsidian 免费 + 按需 API
- 5 人以上团队统一知识管理 → Notion

**SEO 关键词**：Notion AI 怎么样、Obsidian AI 插件、AI 笔记工具推荐 2026、Capacities 评测、知识管理工具对比

---

## 内容规范

所有评测文章统一遵循 `docs/content-templates/review.md` 模板，frontmatter 必须包含：
- `contentType: review`
- `tags` 包含「AI 工具评测」
- `series: "AI 工具评测专栏"`
- `seriesNumber` 与公开篇数对应
- `reviews` 审核标记（gemini-1 + kimi-1 双重审核）
- 每款工具至少一个真实使用场景截图/案例（非官网宣传图）

---

## 待办

- [x] 第 3 篇选题确定并提交 PR（AI 笔记工具横评）
- [ ] 第 3 篇 PR 合并后更新本索引状态为「已发布」
