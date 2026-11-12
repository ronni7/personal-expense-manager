import { expect, test } from '@playwright/test';
import { loginWithKeycloak } from './helpers/auth-helper';

test('should load create expense dialog code on demand', async ({ page }) => {
  const scriptRequests: string[] = [];

  page.on('request', (request) => {
    if (
      request.resourceType() === 'script' &&
      new URL(request.url()).origin === 'http://localhost:4200'
    ) {
      scriptRequests.push(request.url());
    }
  });

  // Authenticate before accessing Expenses.
  await loginWithKeycloak(page);

  // Remember scripts requested before opening the dialog.
  const initialScripts = new Set(scriptRequests);

  await page
    .getByRole('button', {
      name: /add.*expense/i,
    })
    .click();

  await expect(page.getByRole('dialog')).toBeVisible();

  const additionalScripts = scriptRequests.filter((url) => !initialScripts.has(url));

  expect(additionalScripts.length).toBeGreaterThan(0);
});
