# Architecture Decision Record — peterclaw_website

This file records core architecture decisions for quick Agent alignment.
Each entry explains what was decided, why, and what constraints remain.

---

## Search: Pagefind (not Algolia / MeiliSearch)

**Decision**: Use `astro-pagefind` for full-text site search.

**Why**: Pagefind runs entirely at build time and serves index files as static assets — zero server, zero API key, zero cost. The site is deployed as `output: 'static'` on Vercel; a server-side search API would break this model. Algolia and MeiliSearch both require an external service and add latency on cold starts.

**Constraints**: Pagefind indexes only pages included in the `dist/` output. Content that is `noindex: true` or excluded from the build will not be searchable. Index is rebuilt on every `npm run build`.

---

## Multilingual hreflang Strategy

**Decision**: Every locale-prefixed page (`/zh/…`, `/en/…`) must emit:
1. A `<link rel="alternate" hreflang="zh">` pointing to the `/zh/` variant.
2. A `<link rel="alternate" hreflang="en">` pointing to the `/en/` variant.
3. A `<link rel="alternate" hreflang="x-default">` pointing to the **default locale** (`zh`) variant.

**Why**: Google requires symmetric hreflang (each language page must point to all others) and an `x-default` fallback to avoid duplicate-content penalties across locales.

**Implementation**:
- Generic pages (index, about, etc.) call `buildHreflangAlternates(canonicalPath)` which generates alternates for all locales unconditionally.
- Content pages (blog, knowledge, product) call `buildContentAlternateLocales(collection, entryId, allIds)` which only emits alternates where a translated entry actually exists — avoids linking to 404s.
- `BaseHead.astro` is the single source of truth; hreflang tags must NOT be added inline in individual pages.
- The post-build CI script `scripts/validate-hreflang.mjs` asserts every locale-prefixed HTML file has `hreflang="{locale}"` and `hreflang="x-default"`.

**Constraint**: `astro.config.mjs` sets `routing.prefixDefaultLocale: true`, so the default locale (`zh`) still uses `/zh/` — do not rely on bare `/` paths for canonical URLs.

---

## Astro Version Selection Principle

**Decision**: Pin to `astro: "^6.0.0"` (minor-range) and upgrade deliberately.

**Why**: Astro major versions have introduced breaking changes to content collections, i18n routing, and adapter APIs. A migration assessment doc (`docs/astro-6-migration-assessment.md`) was written before the v5→v6 upgrade. Unplanned upgrades have caused SSR/static output regressions in the past.

**Rule**: Before upgrading Astro major version, create a migration-assessment issue, test locally with `astro check && astro build`, and verify `npm run quality:hreflang` passes. Never auto-merge Dependabot PRs for Astro major versions.

---

## Deployment Target: Vercel Static

**Decision**: `output: 'static'` with `@astrojs/vercel` adapter.

**Why**: Static output maximises CDN cache hit rate and eliminates cold-start latency. Vercel's Edge Network handles global distribution.

**Constraints**:
- No server-side rendering or API routes that require a Node.js runtime (unless `output: 'hybrid'` is explicitly switched and justified).
- Inline Vercel Insights is disabled (`webAnalytics: { enabled: false }`) because it adds render-blocking scripts that hurt Lighthouse. Analytics are handled by Umami instead.

---

## Analytics: Umami (not Vercel Analytics)

**Decision**: Use self-hosted Umami for privacy-first analytics; keep Vercel Analytics disabled.

**Why**: Vercel Insights adds a `<script>` that lowers Lighthouse performance score. Umami collects analytics server-side without injecting client-side JS into the critical path.

**Implementation**: `BaseAnalytics.astro` loads the Umami script. Do not re-enable `webAnalytics` in `astro.config.mjs`.

---

## i18n Default Locale

**Decision**: Default locale is `zh` (Chinese), secondary locale is `en` (English).

**Why**: The target audience is primarily Chinese-speaking engineers. Content is authored in Chinese first; English versions are added where translations exist.

**Constraint**: The `localePath()` helper and `defaultLocale` constant in `src/lib/i18n.ts` are the single source of truth. Do not hardcode locale strings (`'zh'`, `'en'`) outside of `src/lib/i18n.ts` and `astro.config.mjs`.

---

## Sitemap Filtering

**Decision**: The sitemap only includes locale-prefixed routes (`/zh/…`, `/en/…`).

**Why**: Root-level redirect stubs (`/`, `/blog/`) are not canonical pages — they redirect to the default locale. Including them in the sitemap causes duplicate-content issues.

**Implementation**: `astro.config.mjs` passes `filter: isLocalePrefixedPage` to `@astrojs/sitemap`. The CI hreflang validator also checks that the root redirect URL is absent from the sitemap.
