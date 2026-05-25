# Astro 6 升级评估与迁移规划

> 评估日期：2026-05-26  
> 评估版本：当前 `astro@6.3.7` → 目标 Astro 6 最新稳定版

---

## 一、现状：升级已基本完成

**peterclaw_website 当前已运行在 Astro 6.3.7**（`package.json` 中声明 `^6.0.0`）。

核心迁移工作已完成，以下 Astro 6 关键特性均已采用：

| 特性 | 状态 | 代码位置 |
|------|------|---------|
| Content Layer API（glob 加载器） | ✅ 已启用 | `src/content.config.ts` |
| `z` 从 `astro/zod` 导入 | ✅ 已迁移 | `src/content.config.ts` |
| `defineCollection` + `glob` loader | ✅ 使用新 API | `src/content.config.ts` |
| content.config.ts 位置（新规范） | ✅ 符合规范 | `src/content.config.ts` |
| i18n 路由配置（`prefixDefaultLocale`） | ✅ 已配置 | `astro.config.mjs` |
| `@astrojs/vercel` v10 | ✅ 兼容 | `package.json` |
| `@astrojs/check` v0.9.9 | ✅ 兼容 | `package.json` |
| TypeScript strict 模式 | ✅ 已启用 | `tsconfig.json` |

---

## 二、从旧版本迁移时的主要破坏性变更（回溯记录）

### 2.1 Content Collections API 重构（最高风险）

Astro 5/6 将 Content Collections 从 `src/content/config.ts` 迁移到 `src/content.config.ts`，并引入了全新的 Content Layer API：

- **旧**：`import { defineCollection, z } from 'astro:content'`
- **新**：`import { defineCollection } from 'astro:content'; import { glob } from 'astro/loaders'; import { z } from 'astro/zod'`
- **`slug` 字段改为 `id`**：所有集合入口的标识符从 `slug` 改为 `id`，已在 `src/lib/i18n.ts` 中统一使用 `id`

本项目迁移工作量评估：**约 2-4 小时**（已完成）

### 2.2 i18n API 变更

- Astro 6 稳定了 i18n 路由，`routing.prefixDefaultLocale: true` 已正确配置
- 新增了 `astro:i18n` 虚拟模块，提供 `getRelativeLocaleUrl`、`getLocaleByPath` 等内置工具函数

本项目当前**未使用** `astro:i18n` 内置工具（见第三节机会清单）

### 2.3 适配器兼容性

- `@astrojs/vercel` v10 支持 Astro 6（已验证）
- `astro-pagefind` v2 支持 Astro 6（已验证）
- `@astrojs/rss` v4、`@astrojs/sitemap` v3 均兼容

---

## 三、尚未采用的 Astro 6 新特性（机会清单）

### 3.1 [高价值] 用 Content Layer Loader 替代 GitHub 运行时抓取

**现状**：`src/lib/github.ts` 在静态构建时通过 `fetch` 调用 GitHub API，带 15 分钟内存缓存和硬编码 fallback 数据。

**问题**：
- `output: 'static'` 下，构建时没有 token 会静默降级到 fallback
- fallback 数据须手动维护
- 无类型推断、无 Zod 校验

**方案**：创建自定义 GitHub Content Layer Loader：

