/**
 * Centralised Salesforce Lightning selectors & constants.
 *
 * WHY:  Lightning DOM is deeply nested with dynamic attributes.
 *       Keeping selectors in one place means a single update when
 *       Salesforce ships a new release and shifts the DOM.
 */

const SF_TIMEOUTS = {
  PAGE_LOAD: 60_000,
  TOAST: 15_000,
  MODAL: 10_000,
  SPINNER: 30_000,
};

// ── Login page (Classic login form at login.salesforce.com) ──────
const LOGIN = {
  USERNAME: '#username',
  PASSWORD: '#password',
  LOGIN_BTN: '#Login',
};

// ── Lightning global UI ─────────────────────────────────────────
const LIGHTNING = {
  APP_LAUNCHER_BTN: "button.slds-icon-waffle_container, div.appLauncher button",
  APP_LAUNCHER_SEARCH: "input[placeholder='Search apps and items...'], input[placeholder='Search apps or items...']",
  GLOBAL_SEARCH: "button[aria-label='Search'], input[placeholder='Search...']",
  TOAST_MESSAGE: "div.toastMessage, div.forceActionsText",
  TOAST_CONTAINER: "div.slds-notify_toast, div.toastContainer",
  SPINNER: "div.slds-spinner_container",
  MODAL: "div.slds-modal__container, section[role='dialog']",
  MODAL_FOOTER_SAVE: "button[name='SaveEdit'], footer button.slds-button_brand, button.slds-button_brand",
};

// ── Object-specific: Lead ───────────────────────────────────────
const LEAD = {
  // Navigation
  TAB_URL_SEGMENT: '/lightning/o/Lead/list',
  NEW_BTN: "a[title='New'], button[name='New'], div[title='New']",

  // Form fields (Lightning record form)
  SALUTATION: "button[aria-label='Salutation'], a[aria-label='Salutation']",
  FIRST_NAME: "input[name='firstName']",
  LAST_NAME: "input[name='lastName']",
  COMPANY: "input[name='Company'], input[placeholder='Company']",
  TITLE: "input[name='Title']",
  EMAIL: "input[name='Email']",
  PHONE: "input[name='Phone']",
  LEAD_STATUS: "button[aria-label='Lead Status'], a[aria-label='Lead Status']",
  SAVE_BTN: "button[name='SaveEdit']",
};

// ── Object-specific: Opportunity ────────────────────────────────
const OPPORTUNITY = {
  TAB_URL_SEGMENT: '/lightning/o/Opportunity/list',
  NEW_BTN: "a[title='New'], button[name='New'], div[title='New']",

  // Form fields
  OPP_NAME: "input[name='Name']",
  CLOSE_DATE: "input[name='CloseDate']",
  STAGE: "button[aria-label='Stage'], a[aria-label='Stage']",
  AMOUNT: "input[name='Amount']",
  ACCOUNT_NAME: "input[placeholder='Search Accounts...']",
  SAVE_BTN: "button[name='SaveEdit']",
};

module.exports = {
  SF_TIMEOUTS,
  LOGIN,
  LIGHTNING,
  LEAD,
  OPPORTUNITY,
};
