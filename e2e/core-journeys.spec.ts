import { expect, test } from '@playwright/test';

test.describe('blog reading journey', () => {
  test('navigates into an article and activates reading helpers', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/blog\/$/);

    await page.getByRole('link', { name: /From Personal Site to Public Collaboration/ }).first().click();
    await expect(page.locator('article[data-pagefind-body]')).toBeVisible();

    const progress = page.locator('[data-reading-progress-bar]');
    await expect(progress).toBeAttached();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect
      .poll(() => progress.evaluate((element) => Number.parseFloat((element as HTMLElement).style.width)))
      .toBeGreaterThan(0);

    const tocLink = page.locator('[data-toc-link]').first();
    await expect(tocLink).toBeVisible();
    await tocLink.click();
    await expect.poll(() => new URL(page.url()).hash).not.toBe('');
  });

  test('loads the Giscus comment frame on an article', async ({ page }) => {
    await page.route('https://giscus.app/client.js', async (route) => {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `
          const frame = document.createElement('iframe');
          frame.className = 'giscus-frame';
          frame.title = 'Comments';
          document.currentScript.parentElement.append(frame);
        `,
      });
    });

    await page.goto('/en/blog/ai-squad-launch-diary/');

    await expect(page.locator('.giscus-host iframe.giscus-frame')).toBeVisible();
  });
});

test('search returns an article and navigates to it', async ({ page }) => {
  await page.goto('/en/search/');

  const search = page.getByRole('combobox', { name: /Search keywords/ });
  await expect(search).toBeVisible();
  await search.fill('collaboration');

  // Pagefind component-ui renders results as .pf-result-link anchors, not role="option"
  const result = page.locator('.pf-result-link, .pagefind-ui__result-link').first();
  await expect(result).toBeVisible({ timeout: 8000 });
  await result.click();

  await expect(page).toHaveURL(/\/en\/(?:blog|knowledge)\//);
  await expect(page.locator('article[data-pagefind-body]')).toBeVisible();
});

test('newsletter validates input and submits without a real subscription', async ({ page }) => {
  await page.route('**/api/subscribe', async (route) => {
    const payload = route.request().postDataJSON() as { email: string };
    expect(payload.email).toBe('reader@example.com');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('/en/');

  const signup = page.locator('.email-signup');
  const email = signup.locator('input[name="email"]');
  const status = signup.getByRole('status');

  await email.fill('not-an-email');
  await signup.getByRole('button', { name: 'Subscribe' }).click();
  await expect(status).toHaveText('Please enter a valid email address.');

  await email.fill('reader@example.com');
  await signup.getByRole('button', { name: 'Subscribe' }).click();
  await expect(status).toHaveText('You are subscribed! Check your inbox to confirm.');
});

test('RSS feed returns XML containing article entries', async ({ request }) => {
  const response = await request.get('/rss.xml');

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('xml');
  const feed = await response.text();
  expect(feed).toContain('<rss');
  expect(feed).toContain('<channel>');
  expect(feed).toContain('<item>');
});

test('language switcher moves between Chinese and English homepages', async ({ page }) => {
  await page.goto('/zh/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');

  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('link', { name: 'Switch to Chinese' }).click();
  await expect(page).toHaveURL(/\/zh\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
});
