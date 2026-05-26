# AI 工具评测专栏内容索引

> 维护者：Kimi 1号（内容策略）
> 最后更新：2026-05-26

本目录追踪「AI 工具评测专栏」系列文章的发布状态、核心结论与 SEO 关键词布局。

---

## 已发布文章

| 篇数 | 标题 | 发布日期 | 文件路径 | 核心对比工具 | 状态 |
|------|------|---------|---------|-------------|------|
| 第 1 篇 | Cursor vs Windsurf 2026 深度评测 | 2026-05-25 | `src/content/blog/zh/ai-tool-review-cursor-vs-windsurf.md` | Cursor, Windsurf | 已发布 |
| 第 2 篇 | Claude Code vs GitHub Copilot Chat 深度评测 | 2026-05-28 | `src/content/blog/zh/ai-tool-review-claude-code-vs-copilot-chat.md` | Claude Code, Copilot Chat | 已发布 |
| 第 4 篇 | **Midjourney v7 vs Flux vs Ideogram 深度评测** | 2026-05-26 | `src/content/blog/zh/ai-tool-review-midjourney-flux-ideogram.md` | Midjourney v7, Flux, Ideogram | **已提交 PR（修订版）** |
| 第 5 篇 | Antigravity 2.0 / Kiro / Cline 深度评测 | 2026-05-26 | `src/content/blog/zh/ai-tool-review-antigravity-kiro-cline.md` | Antigravity, Kiro, Cline | 已发布 |

> 注：第 3 篇预留为 AI 写作/内容生成工具横评，尚未启动。

---

## 第 4 篇交付证据

| 证据项 | 状态 | 文件路径 |
|--------|------|----------|
| 中文评测文章 | ✅ 已更新 | `src/content/blog/zh/ai-tool-review-midjourney-flux-ideogram.md` |
| 英文评测文章 | ✅ 已更新 | `src/content/blog/en/ai-tool-review-midjourney-flux-ideogram.md` |
| 对比样图（5 组） | ✅ 已生成 | `public/images/blog/ai-tool-review-midjourney-flux-ideogram/` |
| 素材来源说明 | ✅ 已补充 | `content-strategy/ai-tool-reviews/PET-562-material-sources.md` |
| 双重审核记录 | ✅ 已补充 | `content-strategy/ai-tool-reviews/PET-562-review-record.md` |
| 综合对比总表 | ✅ 已嵌入文章 | `comparison-overall-chart.png` |

---

## 第 4 篇核心结论摘要

**《AI 图像生成工具横评（Midjourney v7 vs Flux vs Ideogram）》**

- **Midjourney v7**：艺术品质天花板，适合插画/概念艺术/封面，但文本渲染弱、无 API
- **Flux (FLUX.2)**：真实感与可控性标杆，适合电商/产品图/建筑可视化，开源生态丰富
- **Ideogram 3.0**：图中文字渲染独一档，适合社媒图文/海报/Logo，中文文字支持最佳

**场景推荐矩阵**：
- 书籍/专辑封面 → Midjourney
- 社媒日常运营 → Ideogram
- 电商产品图 → Flux
- 印刷物料 → Flux + Ideogram + Midjourney 组合
- 零预算项目 → Flux Schnell + Ideogram Free
- 中文内容批量生产 → Ideogram

**SEO 关键词**：AI 绘图工具推荐、Midjourney v7 怎么样、Flux AI 评测、Ideogram 评测、AI 图像生成对比

---

## 内容规范

所有评测文章统一遵循 `docs/content-templates/review.md` 模板，frontmatter 必须包含：
- `contentType: review`
- `tags` 包含「AI 工具评测」
- `series: "AI 工具评测专栏"`
- `seriesNumber` 与公开篇数对应
- `reviews` 审核标记（gemini-1 + kimi-1 双重审核）

---

## 待办

- [ ] 第 3 篇选题确定（AI 写作/内容生成工具横评）
- [x] 第 4 篇 PR 已提交修订版（补充样图 + 来源说明 + 审核记录）
- [ ] 第 4 篇 PR 合并后更新本索引状态为「已发布」
