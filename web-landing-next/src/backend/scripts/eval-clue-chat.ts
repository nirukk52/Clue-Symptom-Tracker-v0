/**
 * Clue Chat Scenario Eval
 *
 * Why this exists: Converts the curated chat scenarios into a replayable,
 * state-based eval that scores the final persisted graph, logs, timeline, and
 * next-question clue instead of brittle assistant copy snapshots.
 */

import { readFile } from 'node:fs/promises';

import {
  buildUserStateSnapshot,
  createConversation,
  ensureExactUser,
  purgeUserState,
  resolveUserIdentifier,
  sendChatTurn,
  sleep,
  type InsightSnapshot,
  type RenderedGraphSnapshot,
  type SymptomLogSnapshot,
  type TimelineEntrySnapshot,
  type UserStateSnapshot,
} from './clue-chat-eval-helpers';

/**
 * CLI configuration for the scenario eval runner.
 * Why this exists: Developers need a stable interface for single-scenario and
 * whole-suite eval runs while preserving replay timing controls.
 */
interface EvalConfig {
  emailOrHint: string;
  scenarioIds: string[];
  runAll: boolean;
  parallel: boolean;
  workers: number;
  baseUrl: string;
  pauseMs: number;
  settleMs: number;
  keepData: boolean;
}

/**
 * Basic label expectation used across graph, logs, timeline, and insight checks.
 * Why this exists: Clinical labels often have small naming variants, so evals
 * should support alias matching while still reporting a canonical expectation.
 */
interface LabelExpectation {
  label: string;
  aliases?: string[];
}

/**
 * Symptom log expectation with optional exact severity.
 * Why this exists: Severity is one of the most important user-facing fields in
 * the logging flow, so some scenarios need to assert it explicitly.
 */
interface SymptomExpectation extends LabelExpectation {
  severity?: number;
}

/**
 * Scenario graph expectations grouped by rendered node type.
 * Why this exists: The user wants the eval centered on the final canvas graph,
 * and node types are the most stable contract for that representation.
 */
interface GraphExpectations {
  symptom?: LabelExpectation[];
  factor?: LabelExpectation[];
  medication?: LabelExpectation[];
  condition?: LabelExpectation[];
  optionalCondition?: LabelExpectation[];
}

/**
 * Scenario log expectations for structured tables.
 * Why this exists: The chat agent first proves itself through durable rows
 * before the graph and insight agents reconcile downstream state.
 */
interface LogExpectations {
  symptoms?: SymptomExpectation[];
  medications?: LabelExpectation[];
  moodMinCount?: number;
}

/**
 * Scenario timeline expectations for user-visible event history.
 * Why this exists: Timeline rows are part of the primary product experience and
 * often surface logging regressions earlier than graph-only checks.
 */
interface TimelineExpectations {
  symptoms?: SymptomExpectation[];
  medications?: LabelExpectation[];
}

/**
 * Scenario insight expectations for next-turn clue quality.
 * Why this exists: The insight agent should produce a fresh clue without asking
 * again about labels the user already answered in the replay.
 */
interface InsightExpectations {
  requireNextQuestion?: boolean;
  forbidAnsweredLabels?: LabelExpectation[];
}

/**
 * Persisted-state contract attached to each scenario.
 * Why this exists: The replay runner needs machine-readable expectations so it
 * can score the final system state automatically.
 */
interface ScenarioExpectedState {
  graph?: GraphExpectations;
  logs?: LogExpectations;
  timeline?: TimelineExpectations;
  insights?: InsightExpectations;
}

/**
 * One turn in the prose scenario spec.
 * Why this exists: The replay inputs still come from the scenario file's dialog
 * structure, even though the assertions target stored state instead of copy.
 */
interface ScenarioTurn {
  speaker: 'assistant' | 'user';
  message: string;
}

/**
 * One chat scenario from `test-cases.md`.
 * Why this exists: The eval runner reuses the same scenario source that product
 * and prompt work already depend on.
 */
interface TestScenario {
  persona_id: string;
  test_user_email: string;
  persona_name: string;
  user_first_reply: string;
  expected_agent_sequence: ScenarioTurn[];
  expected_state: ScenarioExpectedState;
}

/**
 * Top-level scenario file shape.
 * Why this exists: The suite loader needs just enough typing to safely pull the
 * replay and eval data out of the JSON-formatted markdown file.
 */
interface ScenarioCatalog {
  test_scenarios: TestScenario[];
}

