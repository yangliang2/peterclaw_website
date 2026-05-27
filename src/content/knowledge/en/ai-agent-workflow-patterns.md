---
title: "AI Agent Workflow Design Patterns: Seven Reusable Principles from the PeterClaw Squad"
description: "Seven workflow patterns distilled from 200+ issues and 50+ PRs in a real multi-agent AI team: CEO-agent distribution, parallel vs serial design, context passing, anti-loop design, and cost routing."
publishedAt: 2026-05-26
tags:
  - AI squad
  - workflow design
  - multi-agent collaboration
  - reusable patterns
area: operations
draft: false
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-25"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-25"
---

> **Target audience**: Indie developers and solopreneurs who want to build their own AI agent teams.
>
> This is not theoretical. These patterns were extracted from 200+ issues, 50+ PRs, and three architecture iterations in the PeterClaw Squad.

---

## Introduction: Why Patterns Matter

Most multi-agent tutorials stop at the demo stage—getting two agents to chat with each other. The real challenge is not making agents talk, but making a team of agents **collaborate for weeks or months on a real product without a human micromanager**.

The PeterClaw Squad evolved from Phase 1 chaos (three incompatible Astro scaffolds, orphan PRs, infinite mention loops) to Phase 2 semi-autonomous operation. The improvement did not come from smarter models, but from **clearer collaboration patterns**. This article distills the seven patterns we rely on most, for developers who are building their own AI squads.

---

## Pattern 1: The CEO-Agent Distribution Model — Who Acts as the Central Router

### The Problem

When multiple agents are triggered simultaneously without a unified dispatcher, each agent makes decisions based on its local context. The result: duplicate work, misaligned priorities, and missed tasks.

### The Solution: Single CEO + Routing Protocol

We designate **Claude 2号 as CEO**, the sole task-dispatching entry point. Other agents do not assign tasks to each other directly; all coordination requests go through the CEO.

The CEO's core value is not "doing the most work" but "doing the most irreplaceable work":

| Responsibility | CEO Does | CEO Does Not Do |
|----------------|----------|-----------------|
| Task decomposition and dispatch | ✅ | — |
| Priority arbitration | ✅ | — |
| Cross-member conflict resolution | ✅ | — |
| Implementation of specific code | — | ✅ |
| Content creation | — | ✅ |
| Routine code review | — | ✅ |

**Key protocol**: `BRAINSTORM_PROTOCOL.md` defines a member-assignment routing table. The CEO dispatches by rule, not by gut feeling:

| Task Type | Primary Owner |
|-----------|---------------|
| Frontend implementation / Performance | cursor 1号 → codex 1号 |
| SEO / Growth / Analytics | gemini 1号 → Kimi 1号 |
| Content creation / Copywriting | Kimi 1号 → gemini 1号 |
| Architecture decisions / Core refactoring | Claude 1号 (on-demand) |

### Why Not "Democratic Negotiation"

We tried letting agents discuss "who should take this task" in comments. Each discussion consumed 20–30 minutes and thousands of tokens, only to arrive at the same conclusion as the routing table. **Embedding decisions in protocols ahead of time is more efficient than letting agents negotiate in real time.**

> **Case study**: In PET-56, the CEO planned eight backlog issues at once, covering domain setup, SEO, performance, and content. Because priorities and owners were fixed in advance, agents pushed three tasks in parallel within six hours—without repeating the Phase 1 "three scaffolds" disaster.
>
> See: [From Reactive to Proactive: How Scheduled Tasks Stopped Our AI Squad from Waiting for Work](/zh/blog/ai-squad-diary-03-workflow/)

---

## Pattern 2: Parallel vs Serial Subtask Design — When to Work Together, When to Queue

### The Problem

AI agents can theoretically run 24/7 in parallel. But when tasks have hidden dependencies, parallelism becomes "three people each build a house, then two get demolished." In Phase 1, three agents scaffolded Astro projects simultaneously; only one made it into main.

### The Decision Framework: Dependency Matrix

Our `PROTOCOL.md` defines three task types, each with a matching collaboration mode:

| Type | Characteristic | Collaboration Mode | Example |
|------|----------------|--------------------|---------|
| **Independent** | No external dependencies, can be delivered alone | Parallel, trigger simultaneously | Kimi 1号 writes a blog post + cursor 1号 fixes CSS |
| **Sequential** | Output is input for the next task | Serial, start after predecessor merges | Design tokens finalized → frontend component implementation |
| **Collaborative** | Multiple people edit the same file/module | Serial, or split into independent subtasks | Two agents editing the same `astro.config.mjs` |

**Key rules**:

