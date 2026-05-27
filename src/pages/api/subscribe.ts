import type { APIRoute } from 'astro';

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_LOCALES = ['zh', 'en'] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidLocale(value: string | undefined): value is ValidLocale {
  return VALID_LOCALES.includes(value as ValidLocale);
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.BUTTONDOWN_API_KEY;

  if (!apiKey) {
    console.error('BUTTONDOWN_API_KEY is not configured');
    return new Response(JSON.stringify({ error: 'server_config' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { email?: string; locale?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const locale = isValidLocale(body.locale) ? body.locale : 'zh';
  const source = body.source?.trim().slice(0, 50) || 'website';

  const tags = [`locale:${locale}`, `source:${source}`];

  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Buttondown-Collision-Behavior': 'overwrite',
      },
      body: JSON.stringify({
        email_address: email,
        tags,
        metadata: {
          subscribed_from: source,
          locale,
        },
      }),
    });

    if (response.ok) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (response.status === 409) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const detail = await response.text();
    console.error('Buttondown subscribe failed:', response.status, detail);

    return new Response(JSON.stringify({ error: 'subscribe_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Buttondown subscribe request error:', error);
    return new Response(JSON.stringify({ error: 'subscribe_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
