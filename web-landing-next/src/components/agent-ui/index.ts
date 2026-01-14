/**
 * Backend Components Exports
 *
 * Why this exists: Centralizes component exports for the backend/agents system.
 */

// Original WatchListPreview (being deprecated in favor of ValuePropScreen)
export { WatchListPreview } from './WatchListPreview';
export { FlareRiskGraph } from './WatchListPreview/FlareRiskGraph';
export { SymptomPatternGraph } from './WatchListPreview/SymptomPatternGraph';

// New ValuePropScreen (AI-driven layout selection)
export type { LayoutId, ValuePropScreenData } from './ValuePropScreen';
export {
  BaselineCard,
  FatigueLayout,
  FlaresLayout,
  IBSGutLayout,
  MigrainesLayout,
  MultipleLayout,
  OtherLayout,
  PromiseCard,
  ValuePropScreen,
  VictorySection,
} from './ValuePropScreen';
