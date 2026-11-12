import { expect, type Page } from '@playwright/test';

export async function loginWithKeycloak(page: Page): Promise<void> {
  await page.goto('/expenses');

  // Start Keycloak authentication.
  await page.getByText(' Login with Keycloak ', { exact: true }).click();

  // Wait for the Keycloak login page.
  await expect(page).toHaveURL(/localhost:8080\/realms\/PEM\//);

  // Fill the local demo account credentials.
  await page.locator('#username').fill(process.env.E2E_USERNAME ?? 'demo');

  await page.locator('#password').fill(process.env.E2E_PASSWORD ?? 'DemoPassword123!');

  await page.locator('#kc-login').click();

  // Wait until Keycloak redirects back to the application.
  await expect(page).toHaveURL(/localhost:4200/);

  // Verify that the protected Expenses page is available.
  await expect(
    page.getByRole('button', {
      name: /add.*expense|create.*expense|new.*expense|dodaj.*wydatek/i,
    }),
  ).toBeVisible();
}
