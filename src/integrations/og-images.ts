import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { AstroIntegration } from 'astro';

const execFileAsync = promisify(execFile);
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

async function runOgGeneration(logger: { info: (message: string) => void }) {
  await execFileAsync('npx', ['tsx', 'src/og/run-generate.ts'], {
    cwd: projectRoot,
    env: process.env,
  });
  logger.info('Open Graph images generated.');
}

export function ogImagesIntegration(): AstroIntegration {
  return {
    name: 'peterclaw-og-images',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        await runOgGeneration(logger);
      },
      'astro:dev:server:start': async ({ logger }: { logger: { info: (message: string) => void } }) => {
        await runOgGeneration(logger);
      },
    },
  };
}
