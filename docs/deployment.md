# 部署指南

本项目采用 **Vercel** 作为托管平台，并结合 **GitHub Actions** 实现自动化 CI/CD。

## 自动化流水线 (CI/CD)

### GitHub Actions (`.github/workflows/ci.yml`)

每当有代码推送到 `main` 分支或提交 Pull Request 时，GitHub Actions 会自动执行以下任务：

1.  **构建检查 (Build & Lint)**:
    - 运行 `npm ci` 安装依赖。
    - 运行 `npm run build` (包含 `astro check`) 验证代码是否可构建。
2.  **Lighthouse 审计 (Lighthouse Audit)**:
    - 针对 PR 提交，自动运行 Lighthouse 性能审计。
    - 门禁指标：
        - Performance ≥ 90
        - Accessibility ≥ 90
        - Best Practices ≥ 90
        - SEO ≥ 90
        - LCP < 2.5s

### Vercel 部署

Vercel 会自动检测项目并根据 `vercel.json` 配置进行部署：

- **生产环境**: 推送到 `main` 分支后自动更新。
- **预览环境**: 每个 Pull Request 都会生成独立的预览 URL。

## 配置说明

### Vercel 项目设置

1.  在 Vercel 仪表盘中导入本项目。
2.  确保 **Build Command** 设置为 `npm run build`。
3.  **Output Directory** 设置为 `dist`。

### 环境变量与 Secrets

#### Vercel 环境变量

Newsletter 订阅 API 需要 Buttondown API Key，请在 Vercel 项目设置中添加：

- `BUTTONDOWN_API_KEY`: 在 [Buttondown Settings → API](https://buttondown.com/settings/api) 获取

该变量仅在服务端 `/api/subscribe` 路由中使用，不会暴露到前端代码。

#### GitHub Actions Secrets

为了使 GitHub Actions 中的 Lighthouse CI 工作，需要在 GitHub Repo Settings -> Secrets and variables -> Actions 中配置以下 Secret：

- `LHCI_GITHUB_APP_TOKEN`: 用于将 Lighthouse 报告回写到 PR 状态（可选，但推荐）。

## 本地验证

在提交前，你可以在本地运行以下命令验证构建：

```bash
npm run build
```

如需本地运行 Lighthouse 审计：

```bash
npm install -g @lhci/cli@0.13.x
lhci autorun
```
