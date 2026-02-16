/**
 * Login Page — handles Salesforce Classic login at login.salesforce.com.
 *
 * After successful login, Salesforce redirects to the Lightning
 * Experience home page. We wait for that redirect before returning.
 */

const { BasePage } = require('./base.page');
const { LOGIN } = require('../config/constants');

class LoginPage extends BasePage {

  constructor(page) {
    super(page);
    this.usernameInput = page.locator(LOGIN.USERNAME);
    this.passwordInput = page.locator(LOGIN.PASSWORD);
    this.loginButton   = page.locator(LOGIN.LOGIN_BTN);
  }

  /**
   * Navigate to the Salesforce login page.
   */
  async goto() {
    const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    await this.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Perform login and wait until Lightning home loads.
   */
  async login(username, password) {
    username = username || process.env.SF_USERNAME;
    password = password || process.env.SF_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'SF_USERNAME and SF_PASSWORD must be set in .env or passed as arguments.'
      );
    }

    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // SF may show a "Verify Identity" or "Register Phone" interstitial.
    // If the URL hasn't moved to lightning within 15s, handle it.
    try {
      await this.page.waitForURL(/lightning/i, { timeout: 30_000 });
    } catch {
      // Check for common interstitials and skip them
      await this._handleInterstitials();
    }

    await this.waitForPageReady();
  }

  /**
   * Handle known post-login interstitial screens.
   */
  async _handleInterstitials() {
    // "Remind Me Later" on phone registration
    const remindLater = this.page.getByText('Remind Me Later');
    if (await remindLater.isVisible({ timeout: 3000 }).catch(() => false)) {
      await remindLater.click();
    }

    // "Skip" button on any setup wizard
    const skipBtn = this.page.getByRole('button', { name: /skip/i });
    if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipBtn.click();
    }

    // Final wait for Lightning
    await this.page.waitForURL(/lightning/i, { timeout: 30_000 });
  }
}

module.exports = { LoginPage };
