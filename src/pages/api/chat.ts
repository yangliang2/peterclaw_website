import type { APIRoute } from 'astro';
import {
  checkAiRateLimit,
  classifyProviderStatus,
  fetchWithTimeout,
  getClientIp,
  jsonError,
  ProviderError,
  userFacingStreamError,
} from '@/lib/ai-guardrails';

export const prerender = false;

type MessageItem = { role: string; content: string };

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY is not configured');
    return jsonError({ error: 'server_config' }, 503);
  }

  const ip = getClientIp(request);
  const rate = checkAiRateLimit(ip);

  if (!rate.allowed) {
    return jsonError(
      { error: 'rate_limited', scope: rate.scope },
      429,
      { 'Retry-After': String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) },
    );
  }

  let body: { messages?: MessageItem[]; question?: string; articleContent?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError({ error: 'invalid_json' }, 400);
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
    return jsonError({ error: 'invalid_request' }, 400);
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
    return jsonError({ error: 'invalid_request' }, 400);
  }

  // Validate last user message isn't abusively long
  if ((chatMessages[chatMessages.length - 1]?.content.length ?? 0) > 500) {
    return jsonError({ error: 'invalid_request' }, 400);
  }

  const systemPrompt =
    locale === 'en'
      ? `You are a helpful assistant answering reader questions about the following article. Answer based on the article content. Be concise and accurate. If the question is unrelated to the article, politely redirect to the article topic.\n\nArticle:\n${articleContent}`
      : `你是一个帮助读者理解本文内容的助手。请根据下方文章内容回答问题，回答要简洁准确。如果问题与文章无关，请礼貌地引导回文章话题。\n\n文章内容：\n${articleContent}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
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
          throw classifyProviderStatus(response.status);
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
      } catch (error) {
        const kind = error instanceof ProviderError ? error.kind : 'generic';
        console.error('Article chat stream error:', error);
        controller.enqueue(encoder.encode(userFacingStreamError(locale, kind)));
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
