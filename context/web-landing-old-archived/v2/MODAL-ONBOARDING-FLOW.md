# Modal Onboarding Flow — Question & Answer Specification

> **Purpose:** Define the 4-question conversational flow for the campaign modal.
> **Goal:** Maximize signal for product development while maintaining narrative continuity.
> **Design:** One question per screen, auto-advance on selection, formal/classy aesthetic.

---

## Flow Overview

```
┌─────────────────┐
│   Q1: Entry     │  ← Universal (same for all landing pages)
│   "What brings  │
│   you here?"    │
└────────┬────────┘
         │ auto-advance on selection
         ▼
┌─────────────────┐
│  Q2: Pain Point │  ← Contextual (5 options based on Q1 selection)
│  "What's been   │
│  hardest?"      │
└────────┬────────┘
         │ auto-advance on selection
         ▼
┌─────────────────┐
│ Q3: Product-    │  ← Landing page specific
│ Specific Q1     │
└────────┬────────┘
         │ auto-advance on selection
         ▼
┌─────────────────┐
│ Q4: Product-    │  ← Landing page specific
│ Specific Q2     │
└────────┬────────┘
         │ auto-advance on selection
         ▼
┌─────────────────┐
│ Screen 5:       │
│ AI Summary +    │
│ Email Form      │
└─────────────────┘
```

---

## Question 1: Entry Point (Universal)

**Prompt:** "What brings you here today?"

| Value       | Label                               | Maps To                       |
| ----------- | ----------------------------------- | ----------------------------- |
| `fatigue`   | Fatigue that won't quit             | Long COVID, ME/CFS, Fibro     |
| `flares`    | Unpredictable flares                | Endo, PCOS, IBD, Fibro        |
| `migraines` | Migraines that derail everything    | Migraine, Cluster headaches   |
| `ibs_gut`   | IBS / Gut issues I can't figure out | IBS, SIBO, Food sensitivities |
| `multiple`  | Managing multiple conditions        | Comorbid conditions           |
| `other`     | Something else                      | Catch-all                     |

---

## Question 2: Pain Point (Contextual by Q1)

**Prompt:** "What's been hardest about managing this?"

### When Q1 = `fatigue` (Fatigue that won't quit)

| Value             | Label                                                 | Signal             |
| ----------------- | ----------------------------------------------------- | ------------------ |
| `energy_envelope` | I never know how much I can safely do                 | → Crash Prevention |
| `good_days_trap`  | Good days trick me into overdoing it                  | → Crash Prevention |
| `brain_fog`       | Brain fog makes everything harder                     | → Spoon Saver      |
| `not_understood`  | People don't understand why I can't just push through | → Doctor reports   |
| `delayed_payback` | I pay for today's effort tomorrow                     | → Flare Forecast   |

### When Q1 = `flares` (Unpredictable flares)

| Value               | Label                                                | Signal           |
| ------------------- | ---------------------------------------------------- | ---------------- |
| `cant_plan`         | I can't plan anything because I never know           | → Flare Forecast |
| `no_warning`        | They hit without warning                             | → Flare Forecast |
| `unknown_triggers`  | I don't know what's triggering them                  | → Top Suspect    |
| `cancel_constantly` | I cancel on people constantly                        | → Flare Forecast |
| `anxiety_waiting`   | I waste good days waiting for the other shoe to drop | → Flare Forecast |

### When Q1 = `migraines` (Migraines that derail everything)

| Value              | Label                                                | Signal           |
| ------------------ | ---------------------------------------------------- | ---------------- |
| `too_late_meds`    | By the time I notice, it's too late for meds to help | → Flare Forecast |
| `unknown_triggers` | I can't figure out what triggers them                | → Top Suspect    |
| `lost_days`        | I lose entire days when they hit                     | → Flare Forecast |
| `miss_warning`     | I miss the warning signs until it's too late         | → Flare Forecast |
| `no_patterns`      | I've tried tracking but can't find patterns          | → Top Suspect    |

### When Q1 = `ibs_gut` (IBS / Gut issues I can't figure out)

| Value                    | Label                                             | Signal        |
| ------------------------ | ------------------------------------------------- | ------------- |
| `unsafe_foods`           | I can't tell which foods are safe                 | → Top Suspect |
| `delayed_reactions`      | Reactions are delayed so I can't connect them     | → Top Suspect |
| `inconsistent`           | Same food, different reactions — makes no sense   | → Top Suspect |
| `elimination_exhausting` | Elimination diets are exhausting and inconclusive | → Spoon Saver |
| `eating_gamble`          | Eating out feels like a gamble                    | → Top Suspect |

### When Q1 = `multiple` (Managing multiple conditions)

