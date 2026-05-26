/**
 * Browser driver for quick-entry regression scenarios.
 *
 * Why this exists: The quick-entry verification flow needs one real browser
 * pass through the UI before the state-based scorer inspects logs and graph
 * output. Keeping that logic separate from the CLI runner keeps both files
 * easier to maintain.
 */

import { chromium, type BrowserContext, type Page } from '@playwright/test';
import type { Session } from '@supabase/supabase-js';

import type {
  LabelExpectation,
  QuickEntryInputFactor,
  QuickEntryInputMeasurement,
  QuickEntryInputMedication,
  QuickEntryInputMood,
  QuickEntryScenarioInput,
} from './quick-entry-eval-types';

/**
 * QuickEntryBrowserResult captures the browser-verifiable canvas state.
 * Why this exists: The CLI runner should receive the exact labels exposed by
 * the canvas accessibility surface without knowing Playwright details.
 */
export interface QuickEntryBrowserResult {
  canvasLabels: string[];
  emptyCanvas: boolean;
}

/**
 * createAuthenticatedContext seeds a real Supabase session into local storage.
 * Why this exists: The app uses the browser Supabase client on load, so the
 * quickest stable login path for automation is preloading its session key.
 */
async function createAuthenticatedContext(params: {
  baseUrl: string;
  storageKey: string;
  session: Session;
}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: params.baseUrl,
    viewport: { width: 430, height: 932 },
  });

  await context.addInitScript(
    ({ storageKey, sessionJson }) => {
      window.localStorage.setItem(storageKey, sessionJson);
    },
    {
      storageKey: params.storageKey,
      sessionJson: JSON.stringify(params.session),
    }
  );

  return { browser, context };
}

/**
 * openChatPage loads the chat route and waits for the app shell to hydrate.
 * Why this exists: Quick-entry regression starts from the same `/chat` page
 * users see in production, not from a hidden test-only route.
 */
async function openChatPage(page: Page, baseUrl: string): Promise<void> {
  await page.goto(`${baseUrl}/chat`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Quick Entry' }).waitFor({ state: 'visible' });
}

/**
 * openQuickEntryTab switches the mobile tab rail to the quick-entry surface.
 * Why this exists: The regression should drive the exact UI path users take
 * when moving from chat to structured logging.
 */
async function openQuickEntryTab(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Quick Entry' }).click();
  await waitForQuickEntryReady(page);
}

/**
 * waitForQuickEntryReady blocks until the quick-entry content is interactive.
 * Why this exists: The panel hydrates and fetches a per-day snapshot, so tests
 * need one stable point before they start clicking card controls.
 */
async function waitForQuickEntryReady(page: Page): Promise<void> {
  const signInPrompt = page.getByText('Sign in to use structured quick entry');
  if (await signInPrompt.isVisible().catch(() => false)) {
    throw new Error('Quick entry did not load as an authenticated user.');
  }

  const loadingIndicator = page.getByText('Loading quick entry...');
  if (await loadingIndicator.isVisible().catch(() => false)) {
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 });
  }

  await page.getByRole('heading', { name: 'Sleep' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Add medication' }).waitFor({ state: 'visible' });
}

/**
 * getCardLocator scopes later selectors to one quick-entry card.
 * Why this exists: Several cards reuse button text like "Edit" and "Log", so
 * row-level interactions need a stable local root.
 */
function getCardLocator(page: Page, heading: string) {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: heading, exact: true }),
  });
}

/**
 * applyMoodInput fills the mood card in the same order users typically do.
 * Why this exists: The note field only joins persisted state once a rating is
 * chosen, so the runner mirrors that real interaction pattern.
 */
async function applyMoodInput(page: Page, mood: QuickEntryInputMood): Promise<void> {
  if (mood.note) {
    await page.getByLabel("Additional context for today's mood").fill(mood.note);
  }

  await page.getByRole('button', { name: `Set mood to ${mood.rating} out of 10` }).click();
  await page.getByRole('button', { name: new RegExp(`^Log ${mood.rating}/10 at`) }).click();
}

/**
 * applyMedicationInput adds one medication using the new add sheet.
 * Why this exists: Medication logging has its own normalization rules around
 * strength and units, so it deserves a dedicated browser helper.
 */
async function applyMedicationInput(
  page: Page,
  medication: QuickEntryInputMedication
): Promise<void> {
  await page.getByRole('button', { name: 'Add medication' }).click();
  await page.getByRole('textbox', { name: 'Medication name' }).fill(medication.name);

  if (medication.strength) {
    await page.getByRole('textbox', { name: 'Strength' }).fill(medication.strength);
  }

  if (medication.unit) {
    await page.getByRole('textbox', { name: 'Unit' }).fill(medication.unit);
  }

  await page.getByRole('button', { name: 'Add medication' }).last().click();
}

/**
 * expandFactorCategory opens the relevant accordion before factor selection.
 * Why this exists: Non-sleep factor items live inside category accordions that
 * may be collapsed depending on the current quick-entry defaults.
 */
async function expandFactorCategory(
  page: Page,
  category: string,
  label: string
): Promise<void> {
  const otherFactorsCard = getCardLocator(page, 'Other Factors');
  const row = otherFactorsCard
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');

  if (await row.isVisible().catch(() => false)) {
    return;
  }

  const categoryButton = otherFactorsCard
    .getByRole('button', { name: category, exact: true })
    .first();

  if (!(await categoryButton.isVisible().catch(() => false))) {
    throw new Error(`Could not find factor category "${category}" in quick entry.`);
  }

  await categoryButton.click();
}

