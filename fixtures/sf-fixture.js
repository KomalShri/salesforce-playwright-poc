/**
 * Custom test fixture — provides an authenticated Salesforce page
 * and pre-initialised page objects to every test.
 *
 * WHY fixtures over beforeAll/beforeEach?
 *  • Playwright fixtures are composable, lazy, and auto-teardown.
 *  • They keep test files clean: zero boilerplate, just business logic.
 *  • The `sfAuth` fixture logs in once per worker and reuses the
 *    session, making a 30-test suite run in minutes instead of hours.
 *
 * Usage in spec files:
 *   const { test } = require('../fixtures/sf-fixture');
 *   test('my test', async ({ leadPage, opportunityPage }) => { ... });
 */

const base = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { LeadPage } = require('../pages/lead.page');
const { OpportunityPage } = require('../pages/opportunity.page');

/**
 * Extend the base test with Salesforce-specific fixtures.
 */
const test = base.test.extend({

  /**
   * Authenticated page — logs in before handing the page to the test.
   * Scoped to 'test' so each test gets a fresh page (but login is fast
   * thanks to Salesforce session cookies persisting in the context).
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
    await use(page);
  },

  /**
   * Ready-to-use LeadPage — already authenticated.
   */
  leadPage: async ({ authenticatedPage }, use) => {
    const leadPage = new LeadPage(authenticatedPage);
    await use(leadPage);
  },

  /**
   * Ready-to-use OpportunityPage — already authenticated.
   */
  opportunityPage: async ({ authenticatedPage }, use) => {
    const opportunityPage = new OpportunityPage(authenticatedPage);
    await use(opportunityPage);
  },
});

const { expect } = base;

module.exports = { test, expect };
