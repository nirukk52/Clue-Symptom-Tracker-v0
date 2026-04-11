/**
 * Quick Entry Scenario Eval
 *
 * Why this exists: Converts structured quick-entry scenarios into a hybrid
 * regression that drives the browser UI, then scores the resulting storage,
 * timeline, graph, and canvas state.
 */

import { readFile } from 'node:fs/promises';

import {
  buildUserStateSnapshot,
  createPasswordSession,
  ensureExactPasswordUser,
  getSupabaseStorageKey,
  purgeUserState,
  resolveUserIdentifier,
  type UserStateSnapshot,
} from './clue-chat-eval-helpers';
import {
  canvasIncludesExpectation,
  runQuickEntryBrowserScenario,
  type QuickEntryBrowserResult,
} from './eval-quick-entry-browser';
import type {
  FactorStorageExpectation,
  LabelExpectation,
  MeasurementStorageExpectation,
  MedicationStorageExpectation,
  QuickEntryGraphExpectations,
  QuickEntryScenario,
  QuickEntryScenarioCatalog,
  QuickEntryTimelineExpectations,
  QuickEntryStorageExpectations,
  TimelineLabelExpectation,
} from './quick-entry-eval-types';

const DEFAULT_QUICK_ENTRY_TEST_PASSWORD = 'ClueQuickEntry!234';

/**
 * EvalConfig captures the CLI contract for quick-entry regression runs.
 * Why this exists: Developers need the same serial vs parallel options that
 * the chat eval already supports, but for quick-entry scenarios.
 */
interface EvalConfig {
  emailOrHint: string;
  scenarioIds: string[];
  runAll: boolean;
  parallel: boolean;
  workers: number;
  baseUrl: string;
  settleMs: number;
  keepData: boolean;
}

/**
 * ScenarioEvalResult stores the final pass/fail report for one scenario.
 * Why this exists: The suite summary should separate concrete issues from
 * helpful notes without dumping raw database rows to the terminal.
 */
interface ScenarioEvalResult {
  scenario: QuickEntryScenario;
  passed: boolean;
  issues: string[];
  notes: string[];
  snapshot: UserStateSnapshot;
  browserResult: QuickEntryBrowserResult;
}

/**
 * printUsage prints the non-interactive CLI contract.
 * Why this exists: Quick-entry regression should be easy to rerun locally
 * without reading the script source.
 */
function printUsage(): void {
  console.log(`Usage:
  npm run eval-quick-entry -- --email "<email-or-hint>" --scenario "<scenario_id>"
  npm run eval-quick-entry -- --email "<email-or-hint>" --all
  npm run eval-quick-entry -- --all --parallel

Options:
  --email <value>       Required for shared-user serial runs. Ignored by --parallel.
  --scenario <value>    Optional. Repeat to run specific scenario IDs.
  --all                 Optional. Run every scenario in quick-entry-test-cases.md.
  --parallel            Optional. Run scenarios in parallel with per-scenario users.
  --workers <value>     Optional. Parallel worker count. Defaults to 3.
  --base-url <value>    Optional. Defaults to http://localhost:3000
  --settle-ms <value>   Optional. Final wait after quick-entry edits. Defaults to 12000.
  --keep-data           Optional. Skip the pre-scenario purge.
  --help                Show this help text.
`);
}

/**
 * parseArgs converts CLI flags into a stable config object.
 * Why this exists: Quick-entry regression should be scriptable in the same way
 * as the chat eval rather than relying on hard-coded values.
 */
