import { expect, test } from '@playwright/test';

test.describe('PEM – production build', () => {
  test('should bootstrap Angular without uncaught browser errors', async ({ page }) => {
    const pageErrors: string[] = [];

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/expenses');

    await expect(page.locator('app-root')).toBeVisible();
    await expect(page.locator('app-root')).not.toBeEmpty();

    expect(pageErrors).toEqual([]);
  });

  test('should load first-party JavaScript and CSS without HTTP errors', async ({ page }) => {
    const failedAssets: string[] = [];

    page.on('response', (response) => {
      const resourceType = response.request().resourceType();

      if (resourceType !== 'script' && resourceType !== 'stylesheet') {
        return;
      }

      const url = new URL(response.url());

      if (url.origin !== 'http://localhost:4200') {
        return;
      }

      if (response.status() >= 400) {
        failedAssets.push(`${response.status()} ${url.pathname}`);
      }
    });

    await page.goto('/expenses');
    await expect(page.locator('app-root')).toBeVisible();

    expect(failedAssets).toEqual([]);
  });

  test('should not have horizontal overflow on mobile viewport', async ({ page }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });

    await page.goto('/expenses');
    await expect(page.locator('app-root')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement;

      return root.scrollWidth > root.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
