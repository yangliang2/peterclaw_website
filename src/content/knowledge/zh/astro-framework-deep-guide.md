---
title: "Astro 框架深度指南：基于 peterclaw.com 真实项目的 SSG 最佳实践"
description: "这不是一份翻译文档。这是基于 peterclaw.com 真实构建经验撰写的 Astro 实战指南，涵盖 Islands Architecture、Content Layer、View Transitions、性能优化与 Vercel 部署的完整踩坑记录。"
contentType: tutorial
publishedAt: 2026-05-28
tags:
  - Astro
  - 静态网站生成
  - SSG
  - 前端性能
  - 部署配置
area: architecture
difficultyLevel: intermediate
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
prerequisites:
  - "熟悉 HTML/CSS/JavaScript"
  - "了解 Node.js 和 npm 基础"
  - "有静态站点或博客开发经验"
stepCount: 6
toolchain:
  - Astro
  - TypeScript
  - Vercel
  - Pagefind
draft: false
howTo:
  - name: "配置 TypeScript 严格模式"
    text: "在 tsconfig.json 中继承 astro/tsconfigs/strict，确保代码类型安全。"
  - name: "构建 CSS Variables 设计系统"
    text: "在 :root 中定义颜色、间距和排版 Token，实现深色模式和品牌一致性。"
  - name: "配置 Content Layer"
    text: "使用 defineCollection 定义内容 Schema，并配合 glob loader 自动加载本地 Markdown/MDX 文件。"
  - name: "集成 View Transitions"
    text: "在 BaseLayout 中添加 <ClientRouter />，实现页面间的平滑无刷新切换。"
  - name: "优化图片加载"
    text: "通过 Rehype 插件自动为 Markdown 图片注入 loading='lazy' 和 decoding='async' 属性。"
  - name: "Vercel 自动化部署"
    text: "配置 vercel.json 处理哈希缓存和重定向，实现高效的内容交付。"
faq:
  - question: "Astro 适合做什么类型的项目？"
    answer: "Astro 最适合内容密集型网站：博客、文档站、营销页、作品集。如果你的站点 80% 以上内容是静态的，Astro 几乎总是最优选择。对于重度交互的 SPA 应用，Astro 也能做（通过 Islands），但 React/Vue 的原生体验可能更好。"
  - question: "Astro 6 和旧版本最大的区别是什么？"
    answer: "Astro 5 引入了 Content Layer API（彻底重构了内容集合），Astro 6 在此基础上进一步稳定了 API。最大的变化是 `astro:content` 从基于文件的旧系统迁移到了基于 loader 的新架构，支持 `glob` loader、自定义 loader 和远程数据源。"
  - question: "为什么 peterclaw.com 不用 Tailwind？"
    answer: "Tailwind 在快速原型阶段非常高效，但当站点需要精细的设计系统（如深色模式切换、CSS 渐变、玻璃拟态效果）时，原生 CSS Variables 的可维护性和可控性更高。peterclaw.com 选择了自定义 Design Token 方案，但 Tailwind 仍是 Astro 生态中最流行的 CSS 方案。"
---

> **目标读者**：已经会用 React/Vue 写前端，但想深入了解 Astro 如何构建高性能内容站点的开发者。
>
> 本文所有代码片段均来自 [peterclaw.com](https://peterclaw-website.vercel.app) 真实代码库（Astro 6.0.0，静态输出，双语站点），不是文档示例的二次翻译。

---

## 一、Astro 核心概念：为什么它能让内容站点起飞

### 1.1 Islands Architecture：零 JavaScript 默认

Astro 最著名的设计哲学是 **Islands Architecture（群岛架构）**。简单理解：

- 页面默认是**纯 HTML**，没有任何客户端 JavaScript
- 只有明确标记为 `client:*` 指令的组件才会被水合（hydrate）
- 每个水合的组件就像汪洋大海中的一座"岛屿"

在 peterclaw.com 中，绝大多数页面元素都是 Astro 组件（`.astro` 文件），它们在构建时直接渲染为静态 HTML：

```astro
<!-- Navbar.astro —— 纯静态，零 JS -->
<nav class="navbar">
  <a href="/zh/">PeterClaw</a>
  <div class="nav-links">
    <a href="/zh/blog/">博客</a>
    <a href="/zh/knowledge/">知识库</a>
  </div>
</nav>
```

只有交互性组件（如主题切换、搜索弹窗、AI 聊天窗口）才会使用 `client:load` 或 `client:visible`：

```astro
<!-- AskAI.astro —— 只有用户滚动到附近时才加载 -->
<AskAI client:visible />
```

**实战收益**：peterclaw.com 的首页在 Lighthouse 中 Performance 评分稳定在 98-100，首屏几乎不需要解析任何 JS。

### 1.2 Content Layer：从文件到结构化数据

Astro 5+ 引入了 **Content Layer API**，彻底替代了旧版 Content Collections。核心变化：

| 旧版 Content Collections | 新版 Content Layer |
|---|---|
| 基于 `src/content/` 目录约定 | 基于 `defineCollection` + loader |
| 只能加载本地 Markdown | 支持 `glob`、自定义 loader、远程 API |
| 类型推断较保守 | 完整的 Zod Schema 校验 + TypeScript 推断 |

peterclaw.com 的内容配置（`src/content.config.ts`）定义了四个集合：

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const sharedContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: sharedContentSchema.extend({
    series: z.string().optional(),
    seriesNumber: z.number().int().positive().optional(),
  })
});

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/knowledge' }),
  schema: sharedContentSchema.extend({
    area: z.enum(['architecture', 'operations', 'content', 'growth', 'design'])
  })
});

