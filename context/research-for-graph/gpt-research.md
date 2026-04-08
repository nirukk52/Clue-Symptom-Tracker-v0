{
  "nodeTypes": [
    {
      "name": "Condition",
      "fields": [
        { "name": "conditionName", "type": "string", "example": "IBS" },
        { "name": "conditionCategory", "type": "enum", "example": "Digestive" },
        { "name": "selectedInOnboarding", "type": "boolean", "example": "true" }
      ],
      "captureMethod": "User-selected in onboarding or later via chat."
    },
    {
      "name": "PriorityOutcome",
      "fields": [
        { "name": "outcomeName", "type": "enum", "example": "Pain" },
        { "name": "score0to10", "type": "number", "example": "7" },
        { "name": "isPinnedFocus", "type": "boolean", "example": "true" }
      ],
      "captureMethod": "Chosen in onboarding, then logged in quick entry/chat."
    },
    {
      "name": "FocusHypothesis",
      "fields": [
        { "name": "featureCategory", "type": "enum", "example": "Sleep" },
        { "name": "outcomeCategory", "type": "enum", "example": "Joint pain" },
        { "name": "state", "type": "enum", "example": "active" },
        { "name": "whyNote", "type": "string", "example": "I want to know whether poor sleep drives pain." }
      ],
      "captureMethod": "User-configured from structured feature/outcome pickers in onboarding or chat."
    },
    {
      "name": "DailyCheckIn",
      "fields": [
        { "name": "loggedDate", "type": "date", "example": "2026-03-29" },
        { "name": "priorityOutcomeScore", "type": "number", "example": "4" },
        { "name": "conditionRef", "type": "string", "example": "Fibromyalgia" },
        { "name": "isFlare", "type": "boolean", "example": "false" },
        { "name": "driverChips", "type": "array<string>", "example": "[\"poor sleep\", \"stress\"]" }
      ],
      "captureMethod": "Quick entry, chat, notification action, home/lock-screen widget."
    },
    {
      "name": "SymptomEpisode",
      "fields": [
        { "name": "symptomName", "type": "string", "example": "abdominal pain" },
        { "name": "location", "type": "string", "example": "lower left abdomen" },
        { "name": "durationTiming", "type": "string", "example": "started yesterday, comes and goes" },
        { "name": "characterQuality", "type": "string", "example": "cramping" },
        { "name": "severity0to10", "type": "number", "example": "8" },
        { "name": "progression", "type": "string", "example": "worse than yesterday" },
        { "name": "context", "type": "string", "example": "started after dinner" },
        { "name": "associatedSymptoms", "type": "array<string>", "example": "[\"nausea\", \"bloating\"]" },
        { "name": "aggravatingFactors", "type": "array<string>", "example": "[\"food\", \"stress\"]" },
        { "name": "alleviatingFactors", "type": "array<string>", "example": "[\"rest\", \"heat\"]" },
        { "name": "rawChatText", "type": "string", "example": "Sharp cramping after eating, worse when I stand." }
      ],
      "captureMethod": "Extracted from chat with structured follow-ups; user-confirmed."
    },
    {
      "name": "FlareEpisode",
      "fields": [
        { "name": "startTime", "type": "datetime|string", "example": "Earlier today" },
        { "name": "endTimeOrOngoing", "type": "datetime|string", "example": "ongoing" },
        { "name": "peakSeverity", "type": "number", "example": "9" },
        { "name": "symptomBundle", "type": "array<string>", "example": "[\"fatigue\", \"pain\", \"brain fog\"]" },
        { "name": "modeState", "type": "enum", "example": "flare" }
      ],
      "captureMethod": "Manual flare toggle, rule-based spike detection, or chat flare-context detection."
    },
    {
      "name": "MedicationEvent",
      "fields": [
        { "name": "medicationName", "type": "string", "example": "ibuprofen" },
        { "name": "adherenceState", "type": "enum", "example": "On time" },
        { "name": "scheduledTime", "type": "datetime", "example": "2026-03-29T08:00:00" },
        { "name": "actualTime", "type": "datetime", "example": "2026-03-29T09:10:00" },
        { "name": "changeType", "type": "enum", "example": "changed" }
      ],
      "captureMethod": "Quick toggle, chat follow-up, reminder interaction, optional future integration."
    },
    {
      "name": "SleepObservation",
      "fields": [
        { "name": "hours", "type": "number", "example": "5.5" },
        { "name": "quality", "type": "number|string", "example": "3" },
        { "name": "qualityLabel", "type": "enum", "example": "Poor" },
        { "name": "source", "type": "string", "example": "Apple Health" }
      ],
      "captureMethod": "User input in chat/quick entry or auto-filled from health platform."
    },
    {
      "name": "FoodObservation",
      "fields": [
        { "name": "foodOrMealNote", "type": "string", "example": "dairy-heavy dinner" },
        { "name": "unusualFood", "type": "boolean", "example": "true" },
        { "name": "skippedMeal", "type": "boolean", "example": "false" },
        { "name": "lateEating", "type": "boolean", "example": "true" }
      ],
      "captureMethod": "Chat follow-up, likely-driver chips, and food-trigger prompts."
    },
    {
      "name": "StressObservation",
      "fields": [
        { "name": "stressLevel", "type": "enum", "example": "High" },
        { "name": "stressSpike", "type": "boolean", "example": "true" }
      ],
      "captureMethod": "Quick entry chip, chat follow-up, or driver selection."
    },
    {
      "name": "ActivityObservation",
      "fields": [
        { "name": "activityType", "type": "string", "example": "workout" },
        { "name": "activityLoad", "type": "string", "example": "heavy activity" },
        { "name": "context", "type": "string", "example": "walking a lot before flare" }
      ],
      "captureMethod": "Chat, driver chips, or auto-filled from health platform."
    },
    {
      "name": "CycleHormoneObservation",
      "fields": [
        { "name": "cycleContext", "type": "string", "example": "around period" },
        { "name": "patternNote", "type": "string", "example": "symptoms spike every 4 weeks" }
      ],
      "captureMethod": "User-selected feature/outcome tracking, chat, and future health-platform import where available."
    },
    {
      "name": "WeatherObservation",
      "fields": [
        { "name": "weatherContext", "type": "string", "example": "cold front" },
        { "name": "possibleTrigger", "type": "boolean", "example": "true" }
      ],
      "captureMethod": "User-selected driver/context in chat or quick entry."
    },
    {
      "name": "HydrationObservation",
      "fields": [
        { "name": "hydrationSignal", "type": "unspecified", "example": "hydration chosen as tracked feature" }
      ],
      "captureMethod": "Feature configured in onboarding/chat; exact field schema not yet specified in the docs."
    },
    {
      "name": "WorkRoutineObservation",
      "fields": [
        { "name": "routineContext", "type": "string", "example": "deadline week" },
        { "name": "workChange", "type": "string", "example": "long workday" }
      ],
      "captureMethod": "Feature configured in onboarding/chat; captured as context or note."
    },
    {
      "name": "SocialOutingObservation",
      "fields": [
        { "name": "socialContext", "type": "string", "example": "went out socially" }
      ],
      "captureMethod": "Feature configured in onboarding/chat; exact field schema not yet specified in the docs."
    },
    {
      "name": "FunctionCapacity",
      "fields": [
        { "name": "capacityLevel", "type": "enum", "example": "basic self-care" }
      ],
      "captureMethod": "Single-item quick-entry widget when relevant."
    },
    {
      "name": "NoteTag",
      "fields": [
        { "name": "noteText", "type": "string", "example": "heat helped a little" },
        { "name": "tags", "type": "array<string>", "example": "[\"flare\", \"work\"]" },
        { "name": "inputMode", "type": "enum", "example": "voice" }
      ],
      "captureMethod": "Optional 1-tap text/voice note or freeform chat."
    },
    {
      "name": "ExternalHealthSignal",
      "fields": [
        { "name": "metricId", "type": "string", "example": "sleep_duration" },
        { "name": "value", "type": "number|string", "example": "6.2" },
        { "name": "unit", "type": "string", "example": "hours" },
        { "name": "timestampRange", "type": "string", "example": "2026-03-28 night" },
        { "name": "sourceAppDevice", "type": "string", "example": "Apple Health" },
        { "name": "confidence", "type": "number", "example": "0.92" }
      ],
      "captureMethod": "Auto-filled from Apple Health / Health Connect / Google Fit; always editable and source-labeled."
    }
  ],
  "edgeTypes": [
    {
      "source": "Condition",
      "target": "PriorityOutcome",
      "relationship": "prioritizes",
      "determinationMethod": "User-selected in onboarding.",
      "evidenceRequired": "Single onboarding selection."
    },
    {
      "source": "FocusHypothesis",
      "target": "PriorityOutcome",
      "relationship": "tests_impact_on",
      "determinationMethod": "User-configured feature→outcome experiment.",
      "evidenceRequired": "One structured feature/outcome pair; only one active pinned hypothesis at a time."
    },
    {
      "source": "DailyCheckIn",
      "target": "Condition",
      "relationship": "is_tied_to",
      "determinationMethod": "Direct user pick in check-in/chat.",
      "evidenceRequired": "Single user-confirmed condition selection for that day."
    },
    {
      "source": "DailyCheckIn",
      "target": "PriorityOutcome",
      "relationship": "records_score_for",
      "determinationMethod": "Direct slider or quick action entry.",
      "evidenceRequired": "Single 0–10 log."
    },
    {
      "source": "DailyCheckIn",
      "target": "FlareEpisode",
      "relationship": "marks_as",
      "determinationMethod": "Manual flare toggle, rule-based spike detection, or chat flare-context detection.",
      "evidenceRequired": "Manual mark OR severity jump / multiple symptom spikes / flare-like language. Severity >= 8 also triggers low-energy protections."
    },
    {
      "source": "FlareEpisode",
      "target": "SymptomEpisode",
      "relationship": "contains",
      "determinationMethod": "Same flare capture session.",
      "evidenceRequired": "Current flare plus its symptom bundle."
    },
    {
      "source": "FlareEpisode",
      "target": "FlareEpisode",
      "relationship": "compared_to",
      "determinationMethod": "Rule-based historical comparison.",
      "evidenceRequired": "Current flare plus at least 2 previous flares; compare leading indicators from the prior 24–72 hours."
    },
    {
      "source": "SymptomEpisode",
      "target": "MedicationEvent",
      "relationship": "worsened_by_or_helped_by",
      "determinationMethod": "User-reported and/or AI-extracted from aggravating/alleviating context.",
      "evidenceRequired": "One confirmed symptom episode summary or related med entry."
    },
    {
      "source": "SymptomEpisode",
      "target": "SymptomEpisode",
      "relationship": "associated_with",
      "determinationMethod": "Co-occurrence captured in structured symptom summary.",
      "evidenceRequired": "One episode with associated symptoms filled."
    },
    {
      "source": "MedicationEvent",
      "target": "PriorityOutcome",
      "relationship": "correlates_with_or_impacts",
      "determinationMethod": "Qualified metric-based clue or adherence/timing analysis.",
      "evidenceRequired": "Early hint after 3 days; full clue requires sample_days >= 6, abs(effect_size) >= 1.0, missing_rate <= 25%. Med-timing insights are blocked if actual time is missing for 2 of last 3 days."
    },
    {
      "source": "SleepObservation",
      "target": "PriorityOutcome",
      "relationship": "precedes_or_correlates_with",
      "determinationMethod": "Lag check and trend analysis.",
      "evidenceRequired": "24–72h lag window; early hint after 3 days; full clue requires sample_days >= 6, abs(effect_size) >= 1.0, missing_rate <= 25%."
    },
    {
      "source": "FoodObservation",
      "target": "PriorityOutcome",
      "relationship": "triggers_or_correlates_with",
      "determinationMethod": "User-reported trigger logging plus qualified pattern analysis.",
      "evidenceRequired": "Repeated meal/symptom observations; early hint after 3 days; full clue requires sample_days >= 6, abs(effect_size) >= 1.0, missing_rate <= 25%."
    },
    {
      "source": "StressObservation",
      "target": "PriorityOutcome",
      "relationship": "worsens_or_correlates_with",
      "determinationMethod": "User-reported stress level plus qualified trend analysis.",
      "evidenceRequired": "Repeated stress/outcome logs; same clue thresholds as other factor→outcome clues."
    },
    {
      "source": "ActivityObservation",
      "target": "PriorityOutcome",
      "relationship": "worsens_or_improves",
      "determinationMethod": "Context log, imported activity load, and qualified pattern analysis.",
      "evidenceRequired": "Repeated activity/outcome logs; same clue thresholds as other factor→outcome clues."
    },
    {
      "source": "CycleHormoneObservation",
      "target": "PriorityOutcome",
      "relationship": "cycles_with",
      "determinationMethod": "Temporal pattern analysis across days/weeks.",
      "evidenceRequired": "At least 14 days for visible trend; stronger trust over 30–90 day windows."
    },
    {
      "source": "WeatherObservation",
      "target": "PriorityOutcome",
      "relationship": "correlates_with",
      "determinationMethod": "User-tagged weather context plus qualified pattern analysis.",
      "evidenceRequired": "Repeated weather/outcome logs; same clue thresholds as other factor→outcome clues."
    },
    {
      "source": "HydrationObservation",
      "target": "PriorityOutcome",
      "relationship": "may_correlate_with",
      "determinationMethod": "Configurable feature category; exact metric logic not yet fully specified.",
      "evidenceRequired": "Not fully specified in current docs; would need repeated hydration/outcome logs."
    },
    {
      "source": "WorkRoutineObservation",
      "target": "PriorityOutcome",
      "relationship": "may_correlate_with",
      "determinationMethod": "User-configured feature category and contextual notes.",
      "evidenceRequired": "Repeated work/routine context plus outcome logs."
    },
    {
      "source": "SocialOutingObservation",
      "target": "PriorityOutcome",
      "relationship": "may_correlate_with",
      "determinationMethod": "User-configured feature category and contextual notes.",
      "evidenceRequired": "Repeated outing/social context plus outcome logs."
    },
    {
      "source": "PriorityOutcome",
      "target": "FunctionCapacity",
      "relationship": "limits",
      "determinationMethod": "Direct user report of what they could do today.",
      "evidenceRequired": "Single capacity selection for that day."
    },
    {
      "source": "NoteTag",
      "target": "DailyCheckIn",
      "relationship": "annotates",
      "determinationMethod": "User-entered note/tag.",
      "evidenceRequired": "Single note or voice entry."
    },
    {
      "source": "ExternalHealthSignal",
      "target": "SleepObservation / ActivityObservation / CycleHormoneObservation",
      "relationship": "auto_fills",
      "determinationMethod": "Health-platform import with provenance.",
      "evidenceRequired": "Imported metric_id, value, unit, timestamp_range, source_app/device, confidence; field must remain editable. Symptoms and flares themselves still require user confirmation."
    }
  ],
  "insightTypes": [
    {
      "template": "Clue is starting to see an early link between [Feature] and [Outcome].",
      "inputNodes": ["FocusHypothesis", "PriorityOutcome", "SleepObservation / FoodObservation / StressObservation / ActivityObservation / CycleHormoneObservation / WeatherObservation / MedicationEvent"],
      "minDataDays": 3,
      "confidenceThreshold": "Early hint only; below full clue threshold.",
      "dataNeeded": "At least 3 days in the active focus window."
    },
    {
      "template": "[Feature] is associated with about [X]-point worse/better [Outcome].",
      "inputNodes": ["FocusHypothesis", "PriorityOutcome", "MedicationEvent / SleepObservation / FoodObservation / StressObservation / ActivityObservation / CycleHormoneObservation / WeatherObservation"],
      "minDataDays": 6,
      "confidenceThreshold": "Full clue at confidence >= 0.70; weak signal at 0.50-0.69; suppress below 0.50.",
      "dataNeeded": "sample_days >= 6, abs(effect_size) >= 1.0 on 0-10 scale, missing_rate <= 25%, consistency across days."
    },
    {
      "template": "Weak signal: [Feature] may affect [Outcome], but the evidence is not strong enough yet.",
      "inputNodes": ["FocusHypothesis", "PriorityOutcome", "Factor observations"],
      "minDataDays": 6,
      "confidenceThreshold": "0.50-0.69.",
      "dataNeeded": "Same hard gates as a full clue, but confidence remains below 0.70."
    },
    {
      "template": "This looks inconclusive because [missing data reason].",
      "inputNodes": ["FocusHypothesis", "DailyCheckIn", "MedicationEvent", "PriorityOutcome"],
      "minDataDays": 0,
      "confidenceThreshold": "Shown when clue is blocked, not when confidence is strong.",
      "dataNeeded": "Examples from docs: focus_day < 3, outcome logged < 4 of last 7 days, or med timing missing for 2 of last 3 days."
    },
    {
      "template": "Your [Outcome] is 3+ points worse than baseline.",
      "inputNodes": ["PriorityOutcome", "DailyCheckIn"],
      "minDataDays": 1,
      "confidenceThreshold": "Rule-based threshold alert; baseline must exist.",
      "dataNeeded": "Current score plus baseline comparison."
    },
    {
      "template": "This flare looks like your last 2 flares; 24-72h beforehand you had [poor sleep / missed meds / stress spike].",
      "inputNodes": ["FlareEpisode", "SleepObservation", "MedicationEvent", "StressObservation", "DailyCheckIn"],
      "minDataDays": 1,
      "confidenceThreshold": "Confidence-weighted comparison; exact score not fully specified in docs.",
      "dataNeeded": "Current flare plus at least 2 previous flares and pre-flare data from the prior 24-72 hours."
    },
    {
      "template": "Your flares are happening about every [N] days / on a monthly pattern.",
      "inputNodes": ["FlareEpisode", "CycleHormoneObservation", "DailyCheckIn"],
      "minDataDays": 14,
      "confidenceThreshold": "Descriptive trend; stronger trust at 30-90 days.",
      "dataNeeded": "Repeated flare markers across a 14/30/90 day window."
    },
    {
      "template": "Top suspects for [Outcome] right now are [sleep, meds timing, stress, food, weather].",
      "inputNodes": ["PriorityOutcome", "FocusHypothesis", "MedicationEvent", "SleepObservation", "FoodObservation", "StressObservation", "WeatherObservation"],
      "minDataDays": 3,
      "confidenceThreshold": "Confidence-weighted shortlist.",
      "dataNeeded": "Recent driver logs plus current outcome or flare context."
    },
    {
      "template": "Compared with your last 2-4 weeks, [Outcome] is trending better/worse.",
      "inputNodes": ["PriorityOutcome", "DailyCheckIn"],
      "minDataDays": 14,
      "confidenceThreshold": "Trend view unlocked after 14 days.",
      "dataNeeded": "2-4 week time window of outcome logs."
    },
    {
      "template": "Doctor-ready summary: [onset], [location], [severity], [what helps], [what worsens], [associated symptoms].",
      "inputNodes": ["SymptomEpisode", "MedicationEvent", "NoteTag"],
      "minDataDays": 0,
      "confidenceThreshold": "Not a statistical clue; relies on user-confirmed episode detail.",
      "dataNeeded": "One symptom episode with enough structured fields to form a clinician-style paragraph."
    },
    {
      "template": "Complete [N] more days to unlock your chart / pattern.",
      "inputNodes": ["FocusHypothesis", "DailyCheckIn", "PriorityOutcome"],
      "minDataDays": 0,
      "confidenceThreshold": "Rule-based sufficiency message.",
      "dataNeeded": "Examples from docs: fewer than 3 focus days or fewer than 4 logged outcome days in the last 7."
    }
  ]
}