| Value             | Label                                        | Signal           |
| ----------------- | -------------------------------------------- | ---------------- |
| `symptom_overlap` | I can't tell which condition is causing what | → Top Suspect    |
| `competing_needs` | What helps one thing makes another worse     | → Top Suspect    |
| `tracking_burden` | Tracking everything is a full-time job       | → Spoon Saver    |
| `medical_silos`   | My doctors don't connect the dots            | → Doctor reports |
| `all_blurs`       | It all blurs together into one bad day       | → Spoon Saver    |

### When Q1 = `other` (Something else)

| Value             | Label                                         | Signal           |
| ----------------- | --------------------------------------------- | ---------------- |
| `still_figuring`  | I'm still trying to figure out what's wrong   | → Top Suspect    |
| `not_believed`    | I don't feel believed by doctors              | → Doctor reports |
| `tracking_failed` | I've tried tracking before but it didn't help | → Spoon Saver    |
| `life_disruption` | I can't live the life I used to               | → General        |
| `want_answers`    | I just want answers                           | → Top Suspect    |

---

## Question 3: Product-Specific (by Landing Page)

### Flare Forecast (`/flare-forecast`)

**Prompt:** "How much warning would make a difference?"

| Value   | Label                               |
| ------- | ----------------------------------- |
| `hours` | A few hours to adjust my day        |
| `day`   | A day to cancel or reschedule       |
| `days`  | 2-3 days to prepare properly        |
| `any`   | Just knowing it's coming would help |

### Top Suspect (`/top-suspect`)

**Prompt:** "Which trigger are you most unsure about?"

| Value         | Label                         |
| ------------- | ----------------------------- |
| `sleep`       | Sleep quality or timing       |
| `food`        | Something I'm eating          |
| `stress`      | Stress levels                 |
| `hormones`    | Hormonal cycle                |
| `environment` | Weather or environment        |
| `unknown`     | Not sure — that's the problem |

### Crash Prevention (`/crash-prevention`)

**Prompt:** "What's your biggest pacing struggle?"

| Value           | Label                          |
| --------------- | ------------------------------ |
| `push_too_hard` | I push too hard on good days   |
| `cant_tell`     | I can't tell when to stop      |
| `ignore_signs`  | I ignore the warning signs     |
| `guilt`         | I feel guilty resting          |
| `boom_bust`     | The boom-bust cycle never ends |

### Spoon Saver (`/spoon-saver`)

**Prompt:** "What kills tracking for you?"

| Value                | Label                         |
| -------------------- | ----------------------------- |
| `too_many_questions` | Too many questions            |
| `typing`             | Having to type                |
| `remembering`        | Remembering to do it          |
| `not_worth_it`       | Doesn't feel worth the effort |
| `bad_days`           | Bad days make it impossible   |

---

## Question 4: Product-Specific (by Landing Page)

### Flare Forecast (`/flare-forecast`)

**Prompt:** "What would you do with advance notice?"

| Value         | Label                   |
| ------------- | ----------------------- |
| `rest`        | Rest before it hits     |
| `reschedule`  | Reschedule commitments  |
| `prepare`     | Stock up on what I need |
| `tell_others` | Tell people around me   |
| `all`         | All of the above        |

### Top Suspect (`/top-suspect`)

**Prompt:** "What would 'proof' look like to you?"

| Value          | Label                             |
| -------------- | --------------------------------- |
| `correlations` | Seeing correlations in my data    |
| `ranked_list`  | A ranked list of likely triggers  |
| `doctor_ready` | Something I can show my doctor    |
| `confidence`   | Enough confidence to make changes |

### Crash Prevention (`/crash-prevention`)

**Prompt:** "What would 'permission to rest' look like?"

| Value              | Label                                     |
| ------------------ | ----------------------------------------- |
| `data_limit`       | Data showing I'm at my limit              |
| `push_rest_signal` | A clear push vs. rest signal              |
| `explain_others`   | Something to explain to others            |
| `confidence_rest`  | Confidence that resting is the right call |

### Spoon Saver (`/spoon-saver`)

**Prompt:** "On your worst days, what could you manage?"

| Value     | Label                        |
| --------- | ---------------------------- |
| `one_tap` | One tap to say how I feel    |
| `voice`   | Voice note, no typing        |
| `yes_no`  | Just yes/no questions        |
| `nothing` | Nothing — that's the problem |

---

## Screen 5: AI Summary + Email

### Structure

```
┌─────────────────────────────────────┐
│                                     │
│  [Product Icon]                     │
│                                     │
│  AI-Generated Headline              │
│  (personalized to answers)          │
│                                     │
│  • Feature 1                        │
│  • Feature 2                        │
│  • Feature 3                        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  your@email.com             │    │
│  └─────────────────────────────┘    │
│                                     │
│  [ Get early access → ]             │
│                                     │
│  🔒 No spam, ever.                  │
│                                     │
└─────────────────────────────────────┘
```

### AI Summary Templates (by Product + Q1 + Q2)

