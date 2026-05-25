export interface RagChunk {
  id: string;
  title: string;
  url: string;
  locale: string;
  text: string;
  embedding: number[];
}

export interface RagStore {
  generated: string;
  model: string;
  chunks: RagChunk[];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function topChunks(store: RagStore, queryVec: number[], k = 3): RagChunk[] {
  return store.chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryVec, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}

export function chunkText(text: string, maxWords = 400): string[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const chunks: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length;
    if (wordCount + words > maxWords && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [];
      wordCount = 0;
    }
    current.push(para);
    wordCount += words;
  }
  if (current.length > 0) chunks.push(current.join('\n\n'));
  return chunks;
}

export function stripFrontmatter(raw: string): { title: string; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { title: '', content: raw };

  const frontmatter = match[1];
  const content = match[2];
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return { title: titleMatch?.[1] ?? '', content };
}
