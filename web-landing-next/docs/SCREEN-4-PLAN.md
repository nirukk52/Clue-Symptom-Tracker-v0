# Screen 4 Plan: Value Bridge + Immediate Win

> "Onboarding should feel like a result, not just setup."

---

## Core Concept

**Problem:** Most trackers make onboarding feel like paperwork. Users complete setup but don't feel they've accomplished anything.

**Solution:** Screen 4 shows an **immediate value preview** - a personalized "watch list" based on Q1-Q3 inputs. The user sees what Clue will actively monitor for them in the next 7 days.

---

## Screen 4 Structure

### 1. Progress Confirmation (Brief)

```
✓ Baseline captured
```

_One line, muted. Don't dwell on "you completed setup."_

### 2. IMMEDIATE VALUE PREVIEW (Hero Section)

**Headline:**

> "Based on what you told us, here's what we'll watch for in the next 7 days"

**Personalized Watch List Card:**

```
┌─────────────────────────────────────────────────┐
│  YOUR NEXT 7 DAYS                               │
│                                                 │
│  Watching for:                                  │
│  ─────────────────────────────────────────────  │
│  ○ [Dynamic item 1 based on Q2]                 │
│  ○ [Dynamic item 2 based on Q3 data]            │
│  ○ [Dynamic item 3 - condition-specific]        │
│                                                 │
│  Starting point: [Q3 baseline summary]          │
│  ─────────────────────────────────────────────  │
│  📊 First insight in ~3 days                    │
└─────────────────────────────────────────────────┘
```

### 3. Save Progress CTA

```
Save your progress to start learning

[🔵 Continue with Google]

or enter email
```

### 4. Trust Signal (Footer)

```
Your data stays on your device until you choose to sync
```

---

## Watch List Generation Logic

### By Q4 Value Category

#### PREDICTION_BASED

_Q2: energy_envelope, early_warning, flare_patterns, weather_triggers, hormonal_link_

**Watch List Items:**
| Q2 Selection | Item 1 | Item 2 | Item 3 |
|--------------|--------|--------|--------|
| `energy_envelope` | "Your daily energy rhythm" | "When you crash vs thrive" | "Patterns in your peak hours" |
| `early_warning` | "Subtle warning signs before flares" | "Your body's early signals" | "24-48h pre-flare patterns" |
| `flare_patterns` | "When your flares typically hit" | "Time-of-month patterns" | "Activity → flare delays" |
| `weather_triggers` | "Barometric pressure correlations" | "Weather change → headache timing" | "Your weather sensitivity score" |
| `hormonal_link` | "Cycle phase → migraine patterns" | "Your hormonal trigger window" | "When to prep for attacks" |

**Starting Point Format:**

- `energy_envelope`: "Energy at [X]% right now"
- `early_warning`: "Warning signs today: [list or 'none yet']"
- `flare_patterns`: "Last flare: [recency]"
- `weather_triggers`: "Head status: [X/100]"
- `hormonal_link`: "Cycle phase: [phase]"

---

#### TRIGGER_DISCOVERY

_Q2: good_days_trap, brain_fog, unknown_triggers, food_triggers, stress_sleep, food_culprits, stress_gut_

**Watch List Items:**
| Q2 Selection | Item 1 | Item 2 | Item 3 |
|--------------|--------|--------|--------|
| `good_days_trap` | "Activity → crash correlations" | "Which activities cost extra spoons" | "Your energy payback timeline" |
| `brain_fog` | "Sleep → clarity connections" | "What clears vs clouds your head" | "Your fog trigger profile" |
| `unknown_triggers` | "Suspect testing: [Q3 selections]" | "24-48h lag effect patterns" | "Your trigger confidence scores" |
| `food_triggers` | "Food → migraine correlations" | "Time delay patterns" | "Your personal food risk list" |
| `stress_sleep` | "Stress vs sleep as triggers" | "Which matters more for you" | "Your stress threshold" |
| `food_culprits` | "Meal → reaction timing" | "Safe foods vs risky foods" | "Your gut trigger profile" |
| `stress_gut` | "Stress → gut correlations" | "Your brain-gut connection" | "Stress threshold for symptoms" |

