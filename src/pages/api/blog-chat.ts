import type { APIRoute } from 'astro';
import rawEmbeddings from '../../data/blog-embeddings.json';

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

// In-memory rate limiter: 20 requests per IP per calendar day (resets at midnight UTC)
const bucket = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  const resetAt = tomorrow.getTime();

  const rec = bucket.get(ip);
  if (!rec || now >= rec.resetAt) {
    bucket.set(ip, { count: 1, resetAt });
    return true;
  }
  if (rec.count >= 20) return false;
  rec.count++;
  return true;
}

function jsonErr(payload: object, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// OpenAI embeddings are unit-normalised, so dot product == cosine similarity
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 1000) }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding as number[];
}

export const POST: APIRoute = async ({ request }) => {
  const openaiKey = import.meta.env.OPENAI_API_KEY;
  const deepseekKey = import.meta.env.DEEPSEEK_API_KEY;

  if (!openaiKey || !deepseekKey) return jsonErr({ error: 'server_config' }, 503);
  if (entries.length === 0) return jsonErr({ error: 'not_ready' }, 503);

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRate(ip)) return jsonErr({ error: 'rate_limited' }, 429);

  let body: { question?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return jsonErr({ error: 'invalid_json' }, 400);
  }

  const question = (body.question ?? '').trim().slice(0, 500);
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!question) return jsonErr({ error: 'invalid_request' }, 400);

  let qVec: number[];
  try {
    qVec = await embedQuery(question, openaiKey);
  } catch (err) {
    console.error('Embedding error:', err);
    return jsonErr({ error: 'embedding_failed' }, 502);
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
        const res = await fetch('https://api.deepseek.com/chat/completions', {
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
          controller.enqueue(encoder.encode('[Error generating response]'));
          controller.close();
          return;
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
      } catch (err) {
        console.error('Blog chat stream error:', err);
        controller.enqueue(encoder.encode('[Error generating response]'));
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
