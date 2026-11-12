import { expect, test } from '@playwright/test';
import { loginWithKeycloak } from './helpers/auth-helper';

test('should authenticate using Keycloak', async ({ page }) => {
  await loginWithKeycloak(page);

  await expect(page).toHaveURL(/localhost:4200/);
});
