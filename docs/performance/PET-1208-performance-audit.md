# PET-1208 Core Web Vitals Round 2

## Scope

- Home: `/zh/`
- Blog list: `/zh/blog/`
- Article: `/zh/blog/ai-squad-launch-diary/`

Targets: desktop Performance ≥ 90, mobile ≥ 75, CLS < 0.1.

## Baseline (pre-change, local build HTML weight)

| Route | HTML bytes |
| --- | ---: |
| `/zh/` | 56,571 |
| `/zh/blog/` | 76,667 |
| `/zh/blog/ai-squad-launch-diary/` | 95,755 |

Primary regressions since PET-61:

1. **AskAI** — large inline `<script>` on every page via `BaseLayout`.
2. **ArticleChat** — inline script + 6 KB article payload parsed on every article view.
3. **BlogChat** — inline script on search surfaces.

PageSpeed Insights API quota was exhausted in this run; verification uses Lighthouse CI (same routes as `lighthouserc.json`).

## Changes

1. **AskAI lazy load** — moved logic to `/ask-ai.js`; bootstrap loads only on first FAB click. Added `contain: layout style` on fixed UI to limit layout impact.
2. **ArticleChat lazy load** — payload moved to `application/json` blocks; `/article-chat.js` loads when `<details>` opens.
3. **BlogChat lazy load** — config in JSON block; `/blog-chat.js` loads on first focus/pointer inside the section.

## Post-change (local build HTML weight)

| Route | Before | After | Δ |
| --- | ---: | ---: | ---: |
| `/zh/` | 56,571 | 55,345 | −1,226 |
| `/zh/blog/` | 76,667 | 75,441 | −1,226 |
| `/zh/blog/ai-squad-launch-diary/` | 95,755 | 88,666 | −7,089 |

AI chat JS is no longer inlined on critical path; `/ask-ai.js`, `/article-chat.js`, and `/blog-chat.js` load only after user interaction.

```bash
npm run build:ci
npm run test:performance
```

## Verification

```bash
npm ci
npm run build:ci
npm run test:performance
node scripts/lighthouse-report.mjs
```

CI budgets (`lighthouserc.json`): Performance ≥ 0.90, LCP ≤ 2500 ms, CLS ≤ 0.10, TBT ≤ 200 ms.
