/**
 * Base Page — shared behaviour for all Salesforce Lightning pages.
 *
 * Every page object extends this to inherit spinner-waits, toast
 * assertions, and navigation helpers so individual POs stay lean.
 */

const { SFHelpers } = require('../utils/sf-helpers');

class BasePage {

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async waitForPageReady() {
    await SFHelpers.waitForPageReady(this.page);
  }

  async assertToast(expectedText, type = 'success') {
    return SFHelpers.assertToastMessage(this.page, expectedText, type);
  }

  async screenshot(testInfo, name) {
    await SFHelpers.screenshot(this.page, testInfo, name);
  }

  async navigateTo(urlSegment) {
    await SFHelpers.navigateToObject(this.page, urlSegment);
  }

  async getRecordIdFromUrl() {
    return SFHelpers.extractRecordIdFromUrl(this.page);
  }
}

module.exports = { BasePage };
