# Agent Architecture (Technical)

> How the symptom-tracking agent is built — data spine, agents, retrieval, tools, and data model.

---

## 1. Data Spine

*Ensures every widget and clue is grounded in real data.*

### Local-First: SQLite

- **Source of interaction** — every tap, chat, and check-in writes to SQLite first (fast, offline)
- Use **FTS5** for full-text search on notes/summaries

### Cloud Sync: Supabase Postgres

- Background sync enables multi-device + exports
- Secure per-user access via **Supabase Auth + Row Level Security**

### Sync Options (pick one)

| Option | Best For |
|--------|----------|
| **PowerSync** | Purpose-built for local-first Supabase-style apps |
| **ElectricSQL** | Apps that talk to local DB with sync behind the scenes |
| **RxDB + Supabase** | Quick offline-first collections with pull/push + realtime |

---

## 2. Core Agents

*Small, composable, deterministic.*

### A) Intake Agent
**Chat → Structured Data**

Turns free-text into structured fields:
- Condition, symptom episode, severity, timing, drivers, meds
- OLDCARTS/OPQRST paragraph

**Writes:** `episode`, `episode_fields`, `raw_note`, `tags`

**Inputs:** chat_message, widget_submit, current focus_hypothesis, user mode (Awareness/Tracking/Insight/Action)

**Outputs (tables written):** event_log, episode, episode_facts, day_observation, med_log, symptom_log, note

**Determinism rules:**
- Structured extraction is schema-first: only fills allowed fields; unknown stays null
- ID generation uses deterministic ULID in tests (seeded clock)

**Failure modes + fallbacks:**
- Ambiguous text → write only raw note + ask 1 clarifying widget
- Low energy flag → skip follow-ups, store minimal baseline

---

### B) Timeline Agent
**Episodes → Day Cards**

Builds the "calendar, filled in" day-cards and flare boundaries.

**Writes:** `day_summary`, `flare_sessions`, `missing_fields`

**Inputs:** new/updated events since last_materialized_event_id

**Outputs:** day_card, episode_day_link, flare_session, missing_field_queue

**Determinism:**
- Materialization is a pure function of ordered events
- Flare boundaries rule-based with fixed thresholds + cooldowns

**Failures/fallbacks:**
- Missing timestamps → assign event time, mark time_confidence=low
- Overlapping flare sessions → merge by deterministic precedence (latest start wins)

---

### C) Trend Agent
**Stats, not vibes**

Computes:
- 3-day early signals
- 14-day rolling trends (Screen 4 promises)

**Writes:** `metrics` tables (rolling means, streaks, deltas, correlations)

**Inputs:** day_card range + active focus hypothesis (feature_id, outcome_id)

**Outputs:** metric_def, metric_value, metric_run, baseline_window

**Determinism:**
- Metrics computed by `recompute.metrics(window, feature, outcome)` with fixed windows and rounding rules
- Every metric run stores input row IDs + output hash

**Failures/fallbacks:**
- Insufficient data → emit metric_value with status=insufficient_data (not null), so UI can explain

---

### D) Clue Agent
**Insight with provenance**

Generates a Clue **only** when it can cite evidence.

> Example: *"After poor sleep, fatigue +2.1 avg over 6 days"*

**Writes:** `clue`, `evidence_snapshot`, `confidence`, `next_best_question`

**Inputs:** qualified metric_values + latest day context + rulebook version

**Outputs:** clue_card, evidence_snapshot, decision_trace, next_best_question

**Determinism:**
- Clues are templates filled from metrics; no free-form invention
- Same metric set + same rules → same clue text (stable ordering)

**Failures/fallbacks:**
- If data sufficiency fails → write "Not enough data yet" explanation card + a single low-effort widget that closes the gap

---

### E) Widget Planner Agent
**Personalized UI**

Decides which widgets to show next (Screen 3 adaptive widgets + future "evidence layer").

**Writes:** `widget_spec` (question, options, validation, and what it will unlock)

**Inputs:** mode, focus hypothesis progress (Day X/7), missing-field queue, last 7 days completion rates

**Outputs:** widget_spec, widget_instance, decision_trace (widget selection)

**Determinism:**
- Priority order is fixed: (1) baseline outcome (2) meds timing gap (3) feature capture (4) flare toggle (5) optional note

**Failures/fallbacks:**
- If widget fatigue detected → collapse to 1 widget + "skip" path

---

### F) Doctor Pack Agent
**The trust moment**

Produces "clinician-shaped" summaries + simple graphs and a PDF/export object.

**Inputs:** date range (14/30/90), selected symptoms/conditions, clinician format (default)

**Outputs:** export_job, export_artifact, export_section, evidence_snapshot references for every chart/paragraph

**Determinism:**
- Pack is generated from a pinned export template version + same underlying evidence IDs

**Failures/fallbacks:**
- If charts unavailable → include a "Data gaps" section with exact missing fields and date spans