/**
 * applyFactorInput logs one sleep or non-sleep factor row.
 * Why this exists: Factor cards mix toggle rows and rated rows, so the runner
 * needs one place that knows how to target the intended control.
 */
async function applyFactorInput(page: Page, factor: QuickEntryInputFactor): Promise<void> {
  const targetCard = factor.card === 'sleep' ? getCardLocator(page, 'Sleep') : getCardLocator(page, 'Other Factors');

  if (factor.card === 'other' && factor.category) {
    await expandFactorCategory(page, factor.category, factor.label);
  }

  const row = targetCard
    .getByText(factor.label, { exact: true })
    .first()
    .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
  await row.scrollIntoViewIfNeeded();

  if (factor.intensity) {
    await row.getByRole('button', { name: `Set factor intensity to ${factor.intensity}` }).click();
  } else {
    await row.getByRole('button', { name: /Tap to log|Logged for today/ }).click();
  }
}

/**
 * applyMeasurementInput logs one visible measurement row.
 * Why this exists: Measurements open a focused sheet instead of inline editing,
 * so they need a dedicated browser interaction helper.
 */
async function applyMeasurementInput(
  page: Page,
  measurement: QuickEntryInputMeasurement
): Promise<void> {
  await page.getByRole('button', { name: `Log ${measurement.label}` }).click();
  await page.getByRole('textbox', { name: new RegExp(`Value \\(`) }).fill(measurement.value);

  if (measurement.notes) {
    await page.getByRole('textbox', { name: 'Notes' }).fill(measurement.notes);
  }

  await page.getByRole('button', { name: 'Save measurement' }).click();
}

/**
 * applyQuickEntryInput replays one scenario's quick-entry inputs through the UI.
 * Why this exists: The main runner should hand off structured scenario input
 * without needing to know card-specific browser details.
 */
async function applyQuickEntryInput(
  page: Page,
  input: QuickEntryScenarioInput
): Promise<void> {
  if (input.mood) {
    await applyMoodInput(page, input.mood);
  }

  for (const medication of input.medications ?? []) {
    await applyMedicationInput(page, medication);
  }

  for (const factor of input.factors ?? []) {
    await applyFactorInput(page, factor);
  }

  for (const measurement of input.measurements ?? []) {
    await applyMeasurementInput(page, measurement);
  }
}

/**
 * openCanvasTab moves the mobile rail to the canvas surface.
 * Why this exists: The hybrid verification flow finishes with a browser smoke
 * check of the same canvas tab the user would open manually.
 */
async function openCanvasTab(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Canvas' }).click();
}

/**
 * readCanvasLabels reads the accessible label list exposed by ChatCanvas.
 * Why this exists: Reagraph renders the visual graph in WebGL, so the browser
 * regression needs a lightweight accessibility surface for text assertions.
 */
async function readCanvasLabels(page: Page): Promise<string[]> {
  const emptyState = page.getByText('Start chatting to build your health graph');
  if (await emptyState.isVisible().catch(() => false)) {
    return [];
  }

  const list = page.getByRole('list', { name: 'Canvas nodes' });
  await list.waitFor({ state: 'attached', timeout: 15000 });

  const items = await list.getByRole('listitem').allTextContents();
  return items.map((item) => item.trim()).filter(Boolean);
}

/**
 * canvasIncludesExpectation checks browser labels against one expectation.
 * Why this exists: The browser smoke result should share the same alias-aware
 * semantics as the state-based graph scorer.
 */
export function canvasIncludesExpectation(
  canvasLabels: string[],
  expectation: LabelExpectation
): boolean {
  const actualLabels = canvasLabels.map((label) => label.trim().toLowerCase());
  return [expectation.label, ...(expectation.aliases ?? [])]
    .map((label) => label.trim().toLowerCase())
    .some((label) => actualLabels.some((actual) => actual.includes(label)));
}

/**
 * runQuickEntryBrowserScenario drives the UI and returns the canvas smoke state.
 * Why this exists: The CLI runner needs one high-level browser entry point per
 * scenario rather than micromanaging Playwright resources itself.
 */
export async function runQuickEntryBrowserScenario(params: {
  baseUrl: string;
  storageKey: string;
  session: Session;
  input: QuickEntryScenarioInput;
  settleMs: number;
}): Promise<QuickEntryBrowserResult> {
  const { browser, context } = await createAuthenticatedContext({
    baseUrl: params.baseUrl,
    storageKey: params.storageKey,
    session: params.session,
  });

  try {
    const page = await context.newPage();
    await openChatPage(page, params.baseUrl);
    await openQuickEntryTab(page);
    await applyQuickEntryInput(page, params.input);
    await page.waitForTimeout(1500);
    await page.waitForTimeout(params.settleMs);
    await openCanvasTab(page);

    return {
      canvasLabels: await readCanvasLabels(page),
      emptyCanvas: await page.getByText('Start chatting to build your health graph').isVisible().catch(() => false),
    };
  } finally {
    await closeContext(context);
    await browser.close();
  }
}

/**
 * closeContext shuts down the Playwright context safely.
 * Why this exists: Cleanup should never hide the real test result with a noisy
 * secondary browser-close error.
 */
async function closeContext(context: BrowserContext): Promise<void> {
  try {
    await context.close();
  } catch {
    // Ignore cleanup errors during regression teardown.
  }
}