function parseArgs(argv: string[]): EvalConfig {
  const config: EvalConfig = {
    emailOrHint: '',
    scenarioIds: [],
    runAll: false,
    parallel: false,
    workers: 3,
    baseUrl: 'http://localhost:3000',
    settleMs: 12000,
    keepData: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--email') {
      config.emailOrHint = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--scenario') {
      const scenarioId = argv[index + 1] ?? '';
      if (scenarioId) {
        config.scenarioIds.push(scenarioId);
      }
      index += 1;
      continue;
    }

    if (arg === '--all') {
      config.runAll = true;
      continue;
    }

    if (arg === '--parallel') {
      config.parallel = true;
      continue;
    }

    if (arg === '--workers') {
      config.workers = Number(argv[index + 1] ?? config.workers);
      index += 1;
      continue;
    }

    if (arg === '--base-url') {
      config.baseUrl = argv[index + 1] ?? config.baseUrl;
      index += 1;
      continue;
    }

    if (arg === '--settle-ms') {
      config.settleMs = Number(argv[index + 1] ?? config.settleMs);
      index += 1;
      continue;
    }

    if (arg === '--keep-data') {
      config.keepData = true;
      continue;
    }

    if (arg === '--help') {
      printUsage();
      process.exit(0);
    }
  }

  if ((!config.parallel && !config.emailOrHint) || (!config.runAll && config.scenarioIds.length === 0)) {
    printUsage();
    throw new Error('Pass either --email for serial runs or --parallel, plus either --all or at least one --scenario.');
  }

  if (!Number.isInteger(config.workers) || config.workers < 1) {
    throw new Error('--workers must be a positive integer.');
  }

  return config;
}

/**
 * normalizeLabel makes label comparisons case and whitespace tolerant.
 * Why this exists: Quick-entry rows can normalize capitalization across
 * storage layers, but the eval should still match the same concept.
 */
function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * getExpectedLabels expands one expectation into canonical plus alias labels.
 * Why this exists: Some storage layers may keep the same concept under a known
 * alternate label, especially for graph-facing checks.
 */
function getExpectedLabels(expectation: LabelExpectation): string[] {
  return [expectation.label, ...(expectation.aliases ?? [])].map(normalizeLabel);
}

/**
 * matchesExpectation checks one actual label against one expectation.
 * Why this exists: Storage, timeline, graph, and canvas checks should all use
 * the same label semantics.
 */
function matchesExpectation(actualLabel: string, expectation: LabelExpectation): boolean {
  return getExpectedLabels(expectation).includes(normalizeLabel(actualLabel));
}

/**
 * pushIssue records one hard failure for the scenario result.
 * Why this exists: Keeping failure formatting centralized makes the suite
 * output easier to scan during repeated fix loops.
 */
function pushIssue(issues: string[], message: string): void {
  issues.push(message);
}

/**
 * pushNote records one informational note for the scenario result.
 * Why this exists: Extra context is helpful for debugging, but should stay
 * distinct from hard pass/fail criteria.
 */
function pushNote(notes: string[], message: string): void {
  notes.push(message);
}

/**
 * loadScenarioCatalog reads the dedicated quick-entry scenario file.
 * Why this exists: Quick-entry scenarios are structured UI actions, so they
 * deserve their own catalog instead of sharing chat-turn specs.
 */
async function loadScenarioCatalog(): Promise<QuickEntryScenarioCatalog> {
  const scenarioPath = new URL('../../../../quick-entry-test-cases.md', import.meta.url);
  const raw = await readFile(scenarioPath, 'utf8');
  return JSON.parse(raw) as QuickEntryScenarioCatalog;
}

/**
 * selectScenarios resolves the requested scenario subset.
 * Why this exists: Developers should be able to run one focused case or the
 * full suite while using the same runner.
 */
function selectScenarios(catalog: QuickEntryScenarioCatalog, config: EvalConfig): QuickEntryScenario[] {
  if (config.runAll) {
    return catalog.test_scenarios;
  }

  const scenarioMap = new Map(
    catalog.test_scenarios.map((scenario) => [scenario.scenario_id, scenario])
  );

  return config.scenarioIds.map((scenarioId) => {
    const scenario = scenarioMap.get(scenarioId);
    if (!scenario) {
      throw new Error(`Unknown scenario "${scenarioId}".`);
    }
    return scenario;
  });
}