1. **Parallel does not wait**: Independent tasks never block each other. Content creation and engineering development are naturally parallel tracks.
2. **One decision point per phase**: Handoff nodes for sequential tasks must be explicit, and only one person (usually the CEO) can declare "this phase is done, next phase starts."
3. **Collaborative tasks must be split**: If two agents need to edit the same file, split the file into modules first, or split the task into "you modify part A, I modify part B."

### The Value of Batch Backlog Planning

Another hidden cost of serial dispatch is "scheduling gaps." When the CEO creates issues one by one, there can be 20–30 minutes of dead time between tasks. The fix is **batch planning**: create enough backlog at once so an agent's queue always has a next task ready.

> **Case study**: Phase 1's serial dispatch produced an "orphan PR"—cursor 1号 opened PR #2 based on PR #1 before PR #1 had merged. PR #2 was merged but was not in main's ancestry. The root cause was the absence of a "one decision point per phase" protocol.
>
> See: [Why Do AI Teams Get Blocked? A Serial Dispatch Post-Mortem](/en/blog/ai-squad-diary-02-serialization/)

---

## Pattern 3: Context Passing Methods — Agents Have No Memory, So Files Must

### The Problem

Agents have no cross-session memory. Every trigger is a new run with a new context window. If the new run does not know "what was planned before," "what is already done," or "what the current baseline is," it will reason from scratch—likely producing duplicate work or drifting off course.

### The Three-Tier Context System

We designed three context-passing media, each serving a different time scale and signal density:

| Medium | Purpose | Time Scale | Read/Write Pattern |
|--------|---------|------------|--------------------|
| **Issue comments** | Stage conclusions, progress reports, triggering downstream agents | Task cycle (hours–days) | Platform-native, auto-loaded |
| **Issue metadata** | High-frequency facts (PR URL, blocker reason, current decision) | Task cycle | Injected into context on every trigger |
| **Private repo files** | Cross-session persistent memory, team norms, cost routing, global state | Project lifetime (weeks–months) | Agent actively checks out and reads |

#### 1. Issue Comments: The Walkie-Talkie for Real-Time Collaboration

Comments are for collaboration within a single task cycle. A typical comment thread:

- Agent A finishes work and comments: "Done. PR link: #24"
- The CEO sees the comment and creates the next related issue
- Agent B is triggered, reads the previous issue's comments, and understands the context

**Self-contained comment principle**: Every concluding comment must be understandable by "a future version of yourself who remembers nothing." Do not write "fixed as discussed"; write "changed `ogImage` from relative path to absolute path `\${Astro.site}\${ogImage}` to fix 404 under sub-paths."

#### 2. Issue Metadata: The Sticky Note for High-Frequency Facts

Metadata (labels, assignee, status, custom fields) is ideal for high-frequency, current-task information. Its advantage: **it is automatically loaded into the agent's context on every trigger**, without requiring the agent to dig through comment history.

#### 3. Private Repository Files: The Team's External Hard Drive

This is the most important design. The **first step** after every agent trigger is:

```bash
multica repo checkout https://github.com/yangliang2/peterclaw-squad-private
```

Then read in order:
1. `README.md` — repository index
2. `team/ROLES.md` — roles and division of labor
3. `team/PROTOCOL.md` — collaboration norms
4. `context/CURRENT_STATUS.md` — current project state
5. `context/BACKLOG.md` — global task state

**Why Markdown files instead of a database or API?**

Because Markdown is the native language of AI. Checkout → cat → comprehend: these three steps have almost no failure modes. Calling external APIs risks auth expiration, rate limits, and format changes. We write our team's long-term memory in Markdown and version-control it alongside code.

> **Case study**: BACKLOG.md uses four symbols as a state machine: `[ ]` backlog, `[→]` todo, `[✓]` done, `[✗]` cancelled. When the auto-trigger scanner changes `[ ]` to `[→]`, it simultaneously runs `issue status <id> todo` in Multica. This file is the team's persistent memory.
>
> See: [When Seven AIs Form a Company: Real-World Multi-Agent Collaboration](/zh/blog/ai-diary-005-multi-agent-collaboration/)

---

## Pattern 4: Anti-Loop Design — Two Agents Can Bow to Each Other Forever

### The Problem

Agent-to-agent @mention is a double-edged sword. Kimi 1号 @mentions Claude 2号 requesting review; Claude 2号 replies "approved" and @mentions Kimi 1号 back. If the reply contains a mention link, Kimi 1号 is triggered again, and may reply "thanks" and @mention Claude 2号 again…

**Two agents can bow to each other like Japanese businessmen, forever.**

### Three Lines of Defense

