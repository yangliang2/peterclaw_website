# Astro Component Generation Spec

All Agent-generated Astro pages and components MUST conform to this specification.
Non-conformance will be caught by CI (`npm run build` includes `quality:hreflang`) or code review.

---

## 1. hreflang Tags (REQUIRED on every page)

Every page component that renders a full HTML document must pass `alternateLocales` (or rely on `buildHreflangAlternates`) to `BaseLayout` / `BaseHead`.

**Generic pages** (routes that exist in every locale):
```astro
---
import { buildHreflangAlternates } from '@/lib/i18n';
// alternateLocales is omitted → BaseHead auto-generates from canonicalPath
---
<BaseLayout locale={locale} title={title} description={description}>
```

**Content pages** (blog / knowledge / product — only link to locales where a translation exists):
```astro
---
import { buildContentAlternateLocales } from '@/lib/i18n';
const alternateLocales = buildContentAlternateLocales(collection, entry.id, allEntries.map(e => e.id));
---
<BaseLayout locale={locale} alternateLocales={alternateLocales} ...>
```

**Rules**:
- NEVER add `<link rel="alternate" hreflang="...">` inline in a page — always delegate to `BaseHead`.
- NEVER omit `locale` prop from `BaseLayout`.
- `x-default` is always emitted automatically by `BaseHead`; do not add it manually.

---

## 2. SEO Meta Tags (REQUIRED)

Every page MUST provide:

| Prop | Required | Notes |
|------|----------|-------|
| `title` | Yes | Page-specific title. `BaseHead` appends ` \| PeterClaw` automatically. |
| `description` | Yes | 50–160 characters. Do not reuse the title. |
| `ogType` | Recommended | `'article'` for blog posts, `'website'` for listing/index pages. Defaults to `'website'`. |
| `ogImage` | Recommended | Absolute path to a 1200×630 image. Defaults to `siteConfig.defaultOgImage`. |
| `canonicalPath` | Recommended | Explicit canonical path. Defaults to `Astro.url.pathname` which is usually correct. |

**Article pages additionally require**:
- `publishedTime` — ISO 8601 date string from frontmatter (`pubDate.toISOString()`).
- `modifiedTime` — ISO 8601 date string if available.
- `ogType="article"`.

**Example (blog post)**:
```astro
<BaseLayout
  locale={locale}
  title={entry.data.title}
  description={entry.data.description}
  ogType="article"
  ogImage={entry.data.ogImage ?? undefined}
  publishedTime={entry.data.pubDate.toISOString()}
  modifiedTime={entry.data.updatedDate?.toISOString()}
  alternateLocales={alternateLocales}
>
```

**Do NOT**:
- Hardcode `<meta name="description">` or `<meta property="og:...">` directly in a page.
- Leave `title` or `description` undefined on content pages.

---

## 3. Accessibility — Image alt Attributes (REQUIRED)

Every `<img>` element MUST have a meaningful `alt` attribute.

```astro
<!-- CORRECT -->
<img src={coverUrl} alt={`${entry.data.title} 封面图`} width={1200} height={630} />

<!-- WRONG — empty alt on non-decorative image -->
<img src={coverUrl} alt="" />

<!-- WRONG — missing alt entirely -->
<img src={coverUrl} />
```

**Rules**:
- Decorative images (pure visual chrome, no informational content): `alt=""` is acceptable.
- Content images: alt must describe the image content or match the caption.
- Blog cover images: use `alt="{title}"` or `alt="{title} — cover image"`.
- Icons rendered as `<img>`: use a short label, e.g. `alt="GitHub"`.
- Prefer Astro's `<Image>` component from `astro:assets` for local images; it enforces `alt` at the type level.

---

## 4. i18n Routing Consistency (REQUIRED)

### 4.1 All routes must be locale-prefixed

Route files live under `src/pages/[locale]/…` or use Astro's i18n routing.
Do not create routes under `src/pages/` that are not prefixed with a locale segment.

### 4.2 Use helper functions — never hardcode locale strings

```typescript
// CORRECT
import { localePath, collectionPath, type Locale } from '@/lib/i18n';
const href = localePath('/blog/', locale);

// WRONG — hardcoded locale
const href = `/zh/blog/`;
```

### 4.3 Internal links must use locale-aware helpers

```astro
<!-- CORRECT -->
<a href={localePath('/about/', locale)}>{ui[locale].about}</a>

<!-- WRONG -->
<a href="/zh/about/">关于</a>
```

### 4.4 Content collection IDs are locale-prefixed

All entries in `blog`, `knowledge`, and `product` collections use `{locale}/{slug}` IDs.
Use `localeFromId(entry.id)` and `stripLocaleFromId(entry.id, locale)` when deriving paths.

### 4.5 UI strings

All user-visible strings must come from `ui[locale]` (defined in `src/lib/i18n.ts`).
Do not inline Chinese or English strings in components. Add missing keys to `ui` instead.

---

## 5. Build Validation Gates

All of the above are enforced at build time:

```bash
npm run build
# Runs: astro check → astro build → npm run quality:hreflang
```

- `astro check`: TypeScript + Astro type errors (catches missing required props).
- `astro build`: Component render errors, broken imports.
- `quality:hreflang`: Asserts every locale-prefixed HTML page has correct hreflang tags; asserts sitemap has `xhtml:link` alternates and no root redirect URL.

A PR that breaks any of these gates must not be merged.
