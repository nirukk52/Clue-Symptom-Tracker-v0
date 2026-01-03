# Clue — Symptom & Mood Tracker

> **Predict your next flare before it hits.** A symptom tracker that learns your body's patterns and gives you a heads up — so you can prepare, not just react.

---

## 🎯 Validated Product Direction (Jan 2026)

### What We Learned

After running "The Clarity Experiment" ($100 Reddit campaign testing 3 pain points), **Pattern Discovery / Prediction** won decisively:

| Ad Group                             | Clicks    | CPC   |
| :----------------------------------- | :-------- | :---- |
| **predict_flares**                   | **59**    | $0.05 |
| find_triggers                        | 13        | $0.05 |
| Others (exhaustion, doctor mistrust) | < 10 each | —     |

**Prediction beat trigger-finding by 4.5x.** Users want to know what's coming, not just what happened.

### Current Test: Prediction Depth Test

We're now testing _which type_ of prediction resonates most:

| Ad Group          | Theme          | Core Promise                            |
| :---------------- | :------------- | :-------------------------------------- |
| **The Forecast**  | Time-Based     | "I'll know **WHEN** it's coming"        |
| **The Culprit**   | Variable-Based | "I'll know **WHICH** trigger caused it" |
| **The Preventer** | Action-Based   | "I'll know **WHAT TO DO** to stop it"   |

**Campaign Docs:** [`web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md`](./web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md)

---

## 1. Product Promise

Clue is a **prediction-first symptom tracker** that learns your body's lag effects and warning signs.

### Core Value Proposition

> **"Stop being blindsided by flares."**
>
> Log symptoms in 20 seconds. The app finds patterns you can't see. Get warned 24-48 hours before a crash.

### Five Pillars

| Pillar      | Description                                              | Status               |
| :---------- | :------------------------------------------------------- | :------------------- |
| **Predict** | See flares coming 24-48h early based on your patterns    | 🎯 **PRIMARY FOCUS** |
| **Capture** | Fast check-ins + flare logging when things spike         | ✅ Active            |
| **Recall**  | Calendar history you can trust when brain fog hits       | ✅ Active            |
| **Connect** | "How does X impact Y?" patterns that stay understandable | ✅ Active            |
| **Trust**   | Doctors take your data seriously (structured exports)    | ✅ Active            |

### ~~Deprecated~~ Five Pillars (Original)

<details>
<summary>Original pillars before validation (click to expand)</summary>

| Pillar      | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------- |
| **Capture** | Fast check-ins + flare logging when things spike                              |
| **Recall**  | Calendar history you can trust when brain fog hits                            |
| **Connect** | "How does X impact Y?" patterns that stay understandable                      |
| **Act**     | Gentle next steps, experiments, and "what to try today"                       |
| **Trust**   | Doctors take your data seriously because Clue structures it the way they need |

_Note: "Act" was replaced by "Predict" after campaign validation showed users want foresight over guidance._

</details>

#### Doctor Trust Details

- Graphical trends over relevant windows (2–4 weeks)
- Temporal patterns (onset, cycles, lag effects)
- Symptom summaries that cover what clinicians ask for (the "8 characteristics" structure)
- Provider-ready PDFs and appointment-focused talking points

---

## 2. Target User

**Primary Persona (Beachhead):** Multi-condition chronic illness patient who feels **blindsided by flares**

### Meet "Sarah"

- 42 years old, managing **3–4 chronic conditions**
- Seeing **multiple providers** (specialist + PCP + mental health + PT, etc.)

**What Sarah wants most (validated):**

1. **Prediction** — "Tell me when the next crash is coming so I can prepare" ← **PRIMARY**
2. **Trigger identification** — "Tell me which variable is causing this"
3. **Sense-making** — "Why is this happening again?"

### What Sarah Is Fighting

- **Unpredictability** — Flares feel random, she can't plan her life
- Symptoms shift daily, memory is unreliable during brain fog
- Past logs feel like noise; she can't see the patterns herself
- Energy is limited; anything that feels like a form gets abandoned

### Clue's Job

- **Primary:** Give Sarah a 24-48 hour heads up before flares hit
- **Secondary:** Make tracking feel **lighter than remembering**
- **Tertiary:** Make outputs feel **credible in the exam room**

> _Other personas can exist later, but MVP is built for Sarah who wants to stop being blindsided._

