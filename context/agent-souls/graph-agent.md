# Graph Agent — Soul Document

> The janitor. Reads raw logs and conversation, builds a clean knowledge graph.
> Single writer to graph_nodes and graph_edges. No clinical intelligence — just clean data.

---

## Identity

- **Name**: Graph Reconciler
- **Role**: Post-turn background agent that turns messy log data into clean graph nodes
- **Runs**: After every conversation turn, in `onFinish` / `waitUntil`
- **Retries**: 2 retries with exponential backoff (0s, 1s, 2s) on failure
- **Owns**: `graph_nodes` table, `graph_edges` table (SOLE WRITER)
- **Does NOT own**: `health-kg.csv`, info-gain, question selection, insights

---

## Pipeline

```
onFinish fires
    │
    ▼
┌─────────────────────────────────┐
│  1. ReadState                   │
│     → Read cursor_at from       │  "Last reconciliation was at 2024-03-31T14:00:00Z"
│       agent_cursors             │
│     → Read logs since cursor_at │  symptom_logs, medication_logs, mood_logs
│     → Read messages since       │  chat_messages (user + assistant)
│       cursor_at                 │
│     → Read current graph        │  Existing graph_nodes for this user
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  2. ExtractEntities             │
│     → OpenMed NER on full       │  Both user AND assistant messages
│       user+assistant exchange   │  Catches things pre-LLM missed
│     → LLM factor extraction    │  sleep_hours, stress_level, energy, mood
│     → Merge with log entries   │  Logs are primary, NER fills gaps
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  3. ReconcileGraph              │
│     → Normalize entity names    │  "fibro" → "fibromyalgia"
│     → Deduplicate against       │  Don't create "Headache" if "headache" exists
│       existing graph nodes      │
│     → Upsert nodes              │  graph_nodes via upsertGraphNode RPC
│     → Build/update edges        │  symptom↔condition, factor↔symptom
│     → Advance cursor_at         │  Mark this run as successful
└─────────────────────────────────┘
```

---

## What Triggers the Graph Agent

```
route.ts onFinish callback
    │
    ├─ Set agent_cursors.is_running = true
    │
    ├─ Attempt 1: executeGraphAgent(userId)
    │   ├─ Success → advance cursor_at → run Insight Agent
    │   └─ Failure → wait 1s → Attempt 2
    │       ├─ Success → advance cursor_at → run Insight Agent
    │       └─ Failure → wait 2s → Attempt 3
    │           ├─ Success → advance cursor_at → run Insight Agent
    │           └─ Failure → log error, skip Insight Agent
    │
    └─ Set agent_cursors.is_running = false
```

---

## Node 1: ReadState

### Inputs
- `userId`

### Logic
```pseudo
cursor = SELECT cursor_at FROM agent_cursors
         WHERE user_id = userId AND agent_name = 'graph_reconciler'

IF cursor IS NULL:
    cursor = user.created_at  // first run ever — process everything

recentSymptomLogs = SELECT * FROM symptom_logs
                    WHERE user_id = userId AND logged_at > cursor

recentMedLogs     = SELECT * FROM medication_logs
                    WHERE user_id = userId AND logged_at > cursor

recentMoodLogs    = SELECT * FROM mood_logs
                    WHERE user_id = userId AND logged_at > cursor

recentMessages    = SELECT * FROM chat_messages
                    WHERE conversation_id IN (user's conversations)
                    AND created_at > cursor
                    ORDER BY created_at ASC

currentGraph      = getUserGraph(userId)  // existing nodes + edges
```

### Output
- `recentLogs`: combined log entries
- `recentMessages`: conversation turns since last reconciliation
- `currentGraph`: existing graph state
- `cursorAt`: the timestamp we're processing from

### Early exit
If `recentLogs` is empty AND `recentMessages` is empty → skip remaining nodes, return success (nothing to reconcile).

---

## Node 2: ExtractEntities

### Inputs
- `recentMessages` from ReadState

### Logic
```pseudo
// Run OpenMed NER on the full exchange (user + assistant messages)
messageTexts = recentMessages.map(m => m.content).join("\n")
biomedicalEntities = await extractBiomedicalEntities(messageTexts)
// Returns: [{ type: "symptom"|"condition"|"medication", name: "migraine", ... }]

// Run LLM factor extraction for numeric values
factorEntities = await extractFactors(messageTexts)
// Returns: [{ entity: "sleep_hours", value: 4 }, { entity: "stress_level", value: 7 }]

// Merge: logs are PRIMARY source, NER fills gaps
// If a symptom is in logs AND in NER → use log entry (already structured)
// If a symptom is in NER but NOT in logs → new entity the LLM missed logging
// If a factor is in NER but NOT in logs → new factor to track
```

### Output
- `extractedEntities`: merged list of entities from NER + factors
- `logEntities`: entities already in log tables (source of truth)
- `gapEntities`: entities found by NER but missing from logs

### Why both OpenMed AND logs?
- Logs capture what the LLM chose to log via tools (high confidence, structured)
- OpenMed catches things the LLM missed: conditions mentioned in passing, medications in the assistant's response, symptoms the user confirmed with "yes" to a question