export const collections = { blog, knowledge };
```

**关键优势**：
- `glob` loader 自动扫描指定目录下的 `.md` 和 `.mdx` 文件
- Zod schema 在**构建时**校验所有 frontmatter，类型错误直接阻断构建
- `getCollection()` 返回完全类型化的数据，IDE 自动补全零配置

在页面中获取内容：

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', (post) => !post.data.draft);
// posts 的类型是 CollectionEntry<'blog'>[]，data 字段完全类型安全
---

<ul>
  {posts.map(post => (
    <li>
      <a href={`/zh/blog/${post.id}/`}>{post.data.title}</a>
      <span>{post.data.publishedAt.toLocaleDateString('zh-CN')}</span>
    </li>
  ))}
</ul>
```

### 1.3 View Transitions：原生级的页面切换体验

Astro 内置的 `<ClientRouter />`（原 `View Transitions`）利用浏览器的 View Transitions API，在页面间导航时实现 SPA 般的平滑切换，同时保持静态站点的所有优势（SEO、首屏速度、无 JS 依赖）。

peterclaw.com 的 `BaseLayout.astro` 中的配置：

```astro
---
import { ClientRouter } from 'astro:transitions';
import { fade } from 'astro:transitions';
---

<!doctype html>
<html lang="zh">
  <head>
    <!-- ... -->
    <ClientRouter />
  </head>
  <body>
    <main transition:animate={fade({ duration: '0.2s' })}>
      <slot />
    </main>
  </body>
</html>
```

自定义过渡动画通过 CSS 控制：

```css
/* src/styles/view-transitions.css */
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) {
    animation-name: pc-page-fade-out;
    animation-duration: 0.2s;
  }

  ::view-transition-new(root) {
    animation-name: pc-page-fade-in;
    animation-duration: 0.2s;
  }
}

@keyframes pc-page-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes pc-page-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**重要注意事项**：
- View Transitions 不会破坏 SEO，因为页面仍然是独立的静态 HTML
- 但事件监听器和第三方脚本在导航后需要重新初始化（如 Giscus 评论、代码高亮）
- 始终为 `prefers-reduced-motion` 提供回退

---

## 二、实战配置：TypeScript Strict + CSS 设计系统

### 2.1 TypeScript 严格模式配置

peterclaw.com 使用 Astro 推荐的严格 TypeScript 配置，并扩展了路径别名：

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**关键决策说明**：
- `astro/tsconfigs/strict` 启用了 `strict: true`、`noUnusedLocals: true` 等，能在编码阶段捕获大量错误
- `jsxImportSource: "react"` 是因为项目中用 Satori 生成 OG 图片时需要 JSX
- `@/*` 路径别名让导入从 `@/components/Navbar.astro` 而非 `../../../components/Navbar.astro`，重构时更稳健

### 2.2 CSS Variables 设计系统（替代 Tailwind 的方案）

peterclaw.com **没有使用 Tailwind CSS**，而是构建了一套完整的 CSS Design Token 系统。这个决策基于一个观察：当站点需要深色模式、玻璃拟态、精确渐变控制时，Tailwind 的 utility-first 反而会增加认知负担。

`src/styles/theme.css` 的核心结构：

```css
:root {
  /* 颜色 Token */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #172033;
  --color-text-muted: #5f6b7a;
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;

  /* 渐变 */
  --gradient-ai: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #c026d3 100%);
  --gradient-glass: linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%);

  /* 排版 */
  --font-sans: "Inter Variable", system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;

  /* 间距 */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  /* 玻璃拟态 */
  --border-glass: 1px solid var(--color-line);
  --shadow-glass: 0 8px 32px 0 rgba(15, 23, 42, 0.08);
}

