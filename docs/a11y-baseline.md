# 可访问性（A11y）基线

本站点遵循 WCAG 2.1 AA 作为开发基线，并在 CI 中对关键页面做自动化检查。

## 规范要点

### 对比度与可读性

- 正文与背景对比度不低于 **4.5:1**（大标题 3:1）。
- 次要文字使用 `--color-text-muted`（`#b3b3b3` on `#050505`），避免在玻璃态卡片上使用过浅的灰色。

### 图片与媒体

- Markdown 图片必须写 **有意义的 alt**：`![描述性文字](url)`。
- 纯装饰图使用空 alt：`![](url)` 或 `alt=""`。
- 不在内容中嵌入无文字说明的关键信息图片。

### 键盘与焦点

- 全站提供 **「跳到主要内容」** 跳过链接（Tab 首项可见）。
- 主要导航、搜索、页脚链接均可 Tab 到达。
- 交互元素使用 `:focus-visible` 高亮，不依赖仅 hover 的状态。

### 语义与地标

- 每页单一 `<main id="main-content">`。
- 顶栏 `<nav aria-label="Primary">`，页脚 `<nav aria-label="Footer">`。
- 页面 `lang` 与路由 locale 一致（`zh` / `en`）。

### 第三方嵌入

- **Giscus** 评论区由 giscus.app 渲染；axe 扫描时排除 `.giscus-section`，避免未配置仓库时的占位文案误报。上线前请在仓库启用 Giscus。

## 本地检查

```sh
npm run build
npm run a11y
```

`npm run a11y` 使用 Playwright + axe-core，默认检查：

- `/zh/`（首页）
- `/zh/blog/ai-squad-launch-diary/`（文章页）

仅 **critical** 与 **serious** 违规会导致非零退出码。

## CI

Pull Request 在 `build` 通过后运行 `npm run a11y`（见 `.github/workflows/ci.yml`）。Lighthouse CI 另对静态产物做 accessibility 分数门禁（≥ 0.9）。

## 参考

- [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
