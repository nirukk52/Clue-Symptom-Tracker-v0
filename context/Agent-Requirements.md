# Agent Requirements

> What the symptom-tracking agent must do — features, behaviors, and success criteria.

---

## 1. Agent Definition (One Paragraph)

A chat-first, local-first symptom-tracking agent for multi-condition chronic illness patients who have low energy and need outputs their clinicians will actually scan and trust. It earns "doctor trust" by (1) writing every interaction to local SQLite first, (2) generating clues/actions only from the user's own structured data, (3) attaching an immutable evidence snapshot (exact row IDs + metric IDs + query fingerprint) to every clue, chart, and export, and (4) making every decision inspectable via a replayable Decision Trace + Rulebook Explorer.

---

## 2. Feature Map (Venn Diagram — Text)

### Awareness (unique)

- "Is this a flare?" capture + start time (minimal taps)
- Severity jump detection (rule-based)
- "I'm wiped" low-friction mode (one-tap only)
- New symptom onboarding into today's day card (fast add)
- Safety/Energy gating (no insight spam when data is thin)
- Symptom "8 characteristics" quick capture prompts (only missing bits)

### Tracking (unique)

- Calendar history → day card stacks (proof when memory fails)
- "When did this happen last time?" timeline query
- Flare comparisons: duration/peak/what helped vs last N flares
- Medication adherence timeline (taken/missed/changed)
- Search (FTS5) across notes + provider paragraphs
- Data edit provenance (every edit becomes a new event, not overwrite)

### Insight (unique)

- Focus hypothesis: "How does X impact Y?" pinned card + 7-day progress
- Metric computation windows (3-day early signal; 14-day trend promise)
- Lag checks (24–72h) for feature→outcome effects
- Clue qualification (min sample size, effect threshold, confidence)
- Confound warnings (data insufficiency, missing meds timing, etc.)
- Novelty control (avoid repeating the same clue without new evidence)

### Action (unique)

- "Next 3 actions" ranked micro-steps (lowest effort first)
- Widget-first interventions (cheapest input that unlocks clarity)
- Appointment Prep Mode entry + checklist
- Reminders (limited, context-aware; never naggy)
- Export doctor pack (2–4 week, clinician-shaped)
- Follow-up question selection (max 2 unless appointment mode)

### Awareness ∩ Tracking

- Flare boundaries displayed on calendar + tap-to-expand
- "What changed since yesterday?" driver chips stored on day card
- Missing-fields queue ("we'll fill details later")
- Quick check-in baseline recorded even on bad days
- Edit/dismiss tracking so history stays trustworthy

### Awareness ∩ Insight

- Early-warning hints after 3 days (only if qualified)
- Severity spike → trigger candidate shortlist (confidence-weighted)
- "Is this new or recurring?" rule-based branching
- Low-energy mode switches to observation-only (no recommendations)
- "Compare to last flare" insight entry point

### Tracking ∩ Insight

- Trend charts tied to exact metric IDs (reproducible)
- Baseline comparisons (user-defined baseline windows)
- Flare frequency + cadence over 14/30/90 days
- Correlation summaries (clearly labeled as "pattern", not causation)
- Data sufficiency explanations ("why no clue yet")

### Insight ∩ Action

- Each action cites the clue + evidence snapshot that motivated it
- Action ranking uses confidence + effort + focus relevance
- "Next best question" widget insertion when confidence is low
- Cooldowns to prevent repeating the same advice
- "Try today" vs "Collect data" split (depending on sufficiency)

### Awareness ∩ Tracking ∩ Insight ∩ Action (center)

- One daily loop: chat check-in → widgets → day card → (maybe) clue → next 3 actions
- "Why this?" explainability for every clue/action
- Evidence snapshots for every generated output
- Deterministic replay: same DB state + same rules → same results
- Export pack that mirrors exactly what user saw in-app

---

## 3. Chat Agent Definition

A chat-first symptom companion that turns messy "how I feel" moments into clinician-shaped, provable history. It keeps a pinned Focus hypothesis (like "How does Poor Sleep impact Joint Pain?"), runs a short experiment window, and uses quick widgets (Mood, Pain, Meds, etc.) to capture consistent data with minimal typing. It answers in four modes: Awareness, Tracking, Insight, Action—always grounded in your own entries and trends.

---

## 4. Chat Agent Feature List

