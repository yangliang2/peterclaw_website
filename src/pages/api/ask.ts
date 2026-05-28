import type { APIRoute } from 'astro';
import type { RagStore } from '@/lib/rag';
import { topChunks } from '@/lib/rag';
import ragData from '../../data/rag-embeddings.json';

export const prerender = false;

const MAX_QUESTION_LENGTH = 500;

function json(payload: object, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function embedQuery(apiKey: string, text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  });
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  let body: { question?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const question = body.question?.trim();
  const locale = body.locale === 'en' ? 'en' : 'zh';

  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return json({ error: 'invalid_question' }, 400);
  }

  const store = ragData as unknown as RagStore;
  if (store.chunks.length === 0) {
    return json({ error: 'embeddings_not_generated' }, 503);
  }

  let queryVec: number[];
  try {
    queryVec = await embedQuery(apiKey, question);
  } catch {
    return json({ error: 'embedding_failed' }, 502);
  }

  const chunks = topChunks(store, queryVec, 3);
  const context = chunks
    .map((c) => `### ${c.title}\n${c.text}`)
    .join('\n\n---\n\n');

  const systemPrompt =
    locale === 'en'
      ? `You are PeterClaw's personal site assistant. Answer the visitor's question using ONLY the site content provided below. Be concise and direct. If the answer is not in the content, say "I don't have information about that on the site." Do not fabricate information.`
      : `你是 PeterClaw 个人网站的智能助手。请仅根据下方提供的站点内容回答访客问题，回答简洁直接。如果内容中没有相关信息，请说"站点目前没有这方面的内容"，不要编造信息。`;

  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Site content:\n\n${context}\n\n---\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!chatRes.ok) {
    return json({ error: 'generation_failed' }, 502);
  }

  return new Response(chatRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'X-Accel-Buffering': 'no',
    },
  });
};
