import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Font } from 'satori';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '../../node_modules');

async function loadFont(relativePath: string): Promise<ArrayBuffer> {
  const buffer = await readFile(join(packageRoot, relativePath));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export async function loadOgFonts(): Promise<Font[]> {
  const [inter, interBold, noto] = await Promise.all([
    loadFont('@fontsource/inter/files/inter-latin-400-normal.woff'),
    loadFont('@fontsource/inter/files/inter-latin-700-normal.woff'),
    loadFont('@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff'),
  ]);

  return [
    { name: 'Inter', data: inter, weight: 400, style: 'normal' },
    { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    { name: 'Noto Sans SC', data: noto, weight: 700, style: 'normal' },
  ];
}