### 4.1 Awareness: "Something is wrong"

- Gentle check-in prompts (energy, pain, mood) with one-tap responses
- "Flare mode" when language suggests escalation: fewer questions, higher structure, faster logging
- Structured symptom capture from chat using OPQRST / OLDCARTS-style fields (onset, duration, severity, triggers, relief, etc.)

### 4.2 Tracking: "I need history"

- "When did this happen last time?" instant recall cards: last similar episode + what changed
- Timeline + day cards: gaps highlighted ("missing fields") and the cheapest widget to fill them
- Medication adherence trace (what you took, when, and what was happening around it)

### 4.3 Insight: "What's causing this?"

- Focus experiments (7-day, 14-day): pinned question, progress meter, daily completion
- Evidence-first clues: only generates insights when it can cite exact rows/metrics used
- Simple trend outputs: rolling averages, deltas, lag checks (sleep → next-day pain), streaks
- "What would make this clearer?" next-best-question widget selection (low effort, high unlock)

### 4.4 Action: "What do I do next?"

- Next 3 actions, ranked:
  - best 1-tap widget to reduce uncertainty
  - best computation to run now
  - best summary/export to increase doctor trust
- "Doctor Pack" export: one-page graphs + structured symptom narrative (time-saver for clinicians)
- Appointment prep mode: top changes since last visit, meds tried, what helped, what worsened

---

## 5. "Doctor Trust" Pack Requirements

### What It Contains

- **Cover summary (1 page):** conditions tracked, primary complaint trends, flare count, baseline deltas
- **Graphs (2–4 week windows):** outcome trend, feature trend, overlay flare markers
- **Meds section:** adherence snapshot + timing consistency (not advice)
- **Symptom characteristics:** structured paragraphs per key symptom (onset, location, duration/timing, quality, severity, aggravating/alleviating, associated symptoms)
- **Focus hypothesis page:** "Feature→Outcome" with evidence-labeled charts

### What Makes a Clinician Actually Trust It

- Clinician-shaped formatting (graphs + tight structured paragraphs, not a diary)
- Clear time windows (14/30/90) + units + missing-data flags
- No medical conclusions: only "what happened" patterns, labeled confidence, and data gaps

---

## 6. Rules System Requirements

### Rule Buckets

| Bucket | Purpose |
|--------|---------|
| Safety/Energy | Protect low-energy users; reduce friction |
| Data Sufficiency | Don't generate insights without enough data |
| Insight Qualification | What counts as a "real" clue |
| Action Ranking | How to choose top 3 next actions |

### 10 Example Rules (Tailored to Focus Hypothesis)

#### Safety/Energy

1. **IF** `low_energy=true OR mode=Awareness AND severity>=8` **THEN** show only baseline widget + flare toggle; suppress insight/action.
   - **BECAUSE:** reduce cognitive load on worst days.
   - **EVIDENCE NEEDED:** today day_observation(severity).

2. **IF** user dismissed >2 widgets today **THEN** stop inserting widgets; offer "Save minimal check-in" button.
   - **BECAUSE:** friction kills retention.
   - **EVIDENCE:** dismiss events today.

#### Data Sufficiency

3. **IF** `focus_day < 3` **THEN** do not emit correlation-style clue; emit "baseline building" card + 1 missing-field widget.
   - **EVIDENCE:** day count for focus_hypothesis_id.

4. **IF** meds are part of feature OR user has meds tracked AND `med_log.time_ts` missing for 2 of last 3 days **THEN** block "med timing impact" insight; ask meds timing widget.
   - **EVIDENCE:** med_log rows last 3 days.

5. **IF** outcome logged < 4 of last 7 days **THEN** suppress trend chart; show "complete 3 more days to unlock chart" progress.
   - **EVIDENCE:** day_observation completeness.

#### Insight Qualification

6. **IF** `sample_days>=6 AND abs(effect_size)>=1.0 (0–10 scale) AND missing_rate<=25%` **THEN** eligible clue type "difference of means".
   - **EVIDENCE:** metric_value(effect_size, sample_days, missing_rate).

7. **IF** effect exists but confidence < threshold **THEN** emit "weak signal" clue only in Doctor View OFF; in Doctor View show as "inconclusive".
   - **EVIDENCE:** metric_value(confidence).

