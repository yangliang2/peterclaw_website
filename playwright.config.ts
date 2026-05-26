import { defineConfig, devices } from '@playwright/test';

const previewUrl = process.env.BASE_URL?.trim();
const localUrl = 'http://127.0.0.1:4321';

if (!previewUrl) {
  const localBypass = '127.0.0.1,localhost';
  process.env.NO_PROXY = [process.env.NO_PROXY, localBypass].filter(Boolean).join(',');
  process.env.no_proxy = [process.env.no_proxy, localBypass].filter(Boolean).join(',');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: previewUrl || localUrl,
    trace: 'on-first-retry',
  },
  webServer: previewUrl
    ? undefined
    : {
        command: 'npm run build && npm run preview:e2e -- --host 127.0.0.1 --port 4321',
        url: `${localUrl}/en/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
