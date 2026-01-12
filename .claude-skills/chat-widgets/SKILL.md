---
name: chat-widgets
description: Chat component selection and creation for Clue symptom tracker. Use when building chat UI elements, selecting widgets for agent responses, or implementing interactive components. Covers 30 high-value onboarding widgets and ongoing chat widgets. NO EMOJIS - use icons from icon system.
---

# Chat Widgets

Component catalog and selection logic for Clue's chat-based symptom tracker.

## Core Principles

1. **Reduce Cognitive Load** - Every tap saved is a spoon preserved
2. **NO EMOJIS** - Use icons from our icon system (Material Icons)
3. **Max 3 Taps** - Any widget interaction should complete in 3 taps or fewer
4. **Immediate Value** - Each widget captures data that generates insight

## Widget Type Reference

```
Widget Type              | Use Case
─────────────────────────────────────────────────────────
gradient_slider          | Intensity, energy, severity (visual gradient)
time_segment_selector    | Time-of-day selections
dual_selector            | Two related questions (most common)
triple_selector          | Three related questions
multi_select_chips       | Multiple options from a list
single_slider            | One simple slider
timeline_selector        | When something started/happened
rank_selector            | Prioritize options by importance
attribution_selector     | Assign symptom to condition
multi_symptom_tracker    | Rate multiple symptoms at once
clinical_capture         | Doctor-ready data collection
```

## Widget Catalog

### 1. GradientSlider

**When:** Intensity, severity, energy levels, status ratings
**Props:** `question`, `min_label`, `max_label`, `gradient[]`
**Visual:** Horizontal track with color gradient, draggable thumb

```tsx
<GradientSlider
  question="Where is your energy right now?"
  min_label="Empty"
  max_label="Full"
  gradient={['#f87171', '#fcd34d', '#b8e3d6']}
  value={value}
  onChange={setValue}
/>
```

**Design Notes:**

