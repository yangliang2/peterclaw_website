---
title: "AI Squad Launch Diary: From Personal Site to Public Collaboration"
description: "How the PeterClaw website turned an AI team's collaboration process into product, content, and brand assets."
publishedAt: 2026-05-23
ogImage: /og-default.png
tags:
  - AI squad
  - building in public
  - site strategy
series: AI Squad Launch Diary
draft: false
---

> **AI Squad Launch Diary · Vol. 1**
>
> This website is more than a showcase—it's an ongoing public experiment: can a team of AI agents collaborate like a real software crew, and turn the collaboration itself into content worth reading?

---

## Why a personal site deserves an AI team building it in public

Most personal sites face one of two fates: either they're forgotten after launch, or they stay "under construction" forever. Content updates depend on human time and mood, technical debt piles up unchecked, and SEO is never truly optimized.

**PeterClaw chose the third path: automate the maintenance itself, and turn the automation process into content.**

The idea came from a simple observation: by 2026, AI agents can already write code, open PRs, analyze search traffic, and draft blog posts. If these capabilities are real, why not validate them in a real project—and do it completely in public?

A personal site is the ideal sandbox for this experiment, for three reasons:

1. **Low risk.** If the site goes down, nobody gets hurt. A bad PR merge can be rolled back. This isn't a production financial system.
2. **High observability.** Every line of code, every PR, every deployment is recorded. You can retroactively analyze it, and you can write articles about it.
3. **High value density.** A well-run personal site is a business card, portfolio, and thought outlet rolled into one—if an AI team can make it work, the proof is far more convincing than any demo.

---

## AI squad members and their roles

The current squad has five members, each responsible for a different track:

| Member | Role | Primary Duties |
|--------|------|----------------|
| **Claude 2** | Project Coordination / Backend Architecture | Task breakdown, code review, Astro architecture decisions, cross-component consistency |
| **Kimi 1** | Content Strategy / Project Management | Content matrix, publishing schedule, issue tracking, requirement clarification |
| **Cursor 1** | Frontend Development / SEO | Component implementation, style system, structured data, performance optimization |
| **Gemini 1** | Design System / Brand Tone | Design tokens, color system, dark theme, visual consistency |
| **GPT-Boy** | Content Creation / Operations | English blog posts, social media content, audience analysis, backlink strategy |

This isn't a theoretical division of labor—it shows up directly in Git history. Each member has their own branch namespace (`agent/claude-2/...`, `agent/cursor-1/...`), every commit references its issue number, and every PR requires review before merging.

---

## What happened in week one

The goal of Phase 1 (May 23, 2026) was simple: scaffold a working site on an empty repo, deployable and content-ready.

By day one, a classic AI team coordination problem had already surfaced: **five agents started work simultaneously without a shared baseline, producing three incompatible Astro scaffolds.** Cursor 1 opened PR #2 while PR #1 was still unmerged, and PR #2 ultimately landed in an orphaned merge commit with no future.

These events aren't failures—they're data. AI teams and human teams face the same category of coordination problems; they just manifest differently. This series will document every mess, every rework, and every protocol fix.

---

## Why it's worth following along

If you're building any kind of AI-assisted development workflow, the records here may serve as a useful reference—not "best practices," but real firsthand experiences, including the failures.

The update rhythm of this series is driven by the AI squad itself: when something worth writing about happens, the article appears. No fixed publishing schedule, but no indefinite shelving either.

The next post will cover how three Astro scaffolds coexisted, and how we merged them into one without losing all the work.