8. **IF** same clue_type emitted in last 7 days AND no new data points since **THEN** suppress and instead surface next best question.
   - **EVIDENCE:** last clue_card + metric_run watermark.

#### Action Ranking

9. **IF** meds timing missing AND focus feature includes meds **THEN** rank "log meds time today" above any lifestyle suggestions.
   - **EVIDENCE:** missing-field queue + focus feature.

10. **IF** poor sleep logged AND outcome worse than baseline by >=2 **THEN** propose 3 actions: (a) collect meds timing (b) log a 10s pain score midday (c) add a short note "what worsened/what helped" — rank by effort lowest first.
    - **EVIDENCE:** sleep + outcome baseline delta.

---

## 7. "Next 3 Actions" Requirements

### Pipeline

1. **Observe:** pull today's baseline, focus hypothesis, last 7 days completion, missing-field queue
2. **Diagnose:** identify the single biggest uncertainty blocking the focus question (often missing meds timing / missing outcome)
3. **Propose candidates:** generate 6–10 candidate actions (widgets, not advice)
4. **Rank:** score each candidate
5. **Emit top 3:** write action_candidate + action_plan rows, each linked to decision trace + evidence snapshot

### Scoring Factors (0–1 each, weighted)

| Factor | Description |
|--------|-------------|
| Value | How much clarity it unlocks for focus hypothesis |
| Effort | Taps/time required (lower is better) |
| Focus relevance | Direct tie to feature/outcome |
| Novelty | Not repeated recently |
| Confidence | Likelihood it improves understanding given current gaps |

**Suggested weights (MVP):** Value 0.35, Effort 0.25, Focus 0.20, Confidence 0.15, Novelty 0.05

### Worked Example

**Context:** Day 4/7, low energy (4/10), poor sleep logged, meds timing missing, outcome (joint pain) worse than baseline.

1. **Observe:** sleep_quality=3/10, pain=7/10, baseline pain ~5, med_taken=true but time_ts=null
2. **Diagnose:** cannot evaluate "sleep → pain" vs "late meds → pain" without meds timing
3. **Candidates:**
   - "What time did you take morning meds?" (time picker)
   - "Midday pain 0–10" (single slider reminder)
   - "One-tap: anything unusual? stress/food/weather" (chips)
   - "Add 10-word note: what made it worse?"
4. **Rank outcome:**
   - #1 Value high, Effort low, Focus medium-high, Confidence high → Rank 1
   - #2 Value medium, Effort low, Focus high, Confidence medium → Rank 2
   - #4 Value medium, Effort medium, Focus medium, Confidence medium → Rank 3
5. **Emit Top 3 Actions (as widgets):** meds time → midday pain → short note

---

## 8. MVP Cut List

### Ship in v1 (small-first)

- Onboarding 1A–1C + mode select + pinned focus card + 7-day progress
- Quick check-in widgets (baseline outcome + flare toggle + top suspects)
- Local SQLite event log + materialized day cards + FTS5 notes
- Trend metrics: 3-day early signal + 14-day trend eligibility
- Clue gating + evidence snapshots + decision traces
- Next 3 actions widget planner
- Supabase sync via outbox + pull + re-materialize
- Doctor pack export (14/30 days) with evidence IDs
- Debug screens: Why this clue + Why these actions (Rulebook Explorer can be basic)

### Later

- Advanced lag/correlation models, confound analysis
- Multi-focus hypotheses and saved question library
- Provider portal sharing integrations
- Rich visualization (node-edge graph)
- Advanced personalization / experimentation framework (A/B)
- Multi-profile caregiver mode

---

## 9. Testing Requirements

### Deterministic ID/Time Harness
- Seeded clock + seeded ULID generator in tests
- Freeze rulebook_version and metric rounding

### Golden DB Fixtures
- A handful of SQLite snapshots: Day 1, Day 3, Day 7, flare week, meds-missing week
- Expected outputs: clue_card, action_plan, decision_trace.determinism_hash

### Tool-Call Replay Tests
- Record tool calls for a session; replay against the same DB; assert identical outputs and hashes

### Rule Unit Tests
- Each rule has input predicates → expected fire/no-fire
- Coverage per bucket (Safety/Energy, Sufficiency, Qualification, Ranking)

### Metric Regression
- `recompute.metrics` outputs verified against known inputs; assert stable metric_run.output_hash

