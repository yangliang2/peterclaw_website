import type { APIRoute } from 'astro';

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

type MessageItem = { role: string; content: string };

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return json({ error: 'server_config' }, 503);
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!allowRequest(ip)) {
    return json({ error: 'rate_limited' }, 429);
  }

  let body: { messages?: MessageItem[]; question?: string; articleContent?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const articleContent = (body.articleContent ?? '').trim().slice(0, 6000);
  const locale = body.locale === 'en' ? 'en' : 'zh';

  // Accept multi-turn messages array or legacy single question field
  const rawMessages: MessageItem[] =
    Array.isArray(body.messages) && body.messages.length > 0
      ? body.messages
      : body.question?.trim()
        ? [{ role: 'user', content: body.question.trim() }]
        : [];

  if (rawMessages.length === 0) {
    return json({ error: 'invalid_request' }, 400);
  }

  // Sanitize: keep last 10, valid roles only, cap per-message length
  const chatMessages = rawMessages
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 1000) }));

  if (chatMessages.length === 0 || chatMessages[chatMessages.length - 1]?.role !== 'user') {
    return json({ error: 'invalid_request' }, 400);
  }

  // Validate last user message isn't abusively long
  if ((chatMessages[chatMessages.length - 1]?.content.length ?? 0) > 500) {
    return json({ error: 'invalid_request' }, 400);
  }

  const systemPrompt =
    locale === 'en'
      ? `You are a helpful assistant answering reader questions about the following article. Answer based on the article content. Be concise and accurate. If the question is unrelated to the article, politely redirect to the article topic.\n\nArticle:\n${articleContent}`
      : `你是一个帮助读者理解本文内容的助手。请根据下方文章内容回答问题，回答要简洁准确。如果问题与文章无关，请礼貌地引导回文章话题。\n\n文章内容：\n${articleContent}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v4-pro',
            stream: true,
            max_tokens: 1024,
            messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          }),
        });

        if (!response.ok || !response.body) {
          console.error('DeepSeek API error:', response.status);
          controller.enqueue(encoder.encode('\n[Error generating response]'));
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // ignore malformed SSE chunks
            }
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
