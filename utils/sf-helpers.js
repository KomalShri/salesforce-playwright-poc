/**
 * Salesforce Lightning helper utilities.
 *
 * Lightning's DOM is challenging — heavy iframes, shadow-DOM-like
 * wrappers, asynchronous rendering, and toast notifications that
 * appear/disappear quickly.  These helpers encapsulate the patterns
 * an experienced SDET learns the hard way.
 */

const { expect } = require('@playwright/test');
const { SF_TIMEOUTS, LIGHTNING } = require('../config/constants');

class SFHelpers {

  /**
   * Wait for all Lightning spinners to disappear.
   * Salesforce shows spinners on almost every action; interacting
   * before they finish causes flaky "element not clickable" errors.
   */
  static async waitForSpinners(page, timeout = SF_TIMEOUTS.SPINNER) {
    try {
      // Wait for any visible spinner to disappear
      await page.waitForFunction(() => {
        const spinners = document.querySelectorAll(
          'div.slds-spinner_container, div.slds-spinner, lightning-spinner'
        );
        return [...spinners].every(
          (s) => window.getComputedStyle(s).display === 'none' || 
                 window.getComputedStyle(s).visibility === 'hidden' ||
                 !s.offsetParent
        );
      }, { timeout });
    } catch {
      // If no spinners found at all, that's fine
    }
  }

  /**
   * Wait for Salesforce page to be "truly" ready.
   * domcontentloaded is NOT enough for Lightning — we need the
   * Aura framework to finish rendering.
   */
  static async waitForPageReady(page) {
    await page.waitForLoadState('domcontentloaded');
    await this.waitForSpinners(page);
    // Give Aura a beat to finish hydration
    await page.waitForTimeout(1000);
  }

  /**
   * Capture the toast message and assert it contains expected text.
   * Toast appears briefly; we must race to grab it.
   */
  static async assertToastMessage(page, expectedText, type = 'success') {
    const toast = page.locator(LIGHTNING.TOAST_CONTAINER).first();
    await toast.waitFor({ state: 'visible', timeout: SF_TIMEOUTS.TOAST });

    const message = await toast.textContent();
    expect(message?.toLowerCase()).toContain(expectedText.toLowerCase());

    // Optional: verify toast colour/type
    if (type === 'success') {
      await expect(toast).toHaveClass(/slds-theme_success|toastMessage/i);
    }
    return message;
  }

  /**
   * Navigate to a Salesforce object list via URL.
   * More reliable than clicking through the App Launcher in tests.
   */
  static async navigateToObject(page, objectUrlSegment) {
    const baseUrl = process.env.SF_BASE_URL?.replace(/\/$/, '');
    await page.goto(`${baseUrl}${objectUrlSegment}`, {
      waitUntil: 'domcontentloaded',
      timeout: SF_TIMEOUTS.PAGE_LOAD,
    });
    await this.waitForPageReady(page);
  }

  /**
   * Click "New" button on any list view.
   * Handles multiple possible selector variants (SF is inconsistent).
   */
  static async clickNewButton(page, newBtnSelector) {
    await this.waitForPageReady(page);

    // Try each selector in the comma-separated list
    const selectors = newBtnSelector.split(',').map((s) => s.trim());
    for (const sel of selectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await btn.click();
        await this.waitForSpinners(page);
        return;
      }
    }

    // Fallback: use role-based selector
    await page.getByRole('button', { name: /new/i }).first().click();
    await this.waitForSpinners(page);
  }

  /**
   * Fill a Lightning input field reliably.
   * Lightning inputs are wrapped in layers of divs; we locate by
   * the inner <input> and clear before typing.
   */
  static async fillField(page, selector, value) {
    const selectors = selector.split(',').map((s) => s.trim());
    let filled = false;

    for (const sel of selectors) {
      try {
        const field = page.locator(sel).first();
        if (await field.isVisible({ timeout: 5000 }).catch(() => false)) {
          await field.click();
          await field.fill('');
          await field.fill(value);
          filled = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!filled) {
      throw new Error(`Could not fill field with selectors: ${selector}`);
    }
  }

  /**
   * Select a value from a Lightning combobox / picklist.
   * The pattern: click trigger → wait for dropdown → click option.
   */
  static async selectPicklistValue(page, triggerSelector, optionText) {
    const selectors = triggerSelector.split(',').map((s) => s.trim());

    for (const sel of selectors) {
      try {
        const trigger = page.locator(sel).first();
        if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
          await trigger.click();
          break;
        }
      } catch {
        continue;
      }
    }

    // Wait for the dropdown listbox to render
    const option = page.getByRole('option', { name: optionText }).first();
    await option.waitFor({ state: 'visible', timeout: SF_TIMEOUTS.MODAL });
    await option.click();
    await this.waitForSpinners(page);
  }

  /**
   * Click Save on a record form and wait for the save to complete.
   */
  static async clickSave(page, saveBtnSelector) {
    const selectors = saveBtnSelector.split(',').map((s) => s.trim());

    for (const sel of selectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await btn.click();
          await this.waitForSpinners(page);
          return;
        }
      } catch {
        continue;
      }
    }

    // Fallback
    await page.getByRole('button', { name: /save/i }).first().click();
    await this.waitForSpinners(page);
  }

  /**
   * Extract the record ID from the URL after save navigation.
   */
  static async extractRecordIdFromUrl(page) {
    await page.waitForURL(/\/lightning\/r\/\w+\/\w+\/view/i, {
      timeout: SF_TIMEOUTS.PAGE_LOAD,
    });
    const url = page.url();
    const match = url.match(/\/r\/\w+\/(\w+)\/view/);
    return match ? match[1] : null;
  }

  /**
   * Take a named screenshot (useful for debugging in CI).
   */
  static async screenshot(page, testInfo, name) {
    const screenshotPath = testInfo.outputPath(`${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testInfo.attach(name, { path: screenshotPath, contentType: 'image/png' });
  }
}

module.exports = { SFHelpers };
