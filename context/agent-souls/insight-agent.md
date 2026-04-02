# Insight Agent — Soul Document

> The brain. Looks at the clean graph, scores conditions, computes info-gain,
> and produces the single most valuable question to ask next — the "clue".
> This is the product's core differentiator.

---

## Identity

- **Name**: Insight Agent (produces the "Clue")
- **Role**: Clinical intelligence engine — turns a knowledge graph into a next-best-question
- **Runs**: After Graph Agent succeeds, in the same `waitUntil` chain
- **Owns**: `health-kg.csv` (condition-symptom mappings), `info-gain.ts` (question selection math), `insights` table (output store)
- **Does NOT own**: `graph_nodes` (read-only), conversation, tools

---

## Pipeline

```
Graph Agent success
    │
    ▼
┌──────────────────────────────────┐
│  1. ReadGraph                    │
│     → Load all symptom nodes     │  "migraine (7/10), fatigue (8/10), brain fog"
│     → Load all factor nodes      │  "Sleep (4h), Stress (7/10)"
│     → Load all condition nodes   │  "fibromyalgia"
│     → Load all medication nodes  │  "methotrexate"
│     → Load edges                 │  "Sleep → migraine (TRIGGERS, observed 4x)"
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  2. ScoreConditions              │
│     → Map symptom nodes to       │  health-kg.csv lookup
│       candidate conditions       │  "fibromyalgia: 0.73, CFS: 0.41, lupus: 0.22"
│     → Find missing symptoms     │  Per condition, which symptoms are unknown
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  3. ComputeInfoGain              │
│     → Score each missing symptom │  Info-gain math: which question
│       by information gain        │  maximally reduces uncertainty
│     → Factor in safety priority  │  Red-flag symptoms score higher
│     → Factor in recency          │  Don't ask what was asked recently
│     → Select TOP question        │  Deterministic ranking
│     → LLM rephrase              │  Template → natural language
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  4. StoreClue                    │
│     → Write to insights table    │  type: "next_question"
│     → Include reasoning          │  "Distinguishes fibromyalgia from CFS"
│     → Include priority score     │  0.42 (info-gain value)
│     → Available for next turn    │  Chat Agent picks it up via LoadContext
└──────────────────────────────────┘
```

---

## Node 1: ReadGraph

### Logic
```pseudo
graphNodes = getUserGraphNodes(userId)

symptomNodes   = graphNodes.filter(n => n.type == "symptom")
factorNodes    = graphNodes.filter(n => n.type == "factor")
conditionNodes = graphNodes.filter(n => n.type == "condition")
medicationNodes = graphNodes.filter(n => n.type == "medication")
edges          = getUserGraphEdges(userId)

// Build a simple set of symptom names (lowercased) for CSV lookup
knownSymptoms = symptomNodes.map(n => n.name.toLowerCase())
// e.g. ["migraine", "fatigue", "brain fog", "numbness"]
```

### Output
- `symptomNodes`, `factorNodes`, `conditionNodes`, `medicationNodes`
- `edges`
- `knownSymptoms` (Set<string>)

### Early exit
If `symptomNodes.length == 0` → no symptoms to analyze, skip remaining nodes. Store a generic "Tell me what symptoms you've been experiencing" clue.

---

## Node 2: ScoreConditions

### Logic (reuses `health-kg.ts`)
```pseudo
// health-kg.csv maps conditions to their expected symptoms + weights
// e.g. "fibromyalgia" → [pain: 0.95, fatigue: 0.85, brain_fog: 0.70, ...]

scoredConditions = scoreConditions(knownSymptoms)
// Returns: [
//   { condition: "fibromyalgia", score: 0.73, matchedSymptoms: [...], missingSymptoms: [...] },
//   { condition: "chronic_fatigue_syndrome", score: 0.41, matchedSymptoms: [...], missingSymptoms: [...] },
//   ...
// ]

// Sort by score descending
scoredConditions.sort((a, b) => b.score - a.score)

// Take top 5 candidate conditions
topConditions = scoredConditions.slice(0, 5)
```

### Output
- `topConditions`: array of { condition, score, matchedSymptoms, missingSymptoms }

### What if no CSV match?
If zero conditions score above 0.1, fall through to the LLM fallback in ComputeInfoGain.