### Explainability Integrity
- For every clue/action: assert evidence_snapshot exists and evidence_item resolves to real rows/metrics (no dangling pointers)

### Sync Reconciliation Tests
- Two-device event streams merged; assert materialized day cards identical across devices

---

## 10. System Features (Shippability)

- **Decision Trace:** every clue and next-3-actions stores rule IDs + evidence snapshot (debuggable, testable)
- **Widget Catalog + Coverage Map:** planner can explain "why this question" in one line
- **Full event capture:** onboarding choices → every widget view/submit → edits → exports (replayable runs)

Enforce bloat limits by treating Quick Entry like a budgeted surface, not a place where questions accumulate.

Hard budgets (non-negotiable)

Widget cap: e.g., 5–8 max in normal mode; 2–3 in “wiped/flare” mode. Anything beyond goes to a deeper layer. 

Product-Spec

Interaction cap: “under 20–30 seconds” target; if the last 7 days’ median time rises, the panel auto-slims (demotes lowest-value widgets). 

onboarding-flow

A question lifecycle (so nothing is “forever”)

Pinned: 1 Focus hypothesis (the only thing guaranteed a slot). 

onboarding-flow

Active: at most N (say 2) experiment questions that earn slots temporarily (7–14 days).

Parked: stored in a “Question Bank” (still trackable via chat, not Quick Entry).

Archived: auto-retire if unused or if it never produced a clue/insight.

Admission control (adding a question must “pay for itself”)
When chat proposes a new daily question, it must choose one:

Swap: “Replace X with Y” (default), never “add another row.”

Schedule: “Ask 2×/week” instead of daily (keeps panel stable).

Chat-only: collect opportunistically in conversation, not in Quick Entry.

Auto-ranking by value, not by “newness”
Score every widget weekly and only the top fit the budget:

Usage: seen → answered rate, skip rate

Signal: did it improve confidence on the Focus question (or unlock a clue)?

Energy cost: taps + cognitive load (multi-selects cost more than a single slider)
Low scorers get demoted to “Parked” automatically.

Design multiplexing (one slot, many meanings)
Instead of new widgets, expand inside existing ones:

“Drivers” stays one chip row; chips rotate based on recent context (“sleep/stress/food/meds”) rather than growing forever. 

onboarding-flow

“Symptoms” stays one entry point; it opens a bottom sheet for detail when needed.

Mode gates (separate heavy capture from daily baseline)

Quick Entry: baseline + flare toggle + 1 driver row (always light). 

onboarding-flow

Chat: adds the “missing info” follow-ups, max 2 unless in appointment mode. 

onboarding-flow

Appointment Prep: allowed to be heavier because it’s episodic, not daily.

Guardrail metrics that block bloat automatically
If any new question causes:

check-in completion ↓

median time ↑

skip rate ↑
…then it gets auto-demoted and only asked in chat.

Two valid philosophies (pick your vibe)

Strict minimalism: Quick Entry never changes size; new questions must replace old ones.

Adaptive minimalism: Size stays fixed, but content rotates based on context, experiments, and yield.

The Base 8 (always on the Quick Entry panel)

Priority Outcome (0–10 slider)
Your “today score” for what matters most (pain/fatigue/IBS/mood/etc.). This is the anchor metric for trends and the pinned impact question. 

onboarding-flow

Condition selector (single tap)
“Which condition is this tied to?” prevents multi-condition data from becoming unusable noise. 

onboarding-flow

Top Symptoms (chips, max 6–8 shown)
Select what’s active today (not your whole library). Add new symptom via chat, not the panel.

Flare toggle (Yes/No)
One switch that changes the whole UX (lighter questions, flare comparisons, timeline). 

onboarding-flow

Meds taken (On time / Missed / Changed)
A single adherence state beats long medication forms, and is highly actionable + doctor-relevant. 

Product-Spec

Sleep quality (0–10 OR “Poor/OK/Good”)
Sleep is the highest-leverage cross-condition driver; keep it dead simple. 

onboarding-flow

Stress level (Low/Med/High)
A coarse scale is enough for correlations without daily journaling fatigue. 

onboarding-flow

Notes (1-tap: text/voice) + Tags
Optional “anything unusual” capture—because life doesn’t fit schemas, but it must stay optional. 

Product-Spec

The “Complete Set” add-ons (2–4 that appear only when relevant)

