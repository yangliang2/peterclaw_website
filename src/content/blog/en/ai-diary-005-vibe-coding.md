---
title: "AI Squad Launch Diary Vol.8: Vibe Coding and Multi-Agent Collaboration in Practice"
description: A firsthand account of transitioning from traditional coding to Vibe Coding — using natural language to drive AI agents through full-stack tasks, and scaling the workflow across a multi-agent team.
publishedAt: 2026-05-25
tags:
  - AI Diary
  - Vibe Coding
  - Multi-Agent Collaboration
  - Full-Stack Development
series: "AI Squad Launch Diary"
seriesNumber: 8
draft: true
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-26"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-26"
---

> **AI Squad Launch Diary · Vol. 8**
>
> When code no longer comes from keystrokes but grows out of conversation, what is the developer's role?

---

## Introduction: What Is Vibe Coding

In early 2026, independent developer Andrej Karpathy posted a definition on Twitter: "Vibe coding is coding entirely in natural language conversation with AI, not looking at code, not debugging, just feeling the rhythm." That tweet ignited the community's enthusiasm for conversational development.

But in the real-world practice of PeterClaw Squad, Vibe Coding is not about ignoring code. It is a **human-AI hybrid progressive development paradigm** with three layers:

- **Layer 1**: Describe requirements in natural language and let AI generate the initial code (Cursor, Claude Code, GitHub Copilot)
- **Layer 2**: Agents autonomously iterate, fix, and optimize on top of the code (Multica-triggered autonomous runs)
- **Layer 3**: Multiple agents collaborate in parallel, scaling "one person vibing" into "a whole team vibing"

This article documents our real path from Layer 1 to Layer 3.

---

## Section 1: From Writing Code to Speaking Code

Three months ago, the first line of the PeterClaw website was typed by a human — a standard Astro initialization command. Three months later, 80% of new code is driven by natural language from agents.

### 1.1 A Typical Vibe Coding Session

Take an RSS Feed date format fix task as an example. Cursor 1 received a task description like this:

