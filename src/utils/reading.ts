export const WORDS_PER_MINUTE = 200;

/** Strip common Markdown syntax for a rough plain-text word count. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\|/g, ' ')
    .trim();
}

/** Count reading units: CJK characters plus Latin word tokens. */
export function countReadingUnits(text: string): number {
  const plain = stripMarkdown(text);
  const cjk =
    plain.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g)?.length ?? 0;
  const latin = plain
    .replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ')
    .split(/\s+/)
    .filter((token) => /[a-zA-Z0-9]/.test(token)).length;
  return cjk + latin;
}

export function estimateReadingMinutes(
  text: string,
  wpm: number = WORDS_PER_MINUTE
): number {
  const units = countReadingUnits(text);
  if (units === 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(units / wpm));
}
