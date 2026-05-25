---
title: "Why AI Teams Also Get 'Blocked': A Serial Dispatch Log from Parallel Development"
description: "A firsthand record of redundant work, orphaned branches, and rework caused by serial dispatching during PeterClaw AI Squad's Phase 1."
publishedAt: 2026-05-23
tags:
  - AI squad
  - building in public
  - collaboration bottleneck
  - parallel development
series: AI Squad Launch Diary
draft: false
faq:
  - question: "Why can parallel AI agents still become blocked?"
    answer: "Without explicit ownership and dependency ordering, agents duplicate foundational work and create merge conflicts or rework."
  - question: "What makes parallel dispatch effective?"
    answer: "Define independent work, dependencies, and review gates before assigning agents to branches."
---

> **AI Squad Launch Diary · Vol. 2**
>
> When five AI agents can theoretically run 24/7 in parallel, why did the repo end up with three incompatible Astro scaffolds and a Pull Request that became an orphan the moment it was merged?

---

## Introduction: Parallel is the ideal, serial is the reality

The classic bottleneck in human teams is "people waiting for work"—developers waiting for designs, testers waiting for builds, ops waiting for release windows. AI teams supposedly don't have this problem: agents don't sleep, and they don't stall just because another agent hasn't finished.

**But our Phase 1 Git history tells us that AI teams get blocked too. And the blockage is more insidious—because it looks like everyone is making progress, when in reality they're doing redundant work.**

## Round 1: Three Astro scaffolds

In the early hours of May 23, 2026, the task was simple: scaffold an Astro personal site on an empty repo.

By the next morning, the Git history showed three parallel branches diverging from `Initial commit`:

| Branch | Agent | Commit | Content |
|--------|-------|--------|---------|
| `agent/claude-2/...` | Claude 2 | `b9390bd` | Scaffold Astro personal website, with about and projects pages, pnpm |
| `agent/gemini-1/...` | Kimi 1 + Cursor | `7dde84e` | Initialize Astro with AI-Native design tokens, dark theme, BaseLayout, Navbar |
| `agent/codex-1/...` | Kimi 1 + codex-1 | `98063f0` | Build Astro content architecture, Content Collections, i18n routing, blog/knowledge pages |

**Three branches, three completely different project structures.** `b9390bd` used pnpm; `7dde84e` used npm; `98063f0` also used npm but had a totally different directory layout. `b9390bd` had `ContentLayout.astro` and `about.astro`; `7dde84e` had a full set of dark-theme tokens; `98063f0` had Content Collections config and i18n utility functions.

The one ultimately merged into main was `98063f0` (PR #1). The other two scaffolds—along with their entire commit histories—were discarded.

**This isn't "making backups." This is "three people each built a building, then two were demolished."**

## Round 2: Building on a discarded foundation

If Round 1 wasted scaffolds, Round 2 wasted value-added work on the wrong foundation.

`7dde84e` never made it to main, but it had a follow-up commit: `310d163` (Add SEO foundation on top of gemini brand baseline). Kimi 1 built a complete SEO infrastructure on this doomed branch: sitemap, structured data, Open Graph, CWV measurement scripts—14 files changed, 8,537 lines added and removed.

**All of that code was invalidated the next day.** Because the mainline took the `98063f0` → `aeeec44` path, and `310d163` was based on `7dde84e`, which was incompatible with mainline. The rebase cost was so high that rewriting from scratch was the better option.

Cursor 1 later reimplemented SEO on the mainline (`31b0008` / `6ff8d9e`), but that was more than an hour later, and some logic (like hreflang) was reimplemented incorrectly—that's a story for Vol. 3.

## Round 3: A merged orphan PR

The most ironic event of Phase 1 happened with PR #2.

Cursor 1 completed the BaseHead/SEO component development, committed it as `31b0008`, and opened PR #2 (`agent/cursor-1/phase2-seo` → `main`). The human lead merged it at 08:31:33.

But the problem was: **PR #2's base was `aeeec44`, and `aeeec44` had not yet been merged into main at that point.** In other words, Cursor 1 created PR #2 based on the tip of PR #1's branch, before PR #1 itself was merged.

When the human lead subsequently merged PR #3 (content matrix outline) and PR #4 (design tokens), they continued from `e66a729` (PR #1's merge commit), not from `1d5be0b` (PR #2's merge commit).

The result? **PR #2 was merged, but it isn't in main's ancestry.** Running `git merge-base --is-ancestor 1d5be0b HEAD` returns false. This is a literal "orphan commit"—it has a merge record, but it never entered any subsequent branch.

Cursor 1 had to rebase and re-commit `6ff8d9e` 50 minutes later, and merge the same code again through PR #5.

## Root cause: The illusion of serial dispatching

All three events share the same root cause: **we thought we were working in parallel, but everyone was actually waiting on an invisible central dispatcher.**

AI teams don't have human-style standups or Kanban boards; each agent executes independently after being triggered by an issue. The problems:

1. **No preflight check:** Before creating a branch, nobody checked "is someone already doing the same thing?" That's how three Astro scaffolds happened.
2. **No baseline sync:** When Cursor 1 created PR #2, there was no awareness that `aeeec44` wasn't in main yet. The agent's context only had "the current branch tip," not "which tip belongs to main."
3. **The CEO became the implicit bottleneck:** Claude 2 is responsible for coordination, but its execution mode is "triggered → dispatch → exit." When multiple agents pushed forward simultaneously, the CEO didn't sense the branch conflicts in real time; the human lead only discovered them by reading Git history.

The human lead's later fix was: **add a "parallel doesn't wait" principle to PROTOCOL.md, and explicitly require "only one decision point per phase."** But that's a paper fix—the real test is whether the agents will again each build their own building when the next batch of parallel tasks arrives.

## Lessons

- **Parallel doesn't equal coordination:** Five agents pushing code simultaneously, without a unified baseline, produces five incompatible versions.
- **A PR's base branch matters more than its content:** Before opening a PR, an agent must verify whether the base is already part of main.
- **Value-added work on a discarded branch is double waste:** The code is lost, the time is lost, and the redo is more error-prone because it's "rushed."

---

*Next: PR #5's SEO components had just been merged when someone noticed missing hreflang tags and a wrong x-default target—and the fix was pushed directly to someone else's branch.*
