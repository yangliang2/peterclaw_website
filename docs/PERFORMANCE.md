# Performance Baseline and Monitoring Strategy

## Goals
To ensure a high-quality user experience and maintain search engine rankings, we monitor Core Web Vitals (CWV) and other performance metrics.

### Key Performance Indicators (KPIs)
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Interaction to Next Paint (INP)**: < 200ms
- **Total Blocking Time (TBT)**: < 300ms (Lab proxy for INP)
- **Lighthouse Performance Score**: ≥ 90

## Monitoring Strategy

### 1. Lab Testing (CI/CD)
We use **Lighthouse CI** to audit every Pull Request.
- **Trigger**: Runs automatically on all PRs to `main`.
- **Enforcement**: Build will fail if performance assertions (budgets) are not met.
- **Configuration**: `lighthouserc.json`
- **Script**: `npm run test:performance`

### 2. Real User Monitoring (RUM)
We use **Vercel Speed Insights** to collect anonymous performance data from actual visitors.
- **Metrics**: LCP, CLS, INP, FCP, TTFB.
- **Dashboard**: Viewable in the Vercel Project Dashboard under the "Speed Insights" tab.
- **Implementation**: `@vercel/speed-insights/astro` integrated into `BaseLayout.astro`.

### 3. Continuous Audit
- Periodic manual audits using PageSpeed Insights and Chrome DevTools.
- Reviewing Vercel Speed Insights data weekly to identify regressions in the field.

## Performance Budgets
Current budgets are defined in `lighthouserc.json`:
- `categories:performance`: min 0.9
- `largest-contentful-paint`: max 2500ms
- `cumulative-layout-shift`: max 0.1
- `total-blocking-time`: max 300ms

## Optimization Guidelines
- **Images**: Always use `astro:assets` or provide explicit width/height to prevent layout shifts.
- **Fonts**: Use `@fontsource-variable` to minimize font files and leverage `font-display: swap`.
- **Scripts**: Minimize third-party scripts. Use `is:inline` sparingly.
- **CSS**: Leverage Astro's automatic CSS extraction and minification.