/* 深色模式 */
[data-theme='dark'] {
  --color-bg: #050505;
  --color-surface: #0f1117;
  --color-text: #f0f0f0;
  --color-primary: #3b82f6;
  /* ... */
}
```

工具类仍然保留，但只定义高频模式：

```css
.container {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding: 0 var(--space-md);
}

.glass-card {
  background: var(--gradient-glass);
  backdrop-filter: blur(12px);
  border: var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}
```

**但如果你更喜欢 Tailwind**，Astro 的官方集成非常成熟：

```bash
npm install @astrojs/tailwind tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```mjs
// astro.config.mjs
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()]
});
```

**选择建议**：
- 快速原型或团队已有 Tailwind 经验 → 用 Tailwind
- 需要精细设计系统、品牌一致性、深色模式动画 → 考虑自定义 CSS Variables

---

## 三、内容管理：MDX + Frontmatter Schema 校验

### 3.1 MDX 写作体验

Astro 的 `@astrojs/mdx` 集成让 Markdown 文件中可以直接使用组件：

```mdx
---
title: "示例文章"
description: "MDX 让 Markdown 拥有组件能力"
---

import Callout from '@/components/Callout.astro';

## 正文标题

这是普通 Markdown 段落。

<Callout type="warning">
  这是一条警告提示框——在 MDX 中，你可以在任何位置插入 Astro 组件。
</Callout>

| 框架 | 首屏 JS | 适用场景 |
|------|---------|----------|
| Astro | 0 KB | 内容站点 |
| Next.js | ~80 KB | 全栈应用 |
```

peterclaw.com 的 content loader 同时支持 `.md` 和 `.mdx`：

```typescript
loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' })
```

### 3.2 Frontmatter 的强类型校验

前面提到的 Zod schema 不仅提供类型安全，还能在构建时捕获错误：

```typescript
const sharedContentSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(10).max(300),
  publishedAt: z.date(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).max(10).default([]),
  draft: z.boolean().default(false),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});
```

如果作者写了 `difficultyLevel: 'expert'`，构建会直接失败并给出明确错误信息。这比运行时才发现内容问题要高效得多。

### 3.3 内容目录的国际化组织

peterclaw.com 是中英双语站点，内容目录按语言前缀组织：

```
src/content/
├── blog/
│   ├── zh/
│   │   └── astro-guide.md
│   └── en/
│       └── astro-guide.md
└── knowledge/
    ├── zh/
    │   └── indie-dev-toolchain.md
    └── en/
        └── indie-dev-toolchain.md
```

这种结构配合 `glob` loader 非常简单，不需要额外的国际化内容库。

---

## 四、性能优化：构建缓存、图片与懒加载

### 4.1 构建缓存策略

Astro 构建生成的 `_astro/` 目录包含哈希化文件名（如 `index.abc123.js`），适合长期缓存。peterclaw.com 在 `vercel.json` 中配置了激进的缓存头：

