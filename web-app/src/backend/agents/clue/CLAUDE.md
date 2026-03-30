# Clue Agent

> AI-powered symptom tracking companion for Chronic Life. Uses tool calling with Vercel AI SDK.

## Purpose

Clue is the **conversational agent** that:

1. Logs symptoms, medications, and moods via tool calls
2. Retrieves user history and generates insights
3. Creates doctor-ready summary reports
4. Adapts behavior based on flare mode

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        /api/chat/route.ts                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Extract user message                                                      │
│  2. Fetch memories (mem0) + graph summary + run pre-pipeline                 │
│  3. Build system prompt with context                                          │
│  4. streamText (OpenAI gpt-5.4) with chatTools                               │
│  5. onFinish: store memory, run post-pipeline, persist messages              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TOOL CALLING                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  log_symptom     → symptom_logs + timeline_entries                           │
│  log_medication  → medication_logs + timeline_entries                         │
│  log_mood        → mood_logs + timeline_entries                               │
│  get_timeline    → reads timeline_entries                                     │
│  generate_insights → analyzes logs, writes to insights                        │
│  generate_doctor_summary → aggregates all data into report                   │
│  toggle_flare_mode → updates user_preferences                                │
│  ask_severity    → returns interactive slider config                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Files Structure

```
clue/
├── CLAUDE.md                # This file
├── index.ts                 # Public API exports
├── tools/
│   ├── chat-tools.ts        # Tool registry (exports chatTools object)
│   ├── utils.ts             # Shared Supabase client + user ID helpers
│   └── definitions/         # ONE FILE PER TOOL
│       ├── index.ts         # Re-exports all tools
│       ├── log-symptom.ts
│       ├── log-medication.ts
│       ├── log-mood.ts
│       ├── get-timeline.ts
│       ├── generate-insights.ts
│       ├── generate-doctor-summary.ts
│       ├── ask-severity.ts
│       └── toggle-flare-mode.ts
└── prompts/
    └── system.ts            # System prompt builder
```

---

## Hard Rules

1. **One file per tool** — All tools live in `tools/definitions/` with one tool per file.
2. **New tools require new file** — Never add tools to an existing file; create `tools/definitions/<tool-name>.ts`.
3. **Import from utils** — Use `getSupabase` and `getUid` from `../utils.ts`.

---

## Chat Tools

| Tool | Writes To | Purpose |
|------|-----------|---------|
| `log_symptom` | `symptom_logs`, `timeline_entries` | Log symptom with optional severity |
| `log_medication` | `medication_logs`, `timeline_entries` | Log med intake/skip |
| `log_mood` | `mood_logs`, `timeline_entries` | Log mood 1-10 |
| `get_timeline` | — (read only) | Fetch entries for date range |
| `generate_insights` | `insights` | Analyze data for patterns |
| `generate_doctor_summary` | `doctor_summaries` | Create report for provider |
| `toggle_flare_mode` | `user_preferences` | Switch energy state |
| `ask_severity` | — (returns UI config) | Request interactive slider |

---

## Deduplication

`log_symptom` has 5-minute deduplication:
- If same symptom logged within 5 min, updates existing entry
- Prevents duplicate logs when user adds severity separately

---

## Flare Mode

When `flare_mode` is true:
- System prompt instructs minimal interaction
- No follow-up questions
- Accept any input without probing

---

## Graph Pipeline Integration

The chat route integrates with the knowledge graph pipeline:

**Pre-response (before LLM):**
- `extractEntities` → `upsertNodes` → `scoreConditions` → `pickNextQuestion`
- Next question is injected into system prompt

**Post-response (in onFinish):**
- `updateClues` → generates insight nodes
- Runs fire-and-forget to avoid blocking response

---

## Usage

The chat route imports directly:

```typescript
import { buildSystemPrompt } from '@/backend/agents/clue/prompts/system';
import { chatTools, setActiveUserId } from '@/backend/agents/clue/tools/chat-tools';
```

---

_Last Updated: March 30, 2026_