Yes.

Best shape for Clue is: **relational facts first, graph later**.
So: store health data in normalized tables, then derive clue/relationship rows from those facts. That fits Clue’s requirements around exact evidence snapshots, replayability, doctor-pack exports, 7-day focus questions, flare comparisons, and health-platform imports.

## 1) Enums

Use **lookup tables** for vocabularies that may grow, and **Postgres enums** for stable states.

**Postgres enums**

* `mode_enum`: `awareness`, `tracking`, `insight`, `action`
* `focus_state_enum`: `active`, `completed`, `paused`, `archived`
* `capture_source_enum`: `user_input`, `chat_extracted`, `widget`, `notification`, `home_widget`, `lockscreen`, `healthkit`, `health_connect`, `google_fit`, `ai_inferred`
* `med_adherence_enum`: `on_time`, `missed`, `changed`, `taken_late`
* `flare_status_enum`: `active`, `ended`
* `confidence_label_enum`: `full_clue`, `weak_signal`, `inconclusive`, `suppressed`
* `input_mode_enum`: `text`, `voice`, `chip`, `slider`, `picker`, `imported`
* `stress_level_enum`: `low`, `medium`, `high`
* `sleep_quality_enum`: `poor`, `ok`, `good`
* `action_type_enum`: `log_widget`, `ask_followup`, `run_metric`, `export_doctor_pack`
* `clue_type_enum`: `difference_of_means`, `lag_effect`, `baseline_delta`, `flare_comparison`, `cadence_pattern`, `trigger_shortlist`

