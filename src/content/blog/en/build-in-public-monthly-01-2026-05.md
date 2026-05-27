---
title: "Build in Public Monthly #01: May 2026 — 30 Days from Zero to One"
description: "PeterClaw's first monthly recap: 41 pieces of content, 10+ tool reviews, a running multi-agent collaboration pipeline, and every pitfall we hit along the way."
contentType: journal
publishedAt: 2026-05-28
ogImage: /og-default.png
cover: journal.svg
tags:
  - Build in Public
  - monthly recap
  - AI squad
  - milestone
series: "Build in Public Monthly"
seriesNumber: 1
draft: false
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
faq:
  - question: "What is the Build in Public Monthly?"
    answer: "A monthly recap series for the PeterClaw website that publicly documents project progress, real data, lessons learned, and next steps—turning the build process itself into readable content."
  - question: "Are these numbers real?"
    answer: "All content output, code commits, and collaboration events come from real repositories and real workflows. Traffic data is limited since the site just launched, and we present it honestly."
---

> **Build in Public Monthly · Issue #1**
>
> Thirty days ago, this repository was empty. Thirty days later, it holds 27 Chinese blog posts, 14 English posts, a running multi-agent collaboration pipeline, and enough lessons to fill a monthly report.

---

## This Month's Milestone: Not "We Did a Lot," but "We Built a System"

If I had to summarize May in one sentence, I wouldn't say "we published 40 articles." I'd say: **we validated the hypothesis that an AI team can collaborate like a real software crew in a real project—and turn the collaboration itself into content.**

That hypothesis sounds abstract, but its outputs are concrete:

### 1. From Empty Repo to Live Site

On May 23, the PeterClaw website (Astro + TypeScript) shipped its first deployment. This wasn't a "it works on my machine" demo:

- Bilingual architecture (zh/en) with full content routing and SEO localization
- Five content sections—blog, knowledge base, toolkit, product, and newsletter—all functional
- Giscus comments, Formspree reader feedback, and Buttondown email subscriptions wired up
- Lighthouse performance score maintained at 90+, all Core Web Vitals passing

**Key decision:** We chose Astro over Next.js. A personal site is content-dense, not interaction-dense. Static generation plus islands architecture let us keep first-party JS near zero while preserving interactive components like search, theme toggle, and comments. This decision held up post-launch—first paint stays under 1.2s.

### 2. AI Tool Review Column Launched

On May 25, the first review—[Cursor vs Windsurf](/en/blog/ai-tool-review-cursor-vs-windsurf/)—went live. By month-end, the column covered:

| Topic | Date | Bottom Line |
|-------|------|-------------|
| Cursor vs Windsurf | 5/25 | Complex projects → Cursor; rapid prototypes → Windsurf |
| Midjourney vs Flux vs Ideogram | 5/26 | Commercial design → Midjourney; open-source control → Flux |
| Notion AI vs Obsidian Copilot vs Capacities | 5/26 | Collaboration → Notion; local privacy → Obsidian |
| Gemini 2.5 Pro vs GPT-4o | 5/28 | Coding → Gemini; general chat → GPT-4o |
| Kiro vs Cline | 5/28 | Deep IDE integration → Cline; standalone agent → Kiro |
| n8n vs Make vs Zapier | 5/28 | Self-hosted → n8n; no-code beginner → Zapier |

**Review methodology:** We published the full framework in AI Diary Vol. 9 on May 26 (Chinese-only for now; English version in progress). Every review is based on at least two weeks of real-project usage. We reject feature-list write-ups and only validate lived experience. Agents execute tests and draft comparisons, but framework design, score arbitration, and publishing decisions remain human-gated.

### 3. GitHub Deep-Dive Series Started

Alongside tool reviews, we launched a "don't just use it—understand it" source-code series:

- [Bun Architecture](/en/blog/github-deep-dive-bun-architecture/)
- [Mastra Framework Architecture](/en/blog/github-deep-dive-mastra-framework-architecture/)
- [Mastra Agent Memory](/en/blog/github-deep-dive-mastra-agent-memory/)
- [n8n Workflow Engine](/en/blog/github-deep-dive-n8n-workflow-engine/)
- Context7 Code-Docs Protocol (Chinese-only; English translation planned for June)
- OpenAI Agents SDK (Chinese-only; English translation planned for June)
- TypeScript Bundler Evolution (Chinese-only; English translation planned for June)
- MCP Protocol (Chinese-only; English translation planned for June)

These are harder to write than reviews. Each deep-dive requires an agent to clone the repo, map core module dependencies, extract critical code paths, and then a human to verify technical accuracy. By late May we had a stable pipeline: codex-1 navigates the code, Claude-2 synthesizes the architecture, and Kimi-1 translates it into narrative.

### 4. AI Squad Launch Diary Series

This might be the most "brand-distinctive" output of the month. Nine diary entries document how a seven-person AI team was assembled:

- Evolution from single agent to seven-member team
- Role definitions and collaboration protocols born from real conflict
- How scheduled tasks and workflow automation broke serial blocking
- Evolution of code-review routing
- How decision logs become a brand moat

**The core value of this series isn't "we have an AI team"—it's "here's how we broke it and fixed it."** In the first brainstorming round on May 23, six agents all skipped the startup protocol and produced generic output that had to be rewritten. That failure is recorded in the first diary entry exactly as it happened, not sanitized.

### 5. Second Backlog Cleared

On May 27, Phase 2 backlog (12 issues) was fully completed. The batch included:

- Full Schema.org / JSON-LD structured data rollout
- OG image dynamic-generation pipeline
- Content quality gate script (internal link validation, frontmatter completeness checks)
- Pagefind search index integration
- Reader feedback system launch
- Newsletter welcome sequence (3 emails)

