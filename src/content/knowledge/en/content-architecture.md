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
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-26"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-26"
---

PeterClaw's content is organized along two tracks:

- **Blog**: Publishes opinions, project updates, AI squad diaries, and periodic retrospectives.
- **Knowledge Base**: Archives stable methods, collaboration protocols, technical decisions, and reusable templates.

Every piece of content must declare `publishedAt`, `description`, and `tags`; the locale is inferred from the file path prefix so that SEO, RSS, site search, and multi-platform distribution can be wired up later.

---

## Related Articles

- [AI Agent Core Design Patterns](/en/knowledge/ai-agent-core-design-patterns/) — Example of an engineering knowledge base article
- [AI Squad Launch Diary: From Personal Site to Public Collaboration](/en/blog/ai-squad-launch-diary/) — How the content architecture evolves through public collaboration
- [AI Diary Vol.5: Vibe Coding and Multi-Agent Collaboration](/en/blog/ai-diary-005-vibe-coding/) — Technical practices for natural-language-driven content production