These match the locked mode/focus/clue behavior in the product and agent requirements.

## 2) Reference tables

**`app_user`**
`id PK`

**`condition_catalog`**
`id PK, slug UNIQUE, name, category`

**`outcome_catalog`**
`id PK, slug UNIQUE, name`
Examples: pain, fatigue, mood, ibs, sleep_quality, headache, anxiety, brain_fog, skin

**`feature_catalog`**
`id PK, slug UNIQUE, name`
Examples: meds, sleep, food, stress, exercise, cycle, work, weather, hydration, supplements, social_outings

**`symptom_catalog`**
`id PK, slug UNIQUE, name, body_system NULL`

**`medication_catalog`**
`id PK, display_name, generic_name NULL`

**`tag_catalog`**
`id PK, name UNIQUE`

This comes directly from onboarding condition selection, impact-question feature/outcome lists, symptom capture, meds, and notes/tags.

## 3) User profile / configuration tables

**`user_condition`**
`id PK`
`user_id FK -> app_user.id`
`condition_id FK -> condition_catalog.id`
`is_active boolean`

**`user_symptom`**
`id PK`
`user_id FK -> app_user.id`
`symptom_catalog_id FK -> symptom_catalog.id NULL`
`custom_name text NULL`
`condition_id FK -> condition_catalog.id NULL`
`is_active boolean`