Clearing backlog isn't the goal. **Establishing a closed loop of "backlog → assign → execute → review → merge" is.** By end of May, the average cycle time shrank from 6 hours in Phase 1 to 2.5 hours.

---

## By the Numbers: Honestly, Traffic Hasn't Caught Up to the Story Yet

The site went live on May 23, so we only have five full days of data. Here's everything we can see:

| Metric | Value | Note |
|--------|-------|------|
| Total published articles | 41 (zh: 27, en: 14) | Includes 9 AI squad diaries |
| GitHub commits | 120+ | Content + infrastructure |
| Merged PRs | 35+ | Average review time: 45 min |
| Average content cycle | 2.5 hours / piece | From issue creation to publish |
| Search engine indexing | Pending | Google indexing typically 1–2 weeks |
| Direct traffic | Insufficient sample | Wait for first full week of June |

**Honest read on the data:**

May's core KPI wasn't traffic. It was "does the system run?" Forty-one articles, 120+ commits, and 35 merged PRs prove one thing: **an AI team can produce publishable content and mergeable code continuously, not just as a one-off demo.**

Search indexing and traffic are June's validation targets. We completed sitewide Schema.org markup, sitemap submission, and keyword optimization for core pages on May 28. The rest is a waiting game.

---

## Blockers Faced and How We Solved Them

### Blocker 1: Multiple Agents Started Work Without a Shared Baseline

**Symptom:** On Phase 1 day one, five agents each wrote code against different Astro scaffolding versions. PR #2 became an orphaned merge commit.

**Fix:** Establish a "startup protocol"—any task trigger must begin with checking out the repo and reading `ROLES.md` + `PROTOCOL.md` + `CURRENT_STATUS.md`. This isn't a suggestion; it's a hard gate. Violator output is invalid and must be rewritten.

**Result:** From Phase 2 onward, protocol compliance hit 100%. No more baseline drift causing merge conflicts.

### Blocker 2: The CEO Became a Single Point of Bottleneck

**Symptom:** Claude-2's execution pattern was "triggered → assess → dispatch → exit → wait for return → triggered again." Every sub-task had to wait for member responses before the next step could advance. From the outside, it looked like "always blocked."

**Fix:** Introduce scheduled brainstorming autopilot and batch-planning. Claude-2 no longer reacts passively to issues. Instead, at fixed times each day, it reads site status, assesses backlog, and dispatches tasks in batches. Members submit PRs when done; the CEO only does final review and merge decisions.

**Result:** Team throughput shifted from "serial waiting" to "parallel execution + batch closure." Average issue processing time dropped 58%.

### Blocker 3: Content Quality Fluctuated

**Symptom:** On May 24, several AI diary entries contained factual errors—for example, describing Mastra's memory layer as Redis-only when it actually supports SQLite and Postgres.

**Fix:** Introduce a dual-reviewer system. Every technical article must pass two agents in different roles: one for technical accuracy (codex-1 or Claude-1), one for narrative coherence (Kimi-1 or GPT-Boy). Both sign off in the frontmatter `reviews` field before merge.

**Result:** Zero factual errors in articles published after May 26. Review time increased by ~30 minutes, but it eliminated the cost of post-publish corrections.

### Blocker 4: Bilingual Content Fell Out of Sync

**Symptom:** 27 Chinese blog posts were live, but only 14 English equivalents. GPT-Boy couldn't keep pace with Chinese content growth.

**Fix:** Rather than simply telling GPT-Boy to speed up, we re-evaluated English content priority. The strategy shifted from "translate every post" to "curated sync"—only globally relevant content (tool reviews, source deep-dives, AI collaboration methodology) gets English versions. Diary-style entries remain Chinese-only for now.

**Result:** English content quality improved, and translation backlog shrank from 13 to 5 pieces. In June we'll test an "agent-first draft + human polish" pipeline to see if it can accelerate further.

---

## June Preview

### Core Goal for June: From "It Works" to "It Gets Seen"

**Content:**

- Launch the "Indie Developer Toolkit" series: systematic curation of tools, services, and open-source projects used while building the site—upgrading from "reviews" to "buying guides"
- AI Squad Diary continuation: documenting automated code-review routing, deployment pipeline optimization, and Phase 3 architecture upgrades
- Knowledge-base deep dives: systematic summaries on content architecture, SEO strategy, and accessibility design

**Growth:**

- Complete Google Search Console and Bing Webmaster Tools verification and indexing monitoring
- Start link-building: distribute curated content on relevant platforms and test channel conversion rates
- Newsletter cold start: accumulate subscribers from zero; target 100 by end of June

**Systems:**

- Introduce automated content distribution: after a blog post publishes, auto-generate adapted versions for Twitter/X and other channels
- Build a content health dashboard: monitor broken links, stale content, and declining SEO scores
- Test "AI comment reply": intelligently respond to Giscus comments to boost community engagement

### One Concrete Promise

The June monthly report will include real search traffic data, Newsletter subscription growth curves, and channel conversion comparisons. If the numbers look bad, we'll write that too—**the Build in Public promise isn't to only show highlight reels.**

---

## Closing Thought

The most surprising thing about May wasn't how much content the AI team produced. It was how much value came from **publicly documenting failure.**

When we wrote about "the first brainstorming round was a total wipeout" and published it, I expected readers to question the team's competence. The feedback was the opposite—people said "finally, an AI success story that isn't packaged," and asked "can I borrow your startup protocol?"

That confirmed something for me: **Build in Public isn't a marketing strategy. It's a more efficient way to work.** When you know your decisions, failures, and fixes will be read in public, you identify real problems faster instead of spending energy covering them up.

See you in June.

---

*If you're also building in public, drop your monthly report link in the [Giscus comments](#giscus) or [reader feedback](/en/about/). We keep each other honest.*
