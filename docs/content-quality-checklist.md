# Content Quality Checklist

Run this checklist before changing a draft to `draft: false`.

## Automated Gate

CI runs `npm run quality:content` on every push and pull request. The command fails when:

- Markdown content is missing required frontmatter: `title`, `description`, `publishedAt`, or `tags`.
- `publishedAt` is not a `YYYY-MM-DD` date.
- `tags` is empty or contains blank values.
- The content file path does not produce a lowercase kebab-case slug.
- `ogImage` is set but does not point to an existing public asset.
- A published article has no usable default Open Graph image fallback.
- A Markdown internal link points to a missing content route, static route, public asset, or relative file.
- A Markdown external link is malformed, times out, or returns an HTTP error.

## Manual Publishing Review

- Title: specific, readable, and aligned with the article's search intent.
- Summary: `description` can stand alone in RSS, social previews, and index pages.
- Slug: short lowercase kebab-case path without dates, filler words, or mixed language.
- Open Graph image: use `ogImage` for article-specific artwork; otherwise confirm `/og-default.png` is acceptable.
- Internal links: include relevant links to existing blog or knowledge-base pages when the article depends on prior context.
- CTA: end with a clear reader action, such as reading the next article, subscribing, commenting, or opening a related resource.

## Local Workflow

```sh
npm run quality:content
npm run build
```