Likely Drivers chips (contextual, max 5 visible)
Only show drivers relevant to the active impact question (sleep/food/weather/exercise/cycle/outing) to avoid Bearable-style sprawl. 

onboarding-flow

Onset/time (only if Flare = Yes)
“Started: just now / earlier today / yesterday / pick time.” Enough for timelines and doctor summaries. 

onboarding-flow

Severity for top symptom (only if Flare = Yes OR symptom selected)
One symptom gets a 0–10 (the “worst” one). More detail happens in chat, not the panel. 

Product-Spec

Function/Capacity (single item)
“What could you do today?” (Work / errands / basic self-care / stuck in bed). This captures impact without 10 extra questionnaires—critical for multi-condition users. 

Product-Spec

Why this stays “complete” but not exhausting

It matches how multi-condition patients experience tracking: tracking feels like work, and doctor trust is often missing—so you capture just enough structure for trend + export, and push detail collection into flare-only chat. 

Who Struggles Most with Symptom…

 

Agent-Architecture

It aligns with your UX rule: 2–3 widgets for first check-in, then expand contextually rather than upfront.


What should the exact scoring formula be for “widget value” (usage vs signal vs energy), and what thresholds trigger demotion?
Step 1: Normalize three signals (0–1 each)

Usage (U) = “Do they actually answer it?”

U = 0.6 * completion_rate_14d + 0.3 * recency_7d + 0.1 * voluntary_opens_14d

completion_rate_14d: % days shown where user filled it

recency_7d: days since last fill, mapped to 1 (today) → 0 (7+ days)

voluntary_opens_14d: user tapped it when it wasn’t forced (strong intent)

Signal (S) = “Does it help insights + doctor trust?”

S = max(S_focus, S_clue, S_doctor)

S_focus: predictive lift toward pinned impact question (lagged association / effect size consistency over 14–28d)

S_clue: how often it appears in evidence snapshots for valid clues (provenance)

S_doctor: whether it improves clinician-shaped summaries (e.g., meds timing, onset/timing fields)
This aligns with the “evidence snapshot for every widget/clue” rule. 

Agent-Architecture

Energy (E) = “How costly is it on a bad day?”

E = 0.5 * time_cost + 0.3 * tap_count + 0.2 * interruption_risk

time_cost: median seconds to complete (normalized)

interruption_risk: increases if user often abandons check-in after seeing it (drop-off)

This matches your “20 seconds baseline” promise and low-energy/flare constraints.

Step 2: Exact “widget value” score

Default linear score (easy to tune):

WidgetValue = 0.45·U + 0.45·S − 0.10·E

Why this mix: you’re optimizing for “gets used” and “creates trustworthy insight,” while energy is a veto only when it’s truly costly.

Low-energy / Flare Mode variant (energy matters more):

WidgetValue_flare = 0.35·U + 0.45·S − 0.20·E

This keeps the panel usable when people are wiped.

Step 3: Demotion thresholds (with hysteresis so it doesn’t flap)

Assume two widget classes in Quick Entry:

Core anchors (never demote): priority outcome, flare toggle (when relevant), meds adherence if user tracks meds.

Adaptive widgets (eligible): suspects chips, secondary symptoms, optional factors.

Demote from “Primary” → “Overflow” if ANY rule holds for 14 days:

Low value: WidgetValue < 0.35

Low usage + non-trivial cost: U < 0.25 AND E > 0.40

No signal contribution: S < 0.20 AND U < 0.40

Demote from “Overflow” → “Hidden (available via search/add)” if ANY rule holds for 28 days:

WidgetValue < 0.25

U < 0.10 (basically never used)

S < 0.15 AND it never appears in evidence snapshots for clues/doctor pack

Hard safety demotion (fast):

If a widget repeatedly increases abandonment (session drop-off spike) → immediate to Overflow while you rework it (that’s “interruption_risk” showing up). 

What Makes Symptom Tracking App…

Promotion back up (prevents “once demoted, always demoted”):

Promote Overflow → Primary when WidgetValue > 0.55 for 7 days and U > 0.50.

Two alternative scoring philosophies (pick one)

A) “Signal-first” (doctor-trust maximalist)

WidgetValue = 0.30·U + 0.60·S − 0.10·E
Best when you want every visible widget to justify itself clinically.

B) “Energy-first” (retention maximalist)

