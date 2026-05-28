import type { APIRoute } from 'astro';
import rawEmbeddings from '../../data/blog-embeddings.json';
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

type Entry = {
  id: string;
  locale: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  snippet: string;
  embedding: number[];
};

const entries = rawEmbeddings as Entry[];

// OpenAI embeddings are unit-normalised, so dot product == cosine similarity
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const res = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 1000) }),
  });
  if (!res.ok) throw classifyProviderStatus(res.status);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

export const POST: APIRoute = async ({ request }) => {
  const openaiKey = import.meta.env.OPENAI_API_KEY;
  const deepseekKey = import.meta.env.DEEPSEEK_API_KEY;

  if (!openaiKey || !deepseekKey) return jsonError({ error: 'server_config' }, 503);
  if (entries.length === 0) return jsonError({ error: 'not_ready' }, 503);

  const ip = getClientIp(request);
  const rate = checkAiRateLimit(ip);

  if (!rate.allowed) {
    return jsonError(
      { error: 'rate_limited', scope: rate.scope },
      429,
      { 'Retry-After': String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) },
    );
  }

  let body: { question?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError({ error: 'invalid_json' }, 400);
  }

  const question = (body.question ?? '').trim().slice(0, 500);
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!question) return jsonError({ error: 'invalid_request' }, 400);

  let qVec: number[];
  try {
    qVec = await embedQuery(question, openaiKey);
  } catch (error) {
    const kind = error instanceof ProviderError ? error.kind : 'upstream';
    console.error('Embedding error:', error);
    return jsonError(
      { error: kind === 'quota' ? 'quota_exhausted' : kind === 'timeout' ? 'timeout' : 'embedding_failed' },
      kind === 'timeout' ? 504 : 502,
    );
  }

  const localeEntries = entries.filter(e => e.locale === locale);
  const top = localeEntries
    .map(e => ({ ...e, score: dot(qVec, e.embedding) }))
    .sort((a, b) => b.score - a.score)
    .filter(e => e.score > 0.25)
    .slice(0, 3);

  const context = top.length > 0
    ? top.map((e, i) => `[${i + 1}] ${e.title}\n${e.description}\n${e.snippet}`).join('\n\n')
    : locale === 'en' ? 'No closely matching articles found.' : '未找到高度相关的文章。';

  const systemPrompt = locale === 'en'
    ? `You are a helpful assistant for the PeterClaw blog. Answer questions based on these article excerpts. Be concise. If no relevant content exists, say so.\n\nArticle context:\n${context}`
    : `你是 PeterClaw 博客的 AI 助手，根据以下文章摘要回答问题，回答要简洁。若摘要中没有相关内容，请如实告知。\n\n文章摘要：\n${context}`;

  const sources = top.map(e => ({ title: e.title, url: e.url }));
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v4-pro',
            stream: true,
            max_tokens: 800,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question },
            ],
          }),
        });

        if (!res.ok || !res.body) {
          throw classifyProviderStatus(res.status);
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith('data:')) continue;
            const d = t.slice(5).trim();
            if (d === '[DONE]') continue;
            try {
              const parsed = JSON.parse(d);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch { /* malformed SSE chunk */ }
          }
        }

        // Append sources as a parseable marker after the answer text
        if (sources.length > 0) {
          controller.enqueue(encoder.encode(`\n\n__SOURCES__${JSON.stringify(sources)}`));
        }
      } catch (error) {
        const kind = error instanceof ProviderError ? error.kind : 'generic';
        console.error('Blog chat stream error:', error);
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
