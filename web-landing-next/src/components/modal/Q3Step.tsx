'use client';

import { useMemo, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ChipSelector } from '@/components/widgets/ChipSelector';
import { ConditionPicker } from '@/components/widgets/ConditionPicker';
import { GradientSlider } from '@/components/widgets/GradientSlider';
import { DEFAULT_CONDITION } from '@/content/conditions';

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
  condition: string;
  widgetType: string;
  widgetValue: number | string | string[];
}

/**
 * Widget configurations mapped to Q2 pain points
 * Simplified from onboarding-flow.json for web landing
 */
const WIDGET_CONFIG: Record<
  string,
  {
    type: 'slider' | 'chips';
    question: string;
    minLabel?: string;
    maxLabel?: string;
    options?: { value: string; label: string }[];
    allowMultiple?: boolean;
    gradient?: [string, string, string];
  }
> = {
  // Fatigue domain
  energy_envelope: {
    type: 'slider',
    question: 'Where is your energy right now?',
    minLabel: 'Empty',
    maxLabel: 'Full',
    gradient: ['#f87171', '#fcd34d', '#b8e3d6'],
  },
  good_days_trap: {
    type: 'chips',
    question: 'What activities might be draining you?',
    options: [
      { value: 'exercise', label: 'Exercise' },
      { value: 'social', label: 'Social events' },
      { value: 'work', label: 'Work' },
      { value: 'errands', label: 'Errands' },
      { value: 'chores', label: 'Chores' },
    ],
    allowMultiple: true,
  },
  brain_fog: {
    type: 'slider',
    question: 'How clear is your head right now?',
    minLabel: 'Very foggy',
    maxLabel: 'Clear',
    gradient: ['#a4c8d8', '#d0bdf4', '#b8e3d6'],
  },
  mood_connection: {
    type: 'slider',
    question: 'How is your mood right now?',
    minLabel: 'Low',
    maxLabel: 'Good',
    gradient: ['#a4c8d8', '#d0bdf4', '#b8e3d6'],
  },
  no_focus: {
    type: 'slider',
    question: 'Overall, how are you feeling?',
    minLabel: 'Struggling',
    maxLabel: 'Managing well',
    gradient: ['#f87171', '#fcd34d', '#b8e3d6'],
  },

  // Flares domain
  unknown_triggers: {
    type: 'chips',
    question: 'What happened in the last 24-48 hours?',
    options: [
      { value: 'poor_sleep', label: 'Poor sleep' },
      { value: 'stress', label: 'High stress' },
      { value: 'activity', label: 'More activity' },
      { value: 'food', label: 'Something I ate' },
      { value: 'weather', label: 'Weather change' },
      { value: 'nothing', label: 'Nothing stands out' },
    ],
    allowMultiple: true,
  },
  early_warning: {
    type: 'chips',
    question: 'Have you noticed any warning signs?',
    options: [
      { value: 'fatigue', label: 'Unusual fatigue' },
      { value: 'mood', label: 'Mood shift' },
      { value: 'aches', label: 'Diffuse aches' },
      { value: 'sleep', label: 'Sleep changes' },
      { value: 'none', label: 'None of these' },
    ],
    allowMultiple: true,
  },
  treatment_effect: {
    type: 'slider',
    question: 'How intense are your flares right now?',
    minLabel: 'Mild',
    maxLabel: 'Severe',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  flare_patterns: {
    type: 'chips',
    question: 'When did your last flare start?',
    options: [
      { value: 'now', label: 'In one right now' },
      { value: 'today', label: 'Started today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'few_days', label: 'A few days ago' },
      { value: 'none_recent', label: 'Not recently' },
    ],
    allowMultiple: false,
  },
  log_and_see: {
    type: 'slider',
    question: 'Current flare intensity',
    minLabel: 'None',
    maxLabel: 'Severe',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },

  // Migraines domain
  food_triggers: {
    type: 'chips',
    question: 'What have you had in the last 24 hours?',
    options: [
      { value: 'caffeine', label: 'Coffee or caffeine' },
      { value: 'alcohol', label: 'Alcohol' },
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'cheese', label: 'Aged cheese' },
      { value: 'none', label: 'None of these' },
    ],
    allowMultiple: true,
  },
  weather_triggers: {
    type: 'slider',
    question: 'How is your head right now?',
    minLabel: 'Fine',
    maxLabel: 'Bad headache',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  hormonal_link: {
    type: 'chips',
    question: 'Where are you in your cycle?',
    options: [
      { value: 'period', label: 'On my period' },
      { value: 'before', label: 'A few days before' },
      { value: 'ovulation', label: 'Around ovulation' },
      { value: 'luteal', label: 'After ovulation' },
      { value: 'na', label: 'Does not apply' },
    ],
    allowMultiple: false,
  },
  stress_sleep: {
    type: 'slider',
    question: 'How stressed are you right now?',
    minLabel: 'Low stress',
    maxLabel: 'High stress',
    gradient: ['#b8e3d6', '#d0bdf4', '#f87171'],
  },
  find_any_pattern: {
    type: 'slider',
    question: 'Headache intensity right now',
    minLabel: 'None',
    maxLabel: 'Severe',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },

  // IBS/Gut domain
  food_culprits: {
    type: 'slider',
    question: 'How is your gut right now?',
    minLabel: 'Fine',
    maxLabel: 'Flaring',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  stress_gut: {
    type: 'slider',
    question: 'How stressed or anxious are you?',
    minLabel: 'Calm',
    maxLabel: 'Very stressed',
    gradient: ['#b8e3d6', '#d0bdf4', '#f87171'],
  },
  timing_patterns: {
    type: 'chips',
    question: 'When are your symptoms usually worst?',
    options: [
      { value: 'morning', label: 'Morning' },
      { value: 'after_meals', label: 'After meals' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' },
      { value: 'varies', label: 'It varies' },
    ],
    allowMultiple: false,
  },
  diet_working: {
    type: 'slider',
    question: 'How are your symptoms today?',
    minLabel: 'Good',
    maxLabel: 'Bad',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  track_trends: {
    type: 'chips',
    question: 'What symptom is most present?',
    options: [
      { value: 'bloating', label: 'Bloating' },
      { value: 'pain', label: 'Abdominal pain' },
      { value: 'nausea', label: 'Nausea' },
      { value: 'diarrhea', label: 'Diarrhea' },
      { value: 'constipation', label: 'Constipation' },
      { value: 'fine', label: 'Doing okay' },
    ],
    allowMultiple: false,
  },

  // Multiple conditions domain
  symptom_overlap: {
    type: 'chips',
    question: 'What is bothering you most right now?',
    options: [
      { value: 'pain', label: 'Pain' },
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'brain_fog', label: 'Brain fog' },
      { value: 'digestive', label: 'Digestive issues' },
      { value: 'mood', label: 'Mood changes' },
    ],
    allowMultiple: false,
  },
  competing_needs: {
    type: 'chips',
    question: 'Did you take all your medications today?',
    options: [
      { value: 'all', label: 'Yes, all of them' },
      { value: 'most', label: 'Most of them' },
      { value: 'some', label: 'Only some' },
      { value: 'none', label: 'None today' },
    ],
    allowMultiple: false,
  },
  unified_view: {
    type: 'slider',
    question: 'Overall symptom level right now',
    minLabel: 'Mild',
    maxLabel: 'Severe',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  prioritize_issue: {
    type: 'chips',
    question: 'What impacts your life most right now?',
    options: [
      { value: 'pain', label: 'Pain' },
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'brain_fog', label: 'Brain fog' },
      { value: 'mobility', label: 'Mobility' },
      { value: 'mood', label: 'Mood' },
      { value: 'sleep', label: 'Sleep' },
    ],
    allowMultiple: false,
  },
  reduce_overwhelm: {
    type: 'slider',
    question: 'Overall, how are you doing right now?',
    minLabel: 'Struggling',
    maxLabel: 'Managing well',
    gradient: ['#f87171', '#fcd34d', '#b8e3d6'],
  },

  // Other domain
  find_patterns: {
    type: 'slider',
    question: 'What symptom is most present today?',
    minLabel: 'Mild',
    maxLabel: 'Severe',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  track_treatment: {
    type: 'slider',
    question: 'How is the symptom you are targeting?',
    minLabel: 'Better',
    maxLabel: 'Worse',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  doctor_log: {
    type: 'slider',
    question: 'Main symptom intensity',
    minLabel: '1',
    maxLabel: '10',
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  },
  see_trends: {
    type: 'chips',
    question: 'How do you feel compared to usual?',
    options: [
      { value: 'much_worse', label: 'Much worse' },
      { value: 'worse', label: 'Worse' },
      { value: 'same', label: 'About the same' },
      { value: 'better', label: 'Better' },
      { value: 'much_better', label: 'Much better' },
    ],
    allowMultiple: false,
  },
  just_curious: {
    type: 'slider',
    question: 'How do you feel overall right now?',
    minLabel: 'Not great',
    maxLabel: 'Good',
    gradient: ['#f87171', '#fcd34d', '#b8e3d6'],
  },
};

// Default widget for unknown pain points
const DEFAULT_WIDGET = {
  type: 'slider' as const,
  question: 'How are you feeling right now?',
  minLabel: 'Struggling',
  maxLabel: 'Managing well',
  gradient: ['#f87171', '#fcd34d', '#b8e3d6'] as [string, string, string],
};

export function Q3Step({ q1Domain, q2PainPoint, onComplete }: Q3StepProps) {
  // State for condition picker
  const [condition, setCondition] = useState(
    DEFAULT_CONDITION[q1Domain] || 'other'
  );

  // State for main widget
  const [sliderValue, setSliderValue] = useState(50);
  const [chipsValue, setChipsValue] = useState<string | string[]>([]);

  // Get widget config
  const widgetConfig = useMemo(() => {
    return WIDGET_CONFIG[q2PainPoint] || DEFAULT_WIDGET;
  }, [q2PainPoint]);

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
      condition,
      widgetType: widgetConfig.type,
      widgetValue: widgetConfig.type === 'slider' ? sliderValue : chipsValue,
    });
  };

  return (
    <div className="q3-step-container">
      {/* Header */}
      <div className="q3-step-header">
        <h2 className="q3-step-title">Let us capture your baseline</h2>
        <p className="q3-step-subtitle">
          This helps us personalize your tracking
        </p>
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
            label={widgetConfig.question}
            value={sliderValue}
            onChange={setSliderValue}
            minLabel={widgetConfig.minLabel}
            maxLabel={widgetConfig.maxLabel}
            gradient={widgetConfig.gradient}
          />
        )}

        {widgetConfig.type === 'chips' && widgetConfig.options && (
          <ChipSelector
            label={widgetConfig.question}
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
        Continue
        <MaterialIcon name="arrow_forward" size="sm" />
      </button>
    </div>
  );
}
