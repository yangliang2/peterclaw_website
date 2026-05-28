/**
 * Build-time script: chunks all blog/knowledge Markdown content and generates
 * OpenAI embeddings, writing the result to src/data/rag-embeddings.json.
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 * Requires: OPENAI_API_KEY env var
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { chunkText, stripFrontmatter } from '../src/lib/rag.ts';

const ROOT = resolve(import.meta.dirname, '..');
const OUTPUT = join(ROOT, 'src/data/rag-embeddings.json');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 20;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  process.exit(1);
}

interface RawChunk {
  id: string;
  title: string;
  url: string;
  locale: string;
  text: string;
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => join(e.parentPath ?? dir, e.name));
}

function fileToUrl(filePath: string, locale: string, collection: string): string {
  const rel = filePath
    .replace(/\\/g, '/')
    .replace(/.*src\/content\/[^/]+\/[^/]+\//, '')
    .replace(/\.md$/, '');
  return `/${locale}/${collection}/${rel}/`;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings failed (${res.status}): ${err}`);
  }

  const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function main() {
  const collections = ['blog', 'knowledge'] as const;
  const rawChunks: RawChunk[] = [];

  for (const collection of collections) {
    const dir = join(ROOT, 'src/content', collection);
    const files = await collectMarkdownFiles(dir).catch(() => [] as string[]);

    for (const filePath of files) {
      const raw = await readFile(filePath, 'utf-8');
      const { title, content } = stripFrontmatter(raw);

      const localeMatch = filePath.replace(/\\/g, '/').match(/\/content\/[^/]+\/([^/]+)\//);
      const locale = localeMatch?.[1] ?? 'zh';
      const url = fileToUrl(filePath, locale, collection);

      const chunks = chunkText(content);
      chunks.forEach((text, i) => {
        rawChunks.push({
          id: `${collection}/${locale}/${filePath.split('/').at(-1)?.replace('.md', '')}/${i}`,
          title: title || filePath.split('/').at(-1)?.replace('.md', '') || 'Untitled',
          url,
          locale,
          text: text.trim(),
        });
      });
    }
  }

  console.log(`Found ${rawChunks.length} chunks across ${collections.join(', ')}`);

  const allEmbeddings: number[][] = [];
  for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
    const batch = rawChunks.slice(i, i + BATCH_SIZE);
    console.log(`Embedding batch ${i / BATCH_SIZE + 1}/${Math.ceil(rawChunks.length / BATCH_SIZE)}…`);
    const vecs = await embedBatch(batch.map((c) => c.text));
    allEmbeddings.push(...vecs);
  }

  const output = {
    generated: new Date().toISOString(),
    model: EMBEDDING_MODEL,
    chunks: rawChunks.map((c, i) => ({ ...c, embedding: allEmbeddings[i] })),
  };

  await writeFile(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Wrote ${output.chunks.length} embedded chunks to src/data/rag-embeddings.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
