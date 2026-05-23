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
