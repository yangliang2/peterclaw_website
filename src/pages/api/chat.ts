import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

// In-memory rate limiter — resets on cold start, acceptable for basic protection
const ipBucket = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const entry = ipBucket.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipBucket.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function json(payload: object, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return json({ error: 'server_config' }, 503);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!allowRequest(ip)) {
    return json({ error: 'rate_limited' }, 429);
  }

  let body: { question?: string; articleContent?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const question = body.question?.trim();
  const articleContent = (body.articleContent ?? '').trim().slice(0, 6000);
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!question || question.length === 0 || question.length > 500) {
    return json({ error: 'invalid_request' }, 400);
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt =
    locale === 'en'
      ? `You are a helpful assistant answering reader questions about the following article. Answer based on the article content. Be concise and accurate. If the question is unrelated to the article, politely redirect to the article topic.\n\nArticle:\n${articleContent}`
      : `你是一个帮助读者理解本文内容的助手。请根据下方文章内容回答问题，回答要简洁准确。如果问题与文章无关，请礼貌地引导回文章话题。\n\n文章内容：\n${articleContent}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
        });

        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error('Chat stream error:', err);
        controller.enqueue(encoder.encode('\n[Error generating response]'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
};
