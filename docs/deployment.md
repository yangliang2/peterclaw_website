# 部署指南

本项目采用 **Vercel** 作为托管平台，并结合 **GitHub Actions** 实现自动化 CI/CD。

## 自动化流水线 (CI/CD)

### GitHub Actions (`.github/workflows/ci.yml`)

每当有代码推送到 `main` 分支或提交 Pull Request 时，GitHub Actions 会自动执行以下任务：

1.  **构建检查 (Build & Lint)**:
    - 运行 `npm ci` 安装依赖。
    - 运行 `npm run build` (包含 `astro check`) 验证代码是否可构建。
2.  **Lighthouse 审计 (Lighthouse Audit)**:
    - 针对 `main` 的 push 与 Pull Request，自动运行 Lighthouse 性能审计。
    - 门禁指标：
      - Performance ≥ 85
      - Accessibility ≥ 90
      - Best Practices ≥ 90
      - SEO ≥ 90
      - LCP ≤ 2.5s
      - CLS ≤ 0.1
      - TBT ≤ 200ms（实验室环境中的 INP 代理指标）
    - Lighthouse 完整报告作为 artifact 保留 14 天，PR 会收到性能预算对比表。
3.  **失败摘要与部署状态**:
    - `Build and Lint`、`Lighthouse Audit`、`Playwright E2E` 都会写入 GitHub Actions Job Summary，列出每个关键步骤的 outcome 与失败后的本地复现命令。
    - PR 会收到 `Vercel deployment status` 评论；该评论通过 Vercel Deployments API 汇总当前 commit 的 preview 部署状态、URL、Inspector 链接与 checks 结论。
    - 若未配置 Vercel API secrets，评论会明确提示缺少配置，而不是静默失败。

### GitHub Actions (`.github/workflows/production-smoke.yml`)

每天 02:35 UTC 运行一次生产环境 smoke test，也可手动触发：

- 核心路由：`/`、`/zh/`、`/en/`、`/zh/blog/`、`/en/blog/`、`/zh/tools/`、`/en/tools/`
- Sitemap：`/sitemap-index.xml`
- 默认检测目标：`https://peterclaw-website.vercel.app`
- 可用 repository variable `PRODUCTION_SMOKE_BASE_URL` 覆盖检测目标。

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
- `VERCEL_TOKEN`: 用于在 PR 评论中查询 Vercel preview/production 部署状态。
- `VERCEL_PROJECT_ID`: Vercel 项目 ID。
- `VERCEL_TEAM_ID`: Vercel team ID（如果项目属于 team；个人项目可不配置）。

## 本地验证

在提交前，你可以在本地运行以下命令验证构建：

```bash
npm run build
```

如需本地运行生产 smoke test：

```bash
npm run health:smoke
```

如需本地运行 Lighthouse 审计：

```bash
npm install -g @lhci/cli@0.13.x
lhci autorun
```
