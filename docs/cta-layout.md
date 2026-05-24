# CTA 转化路径设计文档

本文档描述了 PeterClaw 网站内统一的 CTA（Call to Action）转化路径设计。

## 核心转化目标

1.  **Newsletter 订阅**: 获取最新的 AI 团队协作协议与实践。
2.  **RSS 订阅**: 为习惯使用阅读器的读者提供同步更新。
3.  **社交关注 (Twitter/X)**: 建立更及时的互动连接。

## 组件设计

### `CTA.astro`
统一的 CTA 组件，支持两种变体：
- `full` (默认): 包含标题、描述和完整的操作按钮。适用于页面底部的引导。
- `compact`: 仅包含操作按钮，移除标题和描述。适用于侧边栏或空间有限的区域。

**用法示例:**
```astro
---
import CTA from '@/components/CTA.astro';
---
<CTA locale={lang} variant="full" />
```

### `ArticleFooter.astro`
封装了 `CTA` 组件的页脚组件，为文章页提供统一的「下一步」引导。

## 布局分布

### 1. 文章详情页 (Blog & Knowledge)
- **位置**: 文章正文下方，评论区上方。
- **组件**: `ArticleFooter` (包含 `variant="full"` 的 `CTA`)。
- **目的**: 在读者阅读完内容后，及时提供深度连接的入口。

### 2. 首页
- **位置**: 最新内容列表下方。
- **组件**: `CTA` (`variant="full"`)。
- **目的**: 为首次访问首页的用户提供明确的订阅入口。

### 3. 侧边栏 (预留)
- 虽然目前网站采用单栏设计，但 `CTA` 组件已支持 `compact` 变体，可随时集成到未来可能增加的侧边栏中。

## 配置与维护
CTA 的链接与文案分别维护在：
- **链接**: `src/config/site.ts` 中的 `siteConfig`。
- **文案**: `src/lib/i18n.ts` 中的 `ui` 对象。