/**
 * evaluateMoodStorage checks the persisted mood contract.
 * Why this exists: Mood has a dedicated table and should preserve both the
 * chosen rating and any note the user entered.
 */
function evaluateMoodStorage(
  expectations: QuickEntryStorageExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  if (!expectations?.mood) {
    return;
  }

  const moodMatch = snapshot.moodLogs.find((log) => log.rating === expectations.mood?.rating);
  if (!moodMatch) {
    pushIssue(issues, `Missing mood log with rating ${expectations.mood.rating}/10.`);
    return;
  }

  if (expectations.mood.note && moodMatch.note !== expectations.mood.note) {
    pushIssue(issues, `Mood log note mismatch. Expected "${expectations.mood.note}", found "${moodMatch.note ?? ''}".`);
  }
}

/**
 * evaluateMedicationStorage checks durable medication rows.
 * Why this exists: The medication card normalizes name and dosage text before
 * graph propagation, so storage must be verified directly.
 */
function evaluateMedicationStorage(
  expectations: MedicationStorageExpectation[] | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = snapshot.medicationLogs.filter((log) => matchesExpectation(log.medName, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing medication log for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(issues, `Duplicate medication logs matched "${expectation.label}" (${matches.length} rows).`);
    }

    const expectedDosage = expectation.dosage;
    if (
      expectedDosage &&
      !matches.some((log) => normalizeLabel(log.dosage ?? '') === normalizeLabel(expectedDosage))
    ) {
      pushIssue(issues, `Medication log for "${expectation.label}" did not store dosage "${expectedDosage}".`);
    }
  }
}

/**
 * evaluateFactorStorage checks durable factor rows.
 * Why this exists: Factor intensity and category are quick-entry-specific data
 * points that are not fully represented in graph labels alone.
 */
function evaluateFactorStorage(
  expectations: FactorStorageExpectation[] | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = snapshot.factorLogs.filter((log) => matchesExpectation(log.factorName, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing factor log for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(issues, `Duplicate factor logs matched "${expectation.label}" (${matches.length} rows).`);
    }

    const expectedCategory = expectation.categoryLabel;
    if (
      expectedCategory &&
      !matches.some((log) => normalizeLabel(log.categoryLabel) === normalizeLabel(expectedCategory))
    ) {
      pushIssue(issues, `Factor log for "${expectation.label}" did not store category "${expectedCategory}".`);
    }

    if (expectation.rating !== undefined && !matches.some((log) => log.rating === expectation.rating)) {
      pushIssue(issues, `Factor log for "${expectation.label}" did not store rating ${expectation.rating}.`);
    }

    if (expectation.scaleMax !== undefined && !matches.some((log) => log.scaleMax === expectation.scaleMax)) {
      pushIssue(issues, `Factor log for "${expectation.label}" did not store scale max ${expectation.scaleMax}.`);
    }
  }
}

/**
 * evaluateMeasurementStorage checks durable measurement rows.
 * Why this exists: Measurements do not map to graph nodes today, so storage is
 * their primary regression contract.
 */
function evaluateMeasurementStorage(
  expectations: MeasurementStorageExpectation[] | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = snapshot.measurementLogs.filter((log) => matchesExpectation(log.metricName, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing measurement log for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(issues, `Duplicate measurement logs matched "${expectation.label}" (${matches.length} rows).`);
    }

    if (expectation.value !== undefined && !matches.some((log) => log.value === expectation.value)) {
      pushIssue(issues, `Measurement log for "${expectation.label}" did not store value ${expectation.value}.`);
    }

    const expectedUnit = expectation.unit;
    if (expectedUnit && !matches.some((log) => normalizeLabel(log.unit) === normalizeLabel(expectedUnit))) {
      pushIssue(issues, `Measurement log for "${expectation.label}" did not store unit "${expectedUnit}".`);
    }

    if (expectation.notes && !matches.some((log) => (log.notes ?? '') === expectation.notes)) {
      pushIssue(issues, `Measurement log for "${expectation.label}" did not store note "${expectation.notes}".`);
    }
  }
}

