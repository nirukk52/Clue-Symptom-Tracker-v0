# Chronic Life — Symptom Tracker

> **Predict your next flare before it hits.** A symptom tracker that learns your body’s patterns and gives you a heads up — so you can prepare, not just react.

**App name:** Chronic Life · **AI chat agent:** Clue

## Low-effort, non-judgmental, flexible symptom tracking that works on bad days and doesn’t create guilt

---

## Getting Started

```bash
cd web-app && npm install
npm run dev       # → http://localhost:3000
npm run build     # production build check
```

> Requires `web-app/.env.local` — see `context/web-landing-old-archived/KEYS-REFERENCE.md` for required keys.

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

App Name Condition/Persona Focus Key Features Evidence-Based BCTs Quality Rating (MARS) Psychological Impact Addressed Doctor Communication Support Source
Clue The Overwhelmed Spoonie (Multiple Chronic Conditions); IBS Food Detective; Sleep-Deprived Tracker; Hormonal Balancer; Fibro Fog Fighter Chat-first tracking (Vercel AI SDK), 10-30 second daily logging, flare logging, pattern discovery, smart trigger tracking, meal/stress correlation, sleep quality/pain correlation, local-first SQLite storage. 10 example rules (Safety/Energy, Data Sufficiency, Insight Qualification, Action Ranking) Not in source Brain fog, medical gaslighting, cognitive cost of tracking, guilt for 'failing' at tracking, exhaustion, feeling dismissed or unheard. Doctor-ready summaries, clinical format PDFs, 8-characteristics framework extraction, appointment prep mode, symptom spike charts. 1-12
Chronic Life The Overwhelmed Spoonie / Multi-condition chronic illness patient (Sarah) 20-second check-ins, Flare Mode, Chat-first tracking, History View, Pattern Discovery, Flare Forecasting. Self-monitoring of behavior, self-monitoring of outcomes, information about antecedents (triggers), feedback on outcomes, feedback on behavior Not in source Brain fog, medical gaslighting, fear of being blindsided by flares, exhaustion from tracking. Doctor-ready summaries, structured PDF exports, Appointment Prep Mode, clinician-shaped summaries (8 characteristics structure). 13-17
Bearable Chronic illness, mental health, and neurodiversity (e.g., fibromyalgia, migraines, bipolar, PCOS) Mood, symptom, and medication tracking, health experiments, automated data sync, 1-10 pain scales, correlation analysis (stress/pain), reports and visualization. Self-monitoring of behavior, self-monitoring of outcomes, goal setting, feedback on behavior 4.6 (Play Store rating); 4.5 out of 5 Anxiety, depression, feeling out of control, mood swings, brain fog, disorganization of manual journals. Shareable reports and timelines, symptom and mood change summaries for GPs/Therapists. 18-25
Visible Long COVID and ME/CFS Pacing support, HRV measurement via smartphone camera, exertion tracking, heart-rate variability monitoring. Self-monitoring of outcomes, self-monitoring of behavior, information about antecedents Not in source Post-exertional malaise (PEM), cognitive dysfunction (brain fog), physical and mental fatigue. Data sharing for research (optional); pacing data to avoid PEM. 17, 26
PainScale General chronic pain (Adolescent +) Comprehensive daily diary, detailed body map, triggers/relief/medication tracking, visual graphs, and physician email reports. 15 (Total), 8 (Pain-specific: behavior-health link, consequences, instruction, prompt intention formation, prompt specific goal setting, self-monitoring, social support/change, stress management) 4.54 Not in source Synthesized data reports sent via email. 27
Migraine Buddy Migraines (Adolescent +) Weather condition recording, trigger/relief tracking, and Migraine Disability Assessment (MIDAS) score calculation. 13 (Total), 6 (Pain-specific: behavior-health link, consequences, prompt intention formation, instruction, self-monitoring, social support/change) 4.19 Not in source Ability to share information with providers. 27
Manage My Pain Chronic pain (Adolescent +) Pain records for severity and triggers, customizable sections, daily reflections, and chart viewing. 7 (Total), 4 (Pain-specific) 4.06 Not in source Ability to generate reports. 22, 27
Curable Chronic pain management (Adolescent +) Educational modules, psychological techniques for pain relief. 11 (Total), 5 (Pain-specific) 3.95 Pain-related distress Not in source 27
Wysa Anxiety, Stress, & General mental health AI Chatbot, CBT skill work, safety planning, crisis line connections, anonymous onboarding, meditation, and journaling. CBT-based techniques, CBT-rooted support 4 out of 5 Acute distress, anxiety, daily stress, emotional rhythms. Access to Emotional Wellbeing Professionals. 18, 28
Youper Depression & Anxiety AI-powered chatbot, CBT exercises, mood tracking, interactive sessions. AI-based CBT education 3.5 out of 5 Anxiety, depression, low self-confidence. Data sharing with therapists via integrated EHRs. 18
MONARCA 2.0 Bipolar Disorder Subjective self-assessment (mood, sleep, medicine), automated sensor tracking, 5-day mood forecast, 'Live Wallpaper' feedback, mixed-mood scale, retrospective reporting. Not in source Not in source Mood episodes (depression and mania), relapse prevention, anxiety, mood swings. Clinician web portal with overview screen, impact factor analysis, and mood forecasts. 29, 30
ehive Inflammatory Bowel Disease (IBD) / Crohn's & Colitis Passive physiological metric collection (HR, RHR, HRV, steps, oxygenation), daily PRO-2 disease activity surveys, wearable device linking. Not in source Not in source Symptomatic flare identification, subclinical inflammation detection. Captures lab results (CRP, ESR, FC) and clinical data via electronic health records. 31
WARN-D Students at risk for Depression/MDD Ecological Momentary Assessment (EMA), 4x daily smartphone queries, smartwatch data collection, weather forecast metaphor. Not in source Not in source Depression, stress, anxiety, functional impairment, worthlessness, sad mood. Self-report information on diagnoses; longitudinal data on outcome variables. 32
Daylio Mental health and chronic condition monitoring Customizable check-ins (3x per day), 1-5 scale tracking using icons, weekly reports, and trigger testing. Not in source Not in source Mental health status, stress levels. Weekly reports for clinical review. 22, 25
Flo Femtech / Menstruation and Menopause Period tracking, ovulation prediction, pregnancy mode, Flo for Partners, Anonymous Mode. Self-monitoring of outcomes, information about health consequences Not in source Anxiety regarding data privacy, mood swings related to cycle. Health symptom recording for vaginal discharge, pains, and mood. 33
CogniHelp Dementia Patients / The Caregiver persona Memory assistance, gentle reminders, personalized routines, and virtual caregiver interaction. Cognitive therapy techniques Not in source Emotional and cognitive limitations. Secure HIPAA compliant data storage. 28
MindDoc Mental health assessment Daily mood assessments, visual trends, and educational self-help resources. Not in source Not in source Self-awareness, mental health patterns. Clinically backed assessments. 28
Health Buddy Schizophrenia patients with suicidal behavior Pre-programmed questions about symptoms of depression and suicide. Not in source Not in source Suicide prevention, depression monitoring. Allows mental health service providers to monitor patient symptoms. 29
Mobile Mood Diary Adolescents (Mental Health) Mobile reporting of mood, energy, and sleep levels. Not in source Not in source Mood tracking, self-charting. Data can be accessed on a website by mental health service providers. 29
Back Pain Exercises Chronic back pain Stretching/exercise instructions and performance frequency data. 8 (Total), 5 (Pain-specific) 4.03 Not in source Not in source 27
Mobilyze! Depression Machine learning to predict cognitive state from phone sensors and environmental context. Not in source Not in source Cognitive state prediction, proactive intervention. Not in source 29
BeWell General wellbeing Automated tracking of sleep, physical activity, and social interactions; intelligent feedback. Not in source Not in source Stress management, identifying early signs of health decline. Not in source 29
JOOL Self-monitoring user Push notifications for reminders and engagement. Not in source Not in source Motivation, demotivation/guilt from push notifications. Not in source 34

“Spoonie” isn’t a single disease — it’s a label used most in communities dealing with chronic fatigue, chronic pain, and fluctuating disability. The conditions most commonly associated include:

Lupus (the Spoon Theory was created to explain lupus-related limitations)

Fibromyalgia

ME/CFS (myalgic encephalomyelitis / chronic fatigue syndrome)

POTS / dysautonomia

Arthritis / autoimmune inflammatory conditions (often grouped under “spoonie” discussions)

Chronic migraine

Common “multi-condition” overlap in tracking communities: IBS / GI disorders, long COVID, etc.

What symptom tracking solutions…
