# PeterClaw Website

Public Astro site for PeterClaw.

## Development

```sh
npm install
npm run dev
```

## Content Architecture

Content is stored in Astro Content Collections:

- `src/content/blog/<locale>/` for narrative posts and AI squad diaries.
- `src/content/knowledge/<locale>/` for durable references, decisions, and playbooks.

Locale routes are scaffolded under `src/pages/[lang]/` with `zh` and `en` enabled.

The publishing automation draft lives in `docs/content-publishing-pipeline.md`.

## Comments (Giscus)

Blog posts embed [Giscus](https://giscus.app) comments backed by this repo’s GitHub Discussions (`General` category, `pathname` mapping). Configuration lives in `src/config/giscus.ts`. The widget follows the site theme via the `data-theme` attribute on `<html>` (`light` / `dark`).