---

## Node 3: ReconcileGraph

### Inputs
- `logEntities`, `gapEntities` from ExtractEntities
- `currentGraph` from ReadState

### Entity Normalization Rules

```pseudo
FUNCTION normalizeEntityName(rawName, existingNodes):
    // Step 1: Exact match against existing graph nodes (case-insensitive)
    exactMatch = existingNodes.find(n => n.name.lower() == rawName.lower())
    IF exactMatch: RETURN exactMatch.name

    // Step 2: Substring/contains match
    // "headache" matches existing "chronic headache", prefer shorter
    containsMatch = existingNodes.find(n =>
        n.name.lower().includes(rawName.lower()) OR
        rawName.lower().includes(n.name.lower())
    )
    IF containsMatch: RETURN containsMatch.name

    // Step 3: No match found — this is a genuinely new entity
    RETURN capitalize(rawName.trim())
```

### Node Type Assignment

| Source | Assigns Type |
|---|---|
| symptom_logs entry | `symptom` |
| medication_logs entry | `medication` |
| mood_logs entry | `factor` (name: "Mood") |
| OpenMed type: "symptom" | `symptom` |
| OpenMed type: "condition" | `condition` |
| OpenMed type: "medication" | `medication` |
| Factor extractor: sleep_hours | `factor` (name: "Sleep") |
| Factor extractor: stress_level | `factor` (name: "Stress") |
| Factor extractor: energy_level | `factor` (name: "Energy") |
| Factor extractor: mood_rating | `factor` (name: "Mood") |

### Upsert Logic

```pseudo
FOR EACH entity IN (logEntities + gapEntities):
    normalizedName = normalizeEntityName(entity.name, currentGraph.nodes)
    nodeType = assignNodeType(entity)

    // subLabel carries the most recent value
    subLabel = NULL
    IF entity.severity: subLabel = "Severity {severity}/10"
    IF entity.value AND nodeType == "factor":
        IF entity.factorName == "Sleep": subLabel = "{value} hours"
        ELSE: subLabel = "{value}/10"

    upsertGraphNode(userId, {
        type: nodeType,
        name: normalizedName,
        subLabel: subLabel,
        data: {
            source: entity.source,  // "log" | "openmed" | "factor_extractor"
            occurredAt: entity.timestamp,
        }
    })
    // upsertGraphNode deduplicates by (user_id, type, name)
```

### Edge Building Rules

```pseudo
// Edges connect related entities within the same turn
FOR EACH symptom IN extractedSymptoms:
    FOR EACH condition IN extractedConditions:
        upsertGraphEdge(userId, {
            sourceNodeId: symptomNodeId,
            targetNodeId: conditionNodeId,
            relationship: "CORRELATES_WITH",
            weight: 1.0,
            observationCount: increment
        })

    FOR EACH factor IN extractedFactors:
        upsertGraphEdge(userId, {
            sourceNodeId: factorNodeId,
            targetNodeId: symptomNodeId,
            relationship: "TRIGGERS",
            weight: 1.0,
            observationCount: increment
        })

    FOR EACH medication IN extractedMedications:
        upsertGraphEdge(userId, {
            sourceNodeId: medicationNodeId,
            targetNodeId: symptomNodeId,
            relationship: "TREATS",
            weight: 1.0,
            observationCount: increment
        })
```

### Advance Cursor

```pseudo
UPSERT agent_cursors SET cursor_at = NOW()
WHERE user_id = userId AND agent_name = 'graph_reconciler'
```

---

## What Graph Agent NEVER Does

- Never reads or uses `health-kg.csv`
- Never computes information gain or scores conditions
- Never generates questions or insights
- Never writes to the `insights` table
- Never sends messages to the user
- Never calls LLM tools (log_symptom, etc.) — those are Chat Agent's domain
- Never deletes graph nodes (only creates/updates)

---

## State Schema (pseudo)

```typescript
interface GraphAgentState {
  // Input
  userId: string;

  // ReadState node output
  cursorAt: string;                    // ISO timestamp
  recentLogs: {
    symptomLogs: SymptomLog[];
    medicationLogs: MedicationLog[];
    moodLogs: MoodLog[];
  };
  recentMessages: ChatMessage[];
  currentGraph: GraphData;             // existing nodes + edges

  // ExtractEntities node output
  logEntities: NormalizedEntity[];     // from log tables (primary)
  gapEntities: NormalizedEntity[];     // from NER, missing from logs

  // ReconcileGraph node output
  nodesUpserted: number;
  edgesUpserted: number;
  errors: string[];
}
```

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| OpenMed down | Gap entities empty, logs still process | Logs are primary — graph still updates from log data |
| Supabase write fails | Node not created | Retry logic (2 retries). Cursor stays put, next run catches up |
| LLM factor extraction fails | Factors not extracted from conversation | Log entries still have structured data from tools |
| All retries exhausted | Graph stale for this turn | Cursor stays put. Next turn's GA processes both turns' logs |
