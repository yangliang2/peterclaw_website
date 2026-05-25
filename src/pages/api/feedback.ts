import type { APIRoute } from 'astro';

export const prerender = false;

const FEEDBACK_TYPES = new Set(['content_suggestion', 'bug_report', 'other']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 5000;

type FeedbackBody = {
  type?: string;
  email?: string;
  message?: string;
  locale?: string;
  source?: string;
  _gotcha?: string;
};

function json(payload: object, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const formId = import.meta.env.FORMSPREE_FEEDBACK_FORM_ID;

  if (!formId) {
    console.error('FORMSPREE_FEEDBACK_FORM_ID is not configured');
    return json({ error: 'server_config' }, 503);
  }

  let body: FeedbackBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  if (body._gotcha) {
    return json({ ok: true }, 200);
  }

  const type = body.type?.trim();
  const message = body.message?.trim();
  const email = body.email?.trim().toLowerCase();
  const locale = body.locale === 'en' ? 'en' : 'zh';
  const source = body.source?.trim().slice(0, 500) ?? '';

  if (
    !type ||
    !FEEDBACK_TYPES.has(type) ||
    !message ||
    message.length > MAX_MESSAGE_LENGTH ||
    (email && !EMAIL_PATTERN.test(email))
  ) {
    return json({ error: 'invalid_feedback' }, 400);
  }

  try {
    const response = await fetch(`https://formspree.io/f/${encodeURIComponent(formId)}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        message,
        email: email || undefined,
        locale,
        source,
        _subject: `[PeterClaw feedback] ${type}`,
      }),
    });

    if (response.ok) {
      return json({ ok: true }, 200);
    }

    const detail = await response.text();
    console.error('Formspree feedback failed:', response.status, detail);
    return json({ error: 'feedback_failed' }, 502);
  } catch (error) {
    console.error('Formspree feedback request error:', error);
    return json({ error: 'feedback_failed' }, 502);
  }
};
