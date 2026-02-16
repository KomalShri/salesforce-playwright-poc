/**
 * Lead creation spec — verifies end-to-end Lead CRUD in Salesforce.
 *
 * Test design:
 *  1. Create a Lead with all standard fields and verify success.
 *  2. Create a Lead with only required fields (boundary test).
 *  3. Verify the created Lead detail page shows correct data.
 *
 * Tags: @smoke, @lead, @regression
 */

const { test, expect } = require('../fixtures/sf-fixture');
const { generateLeadData } = require('../fixtures/test-data');

test.describe('Salesforce Lead Creation @lead', () => {

  test('TC-LEAD-001: Create Lead with all standard fields @smoke', async ({ leadPage }, testInfo) => {
    // ── Arrange ──────────────────────────────────────────────
    const leadData = generateLeadData();

    // ── Act ──────────────────────────────────────────────────
    const recordId = await leadPage.createLead(leadData);

    // ── Assert ───────────────────────────────────────────────
    expect(recordId).toBeTruthy();
    console.log(`✅ Lead created — ID: ${recordId}`);
    console.log(`   Name: ${leadData.firstName} ${leadData.lastName}`);
    console.log(`   Company: ${leadData.company}`);

    // Verify we landed on the detail page
    await leadPage.verifyLeadDetail(leadData);

    // Attach screenshot for traceability
    await leadPage.screenshot(testInfo, 'lead-created-detail');
  });

  test('TC-LEAD-002: Create Lead with required fields only @regression', async ({ leadPage }, testInfo) => {
    // Only Last Name and Company are truly required on the Lead object
    const leadData = generateLeadData({
      salutation: '',
      firstName: '',
      title: '',
      email: '',
      phone: '',
    });

    const recordId = await leadPage.createLead(leadData);

    expect(recordId).toBeTruthy();
    console.log(`✅ Minimal Lead created — ID: ${recordId}`);

    await leadPage.screenshot(testInfo, 'lead-minimal-created');
  });

  test('TC-LEAD-003: Verify Lead detail page displays correct data @regression', async ({ leadPage, authenticatedPage }, testInfo) => {
    const leadData = generateLeadData();
    const recordId = await leadPage.createLead(leadData);

    expect(recordId).toBeTruthy();

    // Verify detail page heading contains the lead's last name
    const heading = authenticatedPage.getByRole('heading', {
      name: new RegExp(leadData.lastName, 'i'),
    });
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Verify Company field is shown on the detail page
    const companyField = authenticatedPage.locator(
      `lightning-formatted-text:has-text("${leadData.company}"), span:has-text("${leadData.company}")`
    ).first();
    await expect(companyField).toBeVisible({ timeout: 10_000 });

    await leadPage.screenshot(testInfo, 'lead-detail-verified');
  });
});