WidgetValue = 0.55·U + 0.25·S − 0.20·E
Best early on to beat first-month abandonment by keeping Quick Entry ultra-light.


How should the UI explain a demotion (“We hid X to keep this fast”) without making users feel like their symptom doesn’t matter?
Make the demotion feel like respect for their energy, not a judgment on importance:

Name the reason (speed), not the symptom.
“To keep check-in under 20 seconds, we tucked X away for now.” 

onboarding-flow

 

Product-Spec

Promise continuity (nothing is lost).
“We’re still tracking it. It stays in History + Doctor Pack. You can bring it back anytime.” 

Agent-Architecture

 

Product-Spec

Give control in one tap.
Inline CTA: “Pin X back” + secondary “Keep hidden”. (No settings maze.)

Explain the rule so it feels fair.
“We hide items that haven’t been used lately unless they spike during a flare.” (Predictable, not random.)

Show where it went.
A single “More” row: “X is in More → Symptoms” with a count badge (signals it still matters).

Reassure emotionally without being corny.
“X matters. We’re just protecting your bandwidth today.” (This directly counters the “tracking feels like work / self-judgment” trap.) 

Who Struggles Most with Symptom…

 (JMIR MCC paper: https://www.jmir.org/2015/8/e202/
)

Three microcopy options (pick based on brand voice):

Neutral: “We simplified Quick Entry to keep it fast. X is in More.”

Validating: “X still counts. We tucked it away to make today easier.”

Empowering: “Want X on the front row again? Pin it back.”


1) Product requirement: “OS-aware capture, zero-noise logging”

Default behavior: logging must be lighter than remembering, with doctor-trust evidence (every data point has source + timestamp + provenance). 

Product-Spec

 

Agent-Architecture

UX target: 10–30s daily, flare = one-tap + optional 1–2 follow-ups, never a long form. 

onboarding-flow

 

code

2) Auto-sync “channels” (only what reduces effort)
A) Health platforms (highest ROI)

iOS: Apple Health (HealthKit) import for sleep, activity, vitals, workouts, cycle (where applicable).

Android: Health Connect (preferred) or Google Fit (fallback) import for analogous data.

Each imported signal must map to: metric_id, value, unit, timestamp_range, source_app/device, confidence. 

Agent-Architecture

B) Medication adherence (low effort, high signal)

Manual “Taken / Missed / Changed” remains first-class (fast toggle), with optional integration if the OS/platform supports it. 

Product-Spec

Requirement: meds events must support “scheduled time” vs “actual time” so reminders can be precise.

C) Context signals (optional, strictly gated)

Calendar (appointments only, user-selected calendars), location-based prompts (geofenced “at pharmacy/clinic”) only if user opts in.

Hard rule: context never creates extra questions; it only pre-fills or times an existing prompt.

3) Permissions + onboarding requirements (progressive, not scary)

Progressive permission ladder: start with the “impact question” + quick check-in; ask for integrations only after first value moment. 

code

 

onboarding-flow

Each permission screen must say:

what you’ll read, 2) what you’ll write (if any), 3) what improves, 4) how to turn it off.

If denied: app stays fully usable; integrations degrade gracefully.

4) Background sync requirements (OS constraints first)

Local-first writes always; cloud sync is best-effort and battery-aware. 

Agent-Architecture

iOS: background refresh + push-triggered sync where appropriate; Android: scheduled jobs with backoff.

Conflict rule: time-series never “overwrites”—it appends with provenance; summaries can be recomputed deterministically. 

Agent-Architecture

5) Reminders that don’t feel like nagging (noise budget)

Two reminder types only:

Routine check-in (user-chosen time windows)

Missed-critical (only for meds / severe flare follow-up)

Global caps: max notifications/day, quiet hours, snooze presets (15m, 1h, tonight, tomorrow), and “pause for 3 days.” 

What Makes Symptom Tracking App…

Every reminder must contain a single-tap action that completes logging in ≤10 seconds (deep link to Quick Entry with 1–2 widgets). 

code

 

Product-Spec

6) Home screen + lock screen: “log without opening the app”
iOS requirements

Home Screen widget(s): “Quick check-in” (priority outcome slider + save), “Meds” (Taken/Missed), “Flare” toggle. 

code

Lock Screen widget: 1-tap “Log now” + last value preview (no typing).

Siri Shortcuts/App Intents: “Log pain 6”, “Start flare”, “Took meds”.