```markdown
## Task: Fix RSS Feed pubDate format

Current `src/pages/rss.xml.js` uses `new Date().toUTCString()`,
outputting "Sun, 25 May 2026 08:00:00 GMT".

Requirements:
1. Strict RFC 2822 compliance
2. Timezone fixed to +0800 (Asia/Shanghai)
3. Do not modify other RSS fields
4. Run `npm run build` after fixing to verify no errors

Forbidden files:
- `astro.config.mjs`
- `src/layouts/*`
```

Cursor 1 received no specific code modification instructions. He read the natural language description, checked out the repo, located the file, analyzed the problem, wrote the fix, and submitted a PR. The human only did the "stating requirements" step.

### 1.2 How Code Grows

The actual code Cursor 1 generated during the fix looked like this:

```javascript
// src/utils/rss.ts
import { formatRFC2822 } from './date-utils';

export function buildRssItem(post) {
  const pubDate = formatRFC2822(post.data.publishedAt, 'Asia/Shanghai');
  return {
    title: post.data.title,
    link: post.url,
    pubDate,
    description: post.data.description,
  };
}
```

This code was not line-by-line reviewed by a human. Cursor 1 made two mistakes in his first generation:
1. Timezone handling used `toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })`, which did not conform to RFC 2822
2. He forgot to filter out `draft: true` posts

Claude 2 caught both issues during code review, and Cursor 1 fixed them in the second iteration. **The "vibe" in Vibe Coding is not about one-shot perfection — it is about the rhythm of rapid iteration.**

---

## Section 2: The Vibe Pipeline for Full-Stack Tasks

Fixing a single file is easy. The real challenge is: can an entire full-stack feature, from requirement to production, be completed entirely by "speaking"?

A dynamic OG image generation task for blog posts gave us the answer.

### 2.1 Requirement Description

```markdown
## Task: Generate dynamic OG images for each blog post

Background:
- Currently all articles share a default OG image `/og-default.png`
- Twitter / WeChat shares cannot distinguish different articles

Goals:
1. Generate dynamic SVG OG images based on article title and publish date
2. Generate static PNG at build time to avoid runtime overhead
3. URL format: `/og/{slug}.png`
4. Chinese articles use Noto Sans SC, English uses Inter
5. Dark background + brand color accent text

Technical constraints:
- Use Astro's `getStaticPaths` for pre-generation
- Do not introduce external image services (Vercel OG, Cloudinary, etc.)
- Build time increase must not exceed 10 seconds
```

### 2.2 Agent's Autonomous Implementation

After receiving the task, Cursor 1 did not immediately start writing code. He first performed an "emergent analysis":

> "The current Astro project uses static output mode (`output: 'static'`). `getStaticPaths` only works in page components. OG images are not pages — they are assets. I need to use Astro's integration API to generate them during build hooks."

This judgment was not in the task description, but Cursor 1 made the correct decision autonomously based on his understanding of the Astro framework. His final implementation was:

```javascript
// astro-integrations/og-images.ts
import { defineAstroIntegration } from 'astro/integration';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export default function ogImagesIntegration() {
  return defineAstroIntegration({
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        for (const page of pages) {
          if (!page.pathname.startsWith('blog/')) continue;
          
          const svg = await satori(
            generateOgTemplate(page.title, page.date),
            { width: 1200, height: 630, fonts: [...] }
          );
          
          const resvg = new Resvg(svg);
          const png = resvg.render();
          await fs.writeFile(
            new URL(`./og/${page.slug}.png`, dir),
            png.asPng()
          );
        }
      }
    }
  });
}
```

**From zero to merged, the human only participated in requirement description and final PR approval.** Code review, test validation, and build optimization were all completed autonomously by agents.

### 2.3 Build Validation

```bash
$ npm run build
...
 generating og images   ████████████████████  12/12  (8.4s)

 Done in 34.2s
```

Build time increased by 8.4 seconds, within constraint. Lighthouse CI verified no CLS regression, with performance score maintained at 98.

---

## Section 3: The Vibe Amplification Effect in Multi-Agent Collaboration

Vibe Coding is magical in single-agent scenarios, but the real qualitative leap happens during multi-agent collaboration.

### 3.1 The Parallel Vibe Workflow

Take a workflow optimization sprint as an example. Claude 2, acting as project coordinator, created 8 backlog issues at once. Three of them involved code changes:

| Task | Agent | Input (natural language) | Output |
|------|-------|--------------------------|--------|
| Domain binding | Gemini 1 | "Configure DNS on Cloudflare, point peterclaw.com to Vercel" | `dns_config.md` + verification screenshot |
| OG images | Cursor 1 | The requirement description in 2.1 above | `astro-integrations/og-images.ts` + 12 PNGs |
| Analytics integration | codex 1 | "Integrate Plausible and Umami, event tracking includes pageview, scroll, cta_click" | `src/components/Analytics.astro` + event mapping table |

Three agents were triggered simultaneously, each vibing on their own branch. No human was in the middle translating requirements, no serial "wait for the previous one to finish" blocking.

### 3.2 Cross-Review Is Also Vibe

PR review in multi-agent scenarios becomes another form of conversation. After Cursor 1 submitted the PR for the OG image task, the code review comment looked like this:

> **Claude 2** review comment:
> 
> The `ogImage` path will 404 under subpaths. Current code:
> ```astro
> <meta property="og:image" content={ogImage} />
> ```
> When the article URL is `/zh/blog/some-post/`, the relative path `./og/some-post.png` resolves to `/zh/blog/some-post/og/some-post.png`, while the actual file is at `/og/some-post.png`.
> 
> Suggested fix — use absolute path:
> ```astro
> <meta property="og:image" content={`${Astro.site}${ogImage}`} />
> ```

Cursor 1 received the review, fixed it in the next run, and re-pushed. **Review comments are in natural language, fixes are natural-language-driven.** Throughout the entire collaboration chain, not a single line of code was handwritten by a human.

---

## Section 4: Vibe Coding Tool Chain Evaluation

PeterClaw Squad uses three Vibe Coding tools simultaneously, each suited to different scenarios:

### Cursor 1: Frontend Components and Visual Implementation

**Strengths**: Most accurate contextual understanding of CSS, Astro, and React. Can generate components matching the design system from natural language descriptions.

**Weaknesses**: Tends toward over-engineering on multi-file architecture decisions. In that RSS fix task, Cursor 1 spontaneously extracted RSS utility functions. While the result was good, unassessed architectural changes carry risk.

### Claude Code (Claude 1 / 2): Protocol and System-Level Tasks

**Strengths**: Long context window is ideal for system documents like `PROTOCOL.md` and `BACKLOG.md`. Can simultaneously understand protocol rules and code implementation.

**Weaknesses**: Slower code generation speed, and less precise on frontend framework details than Cursor.

### Kimi 1: Content and Copy Vibe

**Strengths**: Highest quality natural language in Chinese contexts. Ideal for translating technical decisions into blog posts, READMEs, and social media copy.

**Weaknesses**: Does not directly manipulate code. Content output needs to be integrated into the codebase by Cursor or codex 1.

---

## Section 5: Boundaries and Reflections

Vibe Coding is not a silver bullet. In PeterClaw Squad's practice, we have established four non-negotiable boundaries:

**1. The precision of requirement description determines output quality**

A vague vibe produces vague code. In the first implementation of that OG image task, Cursor 1 interpreted "brand color accent text" as "all text in brand color," resulting in extremely poor OG image readability. The fix was adding specific color values to the requirement description: `#E8684A` for titles, `#F5F5F0` for backgrounds.

**2. Natural language cannot replace type systems**

Agent-generated code often passes at runtime but fails TypeScript type checking. Our current workflow: after an agent submits a PR, GitHub Actions runs `astro check` first. Type errors block merge directly, no human intervention needed.

```yaml
# .github/workflows/ci.yml
- name: Type check
  run: npm run astro check
- name: Build
  run: npm run build
- name: Lighthouse
  run: npm run lighthouse
```

**3. Vibe context has an expiration date**

Cursor 1's architectural judgment during the RSS date fix was based on Astro 4.x documentation he read at the time. Two weeks later, Astro released 5.x beta, and the same judgment might no longer apply. **Generated code needs continuous validation; do not assume one vibe lasts forever.**

**4. Human value shifts from "writing code" to "designing the vibe protocol"**

When code can be generated from natural language, the core value of human developers is no longer syntax memorization or API fluency, but:
- Designing clear requirement boundaries (what must be done, what is forbidden)
- Building automated quality gates (CI, type checking, Lighthouse)
- Maintaining team collaboration protocols (ROLES.md, PROTOCOL.md)

---

## Conclusion

Vibe Coding has changed our definition of "programming." Three months ago, we believed programming was translating ideas into code. Now we believe programming is designing a system that allows ideas to reliably transform into code.

In PeterClaw Squad, this system includes:
- Writing requirements in natural language (human)
- Generating code from natural language (agent)
- Reviewing and iterating in natural language (agent ↔ agent)
- Validating quality through automated scripts (CI)
- Maintaining long-term memory through protocol files (Markdown)

**The best vibe is not the fastest vibe — it is the most reliable vibe.** When seven AI agents can simultaneously collaborate, review, iterate, and deploy using natural language, the ceiling for independent developers is no longer typing speed, but the ability to design systems.

If you want to try Vibe Coding, our advice is simple: start with one specific small feature, describe the requirements in natural language, let AI generate the code, and build an automated validation pipeline. When you can confidently say "I don't need to read every line of code," you have entered the true vibe.

---

**Series Navigation**

- [Series Index: AI Diary](/en/blog/)

---

## Related Reading

- [Content Architecture: Blog and Knowledge Base](/en/knowledge/content-architecture/) — How PeterClaw's content system supports multi-agent content production
