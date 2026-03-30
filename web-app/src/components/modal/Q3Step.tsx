'use client';

import { useMemo, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ChipSelector } from '@/components/widgets/ChipSelector';
import { ConditionPicker } from '@/components/widgets/ConditionPicker';
import { GradientSlider } from '@/components/widgets/GradientSlider';
import {
  getConditionConfig,
  getMicrocopy,
  getQ3WidgetIdForPainPoint,
  getWidget,
} from '@/lib/onboarding/content';

/**
 * Q3Step - Baseline capture with condition confirmation + main widget
 *
 * Why this exists: Q3 captures the user's baseline data for personalized
 * tracking. It consists of two parts:
 * 1. Condition picker (confirms specific condition from illness.md)
 * 2. Main widget (captures baseline based on Q2 pain point)
 *
 * Design Philosophy:
 * - Max 3 taps total (condition + 1-2 widget interactions)
 * - Generates immediate value for Q4
 * - NO EMOJIS (per frontend-design skill)
 */

interface Q3StepProps {
  /** Q1 domain (fatigue, flares, migraines, etc.) */
  q1Domain: string;
  /** Q2 pain point selection */
  q2PainPoint: string;
  /** Callback when Q3 is complete */
  onComplete: (data: Q3Data) => void;
}

export interface Q3Data {
  conditionId: string;
  widgetId: string;
  widgetType: 'slider' | 'chips';
  widgetValue: number | string | string[];
}

export function Q3Step({ q1Domain, q2PainPoint, onComplete }: Q3StepProps) {
  // State for condition picker
  const { defaultValue } = getConditionConfig(q1Domain);
  const [condition, setCondition] = useState(defaultValue || 'other');

  // State for main widget
  const [sliderValue, setSliderValue] = useState(50);
  const [chipsValue, setChipsValue] = useState<string | string[]>([]);

  // Get widget config from JSON (selected by flow mapping)
  const widgetId = useMemo(
    () => getQ3WidgetIdForPainPoint(q2PainPoint),
    [q2PainPoint]
  );

  const widgetConfig = useMemo(() => {
    try {
      return getWidget(widgetId);
    } catch {
      return getWidget('q3.default.v1');
    }
  }, [widgetId]);

  // Check if complete (condition selected + widget interacted)
  const isComplete = useMemo(() => {
    if (!condition) return false;
    if (widgetConfig.type === 'slider') return true; // Slider always has value
    if (widgetConfig.type === 'chips') {
      const val = Array.isArray(chipsValue) ? chipsValue : [chipsValue];
      return val.length > 0 && val[0] !== '';
    }
    return false;
  }, [condition, widgetConfig, chipsValue]);

  const handleComplete = () => {
    onComplete({
      conditionId: condition,
      widgetId,
      widgetType: widgetConfig.type,
      widgetValue: widgetConfig.type === 'slider' ? sliderValue : chipsValue,
    });
  };

  return (
    <div className="q3-step-container">
      {/* Header */}
      <div className="q3-step-header">
        <h2 className="q3-step-title">
          {getMicrocopy('q3.header.capture_baseline.v1')}
        </h2>
      </div>

      {/* Condition Picker */}
      <ConditionPicker
        domain={q1Domain}
        selected={condition}
        onChange={setCondition}
      />

      <div className="q3-divider" />

      {/* Main Widget */}
      <div className="q3-main-widget">
        {widgetConfig.type === 'slider' && (
          <GradientSlider
            label={widgetConfig.prompt}
            value={sliderValue}
            onChange={setSliderValue}
            minLabel={widgetConfig.minLabel}
            maxLabel={widgetConfig.maxLabel}
            gradient={widgetConfig.gradient}
          />
        )}

        {widgetConfig.type === 'chips' && widgetConfig.options && (
          <ChipSelector
            label={widgetConfig.prompt}
            options={widgetConfig.options}
            selected={chipsValue}
            onChange={setChipsValue}
            allowMultiple={widgetConfig.allowMultiple}
          />
        )}
      </div>

      {/* Continue Button */}
      <button
        type="button"
        className="q3-continue-btn"
        onClick={handleComplete}
        disabled={!isComplete}
      >
        {getMicrocopy('q3.cta.continue.v1')}
        <MaterialIcon name="arrow_forward" size="sm" />
      </button>
    </div>
  );
}