Android requirements

App Widget: same three actions (Outcome / Meds / Flare).

Quick Settings tile: “Log now” (opens smallest entry).

App Shortcuts: “Log pain”, “Log fatigue”, “Took meds”.

7) Notification interactions (fastest path)

Notification buttons must support: “0–10 value”, “Took / Missed”, “Start flare / End flare”, “Skip (I’m wiped)”. 

onboarding-flow

Optional (if supported): inline reply parsing for “pain 7” → structured write via Intake Agent. 

Agent-Architecture

8) “Appropriate data from appropriate channels” mapping rules

Health platform data can auto-fill: sleep duration/quality, activity load, HR/HRV; it cannot invent symptoms.

Symptom + flare data must always be user-confirmed, but can be prompted when signals cross thresholds (ex: sleep crash + pain spike). 

Product-Spec

Every auto-filled field must show a subtle source chip (“Apple Health”, “Health Connect”) and be editable.

9) Doctor-trust requirements (non-negotiable)

Every chart/export must reference the exact evidence snapshot used (rows/metric IDs/time ranges). 

Agent-Architecture

Doctor View must surface: 2–4 week trends + flare timeline + adherence snapshot in clinician-shaped formats. 

Product-Spec

10) Acceptance criteria (ship-ready)

From locked phone → logged outcome in ≤8 seconds (widget or notification path).

Daily check-in median ≤30 seconds. 

code

Reminder fatigue: user reports "too many notifications" < 5% in week-2 survey; abandon risk is high early so week-1 must feel effortless. 

What Makes Symptom Tracking App…

Integrations never block onboarding or daily logging.

---

## 11. MVP Decisions & Clarifications

> Definitive answers to ambiguities in the spec. These are **locked for v1**.

---

### 11.1 Focus Hypothesis

| Question | MVP Decision |
|----------|--------------|
| Multiple active? | **Strictly 1** active pinned hypothesis at a time. Multi-focus is explicitly "Later." |
| What else exists? | A saved/queued library (inactive) + ability to switch (which closes/archives the previous run). |
| Who creates it? | User picks via **guided structure** (Feature dropdown + Outcome dropdown) during onboarding. |
| Free-text hypothesis? | **No.** Only allow pairs that map to existing metric IDs/widgets. Allow a short "why I'm tracking this" note. |
| Unmeasurable input? | Enforce measurable-only by design. Suggest 2–3 nearest proxies, or store as note + propose closest measurable hypothesis. |
| When 7-day ends? | Close-out card + user choice: "Extend 7 more days" / "Pick next (2–3 suggestions)" / "Pause focus." No silent auto-switch. |

**Data model implications:**
```
focus_hypothesis.state ∈ {active, completed, paused, archived}
active_focus_hypothesis_count = 1 (enforced)
```

---

### 11.2 Low-Energy / Flare Mode

#### Detection Signals (hybrid: explicit + inferred)

| Signal | Type | Trigger |
|--------|------|---------|
| "I'm wiped" button | Explicit | User one-tap |
| Severity ≥ 8 | Inferred | From day_observation |
| Dismissed >2 widgets today | Behavioral | From dismiss events |

#### What Happens in Low-Energy Mode

- **Observation-only:** baseline widget + flare toggle only
- **Suppress:** insight cards, action cards, follow-up questions
- **Never interrogate** when user is depleted

#### Exit Criteria

| Mode | Exit When |
|------|-----------|
| Low-Energy | User manually dismisses **OR** 2 consecutive days with severity < 8 and no friction triggers |
| Flare | User marks flare "ended" **OR** no flare markers + severity near baseline for 2 consecutive days |

**Note:** Low-Energy and Flare are related but **distinct** states. User can be in flare without low-energy (rare but possible), or low-energy without a formal flare.

---

### 11.3 Clue Qualification Thresholds

#### Hard Gates (MVP fixed, not tunable)

| Threshold | Value | Rationale |
|-----------|-------|-----------|
| `sample_days` | ≥ 6 | Enough for meaningful pattern |
| `abs(effect_size)` | ≥ 1.0 on 0–10 scale | Noticeable difference |
| `missing_rate` | ≤ 25% | Data quality floor |

#### Confidence Score (0–1)

**Formula (simple, explainable, deterministic):**

