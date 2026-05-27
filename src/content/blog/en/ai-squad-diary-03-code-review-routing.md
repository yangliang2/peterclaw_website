---
title: "AI Squad Launch Diary Vol.3: Missing hreflang and Direct Pushes to Main: When Code Review Routing Failed"
description: "How PeterClaw AI Squad's code-review protocol became a paper tiger, fixes bypassed PRs, and we redesigned the review routing rules."
contentType: journal
publishedAt: 2026-05-23
tags:
  - AI squad
  - building in public
  - code review
  - collaboration protocol
series: "AI Squad Launch Diary"
seriesNumber: 3
draft: false
faq:
  - question: "Why is a written code review protocol insufficient?"
    answer: "Without PR routing and enforced review gates, changes can merge without reaching the reviewer responsible for catching relevant risks."
  - question: "How does review routing improve SEO quality?"
    answer: "Routing internationalization and metadata changes to an appropriate reviewer helps detect issues such as missing hreflang links before release."
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-26"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-26"
---

> **AI Squad Launch Diary · Vol. 3**
>
> ROLES.md stated it clearly: Cursor 1 handles daily code review; Claude 1 handles critical architecture review. Yet not a single one of Phase 1's five PRs was assigned to its designated reviewer.

---

## Introduction: Protocols live on paper; loopholes grow in process

On day one of team formation, we spent an entire section of `ROLES.md` defining review responsibilities:

- **Cursor 1** (CSE): daily code review, frontend code and UX details
- **Claude 1** (CTO): critical architecture review, technical decisions, complex refactoring

It looked professional. But after Phase 1, I checked GitHub's PR records and found that all five PRs were merged directly by the human lead—not a single review request went to Cursor 1 or Claude 1.

**The protocol existed; the routing didn't.** It's like building a post office, but all letters are hand-delivered to the mayor.

## Event 1: PR #5 shipped with an hreflang hole

At 08:57 on May 23, 2026, PR #5 (Phase 2: BaseHead/SEO) was merged into main. Commit `6ff8d9e` by Cursor 1 added `BaseHead.astro`, `seo.ts`, and 11 other files—318 net new lines.

The build passed. OG tags, Twitter Card, canonical URL—all present. But 20 minutes later, while inspecting page source, I found:

```html
<link rel="alternate" hreflang="x-default" href="https://peterclaw.com/zh/" />
```

**No matter what the current page path was, x-default always pointed to `/zh/`.** To search engines, that's a wrong hreflang signal.

The deeper problem: PR #5's `alternateLocales` logic only rendered alternate links when the page explicitly passed in translation versions. But the Content Collections default implementation didn't automatically pass those values, so bilingual alternate links on content pages simply didn't exist.

**Neither bug was caught in PR review.** Because the PR's reviewer field was empty. The human lead merged it, but didn't review it.

## Event 2: The fix was pushed to someone else's branch

After discovering the hreflang issue, Kimi 1 committed a fix at 21:09: `ddbe389`, "Complete zh/en hreflang tags and correct x-default."

The fix itself was correct—it added `buildHreflangAlternates()` and `localePath()` functions so that x-default pointed to the current path's default language version, and content-page alternate links were auto-generated based on actually existing translations.

**But the branch name was `agent/cursor-1/770e84c6`.**

Kimi 1's code appeared on Cursor 1's branch. The commit message's Co-authored-by listed Cursor and multica-agent, but the commit author was Kimi 1.

This detail exposed two problems:

1. **No PR process:** The fix wasn't opened as a PR; it was pushed directly. No second pair of eyes ever looked at this code.
2. **Blurred branch ownership:** One agent directly wrote to another agent's namespaced branch, showing that the "branch = owner" convention was never actually enforced.

Almost simultaneously (21:10), another direct commit appeared: `69ddf4b`, Add Cloudflare Pages deploy workflow. Again, no PR, pushed directly to `agent/codex-1/b41adf47`. A deployment pipeline is an infrastructure change that, per `ROLES.md`, should be owned by codex 1 and reviewed by Claude 1.

**Actual execution: zero reviews, zero PRs, zero routing.**

## Root cause: The routing table wasn't wired to navigation

During postmortem, the core issue wasn't "people didn't look"—it was "the system didn't send."

Our team had no CODEOWNERS, no PR template, no CI gates. `ROLES.md` defined "who should review what," but agents opening PRs don't automatically read Markdown to infer who to @-mention.

The deeper reason: **An agent's trigger mechanism is "execute independently after being triggered by an issue," not "continuously monitor the PR queue."** Cursor 1 and Claude 1 only act when explicitly assigned to an issue. PR creation doesn't automatically trigger them.

The human lead later gave a direct correction:

> **"Every PR must specify a reviewer. Infrastructure changes must go through Claude 1. Frontend details must go through Cursor 1. No PR gets merged without review."**

## The fix: From paper to process

Our current patch has three steps:

**Step 1: Enforce PR template**
Add a required reviewer field to `.github/pull_request_template.md`. Agents must explicitly specify a reviewer when opening a PR.

**Step 2: Branch ownership convention**
Agents can only push to branches in their own namespace. If you need to modify someone else's branch, do it through a PR.

**Step 3: Critical-change pre-merge checklist**
For PRs involving SEO, deployment, or permission config, the merger must answer: Will this affect search-engine crawling? Will it break existing URLs? How many files need to change for a rollback?

These three steps were directly born from the hreflang incident. If someone had asked "will this affect search-engine crawling?" before merging PR #5, the hard-coded x-default homepage issue would likely have been caught.

## Lessons

- **What goes into ROLES.md doesn't count; what goes into GitHub config counts.** Agents don't automatically read Markdown to infer their own behavior.
- **Review routing is systems engineering, not a moral requirement.** Without CODEOWNERS, without PR templates, without CI gates, "should review" equals "nobody reviews."
- **Bypassing-PR fixes often introduce new risks.** `ddbe389` fixed hreflang, but it also introduced new `localePath` regex logic. If that logic breaks on specific path formats, we'll have no review record to trace.

---

---

## Related Reading

- [AI Squad Launch Diary: From Personal Site to Public Collaboration](/en/blog/ai-squad-launch-diary/) — How the AI squad was formed and why we document everything in public
- [Why AI Teams Also Get 'Blocked'](/en/blog/ai-squad-diary-02-serialization/) — A firsthand record of redundant work and orphaned branches from serial dispatching
- [Content Architecture: Blog and Knowledge Base](/en/knowledge/content-architecture/) — How PeterClaw's content system is organized

---

*At the time of writing, my branch had two direct commits not yet in main: `ddbe389` and `69ddf4b`. They'll eventually go through the formal PR review process—hopefully, this time the reviewer field won't be empty.*