---

## 3. North Star Loop

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1) Check-in (10–30s)                                               │
│         ↓                                                           │
│  2) See prediction dashboard (flare risk for next 48h) ← NEW        │
│         ↓                                                           │
│  3) Get early warning alerts when risk is high ← NEW                │
│         ↓                                                           │
│  4) Flare mode when it happens anyway (simplified logging)          │
│         ↓                                                           │
│  5) Calendar history + Doctor-trust exports                         │
│         ↓                                                           │
│      repeat                                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Prediction Features (Being Validated)

| Feature                       | Description                                          | Testing Status |
| :---------------------------- | :--------------------------------------------------- | :------------- |
| **Lag Effect Detection**      | "Your flares start 24-48h after poor sleep + stress" | 🧪 Testing     |
| **Flare Risk Score**          | "Elevated risk today based on yesterday's patterns"  | 🧪 Testing     |
| **Top Suspects Ranking**      | "This week: Sleep (78%), Stress (65%), Food (23%)"   | 🧪 Testing     |
| **Daily Push/Rest Indicator** | "Today is a Rest day based on your patterns"         | 🧪 Testing     |

<details>
<summary>~~Deprecated~~ Original North Star Loop (click to expand)</summary>

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1) Check-in (10–30s)                                               │
│         ↓                                                           │
│  2) Flare mode when needed                                          │
│         ↓                                                           │
│  3) Calendar history (proof)                                        │
│         ↓                                                           │
│  4) Doctor-trust view (graphs + structured summaries)               │
│         ↓                                                           │
│  5) Appointment prep (talking points + export)                      │
│         ↓                                                           │
│      repeat                                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

_Note: Original loop focused on "capture → recall → doctor export". New loop prioritizes prediction as the core value moment._

</details>

---

## 4. Onboarding Flow

### Screen 1A — "What are you managing?"

**Goal:** Acknowledge reality—users manage multiple conditions.

**UI:** Bottom sheet picker with common chronic clusters + search

**Condition Examples:**

- IBS, migraine, long COVID, fibromyalgia
- Endometriosis, anxiety/depression, autoimmune
- Diabetes, chronic pain, insomnia, fatigue
- POTS, skin conditions

**Output:** Creates initial tracking templates and vocabulary (symptom lists, factors, meds)

---

### Screen 1B — "What matters most right now?"

**Goal:** Reduce overwhelm and create a first win. Pick **1 priority**.

| Priority Options           |
| -------------------------- |
| Fatigue and energy crashes |
| Pain and inflammation      |
| Mood and anxiety           |
| IBS and gut symptoms       |
| Sleep and recovery         |
| Headaches/migraines        |
| Brain fog/focus            |

**Output:** Sets the "first month focus" and default charts

---

### Screen 1C — Impact Question

**Header:** _"How does my [Feature] impact [Outcome]?"_

| Feature Dropdown | Outcome Dropdown |
| ---------------- | ---------------- |
| Medications      | Mood             |
| Sleep            | IBS              |
| Food             | Pain             |
| Stress           | Fatigue          |
| Exercise         | Anxiety          |
| Cycle            | Sleep quality    |
| Work             | Headache         |
| Weather          | Skin             |
| Hydration        | Focus            |
| Supplements      |                  |

**Output:** Becomes the pinned question in chat + the first analytics card

---

### Screen 2 — "Intent"

Users pick the mindset they're in:

#### 🔍 Awareness — "Something is wrong"

> - "Why am I so exhausted again?"
> - "My pain is back with a vengeance."
> - "Everything hurts and no one sees it."
> - "I can't think straight; my brain is mush."
> - "This flare came out of nowhere."

#### 📝 Tracking — "I need history"

> - "I need to log this flare, but I'm so tired."
> - "When did this start last time?"
> - "Did I take my meds on time yesterday?"
> - "I've had five flares this month; I'm losing count."
> - "I wish I could remember what triggered this."

#### 🔎 Insight — "What's causing this?"

> - "Is stress making this worse?"
> - "Could it be the weather or the food I ate?"
> - "Every time I skip lunch, my fatigue spikes."
> - "Maybe it's that new medicine."
> - "I'm trying to connect the dots, but it's overwhelming."

#### ⚡ Action — "What do I do next?"

