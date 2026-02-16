/**
 * Login spec — validates that Salesforce authentication works
 * end-to-end.  This is the "smoke test zero" — if login fails,
 * nothing else matters.
 *
 * Tags: @smoke, @login
 */

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');

test.describe('Salesforce Login @smoke @login', () => {

  test('should log in with valid credentials and reach Lightning home', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();

    // Assert: URL contains "lightning"
    await expect(page).toHaveURL(/lightning/i);

    // Assert: A known Lightning element is visible (global nav)
    const navBar = page.locator('one-app-nav-bar, nav[role="navigation"]');
    await expect(navBar.first()).toBeVisible({ timeout: 30_000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await page.locator('#username').fill('bad_user@invalid.test');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('#Login').click();

    // SF shows an error div on bad login
    const error = page.locator('#error');
    await expect(error).toBeVisible({ timeout: 15_000 });
  });
});
