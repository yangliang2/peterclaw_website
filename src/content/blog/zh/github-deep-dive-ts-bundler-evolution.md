---
title: "TypeScript 库打包工具链进化论：从 tsup 到 Rolldown，工程效率的代际跃迁"
description: "对比 tsup、unbuild、pkgroll 和 Rolldown 的架构差异，理解为什么 2026 年的 TypeScript 库作者不再写 Rollup 配置文件。"
contentType: review
publishedAt: 2026-05-26
ogImage: /og-default.png
tags:
  - GitHub 热门项目
  - TypeScript
  - 构建工具
  - 工程效率
  - 打包器
difficultyLevel: intermediate
prerequisites:
  - 发布过 npm 包或维护过 TypeScript 库
  - 了解 ESM vs CommonJS 的区别
  - 使用过 Rollup、webpack 或 esbuild 中的一种
techStack:
  - TypeScript
  - esbuild
  - Rollup
  - Rust
useCases:
  - 选择现代 TypeScript 库的打包方案
  - 理解 bundler 的速度与质量的 trade-off
  - 评估 Vite 底层迁移到 Rolldown 的影响
draft: false
faq:
  - question: "tsup 会被 Rolldown 取代吗？"
    answer: "短期内不会。tsup 胜在零配置和极速构建；Rolldown 胜在 bundle 质量和 Vite 生态整合。两者定位不同，2026 年仍是共存状态。"
  - question: "pkgroll 真的没有配置文件吗？"
    answer: "是的，pkgroll 从 package.json 的 exports 字段推断入口和输出格式。如果你需要复杂定制（如自定义插件），可能还是需要 Rollup。"
  - question: "Rolldown 和 Rollup 的 API 兼容吗？"
    answer: "Rolldown 目标是与 Rollup 插件 API 兼容，但用 Rust 重写核心。目前大部分 Rollup 插件可以无缝迁移，但仍有少数边缘 API 在完善中。"
---

> 2026 年发布一个 TypeScript npm 包，你不需要再写 50 行 Rollup 配置、安装 8 个插件、调试 CommonJS/ESM 双模式输出。
>
> 这个领域的工具在 2023-2026 年经历了静默但深刻的代际更替。tsup 以「零配置」颠覆市场，pkgroll 把 package.json 变成唯一配置源，而 Rolldown 正在用 Rust 重写 Rollup 的核心——它将成为 Vite 的下一任底层打包引擎。
>
> 这篇文章不是使用教程，而是**工程决策框架**：什么场景该选什么工具，以及背后的架构原因。

---

## 第一部分：问题定义——发布一个 TS 库到底需要解决什么？

在对比工具之前，先明确 TypeScript 库发布的工程需求：

1. **Transpilation**：TypeScript → JavaScript（目标语法降级）
2. **双模式输出**：ESM (`import`) + CommonJS (`require`)
3. **类型声明**：`.d.ts` 文件让 TypeScript 消费者获得类型提示
4. **Source maps**：调试时映射回原始 TS 源码
5. **外部依赖处理**：不把 `react` 或 `lodash` 打进 bundle
6. **Tree-shaking 友好**：让消费者能消除未使用的代码
7. **子路径导出**：`import { x } from 'your-lib/utils'` 需要正确解析

在 2020 年，满足以上需求意味着一个 60 行以上的 `rollup.config.js`，加上 `@rollup/plugin-typescript`、`rollup-plugin-dts`、`rollup-plugin-terser` 等一堆插件。任何一个插件版本升级都可能破坏构建。

2026 年的工具把这些复杂度压缩到了一个命令或一个 JSON 字段里。

---

## 第二部分：tsup——「默认就是对的」哲学

### 2.1 架构定位

tsup = esbuild（底层编译器）+ 预设配置（TS 库场景优化）。

```typescript
// tsup.config.ts —— 这已经是「复杂」配置了
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,        // 自动生成 .d.ts
  splitting: true,  // 代码分割
  clean: true,      // 清理旧构建
});
```

tsup 的核心设计原则是：**90% 的 TS 库不需要自定义配置，所以默认配置必须覆盖 90% 的场景。**

### 2.2 esbuild 作为底座的优势与代价

tsup 的构建速度来自 esbuild（Go 编写）：

| 指标 | tsup (esbuild) | Rollup + tsc |
|------|---------------|--------------|
| 构建 1000 个模块 | ~0.5s | ~8-15s |
| 启动时间 | 几乎瞬时 | 需加载多个插件 |
| Tree-shaking | 较好 | 更好（Rollup 的算法更激进） |
| 类型检查 | 不内置（需单独跑 tsc） | 内置 |