/**
 * One scenario result after replay and scoring.
 * Why this exists: The suite summary should clearly separate pass/fail state,
 * concrete findings, and helpful observational notes.
 */
interface ScenarioEvalResult {
  scenario: TestScenario;
  passed: boolean;
  issues: string[];
  notes: string[];
  snapshot: UserStateSnapshot;
}

/**
 * Prints CLI usage.
 * Why this exists: The eval runner is meant to be shared across repeated local
 * regressions, so it needs a deterministic non-interactive interface.
 */
function printUsage(): void {
  console.log(`Usage:
  npm run eval-clue-chat -- --email "<email-or-hint>" --scenario "<persona_id>"
  npm run eval-clue-chat -- --email "<email-or-hint>" --all
  npm run eval-clue-chat -- --all --parallel

Options:
  --email <value>       Required for shared-user serial runs. Ignored by --parallel.
  --scenario <value>    Optional. Repeat to run specific persona IDs.
  --all                 Optional. Run every scenario in test-cases.md.
  --parallel            Optional. Run scenarios in parallel with per-scenario users.
  --workers <value>     Optional. Parallel worker count. Defaults to 3.
  --base-url <value>    Optional. Defaults to http://localhost:3000
  --pause-ms <value>    Optional. Delay between turns. Defaults to 2500.
  --settle-ms <value>   Optional. Final wait for post-turn agents. Defaults to 6000.
  --keep-data           Optional. Skip the pre-scenario purge.
  --help                Show this help text.
`);
}

/**
 * Parses CLI flags into a stable configuration object.
 * Why this exists: Scenario evals are easiest to automate when replay timing
 * and scenario selection are explicit rather than hidden in shell snippets.
 */
