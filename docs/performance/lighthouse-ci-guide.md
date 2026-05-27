# Lighthouse CI Guide

The `Lighthouse Audit` GitHub Actions job runs on pushes to `main` and pull requests targeting `main`. It builds the static Astro site and tests these representative Chinese-language routes:

- Home: `/zh/`
- Blog list: `/zh/blog/`
- Article detail: `/zh/blog/ai-squad-launch-diary/`
- Knowledge base: `/zh/knowledge/`

## Enforced Budgets

The source of truth is `lighthouserc.json`. A regression fails the job when a median audited page falls outside any enforced budget:

| Metric                         |     Budget | Purpose                                      |
| ------------------------------ | ---------: | -------------------------------------------- |
| Lighthouse Performance         |      >= 85 | Overall loading and runtime performance gate |
| Largest Contentful Paint (LCP) | <= 2500 ms | Primary content visibility                   |
| Cumulative Layout Shift (CLS)  |   <= 0.100 | Visual stability                             |
| Total Blocking Time (TBT)      |  <= 200 ms | Lighthouse lab proxy for responsiveness      |

FID and INP require real user interaction data and are not directly produced by a Lighthouse lab audit. The CI TBT budget catches likely responsiveness regressions; production INP should remain at or below 200 ms in Vercel Speed Insights.

## Reading A Pull Request Result

For a pull request, the workflow posts or updates a `Lighthouse CI performance budget` comment. The table compares the median result for each tested route with the configured budgets and reports `PASS` or `FAIL`.

The same table appears in the workflow job summary. A failed Lighthouse assertion blocks the required CI check from passing.

The CI workflow also writes compact failure summaries for build, Lighthouse, and Playwright jobs. Each summary lists the key step outcomes and the local command to run first when that step fails.

Pull requests receive a separate `Vercel deployment status` comment when `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` are configured in GitHub Actions secrets. The comment includes the preview deployment state, URL, Inspector link, and Vercel checks conclusion for the PR head commit.

## Downloading Reports

Each workflow run uploads a `lighthouse-reports-<run-id>` artifact containing the complete `.lighthouseci/` output. The artifact is kept for 14 days.

1. Open the pull request or push workflow run under the repository's **Actions** tab.
2. Select the **Lighthouse Audit** job to see the summary table and failed assertion output.
3. Download the artifact from the workflow run's **Artifacts** section.
4. Open the HTML report for an audited route to inspect opportunities, diagnostics, and filmstrips.

## Running Locally

Install dependencies, build, and run the same audit configuration:

```bash
npm ci
npm run build
npm run test:performance
node scripts/lighthouse-report.mjs
```

Lighthouse writes reports into `.lighthouseci/`, which is generated output and should not be committed.

## Verifying The Gate

When changing performance-sensitive assets or scripts, create a pull request and review the table and artifact before merging. To verify regression detection intentionally, make an isolated temporary branch with an oversized unoptimized hero image or blocking script, open a test pull request, confirm the Lighthouse job fails, and close the test pull request without merging it.
