# Clue Agent

> Main orchestrator agent for the Chronic Life symptom tracking system. Routes user messages to specialized sub-agents and manages context assembly.

## Purpose

Clue is the **router agent** that:

1. Assembles complete context for every message
2. Routes to appropriate sub-agent(s) based on intent
3. Orchestrates parallel sub-agent execution when beneficial
4. Composes final responses with widgets, clues, and evidence

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLUE AGENT (Router)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       CONTEXT ASSEMBLER                                  │ │
│  │  • User profile        • Conversion context    • Focus hypothesis       │ │
│  │  • Today's data        • Last 7 days stats     • Missing fields         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         ROUTER (OpenAI)                                  │ │
│  │  Quick rules → LLM routing if ambiguous                                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│           ┌────────────────────────┼────────────────────────┐               │
│           ▼                        ▼                        ▼               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │     INTAKE      │    │  WIDGET PLANNER │    │     INSIGHT     │         │
│  │  Chat → Data    │    │  Next 3 Actions │    │  Clue Generator │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                        │                        │               │
│           └────────────────────────┼────────────────────────┘               │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       RESPONSE COMPOSER                                  │ │
│  │  • Text response    • Widgets array    • Clue card    • Evidence        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Sub-Agents

| Agent              | Inputs                        | Outputs                           | Model         |
| ------------------ | ----------------------------- | --------------------------------- | ------------- |
| **Intake**         | Chat message, widget submit   | Structured data, follow-up widget | gpt-4o-mini   |
| **Timeline**       | Date range, filters           | Day cards, episode summaries      | gpt-4o-mini   |
| **Trend**          | Metric requests, time windows | Computed metrics, charts          | Deterministic |
| **Insight**        | Focus hypothesis, metrics     | Clue cards with evidence          | gpt-4o        |
| **Widget Planner** | Context, missing fields       | Next 3 actions (ranked)           | gpt-4o-mini   |
| **Doctor Pack**    | Date range, sections          | Export artifacts                  | gpt-4o-mini   |

---

## Context Assembly

Every message triggers full context assembly:

```typescript
interface MessageContext {
  user: UserProfile; // From users table
  conversion: ConversionContext; // Why they signed up (from onboarding-agent)
  focus: FocusHypothesis; // Current tracking question
  today: TodayContext; // Today's observations
  missingFields: MissingFieldsQueue; // What we still need
  lastSevenDays: {
    completionRate: number;
    avgSeverity: number;
    flareCount: number;
  };
  agentState: AgentState; // Mode, energy, cursor positions
}
```

---

## Routing Rules

### Quick Rules (No LLM Call)

```typescript
// Logging keywords → intake
if (message includes 'log', 'feeling', 'pain is', 'today', '/10') → intake

// History keywords → timeline
if (message includes 'when did', 'last time', 'history') → timeline

// Doctor keywords → doctor_pack
if (message includes 'doctor', 'export', 'report') → doctor_pack

// Insight keywords → insight (parallel with trend)
if (message includes 'why', 'causing', 'trigger', 'pattern') → insight + trend

// Low energy state → minimal intake
if (energyState === 'low_energy') → intake (minimal)
```

### LLM Routing (Ambiguous Cases)

For messages that don't match quick rules, use OpenAI gpt-4o-mini to determine routing.

---

## Model Strategy

| Use Case              | Model            | Why                              |
| --------------------- | ---------------- | -------------------------------- |
| **Router decisions**  | gpt-4o-mini      | Fast, accurate routing           |
| **Copy generation**   | Gemini 1.5 Flash | Empathetic, creative copy        |
| **Widget selection**  | gpt-4o-mini      | Deterministic choices            |
| **Data extraction**   | gpt-4o-mini      | Reliable structured output       |
| **Complex reasoning** | gpt-4o           | When insight generation needs it |

---

## Widget Types (MVP)

| Widget              | Taps | Captures                  |
| ------------------- | ---- | ------------------------- |
| `outcome_slider`    | 1    | Priority outcome 0-10     |
| `severity_slider`   | 1    | Specific symptom 0-10     |
| `flare_toggle`      | 1    | Yes/No flare status       |
| `start_time_picker` | 2    | Flare onset time          |
| `drivers_chips`     | 2-3  | Potential triggers        |
| `meds_taken`        | 1    | Yes/No/Changed            |
| `meds_time_picker`  | 2    | When meds were taken      |
| `sleep_quality`     | 1    | Sleep rating 0-10         |
| `short_note`        | 3+   | 10-200 char context       |
| `symptom_8char`     | 5+   | OPQRST structured capture |

---

## Energy States

| State        | Behavior                                      |
| ------------ | --------------------------------------------- |
| `normal`     | Full features, proactive suggestions          |
| `low_energy` | Minimal input, no follow-ups, accept anything |
| `flare`      | Acknowledgment only, offer help later         |

---

## Evidence Requirements

Every clue must have:

1. **Evidence Snapshot** with:

   - `tier`: A (SQL exact rows) or B (RAG narrative)
   - `sourceTool`: Which tool generated it
   - `queryId`: Versioned query identifier
   - `resultHash`: For determinism verification
   - `items`: Array of row/metric references

2. **Qualification Gates** (hard):
   - `sample_days >= 6`
   - `abs(effect_size) >= 1.0`
   - `missing_rate <= 25%`

---

## Files Structure

```
clue/
├── CLAUDE.md            # This file
├── index.ts             # Public API exports
├── router.ts            # Main router logic
├── types.ts             # Shared types
├── context/
│   └── assembler.ts     # Per-message context assembly
├── tools/
│   └── index.ts         # Tool registry
├── sub-agents/
│   ├── intake.ts        # Chat → Structured data
│   ├── widget-planner.ts # Next 3 actions
│   └── insight.ts       # Clue generation
├── rules/
│   └── (rulebook files) # Static rules config
└── prompts/
    └── (prompt files)   # Versioned prompts
```

---

## Related Files

- `backend/agents/onboarding/` - Pre/post conversion agent
- `backend/lib/ai/providers.ts` - AI model configuration
- `context/Agent-Requirements.md` - Full requirements doc
- `context/Agent-Architecture-Technical.md` - Technical architecture
- `.claude-skills/chat-widgets/SKILL.md` - Widget catalog

---

## Usage

```typescript
import { processMessage, assembleMessageContext } from '@/backend/agents/clue';

// Process a user message
const response = await processMessage('Fatigue is 7/10 today', agentState);

// Or assemble context for custom processing
const context = await assembleMessageContext(agentState);
```

---

_Last Updated: January 12, 2026_
