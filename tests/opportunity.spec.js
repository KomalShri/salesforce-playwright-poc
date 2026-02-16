/**
 * Opportunity creation spec — verifies end-to-end Opportunity CRUD.
 *
 * Test design:
 *  1. Create an Opportunity with standard fields.
 *  2. Create with different Stage values (data-driven boundary).
 *  3. Verify Opportunity detail page shows correct data.
 *
 * Tags: @smoke, @opportunity, @regression
 */

const { test, expect } = require('../fixtures/sf-fixture');
const { generateOpportunityData } = require('../fixtures/test-data');

test.describe('Salesforce Opportunity Creation @opportunity', () => {

  test('TC-OPP-001: Create Opportunity with standard fields @smoke', async ({ opportunityPage }, testInfo) => {
    // ── Arrange ──────────────────────────────────────────────
    const oppData = generateOpportunityData();

    // ── Act ──────────────────────────────────────────────────
    const recordId = await opportunityPage.createOpportunity(oppData);

    // ── Assert ───────────────────────────────────────────────
    expect(recordId).toBeTruthy();
    console.log(`✅ Opportunity created — ID: ${recordId}`);
    console.log(`   Name: ${oppData.name}`);
    console.log(`   Stage: ${oppData.stage}`);
    console.log(`   Close Date: ${oppData.closeDate}`);
    console.log(`   Amount: $${oppData.amount}`);

    await opportunityPage.verifyOpportunityDetail(oppData);
    await opportunityPage.screenshot(testInfo, 'opportunity-created-detail');
  });

  test('TC-OPP-002: Create Opportunity at Qualification stage @regression', async ({ opportunityPage }, testInfo) => {
    const oppData = generateOpportunityData({
      stage: 'Qualification',
      amount: '50000',
    });

    const recordId = await opportunityPage.createOpportunity(oppData);

    expect(recordId).toBeTruthy();
    console.log(`✅ Qualification Opportunity created — ID: ${recordId}`);

    await opportunityPage.screenshot(testInfo, 'opportunity-qualification');
  });

  test('TC-OPP-003: Create Opportunity at Needs Analysis stage @regression', async ({ opportunityPage }, testInfo) => {
    const oppData = generateOpportunityData({
      stage: 'Needs Analysis',
      amount: '100000',
    });

    const recordId = await opportunityPage.createOpportunity(oppData);

    expect(recordId).toBeTruthy();
    console.log(`✅ Needs Analysis Opportunity created — ID: ${recordId}`);

    await opportunityPage.screenshot(testInfo, 'opportunity-needs-analysis');
  });

  test('TC-OPP-004: Verify Opportunity detail page displays correct data @regression', async ({ opportunityPage, authenticatedPage }, testInfo) => {
    const oppData = generateOpportunityData();
    const recordId = await opportunityPage.createOpportunity(oppData);

    expect(recordId).toBeTruthy();

    // Verify heading
    const heading = authenticatedPage.getByRole('heading', {
      name: new RegExp(oppData.name, 'i'),
    });
    await expect(heading).toBeVisible({ timeout: 15_000 });

    // Verify Stage is visible on the path or in detail
    const stageElement = authenticatedPage.locator(
      `a[title="${oppData.stage}"], span:has-text("${oppData.stage}")`
    ).first();
    await expect(stageElement).toBeVisible({ timeout: 10_000 });

    await opportunityPage.screenshot(testInfo, 'opportunity-detail-verified');
  });
});