```json
{
  "headers": [
    {
      "source": "/_astro/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

这意味着 JS/CSS 资源可以被浏览器和 CDN 缓存一年，因为文件名中的哈希在内容变化时会自动更新。

### 4.2 图片优化：为什么没有直接用 `astro:assets`

Astro 官方提供了 `<Image />` 组件（`astro:assets`），支持自动格式转换、尺寸响应、懒加载。但 peterclaw.com 选择了**自定义 Rehype 插件**来实现图片懒加载：

```javascript
// astro.config.mjs
function addImagePerformanceAttributes() {
  return (tree) => {
    function visit(node) {
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = {
          loading: 'lazy',
          decoding: 'async',
          ...node.properties,
        };
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
  };
}

export default defineConfig({
  markdown: {
    rehypePlugins: [addImagePerformanceAttributes],
  },
});
```

**决策原因**：
- peterclaw.com 的内容图片多为截图和 SVG 插图，不需要复杂的响应式尺寸
- `<Image />` 组件要求图片放在 `src/assets/` 并在构建时处理，对于大量历史内容迁移成本较高
- Rehype 插件的方案对作者透明——他们继续用标准 Markdown 语法 `![alt](path)`，构建时自动注入性能属性

**如果你需要 `astro:assets`**，配置同样简单：

```astro
---
import { Image } from 'astro:assets';
import myImage from '@/assets/blog/hero.png';
---

<Image src={myImage} alt="描述文字" width={800} height={400} />
```

它会自动生成 WebP/AVIF、srcset、懒加载，适合摄影集、电商等对图片质量敏感的场景。

### 4.3 PWA 与 Service Worker 缓存

peterclaw.com 使用 `@vite-pwa/astro` 实现了完整的 PWA，其中 Workbox 的缓存策略值得参考：

```javascript
// astro.config.mjs
AstroPWA({
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: '/offline/',
    runtimeCaching: [
      {
        // 静态资源：构建产物永久缓存
        urlPattern: ({ request }) =>
          ['font', 'image', 'script', 'style'].includes(request.destination),
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }
        }
      },
      {
        // 文章页面：优先缓存，后台更新
        urlPattern: ({ request, url }) =>
          request.mode === 'navigate' &&
          /^\/(zh|en)\/(blog|knowledge)\//.test(url.pathname),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'article-pages',
          expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 }
        }
      },
      {
        // API 路由：网络优先，5秒超时回退缓存
        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-responses',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 }
        }
      }
    ]
  }
})
```

**性能收益**：重复访问时，文章页面从 Service Worker 读取（< 100ms），同时后台拉取最新版本，下次访问自动更新。

---

## 五、部署：Vercel 配置与环境变量管理

### 5.1 Vercel 适配器配置

peterclaw.com 使用 `@astrojs/vercel` 适配器，但**关闭了官方 Web Analytics**：

```javascript
// astro.config.mjs
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: false,  // 内联脚本会影响 Lighthouse 性能评分
    },
  }),
});
```

**踩坑记录**：Vercel 的 Web Analytics 会往每个 HTML 文件注入一段内联脚本。对于追求极致 Lighthouse 评分的静态站点，这段脚本的体积和执行时间会影响 Performance 分数。解决方案是改用外部统计脚本（如 Plausible 或 Umami）或完全禁用。

### 5.2 vercel.json 完整配置

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "crons": [
    { "path": "/api/newsletter/weekly-draft", "schedule": "0 9 * * 1" }
  ],
  "headers": [
    {
      "source": "/_astro/:path*",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/theme.js",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }]
    },
    {
      "source": "/og/:path*",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }]
    }
  ],
  "redirects": [
    { "source": "/uses", "destination": "/zh/tools/", "permanent": true },
    { "source": "/zh/uses", "destination": "/zh/tools/", "permanent": true }
  ]
}
```

**关键配置说明**：
- `cleanUrls: true`：URL 不需要 `.html` 后缀
- `trailingSlash: false`：统一无尾部斜杠（避免 SEO 重复内容问题）
- `crons`：定时任务，如每周一生成 Newsletter 草稿
- `redirects`：旧 URL 永久重定向到新地址，保留搜索引擎权重

### 5.3 环境变量管理

`.env` 文件不提交到 Git（已在 `.gitignore` 中），Vercel 后台配置生产环境变量：

| 变量 | 用途 | 是否必需 |
|---|---|---|
| `DEEPSEEK_API_KEY` | AI 聊天 API | 仅当使用聊天功能 |
| `OPENAI_API_KEY` |  embeddings 生成 | 仅当使用 RAG 搜索 |
| `GITHUB_TOKEN` | GitHub API（内容 loader）| 高频调用时建议配置，避免限流 |
| `BUTTONDOWN_API_KEY` | Newsletter 订阅 | 仅当使用邮件订阅 |
| `SITE` | 覆盖站点 URL | 本地/预览环境调试 |

本地开发时创建 `.env.local`：

```bash
# .env.local
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

Astro 会自动读取 `.env` 文件，环境变量通过 `import.meta.env.VAR_NAME` 访问。

### 5.4 Preview 分支

Vercel 的 Preview Deployment 是 Astro 静态站点的最佳工作流：

1. 推送分支到 GitHub → Vercel 自动创建预览链接
2. 在 `astro.config.mjs` 中，`site` 配置使用生产域名，Preview 环境自动使用临时域名
3. 内容团队可以在合并前预览实际效果

**一个细节**：sitemap 和 OG 图片生成依赖 `site` 配置。如果 Preview 链接的域名与 `site` 不一致，OG 图片的绝对 URL 会指向生产域名。对于多数场景这没有影响，但测试社交分享卡片时需要注意。

---

## 六、踩坑记录：真实 Bug 与解决方案

### 6.1 View Transitions 导致第三方脚本不执行

**现象**：开启 `<ClientRouter />` 后，Giscus 评论和代码复制按钮在页面切换后消失。

**原因**：View Transitions 只替换 DOM 内容，不重新加载页面。第三方脚本（如 Giscus 的 `<script>`）只在首次加载时执行，导航后不会自动重新初始化。

**解决**：在 Astro 的 `astro:page-load` 事件中重新初始化：

```javascript
<script is:inline>
  document.addEventListener('astro:page-load', () => {
    // 重新初始化代码复制按钮
    initCodeBlocks();
    // Giscus 会通过 data- 属性自动感知，但某些脚本需要手动触发
  });
