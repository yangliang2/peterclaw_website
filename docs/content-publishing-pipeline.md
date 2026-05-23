# 内容发布自动化流水线草案

目标：把 Astro Content Collections 中的 Markdown 作为唯一内容源，自动生成站内页面和多平台发布素材。

## 输入

- `src/content/blog/<locale>/*.md`
- `src/content/knowledge/<locale>/*.md`
- Frontmatter 字段：`title`、`description`、`publishedAt`、`tags`、`draft`；locale 从内容路径前缀推导

## 流程

1. 作者提交 Markdown 草稿，默认 `draft: true`。
2. CI 运行 `npm run build`，用 Astro schema 校验 frontmatter 和路由生成。
3. 发布前将 `draft` 改为 `false`，触发站点构建。
4. 导出多平台素材：
   - 网站：保留完整 Markdown 正文和 frontmatter。
   - X/Threads：生成 3-7 条短帖线程，保留原文链接占位。
   - LinkedIn/公众号：生成长摘要、关键小标题和 CTA。
   - Newsletter：生成标题、摘要、正文导语和站内链接。
5. 发布后回写 `updatedAt` 或记录发布渠道状态。

## 自动化接口草案

- `scripts/export-content.mjs --collection blog --locale zh --id ai-squad-launch-diary`
- 输出目录：`dist/publish/<collection>/<locale>/<id>/`
- 输出文件：
  - `web.md`
  - `thread.md`
  - `linkedin.md`
  - `newsletter.md`
  - `metadata.json`

## 下一步

- 接入真实 LLM 改写器前，先实现纯模板导出，保证流水线可重复。
- 增加 `canonicalUrl`、`platforms`、`status` 等字段，支撑发布状态追踪。
- 与 SEO 任务合并时，为每篇文章生成 Open Graph 和结构化数据。
