# Landing Page Implementation Plan

> **Goal:** Create 3 beautiful, trustworthy landing pages — one per ad group.
> **Reference Design:** `predict-flares.html` (base) + makevisible.com (inspiration)
> **Design System:** `.claude-skills/frontend-design/SKILL.md`

---

## Overview

| Page                 | File                    | URL                 | Ad Group Theme              |
| :------------------- | :---------------------- | :------------------ | :-------------------------- |
| **Flare Forecast**   | `flare-forecast.html`   | `/flare-forecast`   | Time-Based ("WHEN")         |
| **Top Suspect**      | `top-suspect.html`      | `/top-suspect`      | Variable-Based ("WHICH")    |
| **Crash Prevention** | `crash-prevention.html` | `/crash-prevention` | Action-Based ("WHAT TO DO") |

---

## Design Principles (No AI Slop)

### From makevisible.com (Inspiration)

1. **Clean whitespace** — Breathable layouts, not cramped
2. **Single-focus hero** — One clear promise, one primary CTA
3. **Proof through UI mockups** — Show the product, not abstract illustrations
4. **Trust signals** — Privacy, offline-first, user testimonials
5. **Soft gradients** — Subtle color transitions, not harsh
6. **Real data previews** — Show actual insights, not generic text

### From Design System (Mandatory)

1. **Background:** Warm cream `#FDFBF9` (not pure white)
2. **Typography:** Fraunces (display) + DM Sans (body)
3. **Corners:** Generous radius (`16px`+ for cards, `32px` for hero elements)
4. **Shadows:** Soft, low-opacity (`rgba(32, 20, 46, 0.08)`)
5. **Accents:** Pastel blobs (purple, mint, peach, blue) — decorative only
6. **Touch targets:** Large (minimum 48px)

---

## Shared Infrastructure (Copy from predict-flares.html)

All 3 pages share:

```
✅ Head section (meta, fonts, Tailwind config, styles)
✅ Glass navigation bar
✅ Parallax blob animations
✅ Email signup modal (with Supabase tracking)
✅ Footer
✅ Tracking script (UTM capture, page_view, cta_click, signup_complete)
```

### Tracking Configuration

Each page needs unique `PAGE_ID`:

| Page             | PAGE_ID                    |
| :--------------- | :------------------------- |
| Flare Forecast   | `flare_forecast_landing`   |
| Top Suspect      | `top_suspect_landing`      |
| Crash Prevention | `crash_prevention_landing` |

---

## Page 1: `/flare-forecast` (Time-Based)

### Hero Section

```
Badge: "⏱️ See it before it hits"
H1: "Your flares have a forecast."
H2: "Get a 48-hour heads up based on your body's patterns. Stop being blindsided."
Primary CTA: "See your forecast" → opens modal
Secondary CTA: "How prediction works" → scrolls to #insights
```

### Hero Visual (Right Side Card)

**Concept:** A "weather forecast" style card showing symptom predictions

```
┌─────────────────────────────────────────────┐
│  📅 Your Next 48 Hours                      │
├─────────────────────────────────────────────┤
│  TODAY         │  TOMORROW      │  Day 3    │
│  ☀️ Low Risk   │  ⛅ Elevated    │  🌧️ High  │
│  Energy: 7/10  │  Energy: 5/10  │  Flare    │
│                │  Warning signs │  likely   │
├─────────────────────────────────────────────┤
│  ⚠️ Sleep deficit detected (2 nights)       │
│  Historically, this pattern leads to flares │
│  80% of the time within 48h.                │
└─────────────────────────────────────────────┘
```

### Focus Feature Section

**Section ID:** `#lag-effect`

**Title:** "Your body has a 24-48 hour delay. We track it."

**Content:**

- Card showing "Lag Effect Detected" timeline
- Visual: Trigger → Warning Signs → Full Flare (Day 1 → Day 2 → Day 3)
- Copy: "Most people don't realize their flares start 24-48 hours _after_ the trigger, not immediately."

### Remaining Sections (Same as predict-flares.html)

1. Flare Mode
2. Quick Check-ins
3. Doctor Pack
4. Multiple Conditions
5. Closing CTA

---

## Page 2: `/top-suspect` (Variable-Based)

### Hero Section

```
Badge: "🔍 Find the culprit"
H1: "Stop guessing what's making you sick."
H2: "Was it the pizza, the weather, or the stress? Get evidence-based answers."
Primary CTA: "Find your trigger" → opens modal
Secondary CTA: "See an example" → scrolls to #patterns
```

### Hero Visual (Right Side Card)

**Concept:** A "Top Suspects" ranking card

```
┌─────────────────────────────────────────────┐
│  🔍 This Week's Top Suspects                │
├─────────────────────────────────────────────┤
│  1. 🌙 Poor Sleep          78% correlation  │
│     ████████████████░░░░                    │
│                                             │
│  2. 😰 High Stress         65% correlation  │
│     █████████████░░░░░░░                    │
│                                             │
│  3. 🍕 Food (Dairy)        23% correlation  │
│     ████░░░░░░░░░░░░░░░                     │
├─────────────────────────────────────────────┤
│  ✅ Based on 14 days of tracking            │
│  "Your fatigue spikes 40% on days after     │
│   less than 6 hours of sleep."              │
└─────────────────────────────────────────────┘
```