---

## 3. RAG That Actually Works

*Grounded retrieval for every new widget and clue.*

### Two-Tier Retrieval

| Tier | Purpose | Method |
|------|---------|--------|
| **Tier A** | The Truth | Structured retrieval via SQL — exact episodes, metrics, prior clues relevant to current question |
| **Tier B** | The Voice | Narrative retrieval via RAG — past provider paragraphs + user preference notes for consistent phrasing |

> Core RAG principle: generation conditioned on retrieved, explicit memory. This enables provenance and knowledge updates over time.

---

## 4. Tooling Model

*Agent can add/edit Supabase + local SQLite directly — but through strict tools, not open-ended DB access.*

### Available Tools

```
sqlite.read(query_id, params)
sqlite.write(mutation_id, payload)

supabase.read(rpc_or_view, params)
supabase.write(table, row, upsert)

recompute.metrics(window, feature, outcome)

render.widget(widget_spec_id)
render.chart(metric_id)

export.doctor_pack(range, format)
```

---

## 5. Key Rule

> **Every widget/clue must store its evidence snapshot** (the exact rows/metric IDs used). That's how you earn "doctor trust."

---

## 6. Event Taxonomy (Onboarding → End)

### Required Fields (All Events)

`event_id`, `user_id`, `device_id`, `session_id`, `ts_client`, `ts_server_optional`, `screen_id`, `event_type`, `payload_json`, `pointers_json`, `schema_version`

### Event Types + Required Fields

| Event Type | Required Fields |
|------------|-----------------|
| `screen_view` | screen_id, route, focus_hypothesis_id_optional, day_card_id_optional |
| `chat_message` | message_id, role(user/agent), text, mode, thread_id |
| `widget_impression` | widget_instance_id, widget_id, position, reason_code |
| `widget_submit` | widget_instance_id, widget_id, values_json, validation_state, latency_ms |
| `edit` | target_table, target_pk, supersedes_event_id, edit_reason |
| `dismiss` | target_type(clue/widget/prompt), target_id, dismiss_reason |
| `export` | export_job_id, range, format, doctor_view=true/false |
| `share` | export_job_id, channel, success=true/false |
| `tap` | element_id, element_type(button/card/chip), context_json |
| `error` | error_code, tool_name, query_id/mutation_id, trace_id |

### Pointers to Rows (pointers_json)

Array of `{table, pk, role}` like `{day_card, ..., "context"}` or `{metric_value, ..., "evidence"}`

---

## 7. Data Model

### Core Tables (Episodes → Day Cards → Clues → Widgets)

#### episode
```sql
episode_id PK, user_id, start_ts, end_ts_nullable, is_flare, 
primary_symptom_id, created_event_id

Index: (user_id, start_ts)
```

#### day_card
```sql
day_id PK, user_id, date_local, focus_hypothesis_id, 
severity_summary_json, completion_score, created_from_event_range

Unique: (user_id, date_local)
Index: (user_id, focus_hypothesis_id, date_local)
```

#### clue_card
```sql
clue_id PK, user_id, date_local, focus_hypothesis_id, clue_type, 
text, confidence, evidence_snapshot_id, decision_trace_id, status

Index: (user_id, focus_hypothesis_id, date_local)
```

#### widget_spec
```sql
widget_id PK, name, schema_json, writes_to, version
```

#### widget_instance
```sql
widget_instance_id PK, user_id, widget_id, day_id_nullable, 
chat_thread_id_nullable, state(open/submitted/dismissed), 
evidence_snapshot_id_nullable, decision_trace_id

Index: (user_id, day_id, state)
```

### Evidence + Decisions + Versions

#### evidence_snapshot
```sql
evidence_snapshot_id PK, user_id, created_at, tier(A/B), source_tool, 
query_id, params_json, result_hash, rulebook_version, metric_run_id_nullable

Index: (user_id, created_at)
```

#### evidence_item
```sql
evidence_item_id PK, evidence_snapshot_id, item_type(row_ref/metric_ref/blob), 
ref_table, ref_pk, ref_column_nullable, metric_id_nullable

Index: (evidence_snapshot_id)
```

#### decision_trace
```sql
decision_trace_id PK, user_id, created_at, agent_name, inputs_json, 
evidence_snapshot_ids_json, rule_evals_json, scores_json, 
output_pks_json, determinism_hash

Index: (user_id, agent_name, created_at)
```

#### rulebook_version
```sql
rulebook_version PK, published_at, content_hash, rules_json, changelog
```

### Observations + Meds + Symptoms + Notes (MVP Minimal)

#### day_observation
```sql
obs_id PK, user_id, day_id, field_id, value_num, value_text, 
value_json, source_event_id

Index: (user_id, day_id, field_id)
```

