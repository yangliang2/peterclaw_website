# PeterClaw Website

Public Astro site for PeterClaw.

## Development

```sh
npm install
npm run dev
```

Run the content quality gate before publishing content changes:

```sh
npm run quality:content
```

## Content Architecture

Content is stored in Astro Content Collections:

- `src/content/blog/<locale>/` for narrative posts and AI squad diaries.
- `src/content/knowledge/<locale>/` for durable references, decisions, and playbooks.

Locale routes are scaffolded under `src/pages/[lang]/` with `zh` and `en` enabled.

The publishing automation draft lives in `docs/content-publishing-pipeline.md`. The release checklist lives in `docs/content-quality-checklist.md`.

## Comments (Giscus)

Blog posts embed [Giscus](https://giscus.app) comments backed by this repo’s GitHub Discussions (`General` category, `pathname` mapping). Configuration lives in `src/config/giscus.ts`. The widget follows the site theme via the `data-theme` attribute on `<html>` (`light` / `dark`).

## Reader Feedback (Formspree)

The About page and blog posts expose a bilingual reader feedback form. Blog posts use an opt-in expandable prompt so it does not interrupt reading. Submissions are proxied through `/api/feedback` to Formspree.

Set `FORMSPREE_FEEDBACK_FORM_ID` in the deployment environment to the form ID from a Formspree form (the value after `/f/` in its endpoint URL).