---

## Node 3: ComputeInfoGain

### The Core Question: "What single question, if answered, would most reduce our uncertainty?"

### Logic (reuses `info-gain.ts`)
```pseudo
// Gather ALL missing symptoms across top conditions
candidateQuestions = []
FOR EACH condition IN topConditions:
    FOR EACH missingSx IN condition.missingSymptoms:
        // info-gain: how much would knowing this symptom change our condition rankings?
        gain = computeInformationGain(missingSx, topConditions, knownSymptoms)

        // safety boost: red-flag symptoms get priority
        IF missingSx IN RED_FLAG_SYMPTOMS:
            gain *= SAFETY_MULTIPLIER  // e.g. 1.5x

        candidateQuestions.push({
            symptom: missingSx,
            infoGain: gain,
            relevantConditions: conditions that include this symptom,
        })

// Deduplicate: same symptom from multiple conditions → keep highest gain
candidateQuestions = deduplicateBySymptom(candidateQuestions)

// Recency filter: don't ask about symptoms asked in last N turns
recentInsights = SELECT * FROM insights
                 WHERE user_id = userId AND type = 'next_question'
                 ORDER BY created_at DESC LIMIT 5
recentlyAsked = recentInsights.map(i => i.content)
candidateQuestions = candidateQuestions.filter(q => q.symptom NOT IN recentlyAsked)

// Sort by info-gain descending
candidateQuestions.sort((a, b) => b.infoGain - a.infoGain)

topQuestion = candidateQuestions[0]  // or null if no candidates
```

### LLM Natural Phrasing

```pseudo
IF topQuestion IS NOT NULL:
    // Turn clinical template into natural language
    rawQuestion = "Have you been experiencing {topQuestion.symptom}?"
    
    naturalQuestion = await llm.generate({
        prompt: """
        Rephrase this clinical question into warm, natural language
        that a health companion named Clue would ask.

        Clinical question: "{rawQuestion}"
        
        Context:
        - The user has: {knownSymptoms.join(", ")}
        - This question helps distinguish between: {topQuestion.relevantConditions.join(" vs ")}
        
        Rules:
        - One sentence, conversational tone
        - Don't mention condition names or clinical reasoning
        - Don't start with "Have you been experiencing"
        - Be specific enough that the user knows what you mean
        
        Example inputs/outputs:
        "Have you been experiencing joint_stiffness?" →
        "How are your joints feeling in the morning — any stiffness when you first get up?"
        
        "Have you been experiencing photosensitivity?" →
        "Does bright light bother you more than it used to?"
        """,
    })

    clue = {
        question: naturalQuestion,
        reasoning: "Distinguishes {topQuestion.relevantConditions.join(' from ')}. "
                   + "Info gain: {topQuestion.infoGain}. "
                   + "Missing from {topQuestion.relevantConditions.length} candidate conditions.",
        priority: topQuestion.infoGain,
    }

ELSE:
    // FALLBACK: No CSV-backed question found
    // Use LLM to generate a clinically relevant question from graph context alone
    clue = await generateFallbackClue(symptomNodes, factorNodes, edges)
```

### Fallback Clue Generation (no CSV match)

```pseudo
FUNCTION generateFallbackClue(symptomNodes, factorNodes, edges):
    response = await llm.generate({
        prompt: """
        You are a clinical reasoning engine for a symptom tracker.

        The user has reported these symptoms: {symptomNodes.map(n => n.name + " (" + n.subLabel + ")").join(", ")}
        Known factors: {factorNodes.map(n => n.name + " (" + n.subLabel + ")").join(", ")}
        Known correlations: {edges.map(e => e.source + " → " + e.target + " (" + e.relationship + ")").join(", ")}

        Generate ONE follow-up question that would be most clinically useful
        to understand their health picture better.

        Prioritize:
        1. Timing/pattern questions ("When does X happen relative to Y?")
        2. Severity/frequency questions ("How often per week?")
        3. New symptom exploration ("Any changes in Z?")

        Avoid:
        - Questions about symptoms already tracked
        - Questions about factors already logged
        - Vague questions ("How are you feeling?")

        Return JSON:
        { "question": "...", "reasoning": "..." }
        """,
    })

    return {
        question: response.question,
        reasoning: "LLM-generated: " + response.reasoning,
        priority: 0.1,  // lower priority than info-gain backed questions
    }
```