/**
 * evaluateStorageExpectations checks all durable-table expectations together.
 * Why this exists: Quick-entry writes several tables in one autosave cycle, so
 * the runner should report storage failures as one section.
 */
function evaluateStorageExpectations(
  expectations: QuickEntryStorageExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  evaluateMoodStorage(expectations, snapshot, issues);
  evaluateMedicationStorage(expectations?.medications, snapshot, issues);
  evaluateFactorStorage(expectations?.factors, snapshot, issues);
  evaluateMeasurementStorage(expectations?.measurements, snapshot, issues);
}

/**
 * evaluateTimelineExpectation checks one family of timeline rows.
 * Why this exists: Timeline entries are user-facing proof that the quick-entry
 * save reached the history surface.
 */
function evaluateTimelineExpectation(
  expectations: TimelineLabelExpectation[] | undefined,
  entries: UserStateSnapshot['timelineEntries'],
  type: string,
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = entries.filter((entry) => entry.type === type && matchesExpectation(entry.title, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing ${type} timeline entry for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(issues, `Duplicate ${type} timeline entries matched "${expectation.label}" (${matches.length} rows).`);
    }

    const expectedDescriptionSnippet = expectation.descriptionIncludes;
    if (
      expectedDescriptionSnippet &&
      !matches.some((entry) => (entry.description ?? '').includes(expectedDescriptionSnippet))
    ) {
      pushIssue(
        issues,
        `${type} timeline entry for "${expectation.label}" did not include "${expectedDescriptionSnippet}" in the description.`
      );
    }
  }
}

/**
 * evaluateTimelineExpectations checks the user-visible timeline contract.
 * Why this exists: Quick-entry regressions can appear in timeline rendering
 * even when raw storage rows look correct.
 */
function evaluateTimelineExpectations(
  expectations: QuickEntryTimelineExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  evaluateTimelineExpectation(expectations?.mood ? [expectations.mood] : undefined, snapshot.timelineEntries, 'mood', issues);
  evaluateTimelineExpectation(expectations?.medications, snapshot.timelineEntries, 'medication', issues);
  evaluateTimelineExpectation(expectations?.factors, snapshot.timelineEntries, 'factor', issues);
  evaluateTimelineExpectation(expectations?.measurements, snapshot.timelineEntries, 'measurement', issues);
}

/**
 * evaluateGraphExpectations checks the rendered `/api/graph` payload.
 * Why this exists: The graph API is the stable truth source behind the canvas
 * tab, so correctness should be asserted there before browser smoke checks.
 */
function evaluateGraphExpectations(
  expectations: QuickEntryGraphExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[]
): void {
  if (!expectations) {
    return;
  }

  for (const [type, typedExpectations] of Object.entries({
    factor: expectations.factor ?? [],
    medication: expectations.medication ?? [],
  })) {
    const nodes = snapshot.renderedGraph.nodes.filter((node) => node.type === type);

    for (const expectation of typedExpectations) {
      const matches = nodes.filter((node) => matchesExpectation(node.label, expectation));

      if (matches.length === 0) {
        pushIssue(issues, `Missing rendered ${type} node for "${expectation.label}".`);
        continue;
      }

      if (matches.length > 1) {
        pushIssue(issues, `Duplicate rendered ${type} nodes matched "${expectation.label}" (${matches.length} matches).`);
      }
    }
  }

  for (const expectation of expectations.forbidLabels ?? []) {
    const forbiddenMatch = snapshot.renderedGraph.nodes.find((node) => matchesExpectation(node.label, expectation));
    if (forbiddenMatch) {
      pushIssue(issues, `Rendered graph unexpectedly included "${forbiddenMatch.label}".`);
    }
  }
}

