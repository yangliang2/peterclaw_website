import type { Locale } from '@/lib/i18n';

export type NewsletterEntry = {
  title: string;
  description: string;
  publishedAt: Date;
  url: string;
  contentType?: string;
  tags: string[];
};

export type NewsletterDraft = {
  locale: Locale;
  subject: string;
  body: string;
  entryCount: number;
};

type BuildOptions = {
  now?: Date;
  lookbackDays?: number;
  siteUrl?: string | URL;
};

type ButtondownDraftResult = {
  locale: Locale;
  id?: string;
  url?: string;
  status?: string;
};

const DEFAULT_LOOKBACK_DAYS = 7;

export function filterRecentEntries(
  entries: NewsletterEntry[],
  options: Pick<BuildOptions, 'now' | 'lookbackDays'> = {}
) {
  const now = options.now ?? new Date();
  const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;
  const cutoff = new Date(now.valueOf() - lookbackDays * 24 * 60 * 60 * 1000);

  return entries
    .filter((entry) => entry.publishedAt >= cutoff && entry.publishedAt <= now)
    .sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
}

export function buildWeeklyNewsletterDraft(locale: Locale, entries: NewsletterEntry[], options: BuildOptions = {}): NewsletterDraft {
  const siteUrl = stripTrailingSlash(String(options.siteUrl ?? 'https://peterclaw.com'));
  const recentEntries = filterRecentEntries(entries, options);
  const issueDate = formatDate(options.now ?? new Date(), locale);
  const subject =
    locale === 'zh'
      ? `PeterClaw 周报：过去 7 天新增 ${recentEntries.length} 篇内容`
      : `PeterClaw Weekly: ${recentEntries.length} new posts from the past 7 days`;

  return {
    locale,
    subject,
    entryCount: recentEntries.length,
    body: locale === 'zh'
      ? renderZhBody(recentEntries, issueDate, siteUrl)
      : renderEnBody(recentEntries, issueDate, siteUrl),
  };
}

export async function createButtondownDrafts(
  drafts: NewsletterDraft[],
  options: {
    defaultApiKey?: string;
    apiKeysByLocale?: Partial<Record<Locale, string>>;
    fetchImpl?: typeof fetch;
  } = {}
): Promise<ButtondownDraftResult[]> {
  const fetcher = options.fetchImpl ?? fetch;
  const results: ButtondownDraftResult[] = [];

  for (const draft of drafts) {
    const apiKey = options.apiKeysByLocale?.[draft.locale] ?? options.defaultApiKey;

    if (!apiKey) {
      throw new Error(`Missing Buttondown API key for locale "${draft.locale}".`);
    }

    const response = await fetcher('https://api.buttondown.com/v1/emails', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: draft.subject,
        body: `<!-- buttondown-editor-mode: fancy -->\n${draft.body}`,
        status: 'draft',
        metadata: {
          source: 'peterclaw-weekly-newsletter-cron',
          locale: draft.locale,
          entry_count: String(draft.entryCount),
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Buttondown draft creation failed for ${draft.locale}: ${response.status} ${detail}`);
    }

    const payload = await response.json().catch(() => ({}));
    results.push({
      locale: draft.locale,
      id: typeof payload.id === 'string' ? payload.id : undefined,
      url: typeof payload.url === 'string' ? payload.url : undefined,
      status: typeof payload.status === 'string' ? payload.status : undefined,
    });
  }

  return results;
}

function renderZhBody(entries: NewsletterEntry[], issueDate: string, siteUrl: string) {
  const featured = entries[0];

  return [
    '# PeterClaw 周报',
    '',
    `日期：${issueDate}`,
    '',
    entries.length > 0
      ? `过去 7 天，PeterClaw 新发布了 ${entries.length} 篇内容。下面是本周最值得回看的文章、评测与实践记录。`
      : '过去 7 天没有新发布内容。本期草稿保留为空档提醒，请人工确认是否跳过发送。',
    '',
    featured ? '## 本周精选' : '',
    featured ? renderEntry(featured, siteUrl) : '',
    entries.length > 1 ? '## 新发布内容' : '',
    entries.slice(1).map((entry) => renderEntry(entry, siteUrl)).join('\n\n'),
    '## 给读者的行动',
    '',
    '- 如果你只读一篇，先打开「本周精选」。',
    '- 如果你正在搭建自己的 AI 工作流，把相关链接转发给未来的自己。',
    '- 有问题或想看某个工具评测，直接回复这封邮件。',
    '',
    `继续浏览：${siteUrl}/zh/blog/`,
    '',
    '— PeterClaw Squad',
  ].filter(Boolean).join('\n');
}

function renderEnBody(entries: NewsletterEntry[], issueDate: string, siteUrl: string) {
  const featured = entries[0];

  return [
    '# PeterClaw Weekly',
    '',
    `Date: ${issueDate}`,
    '',
    entries.length > 0
      ? `PeterClaw published ${entries.length} new piece${entries.length === 1 ? '' : 's'} in the past 7 days. Here are the posts, reviews, and field notes worth revisiting.`
      : 'No new posts were published in the past 7 days. Keep this draft as a reminder to confirm whether this issue should be skipped.',
    '',
    featured ? '## Featured' : '',
    featured ? renderEntry(featured, siteUrl) : '',
    entries.length > 1 ? '## Newly Published' : '',
    entries.slice(1).map((entry) => renderEntry(entry, siteUrl)).join('\n\n'),
    '## What to do next',
    '',
    '- If you only read one thing, start with the featured piece.',
    '- If you are building your own AI workflow, forward the relevant link to your future self.',
    '- Have a question or want a tool reviewed? Reply to this email.',
    '',
    `Keep reading: ${siteUrl}/en/blog/`,
    '',
    '— PeterClaw Squad',
  ].filter(Boolean).join('\n');
}

function renderEntry(entry: NewsletterEntry, siteUrl: string) {
  const tags = entry.tags.length > 0 ? `\nTags: ${entry.tags.join(', ')}` : '';
  return `### [${entry.title}](${siteUrl}${entry.url})\n\n${entry.description}${tags}`;
}

function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function stripTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