**esbuild 的 trade-off**：esbuild 不做完整类型检查，只做「strip types」——把 `: string` 之类的类型注解删掉，转成 JS。这意味着 tsup 不会帮你发现类型错误，你需要在 CI 中单独跑 `tsc --noEmit`。

对于库作者来说，这是一个可接受的 trade-off：**构建阶段追求速度，类型检查阶段追求正确性**。

### 2.3 什么时候选 tsup？

- 你需要「最快」的构建体验
- 你的库没有复杂的构建需求（如自定义 AST 转换）
- 你愿意接受「类型检查与构建分离」的工作流
- 你的库主要是逻辑代码，不涉及大量 CSS/资源文件

---

## 第三部分：unbuild——Nuxt/UnJS 生态的「正确做法」

### 3.1 架构定位

unbuild = Rollup（底层打包器）+ mkdist（声明文件生成）+ 预设配置。

创建者 Sébastien Chopin 和 Pooya Parsa（Nuxt 创始人）设计 unbuild 的动机是：**esbuild 的 bundle 质量不够好，但 Rollup 的配置太繁琐。**

```typescript
// build.config.ts
import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './src/index',
    './src/cli',  // 支持多入口
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    // unbuild 暴露了 Rollup 的部分配置能力
    esbuild: {
      target: 'node18',
    },
  },
});
```

### 3.2 Rollup 底座的 bundle 质量优势

unbuild 比 tsup 慢（Rollup 是 JavaScript 编写，esbuild 是 Go），但输出更优：

- **更激进的 Tree-shaking**：Rollup 的模块副作用分析更精确，能消除更多死代码
- **更干净的输出格式**：Rollup 的代码生成器对 ESM/CJS 的 polyfill 处理更精细
- **更好的子路径导出**：`unbuild` 对 `package.json` 的 `exports` 字段支持更完整

Nuxt.js、UnJS 生态的几十个项目都使用 unbuild，这本身就是对其输出质量的背书。

### 3.3 什么时候选 unbuild？

- 你在 Nuxt/UnJS 生态中工作
- 你对 bundle 质量（tree-shaking、输出可读性）有较高要求
- 你愿意接受比 tsup 慢 5-10 倍的构建速度换取更好的输出
- 你需要多入口构建（如 `index` + `cli` + `utils`）

---

## 第四部分：pkgroll——package.json 即配置

### 4.1 极端简约哲学

pkgroll 走到了另一个极端：**没有配置文件，一切从 `package.json` 推断。**

```json
{
  "name": "my-lib",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  },
  "scripts": {
    "build": "pkgroll",
    "dev": "pkgroll --watch"
  }
}
```

pkgroll 读取 `exports` 字段：
- 推断入口文件：`./dist/index.js` 对应 `./src/index.ts`
- 推断输出格式：`.js` = ESM，`.cjs` = CommonJS
- 推断子路径导出：`./utils` 对应 `./src/utils/index.ts`

### 4.2 配置即文档

pkgroll 的哲学是：**package.json 的 exports 字段本身就是库的公共 API 契约。**如果 exports 变了，构建输出应该自动适应。这比「在 rollup.config.js 里写一遍，再在 package.json 里写一遍」更少出错。

代价是灵活性有限。如果你需要：
- 自定义 Rollup 插件
- 非标准的文件映射规则
- 构建时的 AST 转换

pkgroll 可能不够用。

### 4.3 什么时候选 pkgroll？

- 你的库结构简单，遵循标准约定
- 你希望「零配置文件」的极简体验
- 你的团队重视「配置即文档」的可维护性
- 你不需要自定义构建流程

---

## 第五部分：Rolldown——Rust 重写的 Rollup，Vite 的下一任引擎

### 5.1 为什么需要 Rolldown？

Vite 的架构是「开发时用 esbuild（快），生产构建时用 Rollup（好）」。这个双引擎策略带来了两个问题：

1. **行为不一致**：esbuild 和 Rollup 的 tree-shaking 算法不同，偶尔出现「开发时正常，构建后报错」
2. **构建速度慢**：生产构建受制于 Rollup 的 JavaScript 实现，大型项目可能需要几十秒

Rolldown 的目标是：**用 Rust 重写 Rollup，在保持 API 和输出质量兼容的前提下，达到 esbuild 级别的速度。**

### 5.2 技术架构

Rolldown 的核心设计决策：