/**
 * evaluateCanvasExpectations checks the browser-smoke canvas labels.
 * Why this exists: The browser step should confirm that the canvas tab exposes
 * the same key labels the user would expect after quick-entry saves.
 */
function evaluateCanvasExpectations(
  expectations: QuickEntryScenario['expected_state']['canvas'],
  browserResult: QuickEntryBrowserResult,
  issues: string[],
  notes: string[]
): void {
  if (!expectations) {
    return;
  }

  if (expectations.notApplicable) {
    pushNote(notes, expectations.reason ?? 'Canvas check marked non-applicable for this scenario.');
    return;
  }

  if (browserResult.emptyCanvas) {
    pushIssue(issues, 'Canvas tab was empty after quick-entry save.');
    return;
  }

  pushNote(notes, `Canvas exposed ${browserResult.canvasLabels.length} accessible node label(s).`);

  for (const expectation of expectations.presentLabels ?? []) {
    if (!canvasIncludesExpectation(browserResult.canvasLabels, expectation)) {
      pushIssue(issues, `Canvas smoke check did not expose label "${expectation.label}".`);
    }
  }
}

/**
 * evaluateScenarioState scores one quick-entry run end to end.
 * Why this exists: The quick-entry regression should produce the same clear
 * pass/fail contract as the chat eval.
 */
function evaluateScenarioState(
  scenario: QuickEntryScenario,
  snapshot: UserStateSnapshot,
  browserResult: QuickEntryBrowserResult
): ScenarioEvalResult {
  const issues: string[] = [];
  const notes: string[] = [];

  evaluateStorageExpectations(scenario.expected_state.storage, snapshot, issues);
  evaluateTimelineExpectations(scenario.expected_state.timeline, snapshot, issues);
  evaluateGraphExpectations(scenario.expected_state.graph, snapshot, issues);
  evaluateCanvasExpectations(scenario.expected_state.canvas, browserResult, issues, notes);

  pushNote(notes, `Graph nodes: ${snapshot.renderedGraph.nodes.length}, graph edges: ${snapshot.renderedGraph.edges.length}.`);

  return {
    scenario,
    passed: issues.length === 0,
    issues,
    notes,
    snapshot,
    browserResult,
  };
}

/**
 * resolveScenarioUser chooses the right auth identity for one scenario run.
 * Why this exists: Serial runs often reuse one shared test account, while
 * parallel runs need isolated scenario-owned auth users.
 */
async function resolveScenarioUser(
  scenario: QuickEntryScenario,
  config: EvalConfig,
  sharedResolvedUser: Awaited<ReturnType<typeof resolveUserIdentifier>> | null
) {
  if (config.parallel) {
    return ensureExactPasswordUser(scenario.test_user_email, DEFAULT_QUICK_ENTRY_TEST_PASSWORD);
  }

  if (sharedResolvedUser) {
    return ensureExactPasswordUser(sharedResolvedUser.email, DEFAULT_QUICK_ENTRY_TEST_PASSWORD);
  }

  return ensureExactPasswordUser(scenario.test_user_email, DEFAULT_QUICK_ENTRY_TEST_PASSWORD);
}

/**
 * runScenarioReplay drives the browser, then captures the final stored state.
 * Why this exists: Quick-entry verification needs the hybrid browser-plus-state
 * sequence described in the implementation plan.
 */
async function runScenarioReplay(
  scenario: QuickEntryScenario,
  config: EvalConfig,
  user: Awaited<ReturnType<typeof ensureExactPasswordUser>>,
  logPrefix = ''
): Promise<{ snapshot: UserStateSnapshot; browserResult: QuickEntryBrowserResult }> {
  if (!config.keepData) {
    const deletedCount = await purgeUserState(user.userId);
    console.log(`${logPrefix}Purged ${deletedCount} row(s) before replay.`);
  }

  const session = await createPasswordSession(user.email, DEFAULT_QUICK_ENTRY_TEST_PASSWORD);
  const browserResult = await runQuickEntryBrowserScenario({
    baseUrl: config.baseUrl,
    storageKey: getSupabaseStorageKey(),
    session,
    input: scenario.quick_entry_input,
    settleMs: config.settleMs,
  });

  const snapshot = await buildUserStateSnapshot(user.userId, user.email, config.baseUrl);
  return { snapshot, browserResult };
}

