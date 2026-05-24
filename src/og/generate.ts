import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { OG_HEIGHT, OG_WIDTH } from './brand.ts';
import { loadOgContentEntries } from './content.ts';
import { loadOgFonts } from './fonts.ts';
import { OgDefaultTemplate, OgTemplate } from './template.tsx';
import type { Locale } from '../lib/i18n.ts';
import { generatedOgPath, isAutoOgPlaceholder } from '../utils/og-image.ts';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const publicDir = join(projectRoot, 'public');

type ContentCollection = 'blog' | 'knowledge';

const sectionLabels: Record<ContentCollection, Record<Locale, string>> = {
  blog: { zh: '博客', en: 'Blog' },
  knowledge: { zh: '知识库', en: 'Knowledge' },
};

async function renderPng(element: Parameters<typeof satori>[0]): Promise<Buffer> {
  const fonts = await loadOgFonts();
  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  });
  return Buffer.from(resvg.render().asPng());
}

async function writePng(relativePath: string, png: Buffer) {
  const outputPath = join(publicDir, relativePath.replace(/^\//, ''));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, png);
}

function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function generateEntryImages(collection: ContentCollection) {
  const entries = await loadOgContentEntries(projectRoot, collection);

  for (const entry of entries) {
    if (!isAutoOgPlaceholder(entry.ogImage)) {
      continue;
    }

    const outputPath = generatedOgPath(collection, entry.locale, entry.slug);
    const png = await renderPng(
      OgTemplate({
        title: entry.title,
        dateLabel: formatDate(entry.publishedAt, entry.locale),
        tags: entry.tags,
        sectionLabel: sectionLabels[collection][entry.locale],
      }),
    );
    await writePng(outputPath, png);
  }
}

export async function generateOgImages() {
  const defaultPng = await renderPng(OgDefaultTemplate());
  await writePng('/og-default.png', defaultPng);

  await generateEntryImages('blog');
  await generateEntryImages('knowledge');
}
