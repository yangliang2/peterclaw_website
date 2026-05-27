# 自定义事件追踪方案 (Umami/Plausible)

## 1. 目标
深化数据追踪，从单一的 PV 转向基于用户行为的语义化追踪，以衡量内容质量、互动深度及转化效率。

## 2. 追踪事件清单

| 分组 | 事件名称 | 触发时机 | 属性 (Props) |
| :--- | :--- | :--- | :--- |
| **阅读体验** | `reading_milestone` | 用户滚动到文章 25%, 50%, 75%, 100% | `percentage`, `title`, `url` |
| **搜索行为** | `search` | 用户输入搜索关键词 (防抖 1s) | `query`, `type` (filter) |
| **搜索行为** | `search_result_click` | 用户点击搜索结果 | `query`, `title`, `url`, `type` |
| **AI 问答** | `article_chat_open` | 用户展开 ArticleChat 组件 | `title`, `url` |
| **AI 问答** | `article_chat_submit` | 用户提交问答请求 | `question` (truncated), `title` |
| **AI 问答** | `article_chat_success`| 问答请求成功返回 | `title` |
| **评论互动** | `giscus_load` | Giscus 评论组件加载 | `url` |
| **评论互动** | `giscus_event` | Giscus 产生互动 (评论, 反应等) | `event_type` (comment, reaction, etc.) |
| **邮件订阅** | `newsletter_view` | 订阅组件进入视口 | `location` (article_bottom, footer) |
| **邮件订阅** | `newsletter_subscribe`| 用户提交订阅请求并成功 | `location` |

## 3. 实现细节

### 3.1 阅读完成率 (ReadingProgress)
在 `ReadingProgress.astro` 中维护一个已触发百分比的集合。当 `progress` 超过阈值且未触发过时，调用 `window.trackEvent`。

### 3.2 搜索行为 (Search)
现有的 `Search.astro` 已包含基础追踪，需确保其覆盖 Pagefind 的动态结果点击。

### 3.3 ArticleChat 问答
在 `ArticleChat.astro` 的脚本中，在 `details` 元素的 `toggle` 事件及 `fetch` 调用的各个阶段埋点。

### 3.4 Giscus 评论互动
1. 将 `giscusConfig.emitMetadata` 设为 `1`。
2. 在 `Giscus.astro` 中监听 `window` 的 `message` 事件，解析来自 `giscus.app` 的数据。

### 3.5 Newsletter 订阅
在 `EmailSignup.astro` 中加入成功状态的追踪。使用 `IntersectionObserver` 追踪组件曝光。

## 4. 验证方式
1. **本地环境**: 在控制台查看 `[Analytics]` 日志。
2. **生产环境**: 访问 Umami/Plausible 看板，实时查看事件触发情况。
