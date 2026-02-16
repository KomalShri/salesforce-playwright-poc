# Salesforce Playwright POC

Production-grade E2E test automation for Salesforce Lightning using **Playwright + JavaScript**.

---

## Architecture

```
salesforce-playwright-poc/
├── config/
│   └── constants.js          # Centralised selectors & timeouts
├── fixtures/
│   ├── sf-fixture.js          # Custom Playwright fixtures (auth + page objects)
│   └── test-data.js           # Test data factory with unique IDs
├── pages/
│   ├── base.page.js           # Shared Lightning page behaviour
│   ├── login.page.js          # Salesforce login flow
│   ├── lead.page.js           # Lead CRUD operations
│   └── opportunity.page.js    # Opportunity CRUD operations
├── tests/
│   ├── login.spec.js          # Authentication smoke tests
│   ├── lead.spec.js           # Lead creation tests
│   └── opportunity.spec.js    # Opportunity creation tests
├── utils/
│   └── sf-helpers.js          # Lightning DOM helpers (spinners, toasts, picklists)
├── reports/                   # HTML + JSON reports (gitignored)
├── .env.example               # Credential template
├── playwright.config.js       # Playwright configuration
└── README.md
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Page Object Model** | Decouples DOM selectors from test logic; one place to update when SF releases change the UI |
| **Custom Fixtures** | Inject authenticated page + page objects into tests; zero boilerplate per spec file |
| **Unique Test Data (uid)** | Every test generates unique records — no collisions, easy cleanup, safe parallel execution in the future |
| **Centralised Selectors** | Lightning DOM shifts between releases; one file to update vs. hunting across specs |
| **Multi-selector fallbacks** | SF renders different button variants depending on context; comma-separated selectors try each one |
| **Spinner waits** | The #1 cause of SF test flakiness; every action waits for spinners to clear |
| **Single worker** | Dev orgs are single-tenant with shared state; serial execution prevents data races |

---

## Quick Start

### 1. Prerequisites

- **Node.js** ≥ 18
- A **Salesforce Developer Org** — get one free at: https://developer.salesforce.com/signup

### 2. Install

```bash
git clone <this-repo>
cd salesforce-playwright-poc
npm install
npx playwright install chromium
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` with your Salesforce credentials:

```env
SF_BASE_URL=https://yourorg-dev-ed.develop.lightning.force.com
SF_LOGIN_URL=https://login.salesforce.com
SF_USERNAME=your_email@example.com
SF_PASSWORD=your_password
```

> **Tip:** For dev orgs, you may need to append your security token to the password,
> or add your IP to the org's trusted IP ranges (Setup → Network Access).

### 4. Run

```bash
# Run all tests
npm test

# Run only Lead tests
npm run test:lead

# Run only Opportunity tests  
npm run test:opportunity

# Run smoke tests
npm run test:smoke

# Run in headed mode (watch the browser)
npm run test:headed

# Debug mode (step through with Playwright Inspector)
npm run test:debug

# Open HTML report
npm run report
```

---

## Test Coverage

| Test ID | Description | Tags |
|---|---|---|
| TC-LEAD-001 | Create Lead with all standard fields | @smoke @lead |
| TC-LEAD-002 | Create Lead with required fields only | @regression @lead |
| TC-LEAD-003 | Verify Lead detail page data | @regression @lead |
| TC-OPP-001 | Create Opportunity with standard fields | @smoke @opportunity |
| TC-OPP-002 | Create Opportunity at Qualification stage | @regression @opportunity |
| TC-OPP-003 | Create Opportunity at Needs Analysis stage | @regression @opportunity |
| TC-OPP-004 | Verify Opportunity detail page data | @regression @opportunity |

---

## Salesforce Lightning Gotchas & How This Framework Handles Them

### 1. Spinners Everywhere
Lightning shows `slds-spinner` on every CRUD action. `SFHelpers.waitForSpinners()` polls until all spinners disappear before proceeding.

### 2. Dynamic Selectors
SF generates dynamic IDs. This framework uses **attribute-based selectors** (`input[name='Company']`) and **role-based fallbacks** (`getByRole('button', { name: /new/i })`).

### 3. Aura/LWC Hydration Delay
DOM is present but not interactive until the Aura framework finishes. `waitForPageReady()` combines `domcontentloaded` + spinner checks + a small buffer.

### 4. Toast Notifications
Success/error toasts appear briefly (~3s). `assertToastMessage()` races to capture the text before it auto-dismisses.

### 5. Picklist Dropdowns
Lightning picklists require: click trigger → wait for `role="listbox"` → click `role="option"`. `selectPicklistValue()` handles this pattern.

### 6. Date Picker
The Lightning date picker widget is fragile under automation. This framework **types directly** into the date input field to bypass it.

---

## Extending the Framework

### Add a new Salesforce object (e.g., Contact)

1. Add selectors to `config/constants.js`
2. Create `pages/contact.page.js` extending `BasePage`
3. Add test data generator in `fixtures/test-data.js`
4. Add fixture in `fixtures/sf-fixture.js`
5. Create `tests/contact.spec.js`

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Salesforce E2E Tests
  env:
    SF_BASE_URL: ${{ secrets.SF_BASE_URL }}
    SF_USERNAME: ${{ secrets.SF_USERNAME }}
    SF_PASSWORD: ${{ secrets.SF_PASSWORD }}
  run: |
    npm ci
    npx playwright install chromium --with-deps
    npm test
```

---

## Reports

After running tests, three report formats are generated:

- **Console** — real-time list output
- **HTML** — `npm run report` opens an interactive report
- **JSON** — `reports/results.json` for CI pipelines

Failed tests automatically capture **screenshots**, **videos**, and **traces** in the `test-results/` directory.
