import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

function scoreChunk(text: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
  const textLower = text.toLowerCase();
  return queryWords.reduce((score, word) => {
    const matches = textLower.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    return score + (matches?.length ?? 0);
  }, 0);
}

function buildChunks(entries: { title: string; body: string; url: string }[]) {
  return entries.flatMap((entry) => {
    const paragraphs = (entry.body ?? '').split(/\n{2,}/).filter((p) => p.trim().length > 40);
    return paragraphs.map((para) => ({
      title: entry.title,
      url: entry.url,
      text: para.trim().slice(0, 600),
    }));
  });
}

export const POST: APIRoute = async ({ request }) => {
  const anthropicKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'not_configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { message?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const message = body.message?.trim();
  const lang = body.lang === 'en' ? 'en' : 'zh';

  if (!message || message.length > 600) {
    return new Response(JSON.stringify({ error: 'invalid_message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const [blogEntries, knowledgeEntries] = await Promise.all([
    getCollection('blog', (e) => !e.data.draft && e.id.startsWith(`${lang}/`)),
    getCollection('knowledge', (e) => !e.data.draft && e.id.startsWith(`${lang}/`)),
  ]);

  const allEntries = [
    ...blogEntries.map((e) => ({
      title: e.data.title,
      body: e.body ?? '',
      url: `/${lang}/blog/${e.id.replace(`${lang}/`, '')}/`,
    })),
    ...knowledgeEntries.map((e) => ({
      title: e.data.title,
      body: e.body ?? '',
      url: `/${lang}/knowledge/${e.id.replace(`${lang}/`, '')}/`,
    })),
  ];

  const chunks = buildChunks(allEntries);
  const topChunks = chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(`${chunk.title} ${chunk.text}`, message) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const contextText =
    topChunks.length > 0
      ? topChunks.map((c) => `**[${c.title}](${c.url})**\n${c.text}`).join('\n\n---\n\n')
      : lang === 'zh'
        ? '（暂无与问题直接匹配的站内内容）'
        : '(No directly matching site content found for this question)';

  const systemPrompt =
    lang === 'zh'
      ? `你是 PeterClaw 网站的 AI 助手，名字叫「PeterClaw AI」。你基于站内博客和知识库内容回答读者问题。

规则：
- 回答简洁清晰，语气自然友好
- 优先引用站内相关内容，使用 Markdown 链接格式，例如 [文章标题](链接)
- 如果问题超出站内范围，诚实说明，并尽力提供有用帮助
- 不要编造不存在的文章或链接

相关站内内容：

${contextText}`
      : `You are PeterClaw AI, the assistant for peterclaw.com. You answer reader questions based on the site's blog and knowledge base.

Rules:
- Be concise, clear, and friendly
- Prioritize referencing site content using Markdown links, e.g. [Article Title](url)
- If the question is outside site scope, say so honestly and still try to help
- Never fabricate articles or links

Relevant site content:

${contextText}`;

  const client = new Anthropic({ apiKey: anthropicKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
          stream: true,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          } else if (event.type === 'message_stop') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          }
        }
      } catch (err) {
        console.error('Claude API error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'api_error' })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