#### med_log
```sql
med_log_id PK, user_id, day_id, med_id, status(taken/missed/changed), 
time_ts_nullable, dose_text_nullable, source_event_id

Index: (user_id, med_id, day_id) and (user_id, day_id)
```

#### symptom_log
```sql
symptom_log_id PK, user_id, day_id, symptom_id, severity_0_10, 
onset_ts_nullable, location_text_nullable, quality_text_nullable, 
source_event_id

Index: (user_id, symptom_id, day_id)
```

#### note
```sql
note_id PK, user_id, day_id_nullable, episode_id_nullable, 
text, fts_vector  -- FTS5
```

### Sync + Events

#### event_log
```sql
event_id PK, …fields above…, synced_at_nullable

Index: (user_id, ts_client)
```

#### outbox
```sql
outbox_id PK, event_id, state(pending/sent/acked/failed), 
attempts, next_retry_at

Index: (state, next_retry_at)
```

### Evidence Snapshot References

- Any clue/chart/export stores `evidence_snapshot_id`
- The snapshot expands to `evidence_item` rows containing either:
  - `{ref_table, ref_pk}` (exact local rows), OR
  - `{metric_id}` + `metric_run_id` (exact computed outputs)

---

## 8. Rules System (Readable + Inspectable)

### Rule Format (stored in rulebook_version.rules_json)

```
IF (predicates on mode, focus day, missing fields, sample size, metric thresholds)
THEN (emit widget / emit clue / suppress / rank action candidates)
BECAUSE (human explanation string)
EVIDENCE NEEDED (row refs + metric defs required)

Plus: rule_id, bucket, severity, cooldown_days, owner(agent)
```

---

## 9. Flowcharts

### Onboarding → First Focus → First Check-in → First Clue → Next 3 Actions → Doctor Pack Export

```
[Onboarding: Conditions (1A)]
           ↓
[Priority outcome (1B)]
           ↓
[Impact question (1C): Feature→Outcome]
           ↓
[Mode select (Awareness/Tracking/Insight/Action)]
           ↓
[Quick check-in widgets (20s)]
           ↓
[Day card materialized]
           ↓
{If Day≥3 and rules qualify} → [Clue card + Why this clue]
{Else} → [Baseline-building + Next best question]
           ↓
[Next 3 actions (widget-first)]
           ↓
[Doctor pack export (14/30/90d)]
```

### Sync Flow: Local Write → Outbox → Supabase → Reconciliation

```
[sqlite.write(event_log + domain rows)]
           ↓
[outbox.enqueue(event_id)]
           ↓
[supabase.write(events upsert)]
           ↓
[supabase.read(pull missing events since cursor)]
           ↓
[sqlite.write(new events)]
           ↓
[re-materialize: day_card/metrics/clues as needed]
           ↓
[mark synced cursors + ack outbox]
```

### Clue Generation Flow: Evidence Retrieval → Metric Compute → Rule Gating → Clue Card Write

```
[sql Tier A retrieval: rows for feature/outcome window]
           ↓
[recompute.metrics(metric_run)]
           ↓
[create evidence_snapshot (rows + metric IDs)]
           ↓
[rule gating: sufficiency + qualification]
           ↓
{Pass} → [write clue_card + decision_trace]
{Fail} → [write "not enough data" + next_best_question widget]
```

---

## 10. ADK Integration Plan (Reproducible Runs)

### ADK Structure (Agents/Tools/State)

**State object (authoritative):**
```json
{
  "user_id": "...",
  "session_id": "...",
  "mode": "...",
  "focus_hypothesis_id": "...",
  "today_day_id": "...",
  "rulebook_version": "...",
  "tool_cursor_ids": {}
}
```

**Agent router:** selects one of the 6 agents per turn based on mode + trigger event type

**Strict tools only:**
- `sqlite.read(query_id, params)` / `sqlite.write(mutation_id, payload)`
- `supabase.read(...)` / `supabase.write(...)`
- `recompute.metrics(...)`
- `render.widget/chart(...)`
- `export.doctor_pack(...)`

### What Gets Logged for Replay + Regression

- Full tool call log: tool name, query_id/mutation_id, params, returned row IDs, hashes
- Decision Trace row for every clue/action/widget plan (includes determinism hash)
- Rulebook version pinned per run
- "Golden" fixtures: a small seeded SQLite DB + expected clue/action outputs for regression

---

## 11. Debug UX (Internal Screens)

### "Why this Clue?"
Shows: clue text, confidence, rule IDs fired, evidence snapshot drilldown (exact rows/metric IDs), and "why not other clues"

### "Why these 3 actions?"
Shows: candidate list with scores (value/effort/focus/novelty/confidence), missing-field diagnosis, and cooldowns that suppressed repeats

### "Rulebook Explorer"
Shows: rule buckets, rule versions, search by rule_id, and per-rule "last fired" counts + examples (links to decision traces)

**How it helps ship faster:** you debug logic by inspecting artifacts instead of guessing from chat transcripts

