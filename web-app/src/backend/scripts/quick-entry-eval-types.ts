/**
 * Shared types for quick-entry regression scenarios.
 *
 * Why this exists: The browser driver and the state scorer both consume the
 * same scenario catalog, so they need one shared contract for inputs and
 * expectations instead of parallel ad-hoc shapes.
 */

/**
 * LabelExpectation supports canonical-label checks plus optional aliases.
 * Why this exists: Stored state can normalize capitalization or wording, but
 * the eval still needs to match the intended clinical concept.
 */
export interface LabelExpectation {
  label: string;
  aliases?: string[];
}

/**
 * QuickEntryInputMood describes the browser actions for the mood card.
 * Why this exists: The runner drives the real quick-entry UI rather than
 * posting raw snapshots directly to the API.
 */
export interface QuickEntryInputMood {
  rating: number;
  note?: string;
}

/**
 * QuickEntryInputMedication describes one medication add flow.
 * Why this exists: The medication card uses UI fields like strength and unit
 * that get normalized into stored dosage text after save.
 */
export interface QuickEntryInputMedication {
  name: string;
  strength?: string;
  unit?: string;
}

/**
 * QuickEntryInputFactor describes one factor-card interaction.
 * Why this exists: The quick-entry runner needs to know which card to target
 * and which preset intensity button to click.
 */
export interface QuickEntryInputFactor {
  card: 'sleep' | 'other';
  category?: string;
  label: string;
  intensity?: 'low' | 'medium' | 'high';
}

/**
 * QuickEntryInputMeasurement describes one measurement-sheet interaction.
 * Why this exists: Measurements are entered through dedicated modal inputs, so
 * the runner needs label, value, and optional notes separately.
 */
export interface QuickEntryInputMeasurement {
  label: string;
  value: string;
  notes?: string;
}

/**
 * QuickEntryScenarioInput groups the structured browser actions for one run.
 * Why this exists: The scenario catalog should read like the quick-entry
 * screen rather than like low-level Playwright steps.
 */
export interface QuickEntryScenarioInput {
  mood?: QuickEntryInputMood;
  medications?: QuickEntryInputMedication[];
  factors?: QuickEntryInputFactor[];
  measurements?: QuickEntryInputMeasurement[];
}

/**
 * MoodStorageExpectation validates the durable mood log contract.
 * Why this exists: Mood verification needs at least the saved rating and, in
 * some cases, the note text that should survive autosave.
 */
export interface MoodStorageExpectation {
  rating: number;
  note?: string;
}

/**
 * MedicationStorageExpectation validates durable medication rows.
 * Why this exists: Dosage text is one of the most important normalizations in
 * the quick-entry medication flow.
 */
export interface MedicationStorageExpectation extends LabelExpectation {
  dosage?: string;
}

/**
 * FactorStorageExpectation validates durable factor rows.
 * Why this exists: Factor logs carry category and intensity data that do not
 * appear in every downstream surface.
 */
export interface FactorStorageExpectation extends LabelExpectation {
  categoryLabel?: string;
  rating?: number;
  scaleMax?: number;
}

/**
 * MeasurementStorageExpectation validates durable measurement rows.
 * Why this exists: Measurements currently prove themselves through storage and
 * timeline state rather than graph propagation.
 */
export interface MeasurementStorageExpectation extends LabelExpectation {
  value?: number;
  unit?: string;
  notes?: string;
}

/**
 * QuickEntryStorageExpectations groups table-level expectations.
 * Why this exists: Quick entry writes several specialized tables that should be
 * checked independently from graph and canvas state.
 */
export interface QuickEntryStorageExpectations {
  mood?: MoodStorageExpectation;
  medications?: MedicationStorageExpectation[];
  factors?: FactorStorageExpectation[];
  measurements?: MeasurementStorageExpectation[];
}

/**
 * TimelineLabelExpectation validates a visible timeline row.
 * Why this exists: Timeline titles are user-facing proof that the save reached
 * the history surface, not just background tables.
 */
export interface TimelineLabelExpectation extends LabelExpectation {
  descriptionIncludes?: string;
}

/**
 * QuickEntryTimelineExpectations groups the user-visible timeline checks.
 * Why this exists: Each quick-entry card maps to a different timeline family.
 */
export interface QuickEntryTimelineExpectations {
  mood?: TimelineLabelExpectation;
  medications?: TimelineLabelExpectation[];
  factors?: TimelineLabelExpectation[];
  measurements?: TimelineLabelExpectation[];
}

/**
 * QuickEntryGraphExpectations validates the rendered `/api/graph` payload.
 * Why this exists: The graph payload is the stable source of truth for the
 * canvas tab and the main correctness contract for this regression.
 */
export interface QuickEntryGraphExpectations {
  factor?: LabelExpectation[];
  medication?: LabelExpectation[];
  forbidLabels?: LabelExpectation[];
}

/**
 * QuickEntryCanvasExpectations defines browser-smoke checks for the canvas tab.
 * Why this exists: Browser verification should stay lightweight because graph
 * correctness is asserted from `/api/graph`, not screenshot heuristics.
 */
export interface QuickEntryCanvasExpectations {
  notApplicable?: boolean;
  reason?: string;
  presentLabels?: LabelExpectation[];
}

/**
 * QuickEntryExpectedState groups every assertion family for one scenario.
 * Why this exists: The runner should score storage, timeline, graph, and
 * browser-canvas smoke independently so failures stay actionable.
 */
export interface QuickEntryExpectedState {
  storage?: QuickEntryStorageExpectations;
  timeline?: QuickEntryTimelineExpectations;
  graph?: QuickEntryGraphExpectations;
  canvas?: QuickEntryCanvasExpectations;
}

/**
 * QuickEntryScenario represents one end-to-end quick-entry regression case.
 * Why this exists: The catalog needs stable IDs, isolated test users, browser
 * inputs, and machine-readable expected state for each scenario.
 */
export interface QuickEntryScenario {
  scenario_id: string;
  test_user_email: string;
  description: string;
  quick_entry_input: QuickEntryScenarioInput;
  expected_state: QuickEntryExpectedState;
}

/**
 * QuickEntryContractReference documents the persistence contract by card.
 * Why this exists: The first quick-entry todo is to make the save-to-graph
 * mapping explicit instead of leaving it implicit in implementation code.
 */
export interface QuickEntryContractReference {
  storage: string[];
  timeline: string[];
  graph: string[];
  canvas: string;
}

/**
 * QuickEntryScenarioCatalog is the top-level quick-entry scenario file shape.
 * Why this exists: The runner loads one dedicated catalog rather than
 * overloading the chat replay scenarios.
 */
export interface QuickEntryScenarioCatalog {
  contract_reference: Record<string, QuickEntryContractReference>;
  test_scenarios: QuickEntryScenario[];
}