### Focus Feature Section

**Section ID:** `#patterns`

**Title:** "Connect the dots your brain can't."

**Content:**

- Card showing correlation analysis between variables
- Visual: Sleep/Stress/Food/Cycle → mapped to Symptoms
- Copy: "Track sleep, stress, food, and cycle. Let the app find the hidden connections."

### Remaining Sections (Reordered)

1. **Patterns / Insights** (FIRST - focus feature)
2. Quick Check-ins
3. Flare Mode
4. Doctor Pack
5. Multiple Conditions
6. Closing CTA

---

## Page 3: `/crash-prevention` (Action-Based)

### Hero Section

```
Badge: "🛡️ Prevent the crash"
H1: "Know when to stop before it's too late."
H2: "Get daily alerts when you're approaching your limit. Break the boom-bust cycle."
Primary CTA: "Start preventing crashes" → opens modal
Secondary CTA: "How pacing works" → scrolls to #pacing
```

### Hero Visual (Right Side Card)

**Concept:** An "Energy Budget" / battery gauge card

```
┌─────────────────────────────────────────────┐
│  🔋 Today's Energy Budget                   │
├─────────────────────────────────────────────┤
│                                             │
│   ████████████░░░░░░░░░░░░  58%            │
│   ▲ You're in the yellow zone               │
│                                             │
├─────────────────────────────────────────────┤
│  Today is a REST day                        │
│  Based on: Poor sleep + Yesterday's         │
│  activity level                             │
├─────────────────────────────────────────────┤
│  💡 Suggested:                              │
│  • Light activity only                      │
│  • Cancel non-essential plans               │
│  • Early bedtime tonight                    │
└─────────────────────────────────────────────┘
```

### Focus Feature Section

**Section ID:** `#pacing`

**Title:** "Stop paying tomorrow for what you did today."

**Content:**

- Card showing "Push Day vs Rest Day" indicator
- Visual: Battery gauge with green/yellow/red zones
- Copy: "Wake up knowing if today is a push day or a rest day. The app reads your patterns and tells you before you overdo it."

### Remaining Sections (Reordered)

1. **Pacing Alerts** (FIRST - focus feature)
2. Flare Mode
3. Quick Check-ins
4. Doctor Pack
5. Multiple Conditions
6. Closing CTA

---

## Tracking URLs (For Reference)

### Page 1: `/flare-forecast`

```
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=flare_forecast
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=early_warning
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=2_day_lookahead
```

### Page 2: `/top-suspect`

```
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=top_suspect
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=the_culprit
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=identify_trigger
```

### Page 3: `/crash-prevention`

```
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=crash_prevention
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=rest_day_alert
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=energy_budget
```

---

## Implementation Order

### Phase 1: Base Template (1 hour)

1. Copy `predict-flares.html` → `flare-forecast.html`
2. Update `PAGE_ID`, meta title, meta description
3. Test tracking works

### Phase 2: Flare Forecast Page (2 hours)

1. Replace hero section with forecast-themed content
2. Create "48h Forecast" card visual
3. Replace Insights section with "Lag Effect" focus
4. Test all CTAs and modal

### Phase 3: Top Suspect Page (2 hours)

1. Copy `flare-forecast.html` → `top-suspect.html`
2. Replace hero with "culprit" themed content
3. Create "Top Suspects Ranking" card visual
4. Replace focus section with "Pattern Detection" content
5. Reorder sections: Patterns first

### Phase 4: Crash Prevention Page (2 hours)

1. Copy `top-suspect.html` → `crash-prevention.html`
2. Replace hero with "pacing" themed content
3. Create "Energy Budget" gauge visual
4. Replace focus section with "Pacing Alerts" content
5. Reorder sections: Pacing first

### Phase 5: QA & Deploy (1 hour)

1. Test all 3 pages on mobile
2. Test all tracking (page_view, cta_click, signup)
3. Verify UTM parameters flow through to Supabase
4. Deploy to Vercel

---

## Files to Create

| File                                | Status    |
| :---------------------------------- | :-------- |
| `web-landing/flare-forecast.html`   | To create |
| `web-landing/top-suspect.html`      | To create |
| `web-landing/crash-prevention.html` | To create |

---

## Anti-Patterns to Avoid

❌ **AI Slop:**

- Generic "Join our community" copy
- Abstract illustrations that don't show product
- Vague promises ("Transform your health journey")
- Stock photo people smiling

✅ **Instead:**

- Specific, concrete promises ("48-hour warning")
- UI mockups showing actual app functionality
- Data-driven language ("78% correlation", "Based on 14 days")
- Real problem language ("Was it the pizza or the stress?")

---

## Visual Reference: makevisible.com

**What to steal:**

- Clean card layouts with subtle shadows
- Single-color accent highlights (not rainbow)
- Generous padding in cards
- Simple iconography (Material Symbols)
- "How it works" sections with numbered steps
- Social proof / testimonial placement

**What to avoid:**

- Their specific colors (we use our own palette)
- Their exact layouts (maintain our identity)

---

_Plan created: January 2, 2026_
