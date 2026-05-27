#!/usr/bin/env node
/**
 * Build-time script: reads all non-draft blog posts, calls OpenAI text-embedding-3-small,
 * and writes src/data/blog-embeddings.json for the /api/blog-chat RAG endpoint.
 *
 * Set OPENAI_API_KEY as a Vercel build env var. Without it, an empty file is written
 * and the build proceeds — the chat endpoint will return a 503 until embeddings exist.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(OUT_DIR, 'blog-embeddings.json');

const OPENAI_KEY = process.env.OPENAI_API_KEY;

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const ci = line.indexOf(':');
    if (ci < 0) continue;
    const k = line.slice(0, ci).trim();
    const v = line.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
    if (k && v) out[k] = v;
  }
  return out;
}

function extractText(src) {
  return src
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s+/gm, '')
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|.*\|/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function collectFiles(dir) {
  const acc = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) acc.push(...await collectFiles(full));
    else if (/\.(md|mdx)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

async function getEmbedding(text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (!OPENAI_KEY) {
    console.warn('[embeddings] OPENAI_API_KEY not set — writing empty embeddings');
    await writeFile(OUT_FILE, '[]');
    return;
  }

  const files = await collectFiles(CONTENT_DIR);
  console.log(`[embeddings] ${files.length} blog files found`);

  const results = [];
  for (const fp of files) {
    try {
      const raw = await readFile(fp, 'utf-8');
      const meta = parseFrontmatter(raw);
      if (meta.draft === 'true') continue;

      const rel = fp.slice(CONTENT_DIR.length + 1).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
      const [locale, ...rest] = rel.split('/');
      const slug = rest.join('/');
      const body = extractText(raw).slice(0, 3000);
      if (!body) continue;

      const input = `${meta.title || slug}\n${meta.description || ''}\n${body}`.slice(0, 8000);
      console.log(`  → ${locale}/${slug}`);
      const embedding = await getEmbedding(input);

      results.push({
        id: `${locale}/${slug}`,
        locale,
        slug,
        title: meta.title || slug,
        description: meta.description || '',
        url: `/${locale}/blog/${slug}/`,
        snippet: body.slice(0, 250),
        embedding,
      });

      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.error(`  ✗ ${fp}: ${err.message}`);
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(results));
  console.log(`[embeddings] Saved ${results.length} entries → ${OUT_FILE}`);
}

main().catch(err => {
  console.error('[embeddings] Fatal:', err.message);
  // Do not exit 1 — let the build continue with whatever was written
});
