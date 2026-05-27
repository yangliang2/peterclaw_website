import type { ImageMetadata } from 'astro';

const coverModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/blog/covers/*.{jpg,jpeg,png,webp,svg}',
  { eager: true }
);

const coverByFilename = new Map<string, ImageMetadata>();

for (const [assetPath, mod] of Object.entries(coverModules)) {
  const filename = assetPath.split('/').pop();
  if (filename) {
    coverByFilename.set(filename, mod.default);
  }
}

const TAG_GRADIENTS = [
  { from: '#2563eb', to: '#7c3aed' },
  { from: '#0ea5e9', to: '#06b6d4' },
  { from: '#059669', to: '#0d9488' },
  { from: '#d97706', to: '#dc2626' },
  { from: '#7c3aed', to: '#c026d3' },
  { from: '#4f46e5', to: '#2563eb' },
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deterministic gradient from the first tag (or a fallback seed). */
export function tagCoverGradient(tags: string[], seed = 'peterclaw'): string {
  const key = tags[0]?.trim() || seed;
  const palette = TAG_GRADIENTS[hashString(key) % TAG_GRADIENTS.length];
  return `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`;
}

/** Resolve a cover filename from frontmatter to an optimized astro:assets image. */
export function resolveCoverAsset(cover?: string): ImageMetadata | undefined {
  if (!cover?.trim()) {
    return undefined;
  }

  return coverByFilename.get(cover.trim());
}

export function listCoverAssets(): string[] {
  return [...coverByFilename.keys()].sort();
}
