import type { APIRoute } from 'astro';

export const prerender = false;

// In-memory rate limiter: ≤10 requests per IP per minute
const rateMap = new Map<string, { count: number; reset: number }>();

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return jsonError('server_config', 503);
  }

  const ip = getClientIP(request);
  if (!allowRequest(ip)) {
    return jsonError('rate_limit', 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError('invalid_json', 400);
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const articleContent = typeof body.articleContent === 'string' ? body.articleContent.trim() : '';
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!question || !articleContent) {
    return jsonError('missing_fields', 400);
  }
  if (question.length > 500 || articleContent.length > 20000) {
    return jsonError('too_long', 400);
  }

  const systemPrompt =
    locale === 'en'
      ? `You are a helpful assistant answering reader questions about the following article. Answer concisely based only on the article content. If the answer is not in the article, say so briefly.\n\nArticle:\n${articleContent}`
      : `你是帮助读者理解文章的 AI 助手。请根据以下文章内容简洁地回答问题，答案应来自文章本身。若文章中没有相关内容，请简短说明。\n\n文章内容：\n${articleContent}`;

  let upstream: Response;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        stream: true,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    });
  } catch (err) {
    console.error('Anthropic fetch error:', err);
    return jsonError('api_error', 502);
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('Anthropic API error:', upstream.status, detail);
    return jsonError('api_error', 502);
  }

  // Parse Anthropic SSE and re-emit only text delta events
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  const readable = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data) continue;
            try {
              const event = JSON.parse(data) as Record<string, unknown>;
              const delta = event.delta as Record<string, unknown> | undefined;
              if (event.type === 'content_block_delta' && delta?.type === 'text_delta') {
                const text = delta.text as string;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } else if (event.type === 'message_stop') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
};