| 层面 | Rollup | Rolldown |
|------|--------|----------|
| 实现语言 | JavaScript | Rust |
| AST 解析 | Acorn (JS) | Oxc (Rust，Vite 团队自研) |
| 模块解析 | 串行 | 高度并行 |
| 插件系统 | JavaScript 插件 | 兼容 Rollup JS 插件 + 未来支持 Rust 插件 |
| 输出目标 | 与 Rollup 一致 | 与 Rollup 一致 |

Oxc 是 Vite 团队开发的 Rust 版 JavaScript/TypeScript 解析器，目标是替代 swc 在 Vite 生态中的位置。Rolldown + Oxc 的组合意味着：Vite 的整个工具链正在 Rust 化。

### 5.3 当前状态与迁移路径

截至 2026 年初：

- Rolldown 已集成到 Vite 6 的实验性选项中：`vite.config.ts` 中设置 `experimental.rolldown: true`
- 大部分 Rollup 插件可直接使用，但仍有少数边缘 case 在处理中
- Vite 团队的长期目标是让 Rolldown 成为默认生产构建引擎

对于库作者来说，Rolldown 的意义是：**你不需要做任何事**。当你的用户升级到使用 Rolldown 的 Vite 版本时，他们的构建速度会自动提升，而你的库代码无需修改。

---

## 第六部分：决策矩阵——如何选择你的工具

| 维度 | tsup | unbuild | pkgroll | Rolldown（间接） |
|------|------|---------|---------|-----------------|
| **构建速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bundle 质量** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **配置复杂度** | 低 | 中 | 极低 | 无（替换底层） |
| **灵活性** | 中 | 高 | 低 | 高（Rollup 兼容） |
| **最佳场景** | 快速迭代 | 高质量输出 | 极简项目 | Vite 生态用户受益 |
| **底层引擎** | esbuild | Rollup | Rollup | Rust Rollup |

**实用建议**：

1. **新项目、快速验证** → tsup，五分钟发布第一个版本
2. **Nuxt/UnJS 生态、重视输出质量** → unbuild
3. **极简主义、拒绝配置文件** → pkgroll
4. **Vite 应用的生产构建** → 关注 Rolldown 进展，适时开启实验选项

---

## 第七部分：对 Astro 技术栈的直接影响

### 7.1 Astro 的构建层

Astro 目前使用 Vite 作为构建底层，而 Vite 正在迁移到 Rolldown。这意味着：

- Astro 站点的**生产构建速度**将在未来 1-2 年内显著提升（尤其是大型内容站点）
- **构建一致性**改善：开发时（esbuild）和生产时（Rollup→Rolldown）的行为差异缩小

### 7.2 我们自己的库发布

如果 PeterClaw 未来需要发布开源工具（如自定义 Astro 集成或内容处理库），推荐采用 **tsup** 作为默认打包方案：

- 零配置意味着任何 Agent 都可以独立发布包，无需理解复杂的 Rollup 配置
- 构建速度快，CI 时间缩短
- 与 Astro/Vite 生态的 ESM-first 方向一致

### 7.3 类型系统的工程化

这四个工具的共性是「把类型检查从构建流程中剥离」。这启示我们：

- **构建 = 转译 + 打包**，追求速度
- **类型检查 = 静态分析**，追求正确性
- 在 CI 中分两步跑：先 `tsc --noEmit` 做类型门禁，再 `tsup` 做构建

---

## 结论

TypeScript 库打包工具在 2023-2026 年的进化，本质是**「配置复杂度」与「输出质量」的帕累托前沿不断外推**。tsup 用 esbuild 证明了「零配置 + 极速」是可能的；unbuild 证明了「Rollup 的质量不需要 Rollup 的复杂度」；pkgroll 证明了「package.json 可以是一切」；Rolldown 则试图证明「速度和质量不必二选一」。

对于 Astro + TypeScript 团队，这个领域的最大收获不是「选哪个工具」，而是**「默认配置应该覆盖 90% 场景」的产品哲学**——这正是我们设计内容发布流水线、Agent 协作协议时应该遵循的原则。

> **延伸阅读**
> - [tsup GitHub 仓库](https://github.com/egoist/tsup)
> - [unbuild GitHub 仓库](https://github.com/unjs/unbuild)
> - [pkgroll GitHub 仓库](https://github.com/privatenumber/pkgroll)
> - [Rolldown 官方文档](https://rolldown.rs/)
> - [Oxc 解析器项目](https://oxc.rs/)