---

## Node 4: StoreClue

### Logic
```pseudo
INSERT INTO insights (
    user_id,
    type,
    content,
    reasoning,
    priority,
    metadata,
    created_at
) VALUES (
    userId,
    'next_question',
    clue.question,
    clue.reasoning,
    clue.priority,
    {
        sourceSymptom: topQuestion?.symptom,       // null for fallback
        topConditions: topConditions?.slice(0, 3),  // top 3 for debugging
        method: topQuestion ? 'info_gain' : 'llm_fallback',
    },
    NOW()
)
```

### How Chat Agent Reads This

On the NEXT turn, Chat Agent's `LoadContext` node runs:

```pseudo
latestClue = SELECT content, reasoning, priority FROM insights
             WHERE user_id = userId AND type = 'next_question'
             ORDER BY created_at DESC
             LIMIT 1

// Injected into system prompt as the Clue Directive
// (see Chat Agent soul document)
```

---

## Red Flag Symptoms

These symptoms get a safety multiplier in info-gain scoring because they may indicate serious conditions that need medical attention.

```pseudo
RED_FLAG_SYMPTOMS = [
    "chest_pain",
    "difficulty_breathing",
    "sudden_vision_loss",
    "sudden_severe_headache",
    "unexplained_weight_loss",
    "blood_in_stool",
    "blood_in_urine",
    "fainting",
    "seizures",
    "suicidal_thoughts",
]

SAFETY_MULTIPLIER = 1.5
```

---

## What Insight Agent NEVER Does

- Never writes to `graph_nodes` or `graph_edges`
- Never writes to log tables (symptom_logs, medication_logs, mood_logs)
- Never sends messages to the user
- Never calls LLM tools
- Never modifies conversation state
- Never runs OpenMed (that's Graph Agent's job)

---

## The Clue Lifecycle

```
Turn N:
  Chat Agent logs "migraine, severity 7"
  Graph Agent reconciles → adds migraine node
  Insight Agent scores → "numbness distinguishes fibro from neuropathy"
  Stores clue: "Does numbness or tingling come and go, or is it constant?"

Turn N+1:
  Chat Agent loads clue → injects into system prompt
  LLM asks: "Does numbness or tingling come and go, or is it constant?"
  User: "It comes and goes, mostly in my hands"
  Chat Agent logs → log_symptom("numbness", notes: "intermittent, hands")
  Graph Agent reconciles → adds numbness node, edges to fibromyalgia
  Insight Agent scores → knownSymptoms now includes "numbness"
  → NEW clue with UPDATED info-gain (numbness no longer missing)
  Stores clue: "How's your sleep been — do you feel rested when you wake up?"

Turn N+2:
  Chat Agent loads NEW clue → asks about sleep quality
  ... cycle continues, each turn making the graph smarter
```

---

## State Schema (pseudo)

```typescript
interface InsightAgentState {
  // Input
  userId: string;

  // ReadGraph node output
  symptomNodes: GraphNode[];
  factorNodes: GraphNode[];
  conditionNodes: GraphNode[];
  medicationNodes: GraphNode[];
  edges: GraphEdge[];
  knownSymptoms: Set<string>;

  // ScoreConditions node output
  topConditions: {
    condition: string;
    score: number;
    matchedSymptoms: string[];
    missingSymptoms: string[];
  }[];

  // ComputeInfoGain node output
  clue: {
    question: string;
    reasoning: string;
    priority: number;
  };

  // StoreClue node output
  insightId: string;
}
```

---

## Why This Matters

The Insight Agent is the **product differentiator**. Without it, Chronic Life is just another symptom logger. With it, we deliver on the north-star promise: *"Stop being blindsided by flares."*

Every question the Insight Agent generates makes the knowledge graph more complete. A more complete graph means better condition scoring. Better condition scoring means better questions. It's a flywheel:

```
Better questions → More data → Cleaner graph → Smarter scoring → Better questions
```

The user never sees any of this machinery. They just notice that Clue asks surprisingly good questions — the kind their doctor would ask, but delivered in their language, at their pace, respecting their energy.
