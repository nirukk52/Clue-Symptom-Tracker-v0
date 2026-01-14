/**
 * Widget Components Index
 *
 * Why this exists: Exports all widget components for Q3 baseline capture
 * and Q4 value preview. These widgets are designed for chronic illness
 * users - low cognitive load, large touch targets, and immediate feedback.
 */

// Q3 Baseline Capture Widgets
export { ChipSelector } from './ChipSelector';
export { ConditionPicker } from './ConditionPicker';
export { GradientSlider } from './GradientSlider';

// Q4 Value Preview Widget with domain-specific previews
export { ValuePropScreen } from './ValuePropScreen';
export { ValuePropCarousel } from './ValuePropCarousel';
export { WatchListPreview } from './WatchListPreview';

// Domain-specific Preview Components
export {
  EnergyWavePreview,
  FlareRiskPreview,
  FoodTimelinePreview,
  GenericPreview,
  MultiMetricPreview,
  TriggerPreview,
} from './previews';

// Preview Registry
export { getPreviewComponent, type Screen4LayoutId } from './registry';