**`focus_hypothesis`**
`id PK`
`user_id FK -> app_user.id`
`feature_id FK -> feature_catalog.id`
`outcome_id FK -> outcome_catalog.id`
`why_note text NULL`
`state focus_state_enum`
`mode_created_from mode_enum NULL`
`started_on date`
`ended_on date NULL`

**Constraint:** partial unique index on `(user_id)` where `state = 'active'`
That enforces the MVP rule of exactly one active pinned focus hypothesis.

## 4) Daily capture tables

**`day_card`**
`id PK`
`user_id FK -> app_user.id`
`observed_date date`
`UNIQUE (user_id, observed_date)`

**`day_observation`**
`id PK`
`day_card_id FK -> day_card.id UNIQUE`
`priority_outcome_id FK -> outcome_catalog.id`
`priority_outcome_score numeric(4,1)`
`tied_condition_id FK -> condition_catalog.id NULL`
`mode mode_enum NULL`
`is_flare boolean`
`is_low_energy boolean`
`capture_source capture_source_enum`

**`day_driver`**
`id PK`
`day_card_id FK -> day_card.id`
`feature_id FK -> feature_catalog.id`
`is_present boolean`
`note text NULL`

**`day_note`**
`id PK`
`day_card_id FK -> day_card.id`
`body text`
`input_mode input_mode_enum`

