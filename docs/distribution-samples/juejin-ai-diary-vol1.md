# AI 日记 Vol.1 掘金分发样本

> 原文：`src/content/blog/zh/ai-squad-launch-diary.md`
> 原标题：AI 小队组建日记 Vol.1：从个人网站到公开协作现场

---

## 掘金版本

### 标题
🤖 我造了一支 5 人 AI 小队来维护个人网站｜实践记录 Vol.1

### 正文

> 阅读约 6 分钟 · 关键词：AI Agent / 多智能体协作 / Astro / 独立开发
>
> 原文发布于 [PeterClaw](https://peterclaw.com)，转载请联系授权。

---

## 背景

大多数个人网站有两种命运：要么在建好后被遗忘，要么永远处于"施工中"。

PeterClaw 这个站选了第三条路：**把维护本身自动化，同时把自动化的过程变成内容。** 具体来说，我组建了一支 5 人 AI 小队，用真实的 Git 工作流、代码审查和任务系统来协作维护网站，并公开记录所有细节——包括失败的部分。

---

## 小队成员与分工

这不是理论分工，直接体现在 Git 历史里：

| 成员 | 角色 | 主要职责 |
|------|------|----------|
| **Claude 2号** | 项目协调 / 后端架构 | 任务拆解、代码审查、Astro 架构决策 |
| **Kimi 1号** | 内容策略 / 项目管理 | 内容矩阵、发布计划、Issue 追踪 |
| **Cursor 1号** | 前端开发 / SEO | 组件实现、样式系统、结构化数据 |
| **Gemini 1号** | 设计系统 / 品牌基调 | 设计 token、色彩系统、暗色主题 |
| **GPT-Boy** | 内容创作 / 运营 | 英文博客、社媒内容、外链策略 |

每个成员有自己的分支命名空间（`agent/claude-2/...`、`agent/cursor-1/...`），每次提交都有对应的 Issue 编号。

---

## 第一周踩的坑

Phase 1 目标是搭好基础结构。结果第一天就暴露了 AI 团队协作的经典问题：

**五个 Agent 同时开工，没有共同基线，导致出现了三套互不兼容的 Astro 脚手架。**

Cursor 1号 在 PR #1 还没合并时就基于它发起了 PR #2，最终 PR #2 进了一个没有未来的孤儿 merge commit。

这个教训和人类团队一模一样：**并行开发前必须先锁定基线。**

---

## 关键结论

1. **AI 团队能跑通真实工作流**，但前提是把协作协议写成文件（ROLES.md、PROTOCOL.md）
2. **个人网站是验证 AI 协作的理想场地**：风险可控、可观测性高、价值密度高
3. **失败比成功更值得记录**： orphan merge commit 不是 bug，是数据

---

## 关于作者

我是 Peter，正在用一支 AI 小队公开构建个人网站 [PeterClaw](https://peterclaw.com)。

- 🔗 GitHub：[github.com/yangliang2](https://github.com/yangliang2)
- 🐦 Twitter/X：[@peterclaw](https://x.com/peterclaw)
- 📧 Newsletter：[newsletter.peterclaw.com](https://newsletter.peterclaw.com)

如果这篇文章对你有帮助，欢迎 **点赞**、**收藏**、**关注**，你的反馈是我们持续输出的最大动力。

---

## 相关阅读

- [AI 小队组建日记 Vol.2：并行开发中的串行派工实录](https://peterclaw.com/zh/blog/ai-squad-diary-02-serialization/)
- [AI 小队组建日记 Vol.3：代码审查路由的失效与修补](https://peterclaw.com/zh/blog/ai-squad-diary-03-code-review-routing/)
- [GitHub 仓库](https://github.com/yangliang2/peterclaw_website)

---

## 适配说明

| 改动项 | 处理方式 | 原因 |
|--------|----------|------|
| 标题 | 加 emoji，突出「5 人」数字 | 掘金读者偏好视觉锚点和数据 |
| 引言 | 增加阅读时间 + 关键词 | 掘金社区惯例 |
| 表格 | 保留 | 掘金 Markdown 支持良好 |
| 代码/分支名 | 保留反引号 | 掘金原生支持行内代码 |
| 文末 CTA | 加 GitHub + Twitter + Newsletter | 掘金作者惯例，引流效果最好 |
| 失败案例 | 单独成段，标题用「踩的坑」 | 掘金读者对「踩坑+方案」内容互动率最高 |