function parseArgs(argv: string[]): EvalConfig {
  const config: EvalConfig = {
    emailOrHint: '',
    scenarioIds: [],
    runAll: false,
    parallel: false,
    workers: 3,
    baseUrl: 'http://localhost:3000',
    pauseMs: 2500,
    settleMs: 6000,
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

    if (arg === '--pause-ms') {
      config.pauseMs = Number(argv[index + 1] ?? config.pauseMs);
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
 * Normalizes labels for case-insensitive state comparisons.
 * Why this exists: The eval cares about durable semantic matches, not minor
 * capitalization or spacing differences between storage layers.
 */
function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Collects canonical and alias labels for one expectation.
 * Why this exists: A single expectation may need to match multiple clinically
 * equivalent labels such as "fatigue" and "low energy".
 */
function getExpectedLabels(expectation: LabelExpectation): string[] {
  return [expectation.label, ...(expectation.aliases ?? [])].map(normalizeLabel);
}

/**
 * Checks whether an actual label satisfies one expectation.
 * Why this exists: Reusing the same matcher keeps graph, log, and insight
 * assertions consistent across all replayed scenarios.
 */
function matchesExpectation(actualLabel: string, expectation: LabelExpectation): boolean {
  const actual = normalizeLabel(actualLabel);
  return getExpectedLabels(expectation).includes(actual);
}

/**
 * Builds the user-turn replay sequence from the chat scenario spec.
 * Why this exists: The existing product scenarios already encode the desired
 * conversation path, so the eval should derive turns directly from that file.
 */
function getReplayMessages(scenario: TestScenario): string[] {
  return [
    scenario.user_first_reply,
    ...scenario.expected_agent_sequence
      .filter((turn) => turn.speaker === 'user')
      .map((turn) => turn.message),
  ];
}

/**
 * Returns active rendered graph nodes of one type.
 * Why this exists: The canvas payload is the main graph contract for this eval,
 * so node checks should operate on the same shape the UI receives.
 */
function getRenderedNodesByType(
  renderedGraph: RenderedGraphSnapshot,
  type: string
): RenderedGraphSnapshot['nodes'] {
  return renderedGraph.nodes.filter((node) => node.type === type);
}

/**
 * Finds the latest active next-question clues for scoring.
 * Why this exists: Scenario evals need a focused view of the insight agent's
 * forward-looking output rather than every historical insight row.
 */
function getActiveNextQuestions(insights: InsightSnapshot[]): InsightSnapshot[] {
  return insights.filter(
    (insight) => insight.type === 'next_question' && insight.status !== 'dismissed'
  );
}

/**
 * Checks whether an insight appears to target one answered label.
 * Why this exists: The eval should fail if Clue asks again about a symptom or
 * factor the replay already captured.
 */
function insightTargetsAnsweredLabel(
  insight: InsightSnapshot,
  expectation: LabelExpectation
): boolean {
  const labels = getExpectedLabels(expectation);
  const relatedSymptom = insight.metadata?.relatedSymptom;
  const relatedLabel =
    typeof relatedSymptom === 'string' && relatedSymptom.trim()
      ? normalizeLabel(relatedSymptom)
      : null;
  const content = normalizeLabel(insight.content);

  return labels.some((label) => relatedLabel === label || content.includes(label));
}

/**
 * Adds one failure message to the scenario result.
 * Why this exists: Centralizing failure formatting keeps the final suite output
 * short, consistent, and easier to scan.
 */
function pushIssue(issues: string[], message: string): void {
  issues.push(message);
}

/**
 * Adds one informational note to the scenario result.
 * Why this exists: Optional context is useful for diagnosis, but should stay
 * separate from the hard pass/fail contract.
 */
function pushNote(notes: string[], message: string): void {
  notes.push(message);
}

/**
 * Evaluates required graph nodes against the rendered graph payload.
 * Why this exists: The user's main request is to validate the final graph state
 * that powers the canvas, including duplicates and missing node labels.
 */
function evaluateGraphExpectations(
  graph: GraphExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[],
  notes: string[]
): void {
  if (!graph) {
    return;
  }

  for (const [type, expectations] of Object.entries({
    symptom: graph.symptom ?? [],
    factor: graph.factor ?? [],
    medication: graph.medication ?? [],
    condition: graph.condition ?? [],
  })) {
    const nodes = getRenderedNodesByType(snapshot.renderedGraph, type);

    for (const expectation of expectations) {
      const matches = nodes.filter((node) => matchesExpectation(node.label, expectation));

      if (matches.length === 0) {
        pushIssue(issues, `Missing rendered ${type} node for "${expectation.label}".`);
        continue;
      }

      if (matches.length > 1) {
        pushIssue(
          issues,
          `Duplicate rendered ${type} nodes matched "${expectation.label}" (${matches.length} matches).`
        );
      }
    }
  }

  for (const expectation of graph.optionalCondition ?? []) {
    const matches = getRenderedNodesByType(snapshot.renderedGraph, 'condition').filter((node) =>
      matchesExpectation(node.label, expectation)
    );

    if (matches.length > 0) {
      pushNote(notes, `Observed optional condition node "${matches[0].label}".`);
    }
  }
}

/**
 * Evaluates required symptom logs against the stored state.
 * Why this exists: Structured symptom rows are the clearest proof that the chat
 * agent captured what the user said before graph reconciliation.
 */
function evaluateSymptomLogs(
  expectations: SymptomExpectation[] | undefined,
  symptomLogs: SymptomLogSnapshot[],
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = symptomLogs.filter((log) => matchesExpectation(log.symptomName, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing symptom log for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(
        issues,
        `Duplicate symptom logs matched "${expectation.label}" (${matches.length} rows).`
      );
    }

    if (expectation.severity !== undefined) {
      const severityMatch = matches.some((log) => log.severity === expectation.severity);
      if (!severityMatch) {
        pushIssue(
          issues,
          `Symptom log for "${expectation.label}" did not store severity ${expectation.severity}/10.`
        );
      }
    }
  }
}

/**
 * Evaluates required medication logs against the stored state.
 * Why this exists: Some scenarios may later cover medication behavior, and the
 * eval should already understand how to score that contract.
 */
function evaluateMedicationLogs(
  expectations: LabelExpectation[] | undefined,
  medicationLogs: UserStateSnapshot['medicationLogs'],
  issues: string[]
): void {
  for (const expectation of expectations ?? []) {
    const matches = medicationLogs.filter((log) => matchesExpectation(log.medName, expectation));

    if (matches.length === 0) {
      pushIssue(issues, `Missing medication log for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(
        issues,
        `Duplicate medication logs matched "${expectation.label}" (${matches.length} rows).`
      );
    }
  }
}

/**
 * Evaluates required timeline entries against the stored state.
 * Why this exists: Timeline regressions are user-facing even when the raw log
 * tables look healthy, so the eval needs a separate timeline check.
 */
function evaluateTimelineExpectations(
  timeline: TimelineExpectations | undefined,
  entries: TimelineEntrySnapshot[],
  issues: string[]
): void {
  for (const expectation of timeline?.symptoms ?? []) {
    const matches = entries.filter(
      (entry) => entry.type === 'symptom' && matchesExpectation(entry.title, expectation)
    );

    if (matches.length === 0) {
      pushIssue(issues, `Missing symptom timeline entry for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(
        issues,
        `Duplicate symptom timeline entries matched "${expectation.label}" (${matches.length} rows).`
      );
    }

    if (expectation.severity !== undefined) {
      const severityMatch = matches.some((entry) => entry.severity === expectation.severity);
      if (!severityMatch) {
        pushIssue(
          issues,
          `Timeline entry for "${expectation.label}" did not store severity ${expectation.severity}/10.`
        );
      }
    }
  }

  for (const expectation of timeline?.medications ?? []) {
    const matches = entries.filter(
      (entry) => entry.type === 'medication' && matchesExpectation(entry.title, expectation)
    );

    if (matches.length === 0) {
      pushIssue(issues, `Missing medication timeline entry for "${expectation.label}".`);
      continue;
    }

    if (matches.length > 1) {
      pushIssue(
        issues,
        `Duplicate medication timeline entries matched "${expectation.label}" (${matches.length} rows).`
      );
    }
  }
}

/**
 * Evaluates next-question clue freshness against answered labels.
 * Why this exists: The insight agent should move the conversation forward, not
 * recycle already answered symptoms or factors.
 */
function evaluateInsightExpectations(
  insightExpectations: InsightExpectations | undefined,
  snapshot: UserStateSnapshot,
  issues: string[],
  notes: string[]
): void {
  if (!insightExpectations) {
    return;
  }

  const activeNextQuestions = getActiveNextQuestions(snapshot.insights);

  if (insightExpectations.requireNextQuestion && activeNextQuestions.length === 0) {
    pushIssue(issues, 'Missing active next-question insight.');
    return;
  }

  if (activeNextQuestions.length > 0) {
    pushNote(notes, `Latest next question: "${activeNextQuestions[0].content}"`);
  }

  for (const expectation of insightExpectations.forbidAnsweredLabels ?? []) {
    const staleInsight = activeNextQuestions.find((insight) =>
      insightTargetsAnsweredLabel(insight, expectation)
    );

    if (staleInsight) {
      pushIssue(
        issues,
        `Next-question insight still targeted answered label "${expectation.label}": "${staleInsight.content}".`
      );
    }
  }
}

/**
 * Scores one scenario against the final stored state.
 * Why this exists: Turning the replay into a deterministic pass/fail contract
 * is the core purpose of this new eval workflow.
 */
function evaluateScenarioState(
  scenario: TestScenario,
  snapshot: UserStateSnapshot
): ScenarioEvalResult {
  const issues: string[] = [];
  const notes: string[] = [];
  const latestConversation = snapshot.conversations[0];

  if (!latestConversation) {
    pushIssue(issues, 'No conversation was persisted for the replay.');
  } else {
    pushNote(
      notes,
      `Stored ${latestConversation.messages.length} message(s) in conversation ${latestConversation.id}.`
    );
  }

  evaluateGraphExpectations(scenario.expected_state.graph, snapshot, issues, notes);
  evaluateSymptomLogs(scenario.expected_state.logs?.symptoms, snapshot.symptomLogs, issues);
  evaluateMedicationLogs(
    scenario.expected_state.logs?.medications,
    snapshot.medicationLogs,
    issues
  );
  evaluateTimelineExpectations(scenario.expected_state.timeline, snapshot.timelineEntries, issues);
  evaluateInsightExpectations(scenario.expected_state.insights, snapshot, issues, notes);

  if (scenario.expected_state.logs?.moodMinCount !== undefined) {
    if (snapshot.moodLogs.length < scenario.expected_state.logs.moodMinCount) {
      pushIssue(
        issues,
        `Expected at least ${scenario.expected_state.logs.moodMinCount} mood log(s), found ${snapshot.moodLogs.length}.`
      );
    }
  }

  return {
    scenario,
    passed: issues.length === 0,
    issues,
    notes,
    snapshot,
  };
}

/**
 * Loads the JSON-formatted scenario catalog from the repo root.
 * Why this exists: The existing `test-cases.md` file is already the source of
 * truth for replay scenarios, so the eval reads it directly.
 */
async function loadScenarioCatalog(): Promise<ScenarioCatalog> {
  const scenarioPath = new URL('../../../../test-cases.md', import.meta.url);
  const raw = await readFile(scenarioPath, 'utf8');
  return JSON.parse(raw) as ScenarioCatalog;
}

/**
 * Resolves the requested scenario subset.
 * Why this exists: Developers need to target one bug-focused scenario quickly
 * or run the full suite when checking broader regressions.
 */
function selectScenarios(catalog: ScenarioCatalog, config: EvalConfig): TestScenario[] {
  if (config.runAll) {
    return catalog.test_scenarios;
  }

  const scenarioMap = new Map(
    catalog.test_scenarios.map((scenario) => [scenario.persona_id, scenario])
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
 * Replays one scenario, waits for settlement, and captures the final state.
 * Why this exists: The eval should mirror the real regression loop developers
 * already run manually, but produce machine-scored results afterward.
 */
async function runScenarioReplay(
  scenario: TestScenario,
  config: EvalConfig,
  userId: string,
  email: string,
  logPrefix = ''
): Promise<UserStateSnapshot> {
  if (!config.keepData) {
    const deletedCount = await purgeUserState(userId);
    console.log(`${logPrefix}Purged ${deletedCount} row(s) before replay.`);
  }

  const messages = getReplayMessages(scenario);
  const conversationId = await createConversation(config.baseUrl, userId);
  console.log(`${logPrefix}conversationId=${conversationId}`);

  for (const message of messages) {
    const raw = await sendChatTurn(config.baseUrl, userId, conversationId, message);
    console.log(`${logPrefix}sent: ${message}`);
    console.log(`${logPrefix}stream preview: ${raw.slice(0, 160).replace(/\n/g, ' ')}`);
    await sleep(config.pauseMs);
  }

  console.log(`${logPrefix}Waiting ${config.settleMs}ms for post-turn agents...`);
  await sleep(config.settleMs);

  return buildUserStateSnapshot(userId, email, config.baseUrl);
}

/**
 * Resolves the auth user for one scenario run.
 * Why this exists: Serial runs keep using the shared test user, while parallel
 * runs need isolated scenario-owned auth identities to avoid data races.
 */
async function resolveScenarioUser(
  scenario: TestScenario,
  config: EvalConfig,
  sharedResolvedUser: Awaited<ReturnType<typeof resolveUserIdentifier>> | null
): Promise<Awaited<ReturnType<typeof ensureExactUser>>> {
  if (config.parallel) {
    return ensureExactUser(scenario.test_user_email);
  }

  if (sharedResolvedUser) {
    return sharedResolvedUser;
  }

  return ensureExactUser(scenario.test_user_email);
}

/**
 * Replays and scores one scenario with the appropriate user isolation strategy.
 * Why this exists: The suite should share one implementation for both serial
 * and parallel modes so evaluation logic stays consistent.
 */
async function runAndEvaluateScenario(
  scenario: TestScenario,
  config: EvalConfig,
  sharedResolvedUser: Awaited<ReturnType<typeof resolveUserIdentifier>> | null
): Promise<ScenarioEvalResult> {
  const resolvedUser = await resolveScenarioUser(scenario, config, sharedResolvedUser);
  const logPrefix = config.parallel ? `  [${scenario.persona_id}] ` : '  ';

  console.log(`\nRunning ${scenario.persona_id}...`);
  if (config.parallel) {
    console.log(`${logPrefix}user=${resolvedUser.email}`);
  }

  const snapshot = await runScenarioReplay(
    scenario,
    config,
    resolvedUser.userId,
    resolvedUser.email,
    logPrefix
  );
  const result = evaluateScenarioState(scenario, snapshot);
  printScenarioResult(result);
  return result;
}

/**
 * Prints one scenario result in a concise developer-friendly format.
 * Why this exists: The suite should surface the precise regression signal
 * without forcing the user to inspect raw database output.
 */
function printScenarioResult(result: ScenarioEvalResult): void {
  const prefix = result.passed ? 'PASS' : 'FAIL';
  console.log(`\n[${prefix}] ${result.scenario.persona_id} — ${result.scenario.persona_name}`);

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
 * Runs the selected scenario suite from end to end.
 * Why this exists: A single entry point keeps the new state-based eval easy to
 * invoke from local debugging and future automation.
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
    results = [];
    for (const scenario of scenarios) {
      results.push(await runAndEvaluateScenario(scenario, config, resolvedUser));
    }
  } else {
    const orderedResults: ScenarioEvalResult[] = new Array(scenarios.length);
    let nextScenarioIndex = 0;
    const workerCount = Math.min(config.workers, scenarios.length);

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