**`day_note_tag`**
`day_note_id FK -> day_note.id`
`tag_id FK -> tag_catalog.id`
`PRIMARY KEY (day_note_id, tag_id)`

This matches the daily loop: priority outcome score, tied condition, “anything new since yesterday,” flare toggle, suspects/drivers, and optional notes.

## 5) Symptom + flare tables

**`symptom_episode`**
`id PK`
`user_id FK -> app_user.id`
`day_card_id FK -> day_card.id`
`raw_chat_text text NULL`
`onset_text text NULL`
`duration_text text NULL`
`progression_text text NULL`
`context_text text NULL`

**`symptom_episode_item`**
`id PK`
`symptom_episode_id FK -> symptom_episode.id`
`user_symptom_id FK -> user_symptom.id`
`location_text text NULL`
`quality_text text NULL`
`severity numeric(4,1) NULL`
`frequency_text text NULL`
`quantity_text text NULL`

**`symptom_episode_associated_symptom`**
`symptom_episode_id FK -> symptom_episode.id`
`user_symptom_id FK -> user_symptom.id`
`PRIMARY KEY (symptom_episode_id, user_symptom_id)`

**`symptom_episode_modifier`**
`id PK`
`symptom_episode_id FK -> symptom_episode.id`
`modifier_kind text`  — `aggravating` / `alleviating`
`feature_id FK -> feature_catalog.id NULL`
`free_text text NULL`