```
confidence = weighted_mean(
  sample_days_score,      // more days = better (0→1 mapped from 0→14+)
  effect_magnitude_score, // bigger effect = better
  completeness_score,     // 1 - missing_rate
  consistency_score       // same direction across days, not driven by 1 outlier
)
```

**Must be stored as a metric** so it's replayable and auditable.

#### Confidence Thresholds (MVP)

| Confidence | User View | Doctor View |
|------------|-----------|-------------|
| ≥ 0.70 | Full clue card | "Pattern (moderate confidence)" |
| 0.50–0.69 | "Weak signal" card | "Inconclusive" |
| < 0.50 | Suppress clue | Suppress; emit next-best-question widget instead |

#### Tunable per user?

**MVP: No.** Fixed defaults for doctor trust + deterministic tests. Personalization (per-user baselines, minimum days adjustments) is Later.

---

### 11.4 Doctor Pack

| Question | MVP Decision |
|----------|--------------|
| PDF only or in-app? | **Both.** Doctor View = on-screen representation. Doctor Pack = exported PDF snapshot that mirrors it (same evidence IDs). |
| Clinician portal? | **Not in MVP.** "Provider portal sharing integrations" explicitly deferred to Later. |
| Flow | Patient → views Doctor View in-app → exports Doctor Pack (PDF) → emails/prints → clinician reads. |

---

### 11.5 Reminders

#### Hard Caps (MVP)

| Limit | Value |
|-------|-------|
| Max push notifications / day | 1 |
| Max push notifications / week | 3 |
| Auto-snooze | If user dismisses reminder 2× in a week → snooze 7 days |

#### Only Send If ALL True:

1. Active focus hypothesis is running
2. User missed 2 consecutive days **OR** late in day with no baseline logged
3. User is **not** in low-energy or flare state

#### Reminder Content Rule

Every reminder must contain a **single-tap action** that completes logging in ≤10 seconds (deep link to Quick Entry with 1–2 widgets).

---

### 11.6 Widgets

#### Catalog (MVP Fixed List)

| Widget | Type | Maps To |
|--------|------|---------|
| Outcome slider | 0–10 | priority_outcome metric |
| Severity slider | 0–10 | symptom_severity metric |
| Flare toggle | boolean | flare_session |
| Start time picker | datetime | flare_session.start_ts |
| Suspects/Drivers chips | multi-select | driver tags |
| Meds taken | yes/no/changed | med_log.status |
| Meds time picker | datetime | med_log.time_ts |
| Sleep quality | 0–10 | sleep metric |
| Short note | text (10–200 chars) | note |
| Symptom 8-char prompts | structured | episode_facts (only when relevant) |

#### Runtime Rules

| Question | MVP Decision |
|----------|--------------|
| Can agent compose new widgets? | **No.** Agent can only instantiate predefined widget types from the catalog. |
| Can users create custom widgets/fields? | **No.** Breaks schema + doctor export consistency. |
| Custom input allowed? | Free-text notes only + "Other" chip option (writes to note/tag). |
| Who adds new widget types? | Engineering team, not runtime. |

---

### 11.7 Four Modes

#### Mode Switching

| Question | MVP Decision |
|----------|--------------|
| How does it work? | **Inferred routing** with optional manual override (mode pill). |
| User picks mode explicitly? | Only during onboarding (sets intent). After that, system infers from message/context. |
| Can features bleed across modes? | **Yes.** Don't refuse cross-mode requests. |

#### Cross-Mode Behavior

Keep a "current mode" for **tone and UI emphasis**, but route each user message to the right capability.

**Example:** User in Awareness mode asks "show last week's trend" → answer with Tracking UI (chart/day cards) **without forcing a formal mode switch.**

---

### 11.8 Summary: What's Locked vs Later

| Feature | MVP (v1) | Later |
|---------|----------|-------|
| Focus hypotheses | 1 active | Multi-focus + saved library |
| Hypothesis creation | Guided dropdowns only | Free-text with NLP mapping |
| Confidence thresholds | Fixed | Per-user tuning |
| Widget catalog | Fixed list | User-defined fields |
| Doctor Pack | PDF export | Clinician portal integration |
| Reminders | 1/day, 3/week caps | Smart scheduling, ML-driven timing |
| Mode switching | Inferred + manual override | Full conversational context |
| Correlations | Simple effect size | Lag models, confound analysis |