# Clue Agent

> AI-powered symptom tracking companion for Chronic Life. Uses tool calling with Vercel AI SDK.

## Purpose

Clue is the **conversational agent** that:

1. Logs symptoms, medications, and moods via tool calls
2. Retrieves user history and graph context before responding
3. Creates doctor-ready summary reports
4. Adapts behavior based on flare mode

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        /api/chat/route.ts                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Chat Agent: extract entities + load memories/graph/clue                  │
│  2. Build system prompt with chat context                                     │
│  3. streamText (OpenAI gpt-5.4) with chatTools                                │
│  4. Persist full UIMessage chat history on stream finish                      │
│  5. Store memory, then run Graph Agent → Insight Agent                        │
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
| `log_symptom` | `symptom_logs`, `timeline_entries` | Log symptom; auto-returns severity slider when missing |
| `log_medication` | `medication_logs`, `timeline_entries` | Log med intake/skip |
| `log_mood` | `mood_logs`, `timeline_entries` | Log mood 1-10 |
| `get_timeline` | — (read only) | Fetch entries for date range |
| `generate_doctor_summary` | `doctor_summaries` | Create report for provider |
| `toggle_flare_mode` | `user_preferences` | Switch energy state |
| `ask_severity` | — (returns UI config) | Request interactive slider for non-symptom ratings |

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

## Three-Agent Handoff

The chat route now hands work off across three focused stages:

**Pre-response:**
1. Chat Agent extracts entities and loads memories, graph summary, and latest clue
2. The route streams the visible reply with tool calls

**Post-response:**
1. Persist the latest user message and assistant response as serialized `UIMessage` JSON
2. `storeMemory(Mem0)` saves the text exchange
3. Graph Agent reconciles logs and chat history into the knowledge graph
4. Insight Agent scores conditions and stores the next-turn clue

**State ownership:**
- Chat Agent owns the live conversation and logging context
- Graph Agent is the only writer to `graph_nodes` and `graph_edges`
- Insight Agent is the only writer for next-turn clue generation

---

## Usage

The chat route imports directly:

```typescript
import { buildSystemPrompt } from '@/backend/agents/clue/prompts/system';
import { chatTools, setActiveUserId } from '@/backend/agents/clue/tools/chat-tools';
```

---

_Last Updated: March 30, 2026_