**`flare_episode`**
`id PK`
`user_id FK -> app_user.id`
`start_day_card_id FK -> day_card.id`
`started_at timestamptz`
`ended_at timestamptz NULL`
`peak_severity numeric(4,1) NULL`
`status flare_status_enum`

**`flare_episode_symptom`**
`flare_episode_id FK -> flare_episode.id`
`user_symptom_id FK -> user_symptom.id`
`peak_severity numeric(4,1) NULL`
`PRIMARY KEY (flare_episode_id, user_symptom_id)`

These cover the 8-characteristics capture, raw chat text, flare start/end, severity peaks, and symptom bundles.

## 6) Medication tables

**`user_medication`**
`id PK`
`user_id FK -> app_user.id`
`medication_catalog_id FK -> medication_catalog.id NULL`
`display_name text`

**`medication_schedule`**
`id PK`
`user_medication_id FK -> user_medication.id`
`scheduled_time time NULL`

**`medication_event`**
`id PK`
`user_medication_id FK -> user_medication.id`
`day_card_id FK -> day_card.id`
`scheduled_at timestamptz NULL`
`actual_at timestamptz NULL`
`adherence_state med_adherence_enum`
`change_note text NULL`
`capture_source capture_source_enum`

You need both `scheduled_at` and `actual_at` because the spec explicitly needs med timing, reminders, adherence snapshots, and “med timing impact” gating.

