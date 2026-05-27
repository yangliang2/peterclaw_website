# PET-437 Performance Audit

Date: 2026-05-28

## Scope

- Images: Astro asset pipeline usage and lazy-loading behavior.
- Fonts: Google Fonts usage, subsetting, and self-hosting.
- Vercel cache policy: static asset `Cache-Control` coverage.
- JavaScript: avoidable client-side work on static pages.
- Target: homepage Lighthouse Performance >= 90 and LCP <= 2.5s.

## Findings

1. Image components already use `astro:assets` with `loading="lazy"` and `decoding="async"` for card/project imagery.
2. Markdown and MDX article images could render without explicit lazy/async attributes, depending on the Markdown renderer output.
3. Fonts are already self-hosted through `@fontsource-variable/inter`, split into Latin and Latin Extended subsets. No Google Fonts request path was found.
4. `vercel.json` did not set explicit long-lived cache headers for hashed Astro build assets or bounded revalidation for public runtime assets.
5. `BaseAnalytics` installed global click/copy listeners on every page even when no analytics provider was configured.
6. Lighthouse CI existed, but the performance score budget was still 0.85 while this issue targets 0.90+.

## Fixes Applied

1. Added a Markdown rehype pass that applies `loading="lazy"` and `decoding="async"` to rendered article images while preserving any explicit author-provided attributes.
2. Added Vercel cache headers:
   - `/_astro/:path*`: one-year immutable cache for hashed build assets.
   - `/theme.js`, `/og/:path*`, and stable public assets: one-day cache with one-week stale-while-revalidate.
3. Converted the analytics helper to an inline, provider-aware bootstrap:
   - `window.trackEvent` remains available for existing callers.
   - global click/copy listeners are skipped in production when neither Plausible nor Umami is configured.
   - no Astro-processed analytics helper bundle is emitted for this component.
4. Raised Lighthouse CI performance assertion from 0.85 to 0.90 and updated the performance docs.

## Validation

Run locally from the repository root:

```bash
npm run build
npm run test:performance
```

Expected gate:

- `categories:performance >= 0.90`
- `largest-contentful-paint <= 2500ms`
- `cumulative-layout-shift <= 0.1`
- `total-blocking-time <= 200ms`

Lighthouse CI uploads temporary public reports when `npm run test:performance` completes.
