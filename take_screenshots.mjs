import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = 'https://peterclaw-website.vercel.app';
const SCREENSHOTS_DIR = 'peterclaw_website/docs/marketing/screenshots';

const pages = [
  { name: '01-homepage-zh', url: `${BASE_URL}/zh/` },
  { name: '02-homepage-en', url: `${BASE_URL}/en/` },
  { name: '03-review-gemini-vs-gpt4', url: `${BASE_URL}/zh/blog/ai-tool-review-gemini-2-5-pro-vs-gpt-4o/` },
  { name: '04-tools-zh', url: `${BASE_URL}/zh/tools/` },
  { name: '05-squad-diary', url: `${BASE_URL}/zh/blog/ai-squad-launch-diary/` },
  { name: '06-about-en', url: `${BASE_URL}/en/about/` }
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // High resolution
  });
  const page = await context.newPage();

  for (const { name, url } of pages) {
    console.log(`Taking screenshot of ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Wait a bit for animations
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
      console.log(`Saved ${name}.png`);
    } catch (error) {
      console.error(`Failed to take screenshot of ${url}:`, error.message);
    }
  }

  await browser.close();
})();