> - "Should I call my doctor or wait it out?"
> - "How can I prevent this from happening again?"
> - "What can I try to feel better today?"
> - "I need to show my doctor what's been happening."
> - "I want to prepare for my appointment."

**Output:**

- Sets the tone of the app's first week (agent asks fewer/more questions)
- Preconfigures default quick-entry widgets and chat prompts

---

### Screen 3 — First Check-in Widgets

2–3 lightweight, adaptive widgets based on Screen 1B + Screen 2:

| Widget                 | Description                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Baseline slider**    | Today overall rating for priority outcome                                                        |
| **Flare toggle**       | "Is this a flare?" yes/no → If yes: start time + 1–2 symptom chips                               |
| **Top suspects chips** | 3–7 chips relevant to chosen Feature (missed meds, poor sleep, stress spike, food trigger, etc.) |

---

### Screen 4 — First Value (Instant Commitment)

Show three things:

1. **"Baseline captured"** — Clear confirmation
2. **Calendar preview** — What their history will look like once they log
3. **Promise card** (mock insight):
   - _"After 3 days, I'll start spotting patterns between [Feature] and [Outcome]."_
   - _"After 2 weeks, you'll get a doctor-ready 2–4 week trend view."_

> This creates psychological buy-in before the data exists.

---

## 5. Main App Navigation

### Tab 1 — Chat (Primary)

Chat is the front door. It should feel like **texting**—while quietly building **doctor-grade structure**.

**Key Behaviors:**

- **Pinned question:** How does my [Feature] impact [Outcome]?
- **Side drawer:** Saved questions + suggested ones
- **Bottom-sheet pickers** for chips (symptoms, factors, meds)—never heavy forms

#### Chat Intelligence: The "8 Characteristics" Structure

When users describe symptoms, Clue extracts and summarizes the doctor-usable structure and gently prompts for what's missing—without feeling like a checklist.

| Characteristic          | What It Captures                   |
| ----------------------- | ---------------------------------- |
| **Location**            | Where exactly                      |
| **Duration**            | How long                           |
| **Frequency**           | How often                          |
| **Progression**         | Worse/better/same                  |
| **Context**             | What was happening when it started |
| **Associated symptoms** | Related symptoms                   |
| **Quality**             | What it feels like                 |
| **Quantity**            | Severity 1–10                      |
| **Aggravating factors** | What makes it worse                |
| **Alleviating factors** | What helps                         |

#### Example Chat Flow

**User:** "My stomach is killing me again."

**Clue (1–2 short prompts max):**

- "Where exactly?" (upper/lower, left/right, diffuse)
- "Severity 1–10?"
- "Anything that helped or made it worse?"

→ Clue stores a **single tight paragraph** for doctors, not six paragraphs.

---

### Tab 2 — History (Calendar-First)

- Calendar grid with day markers
- Tap day → day card stack (outcomes, symptoms, factors, meds, notes)
- "Compare to last flare" entry point when flare mode is active

---

### Tab 3 — Quick Entry (Dynamic)

Top 5–8 actions based on:

- Priority outcome
- Flare state
- Most frequent logs

**Must stay usable under 10 seconds.**

---

### Tab 4 — Analytics + Doctor View

**Default:** Friendly insights for the user
**Toggle:** Doctor View

#### Doctor View Includes:

| Feature              | Description                                     |
| -------------------- | ----------------------------------------------- |
| 2–4 week trends      | Clean, minimal graphical trends                 |
| Baseline comparisons | Current vs. baseline                            |
| Threshold alerts     | Example: "3+ points worse than baseline"        |
| Symptom summaries    | Formatted using the 8 characteristics paragraph |
| Flare timeline       | Start/end, severity peaks overlay               |

**Goal:** Fewer clicks, provider-ready at a glance.

---

## 6. Flare Mode ⚠️

> Flare mode is when Clue is most valuable and most retention-driving.

### Triggers

| Type          | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| **Manual**    | User taps "This is a flare"                                                  |
| **Automatic** | Detected when severity jumps or multiple symptoms spike (simple rules first) |

### During Flares: Simplified Logging

Because energy is lowest:

- ✓ One-tap severity
- ✓ 1–2 short follow-ups (only if needed)
- ✓ Minimal typing

### Timestamps

- Start time and end time (or "ongoing")
- Stores flare duration and peak severity

### Auto-Compare

> "This flare looks like your last 2 flares"

