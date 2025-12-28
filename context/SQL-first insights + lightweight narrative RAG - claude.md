# Path 1 (MVP): SQL-First Insights + Lightweight Narrative RAG

## North Star

Build a symptom tracker that produces **doctor-trustworthy insights** from structured metrics.

RAG is **not** the brain—it only:
1. Rewrites metric-derived insights into human language
2. Asks the next best missing field to improve data quality

---

## Core Promise

> "Tell me how you feel → I capture it in a way doctors take seriously → you get trends, triggers, and visit-ready summaries."

---

## Scope

### What We're Building

| Feature | Description |
|---------|-------------|
| **Fast Logging** | Chat-first entry for quick symptom capture |
| **Strict Schema** | SQL-powered insights engine |
| **Insight Cards** | Trends, correlations, flare summaries, medication adherence patterns |
| **Doctor Export** | Clean PDF/print view (later); MVP = shareable summary screen |

### What We're NOT Building (Path 1 Constraints)

- ❌ No "medical diagnosis"
- ❌ No free-form long RAG over the whole internet
- ❌ No "agent decides everything" — **Metrics decide; RAG narrates**

---

## System Design Rules

1. **SQL is source of truth** — Every insight must map to a queryable table + timestamped facts

2. **RAG never invents facts** — It can only use:
   - Computed metrics + aggregates
   - The user's own logged entries
   - A small "app knowledge base" for copy/templates (not medical claims)

3. **Reduce uncertainty** — Every chat turn tries to collect the single most valuable missing field

4. **Doctor trust** — Always capture symptoms with the **8 characteristics** when relevant:

   | Characteristic | Example |
   |----------------|---------|
   | Onset | "Started 2 hours ago" |
   | Duration | "Lasted 45 minutes" |
   | Intensity | "6/10 severity" |
   | Location | "Left temple" |
   | Quality | "Throbbing, sharp" |
   | Triggers | "After coffee" |
   | Relieving factors | "Better after rest" |
   | Associated symptoms | "With nausea" |
   | *Functional impact* | "Couldn't work" *(optional but useful)* |

---

## Data Model (Minimum Viable Tables)

### `events`

```sql
id              -- Primary key
user_id         -- Foreign key to users
timestamp       -- When the event occurred
event_type      -- ENUM: symptom | mood | med | meal | sleep | activity | cycle | note
source          -- ENUM: chat | quick-add | import
confidence      -- System-derived parsing confidence (optional)
```

### `symptom_logs`

```sql
event_id        -- FK → events
symptom         -- Normalized symptom name
severity        -- 0–10 scale

-- Optional structured fields (store NULL if unknown):
onset_time
duration_min
location
quality
suspected_trigger
relief
associated
functional_impact
```

### `med_logs`

```sql
event_id        -- FK → events
med_name        -- Normalized medication name
dose            -- Dosage amount
taken           -- BOOLEAN: was it taken?
time_intended   -- Optional: scheduled time
side_effects    -- Optional: any side effects noted
```

### `context_logs` (lightweight)

```sql
event_id        -- FK → events
sleep_hours
stress          -- 0–10 scale
activity_level  -- 0–10 scale
caffeine        -- Simple int/bool
alcohol         -- Simple int/bool
hydration       -- Simple int/bool
```

### `entities_normalized`

Maps raw user phrases → canonical entities (symptoms, meds, foods).

Used to keep SQL clean and insights stable.

---

## Insights Engine (SQL-First)

### Output Table: `insights`

```sql
id
user_id
generated_at
insight_type    -- ENUM: trend | trigger | correlation | adherence | flare_summary | anomaly
title
metric_payload  -- JSON: query result rows + stats
evidence_refs   -- List of event_ids or date ranges
confidence      -- 0–1 scale
recommended_next_field  -- Optional
```

### Required Insight Types (MVP)

| Type | Example |
|------|---------|
| **Trend** | "Fatigue severity has increased over the last 14 days." |
| **Trigger Candidates** | "Headache often appears within 12 hours of \<X\>." *(non-causal language)* |
| **Before/After Comparisons** | "On days with sleep < 6h, pain is higher by +1.2." |
| **Flare Summaries** | Cluster high-severity runs into a "flare episode" with start/end + top co-occurring signals |
| **Adherence Patterns** | Missed meds rate + association with symptoms *(careful phrasing)* |

### Language Constraints

✅ **Use:** "associated with," "co-occurs," "often follows," "pattern suggests"

❌ **Avoid:** "causes," "definitely," "diagnosis"

