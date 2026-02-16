/**
 * Test data factory.
 *
 * Every test generates UNIQUE records using a timestamp suffix.
 * This avoids name collisions and makes it trivial to identify
 * which test run created which records during cleanup.
 */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function generateLeadData(overrides = {}) {
  const id = uid();
  return {
    salutation: 'Mr.',
    firstName: `AutoTest`,
    lastName: `Lead_${id}`,
    company: `TestCorp_${id}`,
    title: 'QA Engineer',
    email: `lead_${id}@testautomation.dev`,
    phone: '5551234567',
    leadStatus: 'Open - Not Contacted',
    ...overrides,
  };
}

function generateOpportunityData(overrides = {}) {
  const id = uid();
  // Close date = 30 days from now, formatted MM/DD/YYYY
  const closeDate = new Date(Date.now() + 30 * 86400000);
  const formattedDate = `${String(closeDate.getMonth() + 1).padStart(2, '0')}/${String(closeDate.getDate()).padStart(2, '0')}/${closeDate.getFullYear()}`;

  return {
    name: `AutoTest_Opp_${id}`,
    closeDate: formattedDate,
    stage: 'Prospecting',
    amount: '25000',
    ...overrides,
  };
}

module.exports = {
  generateLeadData,
  generateOpportunityData,
  uid,
};
