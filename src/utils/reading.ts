const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(markdown = '') {
  const withoutFrontmatter = markdown.replace(/^---[\s\S]*?---/, '');
  const withoutCode = withoutFrontmatter.replace(/```[\s\S]*?```/g, ' ');
  const text = withoutCode
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~|[\](){}:;.,!?'"，。！？、：；（）《》“”‘’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cjkCharacters = text.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = text
    .replace(/[\u3400-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil((cjkCharacters + latinWords) / WORDS_PER_MINUTE));
}
