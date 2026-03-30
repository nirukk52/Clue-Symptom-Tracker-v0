/**
 * Backend Components Exports
 *
 * Why this exists: Centralizes component exports for the backend/agents system.
 */

// ValuePropScreen with domain-specific previews (from widgets)
export { ValuePropScreen } from './widgets/ValuePropScreen';
export type { ValuePropScreenProps } from './widgets/ValuePropScreen';

// Domain-specific preview components
export {
  EnergyWavePreview,
  FlareRiskPreview,
  FoodTimelinePreview,
  GenericPreview,
  MultiMetricPreview,
  TriggerPreview,
} from './widgets/previews';

// Preview registry for domain-based selection
export { getPreviewComponent, type Screen4LayoutId } from './widgets/registry';