Shows what was different 24–72h before:

- Sleep dip
- Missed meds
- Stress spike
- etc.

---

## 7. Provider Trust Features

### Reports (Friendly + Clinical)

- 14/30/90-day summaries
- Flare timeline
- Med adherence snapshot
- Trigger shortlist (confidence-weighted)

### Appointment Prep Mode

When user indicates an appointment (or it's upcoming):

> _"Your appointment is in 3 days. Here's what to discuss."_

**Generates talking points:**

- 1 paragraph per key symptom (doctor preference)
- Includes trend + flare frequency + what helped/hurt
- **Export as PDF**
- Optional: share/send to provider portal workflow

> This solves the real fear: _"My doctor won't look at it."_

---

## 8. Data Model

### Core Data

| Entity             | Description                                         |
| ------------------ | --------------------------------------------------- |
| **Daily check-in** | Outcome scores + suspects                           |
| **Symptom event**  | 8-characteristics summary + raw chat text           |
| **Flare**          | Start/end, peaks, symptom bundle                    |
| **Factors**        | Sleep, stress, food, exercise, cycle, weather, etc. |
| **Meds**           | Taken/missed/changed                                |
| **Notes/tags**     | Free-form annotations                               |

### Derived Data

| Entity                           | Description                     |
| -------------------------------- | ------------------------------- |
| **Baseline**                     | User's normal state             |
| **Threshold alerts**             | Deviation detection             |
| **Lag effects**                  | Yesterday sleep → today outcome |
| **Provider paragraphs + graphs** | Export-ready summaries          |

---

## 9. MVP Scope

### Must Ship ✓

- [ ] Expanded onboarding (1A, 1B, 1C, 2, first value screen)
- [ ] Chat with 8-characteristics extraction + gentle missing-info prompts
- [ ] Flare Mode (manual + simple automatic triggers, timestamps, compare to past)
- [ ] History calendar
- [ ] Analytics with Doctor View toggle
- [ ] Appointment Prep Mode (basic) + PDF export

---

## 10. Metrics That Matter

| Category       | Metrics                                                          |
| -------------- | ---------------------------------------------------------------- |
| **Activation** | Onboarding completion, first check-in within 2 minutes           |
| **Retention**  | Flare mode usage frequency, appointment pack generated           |
| **Trust**      | "Doctor-ready" export usage, "This summary is accurate" feedback |

---

## 11. Privacy, Trust, and Safety

### Non-Negotiables

- ✓ **Clear data ownership:** User can export + delete anytime
- ✓ **Minimal data collection** by default
- ✓ **Transparent analytics:** Explain what's being computed

### References

| Topic           | Link                                                |
| --------------- | --------------------------------------------------- |
| GDPR Overview   | https://gdpr.eu/what-is-gdpr/                       |
| HIPAA Overview  | https://www.hhs.gov/hipaa/index.html                |
| Apple HealthKit | https://developer.apple.com/documentation/healthkit |
| Google Fit      | https://developers.google.com/fit                   |

---

## 12. Marketing Validation

### Campaign History

| Campaign                  | Date     | Budget | Winner                       | Insight                               |
| :------------------------ | :------- | :----- | :--------------------------- | :------------------------------------ |
| **Clarity Experiment**    | Dec 2025 | $100   | `predict_flares` (59 clicks) | Prediction beats trigger-finding 4.5x |
| **Prediction Depth Test** | Jan 2026 | $100   | _In progress_                | Testing Time vs Variable vs Action    |

### Live Landing Pages

- **Prediction (winner):** https://chroniclife.app/predict-flares
- **Forecast test:** https://chroniclife.app/flare-forecast _(to create)_
- **Culprit test:** https://chroniclife.app/top-suspect _(to create)_
- **Prevention test:** https://chroniclife.app/crash-prevention _(to create)_

### Competitive Landscape

| App                                        | Strength               | Clue's Differentiation                     |
| :----------------------------------------- | :--------------------- | :----------------------------------------- |
| [Bearable](https://bearable.app/)          | Comprehensive tracking | Too complex; we're prediction-first        |
| [Visible](https://www.makevisible.com/)    | Pacing focus           | We predict flares, not just track energy   |
| [Wave Health](https://www.wavehealth.app/) | Beautiful UI           | We have prediction engine + doctor exports |

---

_Last Updated: January 2, 2026_