Templates are selected based on:

1. Landing page (product)
2. Q1 selection (condition type)
3. Q2 selection (specific pain point)

**Example: Flare Forecast + Fatigue + "I pay for today's effort tomorrow"**

> **Headline:** "We'll help you see the crash coming before it hits."
>
> **Features:**
>
> - 48-hour early warning based on your activity patterns
> - Learn your personal "payback window" timing
> - Doctor-ready reports showing your prediction accuracy

**Example: Top Suspect + IBS/Gut + "Reactions are delayed"**

> **Headline:** "We'll find the trigger hiding 24-72 hours before your symptoms."
>
> **Features:**
>
> - Lag-effect detection that looks back 3 days
> - Weekly "Top Suspects" ranked by correlation strength
> - Evidence you can finally show your doctor

---

## Tracking Schema (Supabase)

### Tables Required

1. **`modal_sessions`** — One row per modal open
2. **`modal_responses`** — One row per question answered
3. **`ai_generations`** — AI summary shown
4. **`beta_signups`** — Email submissions

### `modal_responses` Schema (Current)

```sql
-- Existing table with new columns added via migration
CREATE TABLE modal_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modal_session_id UUID REFERENCES modal_sessions(id),

  -- Question context
  step_number INT NOT NULL,               -- Legacy: screen step
  question_number INT,                    -- NEW: question number (1-4)
  question_key TEXT NOT NULL,             -- e.g., 'q1_entry', 'q2_pain_point'
  question_text TEXT NOT NULL,            -- Full question shown

  -- Answer
  answer_value TEXT NOT NULL,             -- e.g., 'fatigue', 'good_days_trap'
  answer_label TEXT,                      -- Full label shown

  -- Context (for Q2 branching)
  previous_answer_value TEXT,             -- NEW: Q1 answer that determined Q2 options

  -- Landing page context
  product_offering TEXT,                  -- NEW: flare-forecast, top-suspect, etc.

  -- Timing
  time_to_answer_ms INT,                  -- How long to select
  was_changed BOOLEAN DEFAULT false,      -- If user changed answer

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Migration Applied:** `update_modal_schema_for_4_questions` added `previous_answer_value`, `question_number`, and `product_offering` columns.

### Data Flow

```
User clicks CTA
    ↓
modal_sessions INSERT (session_id, product, persona, utm)
    ↓
Q1 shown → user selects → modal_responses INSERT
    ↓
Q2 shown (based on Q1) → user selects → modal_responses INSERT
    ↓
Q3 shown (product-specific) → user selects → modal_responses INSERT
    ↓
Q4 shown (product-specific) → user selects → modal_responses INSERT
    ↓
AI summary generated → ai_generations INSERT
    ↓
Email submitted → beta_signups INSERT + ai_generations UPDATE (converted=true)
    ↓
modal_sessions UPDATE (completed=true)
```

---

## Metrics to Track

### Funnel Metrics

- **Modal open rate:** CTAs clicked / page views
- **Q1 completion:** Users who answer Q1 / modal opens
- **Q2 completion:** Users who answer Q2 / Q1 completions
- **Q3 completion:** Users who answer Q3 / Q2 completions
- **Q4 completion:** Users who answer Q4 / Q3 completions
- **Email submission:** Signups / Q4 completions

### Signal Metrics

- **Q1 distribution:** Which conditions are most represented
- **Q2 distribution by Q1:** Which pain points map to which conditions
- **Q3 distribution by product:** Which product features resonate
- **Q4 distribution by product:** What outcomes users want
- **Time-to-answer per question:** Engagement/confusion indicator

### Conversion Correlations

- **Q1 → Conversion:** Which condition types convert best
- **Q2 → Conversion:** Which pain points convert best
- **Q1+Q2 combo → Conversion:** Which journeys convert best
- **Product → Conversion:** Which landing pages convert best

---

## Implementation Notes

### Auto-Advance Behavior

- On option click: 300ms delay, then slide-left transition to next question
- No "Continue" button
- No back button (simplicity)
- Progress shown via subtle dots (not numbers)

### Design Principles

- **Formal/classy:** No emojis, clean typography
- **Minimal:** One question visible at a time
- **Fast:** Quick transitions, no loading states
- **Empathetic:** Questions acknowledge their struggle

### Error Handling

- If Supabase fails: Continue flow, log to console
- If AI generation fails: Use fallback template
- If email already exists: Show friendly message, still count as conversion

---

## File References

| File                                           | Purpose              |
| ---------------------------------------------- | -------------------- |
| `web-landing/v2/MODAL-ONBOARDING-FLOW.md`      | This document        |
| `web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md` | Campaign strategy    |
| `web-landing/campaign-modal.js`                | Modal implementation |
| `web-landing/tracking.html`                    | Analytics dashboard  |

---

_Last Updated: January 4, 2026_