/**
 * printScenarioResult prints one concise per-scenario summary.
 * Why this exists: Developers need fast signal when iterating on quick-entry
 * bugs rather than scanning raw JSON or database dumps.
 */
function printScenarioResult(result: ScenarioEvalResult): void {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`\n[${prefix}] ${result.scenario.scenario_id}`);

  if (result.notes.length > 0) {
    for (const note of result.notes) {
      console.log(`  note: ${note}`);
    }
  }

  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      console.log(`  issue: ${issue}`);
    }
  }
}

/**
 * runAndEvaluateScenario executes one scenario and scores the result.
 * Why this exists: Serial and parallel suite modes should share the same
 * execution logic and reporting path.
 */
async function runAndEvaluateScenario(
  scenario: QuickEntryScenario,
  config: EvalConfig,
  sharedResolvedUser: Awaited<ReturnType<typeof resolveUserIdentifier>> | null
): Promise<ScenarioEvalResult> {
  const resolvedUser = await resolveScenarioUser(scenario, config, sharedResolvedUser);
  const logPrefix = config.parallel ? `  [${scenario.scenario_id}] ` : '  ';

  console.log(`\nRunning ${scenario.scenario_id}...`);
  if (config.parallel) {
    console.log(`${logPrefix}user=${resolvedUser.email}`);
  }

  const { snapshot, browserResult } = await runScenarioReplay(
    scenario,
    config,
    resolvedUser,
    logPrefix
  );

  const result = evaluateScenarioState(scenario, snapshot, browserResult);
  printScenarioResult(result);
  return result;
}

/**
 * main runs the selected quick-entry scenario suite.
 * Why this exists: One entry point keeps the new quick-entry regression easy to
 * call from local debugging and from the shared testing skill.
 */
async function main(): Promise<void> {
  const config = parseArgs(process.argv.slice(2));
  const catalog = await loadScenarioCatalog();
  const scenarios = selectScenarios(catalog, config);
  const resolvedUser = config.parallel ? null : await resolveUserIdentifier(config.emailOrHint);

  if (resolvedUser) {
    console.log(`Resolved user: ${resolvedUser.email} (${resolvedUser.userId}) via ${resolvedUser.matchedBy} match`);
  } else {
    console.log('Resolved users: scenario-owned exact emails (parallel mode)');
  }

  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Scenarios: ${scenarios.length}`);
  if (config.parallel) {
    console.log(`Workers: ${Math.min(config.workers, scenarios.length)}`);
  }

  let results: ScenarioEvalResult[] = [];

  if (!config.parallel) {
    for (const scenario of scenarios) {
      results.push(await runAndEvaluateScenario(scenario, config, resolvedUser));
    }
  } else {
    const orderedResults: ScenarioEvalResult[] = new Array(scenarios.length);
    let nextScenarioIndex = 0;
    const workerCount = Math.min(config.workers, scenarios.length);

    /**
     * runWorker drains the shared scenario queue in parallel mode.
     * Why this exists: Parallel quick-entry runs need isolated users but should
     * still preserve deterministic summary ordering.
     */
    async function runWorker(): Promise<void> {
      while (nextScenarioIndex < scenarios.length) {
        const scenarioIndex = nextScenarioIndex;
        nextScenarioIndex += 1;
        orderedResults[scenarioIndex] = await runAndEvaluateScenario(
          scenarios[scenarioIndex],
          config,
          resolvedUser
        );
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
    results = orderedResults;
  }

  const passedCount = results.filter((result) => result.passed).length;
  const failedCount = results.length - passedCount;

  console.log('\nSuite Summary');
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