## 7) Factor / observation tables

Do this with a **base observation table + subtype tables**.

**`observation`**
`id PK`
`user_id FK -> app_user.id`
`day_card_id FK -> day_card.id`
`feature_id FK -> feature_catalog.id`
`observed_at timestamptz`
`capture_source capture_source_enum`

**`sleep_observation`**
`observation_id PK FK -> observation.id`
`duration_minutes int NULL`
`quality_score numeric(4,1) NULL`
`quality_label sleep_quality_enum NULL`

**`stress_observation`**
`observation_id PK FK -> observation.id`
`stress_level stress_level_enum`

**`food_observation`**
`observation_id PK FK -> observation.id`
`meal_note text NULL`
`unusual_food boolean NULL`
`skipped_meal boolean NULL`
`late_eating boolean NULL`

**`activity_observation`**
`observation_id PK FK -> observation.id`
`activity_type text NULL`
`load_label text NULL`
`duration_minutes int NULL`

**`cycle_observation`**
`observation_id PK FK -> observation.id`
`cycle_phase text NULL`
`day_in_cycle int NULL`
`note text NULL`

**`weather_observation`**
`observation_id PK FK -> observation.id`
`weather_note text NULL`

**`hydration_observation`**
`observation_id PK FK -> observation.id`
`amount_ml int NULL`

**`work_routine_observation`**
`observation_id PK FK -> observation.id`
`routine_note text NULL`

**`social_outing_observation`**
`observation_id PK FK -> observation.id`
`outing_note text NULL`

This matches Clue’s factor model: sleep, stress, food, exercise/activity, cycle, weather, hydration, work/routine, social/outing.

## 8) External health signal tables

**`external_health_signal`**
`id PK`
`observation_id FK -> observation.id NULL`
`user_id FK -> app_user.id`
`metric_id text`
`value_num numeric NULL`
`value_text text NULL`
`unit text NULL`
`range_start timestamptz`
`range_end timestamptz`
`source_app_device text`
`confidence numeric(4,3) NULL`

This is straight from the integration mapping requirement: `metric_id`, `value`, `unit`, `timestamp_range`, `source_app/device`, `confidence`, and editable imported fields.

## 9) Derived analytics / graph / evidence tables

**`baseline_metric`**
`id PK`
`user_id FK -> app_user.id`
`outcome_id FK -> outcome_catalog.id`
`window_days int`
`baseline_value numeric(6,2)`
`computed_at timestamptz`

**`metric_run`**
`id PK`
`user_id FK -> app_user.id`
`focus_hypothesis_id FK -> focus_hypothesis.id NULL`
`run_type text`
`window_start date`
`window_end date`
`output_hash text`
`created_at timestamptz`

**`metric_value`**
`id PK`
`metric_run_id FK -> metric_run.id`
`metric_key text`
`value_num numeric NULL`
`value_text text NULL`