#### Defense 1: Mention Rules in Comment Content

- **After completing a task, do not @mention the other party as thanks.**
- **Only mention when you need the other party to act, and state explicitly what action is required.**

| Comment Type | Mention? | Example |
|--------------|----------|---------|
| Task completion report | ❌ No mention | "PR #24 merged. OG image feature is live." |
| Review request | ✅ Mention + explicit action | "[@Claude 2号] Please review the `ogImage` path fix in PR #24." |
| Review approval | ❌ No mention | "Approved. `ogImage` path fix is correct; ready to merge." |
| Change request | ✅ Mention + explicit action | "[@cursor 1号] Please change the path to absolute; see review comment." |

#### Defense 2: Platform-Level Trigger Filtering

If the platform supports it, add a guard: "within the same thread, if the same agent is triggered consecutively more than twice, pause."

#### Defense 3: Agent-Level Self-Constraint

Add to every agent's system prompt:

> "If you are replying to another agent's comment, and your reply does not contain a specific task for the other party to execute, do not use @mention links. Simple thanks and acknowledgments do not need mentions."

### Related Trap: Autopilot Self-Counting

Another hidden loop: autopilots counting themselves as "active tasks." Our auto-trigger logic is: when `in_progress + todo < 3`, supplement new tasks. But Brainstorming, PR patrol, and Backlog scan autopilots counted themselves in the denominator, so the total was always ≥3 and real backlog tasks were never triggered.

**Fix**: Exclude issues with titles containing "Brainstorming", "PR patrol", or "Backlog scan" from the count, and shorten autopilot lifecycles from "5–10 minutes" to "instant execution, immediately mark done."

> **Case study**: This bug caused seven backlog tasks to pile up while the team sat effectively idle. The human owner discovered it 12 hours after it started.
>
> See: [When Autopilot Counted Itself as an Active Task](/zh/blog/ai-diary-004-automation/)

---

## Pattern 5: Cost Routing Principles — Not Every Task Deserves the Best Model

### The Problem

The hidden cost of multi-agent collaboration is token consumption. Without controls, a seven-agent team can burn through an engineer's monthly salary in API fees every day.

### Four Layers of Cost Awareness

#### 1. Model-Tiered Invocation

Not every task needs the strongest model. We use a simple tiering strategy:

| Task Type | Recommended Agent | Rationale |
|-----------|-------------------|-----------|
| Content creation, long-document processing | Kimi 1号 | High Chinese-context quality, fixed monthly fee |
| Frontend component implementation | cursor 1号 | Precise framework understanding, fixed monthly fee |
| System architecture decisions | Claude 1号 | Long context, strong reasoning, pay-per-token |
| Routine code review | cursor 1号 / codex 1号 | Fixed monthly fee, marginal cost near zero |
| Complex refactoring assessment | Claude 1号 | Pay-per-token, summon on demand |

**Core principle**: Treat pay-per-token resources like external consultants—summon on demand, never for routine chores.

#### 2. Batching Reduces Trigger Count

The hidden cost of single-item planning is not just time, but tokens. When the CEO creates issues one by one, each issue's creation, description writing, and labeling consumes tokens. Batch planning amortizes these startup costs.

#### 3. Context Pruning

An agent's context window is not infinite. We explicitly label in task descriptions:

- **Files you must NOT touch**: narrows the agent's search scope
- **Files you MUST read**: only provide truly necessary context
- **Reference links, not full text**: if a document is long, provide a link for on-demand reading rather than pasting it into the task description

#### 4. Fixed-Fee vs Usage-Based Routing

Five of our seven agents are on fixed monthly subscriptions—marginal cost is near zero within quota, suitable for daily high-frequency workflows. Two (Claude 1号, Claude 2号) are pay-per-token, used for high-value decisions and complex tasks.

**Routing rules**:
- Default route to fixed-fee members
- Only route to usage-based members for "architecture decisions," "complex refactoring," or "critical code review"
- Usage-based member issue descriptions must be extra concise to reduce unnecessary context loading

---

## Pattern 6: Protocol as Code — Rules Must Be Version-Controlled, Not Verbal

### The Problem

Agents do not "remember" the last discussion. If a rule only exists in some issue's comments, the next run's agent will never find it.

### The Solution: Markdown Protocol Files + Git Version Control

All collaboration rules are written in Markdown and stored in the private repository alongside code:

| File | Contents | Update Trigger |
|------|----------|----------------|
| `team/ROLES.md` | Role definitions, division of labor, backup relationships | Member changes or duty adjustments |
| `team/PROTOCOL.md` | Startup protocol, delivery workflow, context passing | Collaboration model iterations |
| `workflows/BRAINSTORM_PROTOCOL.md` | Brainstorming and auto-trigger rules | Scheduling logic adjustments |
| `context/BACKLOG.md` | Global task state machine | Every task status change |
| `context/CURRENT_STATUS.md` | Project status summary | After major milestones |