---

## Narrative RAG (Rewrite + Next Question)

### Inputs to the Model

1. **The insight object** — title + metric_payload + evidence_refs
2. **User context** — what they track, goals, preferred tone
3. **Template library** (tiny KB) for:
   - Empathetic phrasing
   - Doctor-ready summaries
   - Follow-up question patterns

### Output Schema (Strict)

```typescript
narrative_response {
  summary          // 1–3 sentences
  evidence         // Bullets with numbers/dates
  confidence_line  // One sentence
  next_question    // Exactly one question (highest value missing field)
  cta              // "Log now" | "Add detail" | "View chart" | "Export summary"
}
```

### "Next Best Missing Field" Selection

Pick **ONE** based on expected insight lift:

| Priority | Missing Field | Why It Matters |
|----------|---------------|----------------|
| 1 | Severity | Blocks almost everything |
| 2 | Timestamp precision | Morning/afternoon/evening |
| 3 | Trigger/relief | For recurring symptoms |
| 4 | Duration/onset | For flare detection |
| 5 | Med dose/time | For adherence correlation |
| 6 | Sleep/stress context | When patterns look noisy |

> **Rule:** Ask only what's relevant to the just-seen insight.

---

## Chat Parsing Rules (MVP)

1. Convert chat text → draft structured event(s)

2. Always show a **confirmation chip UI**:
   > "I logged: Headache 6/10, 2:10pm. Add trigger?"

3. If parsing confidence is low → ask a **single** clarification

---

## Product Behaviors That Build "Doctor Trust"

### Every Chart/Summary Includes:

- Date ranges
- Counts (n)
- Simple stats (avg, max, streaks)
- Clear uncertainty language

### "Visit Pack" Summary Format

*MVP = screen view; PDF later*

| Section | Content |
|---------|---------|
| Top Symptoms | Severity + frequency |
| Flare Episodes | Start/end, max severity |
| Med Adherence | Overview of compliance |
| Consistent Associations | Sleep/stress/food/activity correlations |
| Important Notes | User-marked entries |

---

## Safety + Scope Guardrails

| ❌ Never Do | ✅ Always Do |
|-------------|--------------|
| Treatment instructions | Route back to logging |
| Diagnosis | Use association language |
| Medical advice | "Seek immediate help" for emergencies |

> **Emergency handling:** Keep minimal—route back to logging + "seek immediate help" wording.

---

## Milestones (Path 1 MVP)

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOGGING PIPELINE                                        │
│     chat → structured tables → timeline UI                  │
├─────────────────────────────────────────────────────────────┤
│  2. INSIGHT GENERATOR v1                                    │
│     daily/weekly aggregates + flare clustering              │
├─────────────────────────────────────────────────────────────┤
│  3. NARRATIVE LAYER                                         │
│     insight → summary + evidence + single next question     │
├─────────────────────────────────────────────────────────────┤
│  4. DOCTOR-READY SUMMARY SCREEN                             │
│     1-tap shareable view (PDF later)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Definition of Done (MVP)

### Speed Target
- [ ] User can log in **20–30 seconds**

### Insight Generation
The system generates at least:
- [ ] **3 trends**
- [ ] **2 association insights**
- [ ] **1 flare summary** (if data supports it)
- [ ] **1 adherence insight** (if meds tracked)

*All with evidence and dates.*

### UX Requirement
- [ ] Every insight ends with exactly **one "next best field" question**

Path 2 (More magic, still safe): Add embeddings over provider paragraphs + notes
Better “compare to last flare like this” and more human continuity, while still anchored to SQL evidence.

Path 1 is the foundation for Path 2.

It creates clean structured data (episodes, day cards, flare boundaries, metrics). Path 2’s embeddings/RAG become way more accurate when they can anchor to these IDs and windows instead of guessing from raw text.

It forces “evidence-first” habits (every clue tied to specific rows/metrics + confidence). Path 2 then uses retrieval to explain and personalize, not invent.

It generates the best RAG corpus: provider paragraphs, resolved missing-fields, user edits, and “what helped” outcomes become high-signal documents to embed later.

It de-risks privacy + cost: most insights stay SQL/metric-driven; embeddings are only for narrative continuity and better comparisons.

Two ways to think about it:

Complementary: Path 1 = truth layer, Path 2 = voice + memory layer.

Progressive enhancement: Ship Path 1 fully, then add Path 2 in slices (compare-to-last-flare, appointment pack phrasing, “what changed?” explanations) without changing your core data model.