**`evidence_snapshot`**
`id PK`
`user_id FK -> app_user.id`
`query_fingerprint text`
`created_at timestamptz`

**`evidence_item`**
`id PK`
`evidence_snapshot_id FK -> evidence_snapshot.id`
`source_table text`
`source_pk text`
`metric_run_id FK -> metric_run.id NULL`

**`clue_card`**
`id PK`
`user_id FK -> app_user.id`
`focus_hypothesis_id FK -> focus_hypothesis.id`
`clue_type clue_type_enum`
`summary_text text`
`confidence_score numeric(4,3)`
`confidence_label confidence_label_enum`
`metric_run_id FK -> metric_run.id`
`evidence_snapshot_id FK -> evidence_snapshot.id`
`created_at timestamptz`

**`relationship_fact`**
`id PK`
`user_id FK -> app_user.id`
`focus_hypothesis_id FK -> focus_hypothesis.id NULL`
`source_feature_id FK -> feature_catalog.id`
`target_outcome_id FK -> outcome_catalog.id`
`relationship_verb text`
`clue_card_id FK -> clue_card.id`
`valid_from date`
`valid_to date NULL`

This is your actual “graph edge” layer in Postgres.
Facts stay normalized. Edges become **derived relationship facts** backed by a clue, metric run, and evidence snapshot. That fits the product’s “pattern, not causation” stance and exact-evidence requirement.

## 10) Action / explainability tables

**`decision_trace`**
`id PK`
`user_id FK -> app_user.id`
`focus_hypothesis_id FK -> focus_hypothesis.id NULL`
`rulebook_version text`
`determinism_hash text`
`created_at timestamptz`

**`decision_trace_rule`**
`id PK`
`decision_trace_id FK -> decision_trace.id`
`rule_id text`
`fired boolean`

**`action_candidate`**
`id PK`
`decision_trace_id FK -> decision_trace.id`
`focus_hypothesis_id FK -> focus_hypothesis.id NULL`
`action_type action_type_enum`
`title text`
`value_score numeric(4,3)`
`effort_score numeric(4,3)`
`focus_score numeric(4,3)`
`confidence_score numeric(4,3)`
`novelty_score numeric(4,3)`
`rank_score numeric(4,3)`

**`action_plan`**
`id PK`
`action_candidate_id FK -> action_candidate.id`
`evidence_snapshot_id FK -> evidence_snapshot.id`
`rank_position int`

These are required because Clue stores top-3 actions, their ranking factors, and the evidence/decision trace behind them.

## 11) Export / doctor pack tables

**`doctor_pack_export`**
`id PK`
`user_id FK -> app_user.id`
`window_days int`
`evidence_snapshot_id FK -> evidence_snapshot.id`
`created_at timestamptz`

**`doctor_pack_section`**
`id PK`
`doctor_pack_export_id FK -> doctor_pack_export.id`
`section_type text`
`sort_order int`

This preserves the exact export that clinicians see: trend windows, flare timeline, med adherence snapshot, symptom paragraphs, and focus-hypothesis evidence page.

## 12) One table I would still keep, even in a normalized design

**`event_log`**
`id PK`
`user_id FK -> app_user.id`
`entity_table text`
`entity_pk text`
`event_type text`
`payload_jsonb`
`created_at timestamptz`

Reason: Clue explicitly wants append-only capture, replayable decisions, and edits as new events rather than destructive overwrite. So the normalized tables are your query model, and `event_log` is your immutable audit stream.

## 13) The 5 highest-value constraints

* `UNIQUE (user_id, observed_date)` on `day_card`
* partial unique index for one active `focus_hypothesis` per user
* `CHECK (confidence_score >= 0 AND confidence_score <= 1)` on `clue_card`
* `CHECK (priority_outcome_score BETWEEN 0 AND 10)` and same for symptom severity
* `FOREIGN KEY` from every clue/action/export to `evidence_snapshot`

## 14) What not to do

Do **not** make the core model:

* one giant `health_log` table
* one generic `node` table
* one generic `edge` table

That would make doctor-trust outputs, evidence snapshots, and replayable clue logic much harder.
For Clue, the right order is:

**facts → metrics → clues → relationship facts → exports**.

Next useful step is the actual `CREATE TYPE` + `CREATE TABLE` SQL.
