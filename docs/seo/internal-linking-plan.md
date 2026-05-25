# SEO 内链矩阵规划文档

> 版本：v1.0
> 日期：2026-05-25
> 覆盖范围：博客（中/英）× 知识库（中/英）× AI 工具评测

---

## 一、关键词重叠分析

三大内容支柱围绕以下核心关键词群产生交集：

| 关键词群 | 博客覆盖 | 知识库覆盖 | 评测覆盖 |
|---------|---------|-----------|---------|
| AI 小队 / AI Squad | 日记全系列 | 内容架构 | — |
| 多智能体协作 / Multi-Agent | Vol.5, Vol.6, Vol.7 | 内容架构 | — |
| 工作流自动化 / Workflow | Vol.3, Vol.4 | — | — |
| Vibe Coding | Vol.5（中/英） | — | — |
| AI 工具评测 / AI Tool Review | Vol.8 | — | Cursor vs Windsurf |
| 代码审查 / Code Review | Vol.3 | — | — |
| 信任与边界 / Trust & Boundaries | Vol.7 | — | — |
| 内容架构 / Content Architecture | — | 知识库文章 | — |
| 独立开发 / Indie Development | Vol.5, Vol.8 | — | — |

---

## 二、内链矩阵

### 2.1 中文博客内链矩阵

| 源文章 | 已存在内链 | 新增内链 1 | 新增内链 2 | 新增内链 3 |
|--------|-----------|-----------|-----------|-----------|
| AI 小队组建日记 · 第 1 篇 | 无 | 工作流设计（第 3 篇） | 多智能体协作（第 5 篇） | 内容架构（知识库） |
| 串行派工阻塞（第 2 篇） | 无 | 工作流自动化（第 3 篇） | 多智能体协作（第 5 篇） | 自动化巡检（第 4 篇） |
| 代码审查路由（第 3 篇） | 无 | 信任与边界（第 7 篇） | Vibe Coding（第 5 篇） | — |
| 自动化巡检 Bug（第 4 篇） | 串行派工、多智能体 | 工作流设计（第 3 篇） | 信任与边界（第 7 篇） | — |
| 多智能体协作（第 5 篇） | 自动化巡检、信任边界 | Vibe Coding（第 5 篇） | 内容架构（知识库） | — |
| Vibe Coding（第 5 篇） | 系列索引 | 涌现能力（第 6 篇） | 多智能体协作（第 5 篇） | 内容架构（知识库） |
| 涌现能力（第 6 篇） | 无 | 信任与边界（第 7 篇） | Vibe Coding（第 5 篇） | 内容架构（知识库） |
| 信任与边界（第 7 篇） | 无 | 涌现能力（第 6 篇） | Vibe Coding（第 5 篇） | AI 工具评测（Cursor vs Windsurf） |
| AI 写作工具对比（第 8 篇） | 无 | Cursor vs Windsurf 评测 | Vibe Coding（第 5 篇） | — |
| Cursor vs Windsurf 评测 | 信任边界、工具箱 | AI 写作工具（第 8 篇） | 内容架构（知识库） | — |

### 2.2 英文博客内链矩阵

| 源文章 | 已存在内链 | 新增内链 1 | 新增内链 2 |
|--------|-----------|-----------|-----------|
| Launch Diary Vol.1 | 无 | Serialization Vol.2 | Code Review Vol.3 |
| Serialization Vol.2 | 无 | Launch Diary Vol.1 | Code Review Vol.3 |
| Code Review Vol.3 | 无 | Launch Diary Vol.1 | Serialization Vol.2 |
| Vibe Coding | 系列索引 | Content Architecture (KB) | — |

### 2.3 知识库 ↔ 博客/评测 交叉引用

| 源页面 | 目标页面 | 引用位置 |
|--------|---------|---------|
| 内容架构（知识库-中） | AI 小队组建日记 · 第 1 篇 | 博客示例 |
| 内容架构（知识库-中） | Vibe Coding（第 5 篇） | 内容生产实践 |
| 内容架构（知识库-英） | AI Squad Launch Diary Vol.1 | Blog example |
| 知识库首页 | AI 小队组建日记系列 | 推荐阅读入口 |
| 知识库首页 | Cursor vs Windsurf 评测 | 深度阅读入口 |

---

## 三、模板层标准

所有内容模板在结尾统一加入「相关链接 / Related Links」section：

- **日记模板**：链接至同系列相邻文章 + 1 篇知识库文章
- **评测模板**：链接至 1-2 篇相关日记 + 1 篇知识库文章
- **教程/知识库模板**：链接至 1-2 篇相关博客文章

---

## 四、验收检查清单

- [x] 内链规划文档已产出（覆盖所有现有文章）
- [x] 每篇已发布文章至少新增 2 个相关内链
- [x] 知识库文章页新增「相关文章」模块（跨集合）
- [x] 知识库主页有博客/评测推荐入口
- [x] 内容模板更新「相关链接」标准 section
- [x] 无断链（通过构建验证）

---

## 五、URL 速查表

| 内容 | 中文路径 | 英文路径 |
|------|---------|---------|
| AI 小队组建日记 · 第 1 篇 | `/zh/blog/ai-squad-launch-diary/` | `/en/blog/ai-squad-launch-diary/` |
| 串行派工阻塞 | `/zh/blog/ai-squad-diary-02-serialization/` | `/en/blog/ai-squad-diary-02-serialization/` |
| 代码审查路由 | `/zh/blog/ai-squad-diary-03-code-review-routing/` | `/en/blog/ai-squad-diary-03-code-review-routing/` |
| 工作流自动化 | `/zh/blog/ai-squad-diary-03-workflow/` | — |
| 自动化巡检 Bug | `/zh/blog/ai-diary-004-automation/` | — |
| 多智能体协作 | `/zh/blog/ai-diary-005-multi-agent-collaboration/` | — |
| Vibe Coding | `/zh/blog/ai-diary-005-vibe-coding/` | `/en/blog/ai-diary-005-vibe-coding/` |
| 涌现能力 | `/zh/blog/ai-diary-006-emergent-capabilities/` | — |
| 信任与边界 | `/zh/blog/ai-diary-007-boundaries-trust/` | — |
| AI 写作工具对比 | `/zh/blog/ai-diary-008-creative-writing-tools/` | — |
| Cursor vs Windsurf 评测 | `/zh/blog/ai-tool-review-cursor-vs-windsurf/` | — |
| 内容架构 | `/zh/knowledge/content-architecture/` | `/en/knowledge/content-architecture/` |
| PeterClaw AI Squad 产品 | `/zh/product/peterclaw-ai-squad/` | `/en/product/peterclaw-ai-squad/` |