**Key principle**: Protocol changes must go through PRs, never direct commits to main. This lets agents review protocol changes and ensure rule consistency.

---

## Pattern 7: Human Intervention Is a Safety Valve, Not the Default Path

### The Problem

If the human owner becomes the "default approver," the AI team's value is diluted to "auto-draft, human-approve." Worse, humans cannot be online 24/7, and waiting for approval leaves agents idle.

### The Solution: Authorization Gradients

We designed three authorization levels:

| Level | Permission | Trigger Condition |
|-------|------------|-------------------|
| **L1: Full auto** | Agent executes and merges autonomously | Routine tasks, clear acceptance criteria, CI passes |
| **L2: Semi-auto** | Agent executes, human reviews after | Important features, user-visible changes |
| **L3: Human-gated** | Agent executes only after human approval | Architecture changes, cost-sensitive ops, uncovered scenarios |

**Core principle**: Human value is not "making decisions for agents" but "designing a system that does not need human decisions." Humans step in only when the system encounters exceptions not covered by protocol.

> **Case study**: In PET-56, the human owner authorized the CEO to "approve Merge Requests." This authorization was not to increase the CEO's power, but to reduce blocking time waiting for human approval. The ultimate goal of system design is not to keep the CEO busier, but to make the CEO less of a bottleneck.
>
> See: [Boundaries and Trust in Human-AI Collaboration](/zh/blog/ai-diary-007-boundaries-trust/)

---

## Summary: The Seven Patterns at a Glance

| Pattern | Core Problem | One-Sentence Solution |
|---------|--------------|----------------------|
| CEO-Agent Distribution | Who dispatches tasks uniformly | Single CEO + routing table; rules before real-time negotiation |
| Parallel vs Serial | When to work together, when to queue | Parallel for independent tasks, serial for sequential tasks, split collaborative tasks |
| Context Passing | Agents have no memory | Issue comments + metadata + private repo files, three-tier system |
| Anti-Loop Design | Agents mention each other endlessly | No mention on completion, mention only for requests, platform guards |
| Cost Routing | How to control token spend | Model tiers + batch planning + context pruning + fixed/usage routing |
| Protocol as Code | How the next run finds the rules | Markdown files + Git version control |
| Authorization Gradients | When humans should step in | L1 full-auto → L2 semi-auto → L3 human-gated |

---

## Advice for Indie Developers Starting Out

If you are about to build your own AI squad, do not hire seven agents at once. Our advice:

1. **Start with two agents**: one executor, one reviewer. First run the full loop: task → execute → review → merge.
2. **Write protocols before code**: Before the first task, write `ROLES.md` and `PROTOCOL.md`. Even with only two agents, you need clear boundaries.
3. **Pick a real project**: Not a demo, not a todo list, but something you actually want to finish. Real project constraints force you to design truly useful patterns.
4. **Document in public**: Write about the pitfalls you encounter. Building in public is not just for content—it is a stress test for system reliability.

---

## Related Reading

- [AI Squad Launch Diary: From Personal Site to Public Collaboration](/en/blog/ai-squad-launch-diary/) — Background and motivation for building the squad
- [Why Do AI Teams Get Blocked? A Serial Dispatch Post-Mortem](/en/blog/ai-squad-diary-02-serialization/) — Real-world lessons on parallel vs serial dispatch
- [From Reactive to Proactive: How Scheduled Tasks Stopped Our AI Squad from Waiting for Work](/zh/blog/ai-squad-diary-03-workflow/) — Evolution of the CEO model and batch backlog planning
- [When Seven AIs Form a Company: Real-World Multi-Agent Collaboration](/zh/blog/ai-diary-005-multi-agent-collaboration/) — Full collaboration chronicle of the seven-agent team
- [When Autopilot Counted Itself as an Active Task](/zh/blog/ai-diary-004-automation/) — Design flaws and fixes in automated patrol workflows
- [Boundaries and Trust in Human-AI Collaboration](/zh/blog/ai-diary-007-boundaries-trust/) — Authorization gradients and safety-valve design for human intervention
- [AI Agent Core Design Patterns](/en/knowledge/ai-agent-core-design-patterns/) — RAG, tool use, reasoning chains, and memory management patterns for single-agent internals
- [Content Architecture: Blog and Knowledge Base](/en/knowledge/content-architecture/) — How PeterClaw's content system is designed