- Gradient colors: red (#f87171) → yellow (#fcd34d) → mint (#b8e3d6)
- Thumb shows current value
- No numbers displayed (visual only)
- Haptic feedback on drag

### 2. TimeSegmentSelector

**When:** Daily patterns, peak energy times, symptom timing
**Props:** `question`, `segments[]`, `allow_multiple`

```tsx
<TimeSegmentSelector
  question="When do you have the most energy?"
  segments={[
    { value: 'early_morning', label: 'Early morning', time: '6-9am' },
    { value: 'late_morning', label: 'Late morning', time: '9am-12pm' },
    { value: 'afternoon', label: 'Afternoon', time: '12-5pm' },
    { value: 'evening', label: 'Evening', time: '5-9pm' },
    { value: 'varies', label: 'It varies day to day' },
  ]}
  selected={selected}
  onChange={setSelected}
/>
```

### 3. DualSelector

**When:** Two related questions that inform each other
**Props:** `part1`, `part2` (each with question + options or slider)

```tsx
<DualSelector
  part1={{
    question: 'What did you do yesterday?',
    options: [
      { value: 'exercise', label: 'Exercise or physical activity' },
      { value: 'social', label: 'Social outing or event' },
      { value: 'rest', label: 'Mostly rested' },
    ],
  }}
  part2={{
    question: 'How are you feeling today?',
    options: [
      { value: 'crashed', label: 'Crashed or wiped out' },
      { value: 'okay', label: 'About the same as usual' },
      { value: 'good', label: 'Better than usual' },
    ],
  }}
/>
```

**Design Notes:**

- Part 2 appears after Part 1 is answered
- Can mix selectors and sliders in parts
- Smooth transition animation between parts

### 4. TripleSelector

**When:** Three related data points needed
**Props:** `part1`, `part2`, `part3`

```tsx
<TripleSelector
  part1={{
    question: 'How did you sleep?',
    options: [
      { value: 'poor', label: 'Poorly' },
      { value: 'okay', label: 'Okay' },
      { value: 'good', label: 'Good' },
    ],
  }}
  part2={{
    question: 'How stressed are you?',
    options: [
      { value: 'high', label: 'High stress' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'low', label: 'Low stress' },
    ],
  }}
  part3={{
    question: 'How is your head?',
    type: 'gradient_slider',
    min_label: 'Fine',
    max_label: 'Bad',
  }}
/>
```

### 5. MultiSelectChips

**When:** Select all that apply from a list
**Props:** `question`, `instruction`, `options[]`, `allow_multiple`

```tsx
<MultiSelectChips
  question="What happened in the last 24-48 hours?"
  instruction="Select all that apply"
  options={[
    { value: 'poor_sleep', label: 'Poor sleep' },
    { value: 'stress', label: 'High stress' },
    { value: 'activity', label: 'More activity than usual' },
    { value: 'food', label: 'Something I ate' },
    { value: 'nothing', label: 'Nothing stands out' },
  ]}
  selected={selected}
  onChange={setSelected}
/>
```

**Design Notes:**

- Chips wrap horizontally
- Selected state: filled background, check icon
- "Nothing stands out" clears other selections

### 6. TimelineSelector

**When:** Establishing when something started
**Props:** `question`, `options[]`, `follow_up?`

```tsx
<TimelineSelector
  question="When did your current or last flare start?"
  options={[
    { value: 'now', label: 'In one right now' },
    { value: 'today', label: 'Started today' },
    { value: 'yesterday', label: 'Started yesterday' },
    { value: 'few_days', label: 'A few days ago' },
    { value: 'none_recent', label: 'Have not had one recently' },
  ]}
  follow_up={{
    question: 'Is this connected to your cycle?',
    options: [
      { value: 'yes', label: 'Yes, seems related' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Does not apply to me' },
    ],
  }}
/>
```

### 7. RankSelector

**When:** Prioritizing issues by impact
**Props:** `question`, `instruction`, `options[]`, `max_selections`, `ranked`

```tsx
<RankSelector
  question="What impacts your life most right now?"
  instruction="Rank your top 3 by impact"
  options={[
    { value: 'pain', label: 'Pain' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'brain_fog', label: 'Brain fog' },
    { value: 'mood', label: 'Mood' },
    { value: 'sleep', label: 'Sleep' },
  ]}
  max_selections={3}
  ranked={true}
/>
```

**Design Notes:**

- Numbers appear as user selects (1, 2, 3)
- Drag to reorder or tap to remove
- Clear visual hierarchy of importance

### 8. AttributionSelector

**When:** Linking symptom to condition (multiple conditions)
**Props:** `question`, `options[]`, `follow_up`

```tsx
<AttributionSelector
  question="What is bothering you most right now?"
  options={[
    { value: 'pain', label: 'Pain' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'brain_fog', label: 'Brain fog' },
  ]}
  follow_up={{
    question: 'Which condition do you think is causing it?',
    options: 'dynamic_from_condition_picker',
  }}
/>
```

### 9. MultiSymptomTracker

**When:** Rating several symptoms simultaneously
**Props:** `question`, `instruction`, `symptoms[]`, `intensity_scale`

```tsx
<MultiSymptomTracker
  question="Rate your current symptoms"
  instruction="Tap each that applies and set intensity"
  symptoms={[
    { value: 'pain', label: 'Pain' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'brain_fog', label: 'Brain fog' },
    { value: 'mood', label: 'Mood' },
  ]}
  intensity_scale={{
    min: 0,
    max: 10,
    gradient: ['#b8e3d6', '#fcd34d', '#f87171'],
  }}
/>
```

### 10. ClinicalCapture

**When:** Doctor-ready data collection
**Props:** `question`, `parts[]`

```tsx
<ClinicalCapture
  question="Let us capture today for your records"
  parts={[
    {
      id: 'symptom',
      question: 'Main symptom',
      type: 'select',
      options: [
        { value: 'pain', label: 'Pain' },
        { value: 'fatigue', label: 'Fatigue' },
      ],
    },
    {
      id: 'intensity',
      question: 'Intensity',
      type: 'gradient_slider',
      min_label: '1',
      max_label: '10',
    },
    {
      id: 'interference',
      question: 'How much did it interfere with your day?',
      type: 'select',
      options: [
        { value: 'none', label: 'Not at all' },
        { value: 'severe', label: 'Severely' },
      ],
    },
  ]}
/>
```

---

## Condition Picker (Required for Q3)

Every Q3 widget starts with a condition confirmation:

```tsx
<ConditionPicker
  question="Is this about your fatigue?"
  suggested="fatigue"
  alternatives={['chronic_fatigue', 'pem', 'general_energy']}
  onConfirm={setCondition}
/>
```

**Design Notes:**

- Auto-suggests based on Q1 selection
- One tap to confirm
- "No, it's about..." reveals alternatives
- Attached to all subsequent widget data

---

## 30 Onboarding Widgets (Q2 → Q3 Mapping)

### FATIGUE Domain (Widgets 1-5)

| Q2 Selection      | Widget Name             | Type                  | Captures                     |
| :---------------- | :---------------------- | :-------------------- | :--------------------------- |
| `energy_envelope` | Time-of-Day Energy Map  | time_segment_selector | Daily energy pattern         |
| `good_days_trap`  | Activity Impact Tracker | dual_selector         | Activity → crash correlation |
| `brain_fog`       | Sleep-to-Clarity Check  | dual_selector         | Sleep → fog correlation      |
| `mood_connection` | Energy-Mood Snapshot    | dual_slider           | Energy-mood correlation      |
| `no_focus`        | Open Baseline           | dual_selector         | General baseline             |

### FLARES Domain (Widgets 6-10)

| Q2 Selection       | Widget Name           | Type               | Captures                     |
| :----------------- | :-------------------- | :----------------- | :--------------------------- |
| `unknown_triggers` | Yesterday's Suspects  | multi_select_chips | Trigger inventory            |
| `early_warning`    | Current Warning Signs | multi_select_chips | Prodrome symptoms            |
| `treatment_effect` | Treatment Check-in    | dual_selector      | Treatment-flare correlation  |
| `flare_patterns`   | Flare Timeline        | timeline_selector  | Temporal patterns            |
| `log_and_see`      | Flare Snapshot        | triple_selector    | Intensity, symptom, location |

### MIGRAINES Domain (Widgets 11-15)

| Q2 Selection       | Widget Name                    | Type               | Captures                      |
| :----------------- | :----------------------------- | :----------------- | :---------------------------- |
| `food_triggers`    | Recent Intake Review           | multi_select_chips | Food-migraine correlation     |
| `weather_triggers` | Weather Sensitivity            | dual_selector      | Weather-headache correlation  |
| `hormonal_link`    | Cycle Position Check           | dual_selector      | Hormonal-migraine correlation |
| `stress_sleep`     | Stress-Sleep-Migraine Triangle | triple_selector    | Multi-factor baseline         |
| `find_any_pattern` | Migraine Snapshot              | quad_selector      | Full migraine profile         |

### IBS/GUT Domain (Widgets 16-20)

| Q2 Selection      | Widget Name           | Type          | Captures                   |
| :---------------- | :-------------------- | :------------ | :------------------------- |
| `food_culprits`   | Meal Review           | dual_selector | Food-reaction timing       |
| `stress_gut`      | Stress-Gut Connection | dual_slider   | Stress-gut correlation     |
| `timing_patterns` | Time-of-Day Gut Check | dual_selector | Temporal gut pattern       |
| `diet_working`    | Diet Adherence Check  | dual_selector | Diet-symptom correlation   |
| `track_trends`    | Gut Snapshot          | dual_selector | Primary symptom, intensity |

### MULTIPLE CONDITIONS Domain (Widgets 21-25)

| Q2 Selection       | Widget Name            | Type                  | Captures                |
| :----------------- | :--------------------- | :-------------------- | :---------------------- |
| `symptom_overlap`  | Symptom Attribution    | attribution_selector  | Symptom-condition link  |
| `competing_needs`  | Med Conflict Check     | dual_selector         | Medication interactions |
| `unified_view`     | Multi-Symptom Snapshot | multi_symptom_tracker | Multi-symptom baseline  |
| `prioritize_issue` | Priority Rank          | rank_selector         | Impact ranking          |
| `reduce_overwhelm` | Minimal Check          | single_slider         | Overall status          |

### OTHER Domain (Widgets 26-30)

| Q2 Selection      | Widget Name       | Type             | Captures                      |
| :---------------- | :---------------- | :--------------- | :---------------------------- |
| `find_patterns`   | Pattern Start     | dual_selector    | Symptom-context baseline      |
| `track_treatment` | Treatment Tracker | dual_selector    | Treatment efficacy            |
| `doctor_log`      | Clinical Snapshot | clinical_capture | Clinically-relevant data      |
| `see_trends`      | Trend Baseline    | dual_selector    | Relative status               |
| `just_curious`    | Discovery Mode    | dual_selector    | Overall feeling, observations |

---

## Q4 Value Propositions (by Widget Category)

| Category              | Q2 Options                                                                                          | Screen 4 Promise                                        |
| :-------------------- | :-------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **Prediction**        | energy_envelope, early_warning, flare_patterns, weather_triggers, hormonal_link                     | "Give us a few days, we'll predict your next [symptom]" |
| **Trigger Discovery** | good_days_trap, brain_fog, unknown_triggers, food_triggers, stress_sleep, food_culprits, stress_gut | "We're already building your trigger profile"           |
| **Validation**        | treatment_effect, diet_working, track_treatment, doctor_log                                         | "You now have evidence your doctor can see"             |
| **Pattern Finding**   | no_focus, log_and_see, find_any_pattern, track_trends, find_patterns, see_trends, just_curious      | "Patterns are forming - check back tomorrow"            |
| **Multi-Condition**   | symptom_overlap, competing_needs, unified_view, prioritize_issue, reduce_overwhelm                  | "One dashboard for everything you're managing"          |

---

## Chat Widgets (Post-Onboarding)

### VoiceNote

**When:** User energy is low, typing is hard, flare mode active
**Props:** `onRecordComplete`, `maxDuration=60`

```tsx
<VoiceNote
  onRecordComplete={(audio, transcript) => processVoice(audio, transcript)}
/>
```

### QuickTapChip

**When:** One-tap logging, frequent actions
**Props:** `label`, `icon?`, `onTap`, `variant`

```tsx
<QuickTapChip icon="bedtime" label="Poor sleep" onTap={logPoorSleep} />
```

### MemoryCard

**When:** Showing remembered context, pattern detection
**Props:** `icon`, `text`, `timestamp?`

```tsx
<MemoryCard icon="psychology" text="Remembering last 3 days..." />
```

### ContextTag

**When:** Inline context references in messages
**Props:** `label`, `variant='sleep'|'stress'|'symptom'|'driver'`

```tsx
<ContextTag label="poor sleep" variant="sleep" />
```

---

## Flare Mode Adaptations

When `flareMode=true`:

- Reduce options (top 3-5 only)
- Larger touch targets (+20%)
- Voice note prominent
- Skip optional fields
- One question at a time
- Muted animations

---

## Styling Tokens

```css
/* Widget Colors */
--widget-bg: var(--bg-cream); /* #FDFBF9 */
--widget-border: var(--primary-10); /* rgba(32,19,46,0.1) */
--widget-selected: var(--accent-purple); /* #D0BDF4 */

/* Gradient Colors (for sliders) */
--gradient-low: #b8e3d6; /* Mint - good/low */
--gradient-mid: #fcd34d; /* Yellow - moderate */
--gradient-high: #f87171; /* Rose - intense/high */

/* Touch Targets */
--tap-target-min: 48px;
--tap-target-large: 56px;

/* Radius */
--widget-radius: 16px;
--chip-radius: 9999px;
```

---

## Implementation Notes

- **NO EMOJIS** - Use Material Icons or custom icons
- All widgets save immediately on interaction (no submit buttons)
- Smooth transitions between parts (300ms ease-out)
- Haptic feedback on selection (iOS/Android)
- Support both light/dark themes via CSS variables
- Accessible: screen reader labels, WCAG 2.1 AA color contrast

---

## Web Implementation (web-landing-next)

The following components are implemented in `web-landing-next/src/components/widgets/`:

### ConditionPicker

**File:** `ConditionPicker.tsx`
**Props:** `domain`, `selected`, `onChange`

Confirms the user's specific condition based on Q1 domain selection. Maps to conditions from `illness.md`.

```tsx
import { ConditionPicker } from '@/components/widgets';

<ConditionPicker
  domain="fatigue" // From Q1 response
  selected={condition}
  onChange={setCondition}
/>;
```

**Condition mappings:** `web-landing-next/src/content/conditions.ts`

### GradientSlider

**File:** `GradientSlider.tsx`
**Props:** `label`, `value`, `onChange`, `minLabel`, `maxLabel`, `gradient`, `showValue`

Visual slider with color gradient for intensity/severity/energy scales.

```tsx
import { GradientSlider } from '@/components/widgets';

<GradientSlider
  label="Where is your energy right now?"
  value={sliderValue}
  onChange={setSliderValue}
  minLabel="Empty"
  maxLabel="Full"
  gradient={['#f87171', '#fcd34d', '#b8e3d6']}
/>;
```

### ChipSelector

**File:** `ChipSelector.tsx`
**Props:** `label`, `instruction`, `options`, `selected`, `onChange`, `allowMultiple`, `maxSelect`

Single or multi-select chip group for symptoms, triggers, etc.

```tsx
import { ChipSelector } from '@/components/widgets';

<ChipSelector
  label="What happened in the last 24-48 hours?"
  instruction="Select all that apply"
  options={[
    { value: 'poor_sleep', label: 'Poor sleep' },
    { value: 'stress', label: 'High stress' },
    { value: 'nothing', label: 'Nothing stands out' },
  ]}
  selected={chipsValue}
  onChange={setChipsValue}
  allowMultiple={true}
/>;
```

### Q3Step

**File:** `web-landing-next/src/components/modal/Q3Step.tsx`

Combines ConditionPicker + main widget into a single Q3 step. Automatically selects the appropriate widget based on Q2 pain point.

```tsx
import { Q3Step } from '@/components/modal/Q3Step';

<Q3Step
  q1Domain="fatigue"
  q2PainPoint="energy_envelope"
  onComplete={(data) => {
    // data: { condition, widgetType, widgetValue }
    handleQ3Complete(data);
  }}
/>;
```

### CSS Classes

Styles are in `web-landing-next/src/app/globals.css`:

```css
.condition-picker-container
.condition-picker-option
.condition-picker-option.selected
.gradient-slider-container
.gradient-slider-input
.chip-selector-container
.chip-selector-chip
.chip-selector-chip.selected
.q3-step-container
.q3-continue-btn
```