**Starting Point Format:**

- `good_days_trap`: "Suspects: [activity list]"
- `brain_fog`: "Clarity: [X/100]"
- `unknown_triggers`: "Testing: [trigger list]"
- `food_triggers`: "Tracking: [food list]"
- etc.

---

#### VALIDATION

_Q2: treatment_effect, diet_working, track_treatment, doctor_log_

**Watch List Items:**
| Q2 Selection | Item 1 | Item 2 | Item 3 |
|--------------|--------|--------|--------|
| `treatment_effect` | "Treatment → flare correlation" | "Is your protocol working?" | "Data for your next appointment" |
| `diet_working` | "Diet adherence → symptoms" | "Is your diet paying off?" | "Evidence for adjustments" |
| `track_treatment` | "Treatment impact measurement" | "Before vs after comparison" | "Real efficacy data" |
| `doctor_log` | "Clinical-grade symptom log" | "Interference with daily life" | "Doctor-ready export building" |

**Starting Point Format:**

- Show Q3 baseline as "Day 1 record"
- Example: "Symptom intensity: 6/10 • Interference: Moderate"

---

#### PATTERN_FINDING

_Q2: no_focus, log_and_see, find_any_pattern, track_trends, find_patterns, see_trends, just_curious_

**Watch List Items:**
| Q2 Selection | Item 1 | Item 2 | Item 3 |
|--------------|--------|--------|--------|
| `no_focus` | "Whatever patterns emerge" | "Surprises in your data" | "Connections you haven't seen" |
| `log_and_see` | "Flare frequency and timing" | "Intensity trends" | "Unexpected correlations" |
| `find_any_pattern` | "Headache frequency" | "Location patterns" | "Duration trends" |
| `track_trends` | "Symptom type frequency" | "Weekly trends" | "Good day vs bad day patterns" |
| `find_patterns` | "Symptom → context links" | "What precedes bad days" | "Hidden triggers" |
| `see_trends` | "Week-over-week changes" | "Your baseline vs now" | "Long-term direction" |
| `just_curious` | "Body observations over time" | "What your data reveals" | "Insights you didn't expect" |

**Starting Point Format:**

- "Baseline captured • Patterns emerging in ~3 days"

---

#### MULTI_CONDITION

_Q2: symptom_overlap, competing_needs, unified_view, prioritize_issue, reduce_overwhelm_

**Watch List Items:**
| Q2 Selection | Item 1 | Item 2 | Item 3 |
|--------------|--------|--------|--------|
| `symptom_overlap` | "Which condition → which symptom" | "Overlap patterns" | "Attribution confidence" |
| `competing_needs` | "Medication timing optimization" | "Conflict identification" | "Side effect patterns" |
| `unified_view` | "All symptoms in one dashboard" | "Cross-condition patterns" | "Unified timeline" |
| `prioritize_issue` | "Impact tracking for: [top issue]" | "Priority changes over time" | "Where to focus energy" |
| `reduce_overwhelm` | "Minimal tracking, maximum insight" | "One-number trends" | "Simple progress tracking" |

**Starting Point Format:**

- `symptom_overlap`: "Today's main issue: [symptom]"
- `prioritize_issue`: "Priority #1: [issue]"
- `reduce_overwhelm`: "Overall: [X/100]"

---

## Component Implementation

### WatchListPreview.tsx

```tsx
interface WatchListPreviewProps {
  q1Domain: string; // fatigue, flares, migraines, etc.
  q2PainPoint: string; // energy_envelope, unknown_triggers, etc.
  q3Data: {
    condition: string;
    widgetType: string;
    widgetValue: number | string | string[];
  };
}

// Returns personalized watch list based on inputs
function generateWatchList(props: WatchListPreviewProps): WatchListItem[] {
  const { q2PainPoint, q3Data } = props;

  // Get category
  const category = getValueCategory(q2PainPoint);

  // Get watch items for this Q2 selection
  const items = WATCH_LIST_CONFIG[q2PainPoint];

  // Format baseline from Q3
  const baseline = formatBaseline(q2PainPoint, q3Data);

  return { items, baseline, category };
}
```