</script>
```

### 6.2 FOUC（无样式内容闪烁）

**现象**：深色模式下，页面加载瞬间会出现白色背景闪烁。

**原因**：主题状态存储在 `localStorage` 中，但 JavaScript 读取并应用主题之前，浏览器已经渲染了默认样式。

**解决**：在 `<head>` 中同步插入内联脚本（无 `defer`/`async`），在 HTML 解析的最早期执行：

```html
<!-- BaseLayout.astro -->
<script is:inline src="/theme.js"></script>
```

`public/theme.js` 直接操作 `document.documentElement.dataset.theme`，在 CSS 应用前就已确定主题。这是 peterclaw.com 主题系统的核心设计。

### 6.3 i18n 路由与 sitemap 冲突

**现象**：`@astrojs/sitemap` 生成了根路径 `/` 的 sitemap 条目，但根路径只是一个跳转到 `/zh/` 的 meta refresh 页面。

**解决**：使用 sitemap 的 `filter` 选项排除非语言前缀路径：

```javascript
sitemap({
  filter: (page) => {
    const path = new URL(page).pathname;
    return /^\/(zh|en)(\/|$)/.test(path);
  },
  i18n: {
    defaultLocale: 'zh',
    locales: { zh: 'zh', en: 'en' }
  }
})
```

### 6.4 OG 图片中文渲染

**现象**：使用 Satori 生成 OG 图片时，中文字符显示为方框（ tofu ）。

**原因**：Satori 默认不包含中文字体文件，必须手动提供字体 buffer。

**解决**：在构建时加载 Noto Sans SC 字体，传入 Satori：

```typescript
import { readFileSync } from 'fs';
import satori from 'satori';

const fontData = readFileSync('./src/assets/fonts/NotoSansSC-Bold.ttf');

const svg = await satori(element, {
  width: 1200,
  height: 630,
  fonts: [{
    name: 'Noto Sans SC',
    data: fontData,
    weight: 700,
    style: 'normal',
  }]
});
```

### 6.5 Markdown 图片没有懒加载

**现象**：文章中的 Markdown 图片 `![alt](url)` 默认没有 `loading="lazy"`。

**解决**：前面提到的自定义 Rehype 插件（见 4.2 节）。Astro 的 Markdown 处理基于 Unified/Rehype 生态，插件系统非常灵活。

---

## 七、总结：Astro 建站决策清单

如果你正在考虑用 Astro 搭建内容站点，以下是基于 peterclaw.com 经验的决策框架：

| 决策项 | peterclaw.com 的选择 | 适用场景 |
|---|---|---|
| CSS 方案 | 原生 CSS Variables | 品牌一致性要求高、设计系统复杂 |
| 替代方案 | Tailwind CSS | 快速原型、团队熟悉 utility-first |
| 图片优化 | Rehype 插件 + 懒加载 | 内容图片为主、迁移成本低 |
| 替代方案 | `astro:assets` | 响应式图片需求高、摄影/电商 |
| 搜索 | Pagefind | 静态站点、客户端搜索 |
| 替代方案 | Algolia DocSearch | 大规模内容、需要高级筛选 |
| 部署 | Vercel + static | 内容站、需要预览分支 |
| 替代方案 | Cloudflare Pages | 边缘函数、全球 CDN 优先 |
| 评论 | Giscus | GitHub Discussions 驱动的社区 |
| 替代方案 | Twikoo / Waline | 国内用户为主、需要匿名评论 |

Astro 的核心优势不是"比 Next.js 快"，而是**让你只在真正需要的地方支付 JavaScript 的成本**。对于一个内容占比超过 80% 的站点，这意味着更快的首屏、更低的带宽、更好的用户体验——以及更简洁的架构。

---

> **延伸阅读**：peterclaw.com 的完整代码开源在 [GitHub](https://github.com/yangliang2/peterclaw_website)。如果你想看到本文中所有配置在真实项目中的上下文，直接阅读源码是最快的方式。
