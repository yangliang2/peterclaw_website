import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSiteUrl } from '@/config/site';
import { buildWeeklyNewsletterDraft, createButtondownDrafts, type NewsletterEntry } from '@/lib/newsletter';
import { collectionPath, localeFromId, locales } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const cronSecret = import.meta.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const lookbackDays = parsePositiveInteger(url.searchParams.get('days')) ?? 7;
  const dryRun = url.searchParams.get('dryRun') === '1';
  const now = new Date();
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const drafts = locales.map((locale) => {
    const entries: NewsletterEntry[] = posts
      .filter((post) => localeFromId(post.id) === locale)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        publishedAt: post.data.publishedAt,
        url: collectionPath(locale, 'blog', post.id),
        contentType: post.data.contentType,
        tags: post.data.tags,
      }));

    return buildWeeklyNewsletterDraft(locale, entries, {
      now,
      lookbackDays,
      siteUrl: getSiteUrl(),
    });
  });

  if (dryRun) {
    return json({ ok: true, dryRun: true, drafts });
  }

  try {
    const results = await createButtondownDrafts(drafts, {
      defaultApiKey: import.meta.env.BUTTONDOWN_API_KEY,
      apiKeysByLocale: {
        zh: import.meta.env.BUTTONDOWN_ZH_API_KEY,
        en: import.meta.env.BUTTONDOWN_EN_API_KEY,
      },
    });

    return json({ ok: true, dryRun: false, results });
  } catch (error) {
    console.error('Weekly newsletter draft creation failed:', error);
    return json({ error: 'draft_creation_failed' }, 502);
  }
};

function parsePositiveInteger(value: string | null) {
  if (!value) return undefined;

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