### Visual Design

```css
.watch-list-card {
  background: linear-gradient(
    135deg,
    var(--bg-cream) 0%,
    var(--accent-purple-10) 100%
  );
  border: 2px solid var(--accent-purple);
  border-radius: 20px;
  padding: 24px;
}

.watch-list-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 16px;
}

.watch-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--primary-10);
}

.watch-list-item::before {
  content: '○';
  color: var(--accent-peach);
  font-size: 0.875rem;
}

.watch-list-baseline {
  background: var(--primary-5);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 16px;
  font-size: 0.875rem;
}

.watch-list-eta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--text-muted);
  font-size: 0.8125rem;
}
```

---

## Example Screens

### Fatigue → Energy Envelope

```
┌─────────────────────────────────────────────────┐
│  YOUR NEXT 7 DAYS                               │
│                                                 │
│  Watching for:                                  │
│  ─────────────────────────────────────────────  │
│  ○ Your daily energy rhythm                     │
│  ○ When you crash vs when you thrive            │
│  ○ Patterns in your peak energy hours           │
│                                                 │
│  Starting point                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Energy right now: 35%                  │    │
│  │  Condition: ME/CFS                      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  📊 First insight in ~3 days                    │
└─────────────────────────────────────────────────┘

Save your progress to start learning

      [🔵 Continue with Google]

           or enter email
```

### Flares → Unknown Triggers

```
┌─────────────────────────────────────────────────┐
│  YOUR NEXT 7 DAYS                               │
│                                                 │
│  Watching for:                                  │
│  ─────────────────────────────────────────────  │
│  ○ Suspect testing: poor sleep, stress          │
│  ○ 24-48 hour lag effect patterns               │
│  ○ Your trigger confidence scores               │
│                                                 │
│  Starting point                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Testing: Poor sleep, High stress       │    │
│  │  Condition: Fibromyalgia                │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  📊 First insight in ~3 days                    │
└─────────────────────────────────────────────────┘
```

### Multiple Conditions → Reduce Overwhelm

```
┌─────────────────────────────────────────────────┐
│  YOUR NEXT 7 DAYS                               │
│                                                 │
│  Watching for:                                  │
│  ─────────────────────────────────────────────  │
│  ○ Minimal tracking, maximum insight            │
│  ○ One-number trends over time                  │
│  ○ Simple progress without overwhelm            │
│                                                 │
│  Starting point                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Overall status: 42%                    │    │
│  │  Managing: Multiple conditions          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  📊 First insight in ~3 days                    │
└─────────────────────────────────────────────────┘
```

---

## Why This Works

1. **Immediate Gratification**: User sees concrete output from their input
2. **Future Promise**: Creates anticipation for "first insight in ~3 days"
3. **Personalization Proof**: Watch list items directly reflect their answers
4. **Commitment Device**: "Don't lose your starting point" motivates sign-up
5. **Reduces Anxiety**: User knows exactly what will happen next

---

## Metrics to Track

| Metric             | Target | Why                                   |
| ------------------ | ------ | ------------------------------------- |
| Q3 → Q4 completion | >90%   | Watch list should be compelling       |
| Time on Screen 4   | 15-30s | Reading watch list, not bouncing      |
| CTA click rate     | >60%   | Watch list creates desire to continue |
| Google vs Email    | 70/30  | Google should dominate                |

---

## Implementation Priority

1. **Phase 1**: Static watch list items by Q2 selection
2. **Phase 2**: Dynamic baseline formatting from Q3 data
3. **Phase 3**: Animated card reveal on Q4 load
4. **Phase 4**: Progress ring showing "7 days" countdown post-signup

---

_"The best onboarding doesn't feel like onboarding. It feels like the product already working for you."_
