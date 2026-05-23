---
title: "Content Architecture: Blog and Knowledge Base"
description: "PeterClaw's content system uses the blog for narratives and the knowledge base for reusable methods."
publishedAt: 2026-05-23
tags:
  - content architecture
  - i18n
  - Astro
area: architecture
draft: false
---

PeterClaw's content is organized along two tracks:

- **Blog**: Publishes opinions, project updates, AI squad diaries, and periodic retrospectives.
- **Knowledge Base**: Archives stable methods, collaboration protocols, technical decisions, and reusable templates.

Every piece of content must declare `publishedAt`, `description`, and `tags`; the locale is inferred from the file path prefix so that SEO, RSS, site search, and multi-platform distribution can be wired up later.
