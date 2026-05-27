# Newsletter Automation

PET-510 adds a weekly draft workflow for PeterClaw Newsletter. It reads published blog posts from the last 7 days, renders one Chinese draft and one English draft, and creates Buttondown emails with `status: draft`.

## Schedule

Vercel Cron calls:

```text
GET /api/newsletter/weekly-draft
```

The cron schedule is every Monday at 09:00 UTC.

If `CRON_SECRET` is configured, calls must include:

```text
Authorization: Bearer <CRON_SECRET>
```

## Environment Variables

Use one of these Buttondown configurations:

```text
BUTTONDOWN_API_KEY=<single-list-token>
```

Or separate lists for bilingual publishing:

```text
BUTTONDOWN_ZH_API_KEY=<chinese-newsletter-token>
BUTTONDOWN_EN_API_KEY=<english-newsletter-token>
```

`BUTTONDOWN_ZH_API_KEY` and `BUTTONDOWN_EN_API_KEY` take precedence over `BUTTONDOWN_API_KEY` for their locale.

## Local Draft Generation

Generate Markdown files under `newsletter/drafts/` without touching Buttondown:

```bash
npm run newsletter:draft
```

Change the lookback window:

```bash
npm run newsletter:draft -- --days 14
```

Create Buttondown drafts from the local CLI:

```bash
npm run newsletter:draft -- --push
```

## Template

Each generated issue uses this structure:

```text
# PeterClaw Weekly / PeterClaw 周报

Date
One-paragraph summary of the past 7 days

## Featured / 本周精选
Top newest post with summary, link, and tags

## Newly Published / 新发布内容
Remaining posts with summaries, links, and tags

## What to do next / 给读者的行动
CTA bullets and blog archive link
```

The automation only creates drafts. Human review remains required before sending.
