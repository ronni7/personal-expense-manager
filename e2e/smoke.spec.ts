import { expect, test } from '@playwright/test';

test('Nginx serves the Angular application', async ({ request }) => {
  const response = await request.get('/');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/html');

  const html = await response.text();

  expect(html).toContain('<app-root');
});

test('Nginx supports Angular SPA deep links', async ({ request }) => {
  const response = await request.get('/expenses');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/html');

  const html = await response.text();

  expect(html).toContain('<app-root');
});

test('Angular application bootstraps in Chromium', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);

  await expect(page.locator('app-root')).not.toBeEmpty();
});