```ts
// src/loaders/github-repos.ts
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

export const githubRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.string().url(),
  stargazers_count: z.number(),
  language: z.string().nullable(),
  fork: z.boolean(),
  archived: z.boolean(),
  updated_at: z.string(),
});

export function githubReposLoader(user: string): Loader {
  return {
    name: 'github-repos-loader',
    load: async ({ store, logger }) => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${user}/repos?per_page=100&type=public&sort=updated`,
          { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }
        );
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const repos = await res.json();
        store.clear();
        for (const repo of repos) {
          store.set({ id: repo.name, data: repo });
        }
      } catch (e) {
        logger.warn(`GitHub loader fallback: ${e}`);
        // store retains previous data across incremental builds
      }
    },
    schema: githubRepoSchema,
  };
}
```

优点：类型安全、增量构建缓存、与 `getCollection('github-repos')` 统一查询。

**预估工时**：3-5 小时（含测试和 fallback 处理）

---

### 3.2 [中价值] 使用 `astro:i18n` 内置工具替换手写路由工具

**现状**：`src/lib/i18n.ts` 手写了 `localePath`、`buildHreflangAlternates` 等函数。

Astro 6 提供了 `astro:i18n` 虚拟模块：

```ts
import { getRelativeLocaleUrl, getLocaleByPath } from 'astro:i18n';

// 替代手写的 localePath()
const zhPath = getRelativeLocaleUrl('zh', '/blog/my-post/');
const enPath = getRelativeLocaleUrl('en', '/blog/my-post/');
```

**建议**：渐进迁移，优先在新页面使用 `astro:i18n`，暂不强制重构旧工具函数。

**预估工时**：4-6 小时（全量迁移）/ 0 小时（保持现状，按需替换）

---

### 3.3 [低价值，可选] 实验性 Rust 编译器

Astro 6 内置实验性 Rust 编译器（基于 Rolldown）可加速构建：

```js
// astro.config.mjs
export default defineConfig({
  experimental: {
    // 注意：2026-05 仍为实验性，生产环境需充分测试
  }
});
```

当前构建脚本为 `astro check && astro build`，启用后构建速度理论提升 30-70%，但实验性功能存在稳定性风险。

**建议**：待 Rust 编译器稳定后（预计 Astro 7.x）再启用。

**预估工时**：0.5 小时（仅修改配置） + 回归测试

---

### 3.4 [低价值] Live Content Collections

Live Content Collections 专为 **服务端渲染**（`output: 'server'`）设计，允许在每次请求时重新获取内容。

**本项目限制**：当前使用 `output: 'static'` 部署到 Vercel，**Live Collections 不适用**。

若未来将 GitHub Activity 页面切换为按需渲染（ISR/SSR），可考虑此特性。

**建议**：暂不采用。

---

### 3.5 [中价值] CSP Headers 改进支持

Astro 6 改进了 `Content-Security-Policy` 头部支持，可在 `astro.config.mjs` 中配置。当前项目通过 `vercel.json` 管理 headers，可迁移至 Astro 原生方式统一管理。

**预估工时**：2-3 小时

---

## 四、优先级与总工时

| 任务 | 优先级 | 预估工时 | 说明 |
|------|--------|---------|------|
| ~~核心升级到 Astro 6~~（已完成） | - | - | 已完成 |
| GitHub Content Layer Loader | 高 | 3-5h | 替换临时抓取方案，提升类型安全性 |
| `astro:i18n` 工具迁移 | 中 | 4-6h | 减少手写代码，跟随官方规范 |
| CSP Headers 迁移 | 中 | 2-3h | 从 vercel.json 统一到 Astro 配置 |
| 实验性 Rust 编译器 | 低 | 0.5h | 等 Astro 7 稳定后再启用 |
| Live Content Collections | 不适用 | — | 需切换到 SSR 才有意义 |

**建议优先实施**：GitHub Content Layer Loader，是目前代码质量改进最大的单项工作。

---

## 五、结论

peterclaw_website **已成功运行在 Astro 6.3.7**，核心迁移工作完成。Content Layer API 的基础用法（`glob` loader + `astro/zod`）已到位，i18n 路由已配置。

**最大的剩余机会**是将 `src/lib/github.ts` 中的临时抓取逻辑重构为正式的 Content Layer Loader，使 GitHub 数据享有与博客/知识库内容相同的类型安全和增量构建优化。

其余 Astro 6 新特性（`astro:i18n` 工具、CSP 配置）属于增量改进，可在日常迭代中按需采用。
