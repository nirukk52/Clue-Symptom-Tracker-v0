# CLAUDE.md — Chronic Life / Clue

> AI agent guide for this codebase. Read before touching anything.
> You are connected to Supabase MCP use to debug.

---

## Identity

| Name | Role |
|------|------|
| **Chronic Life** | App name (brand, product) |
| **Clue** | AI chat agent inside the app |

---

## One-line product summary

Chronic Life is a **prediction-first symptom tracker** for multi-condition chronic illness patients.
The north-star promise: *"Stop being blindsided by flares."* — give users a 24-48 h heads-up before a crash.

---

## Repo layout

```
/
├── web-app/            ← Next.js 16 web app (primary codebase)
│   ├── src/
│   │   ├── app/        ← Next.js App Router (pages, API routes)
│   │   ├── backend/    ← AI agents, lib/db, lib/ai, lib/memory
│   │   │   └── agents/
│   │   │       ├── clue/        ← Main Clue agent (router → sub-agents)
│   │   │       └── onboarding/  ← Pre/post conversion agent
│   │   ├── components/ ← React UI (clue-chat, widgets, modal)
│   │   ├── content/    ← Static data (conditions, questions, pages)
│   │   ├── hooks/      ← Custom React hooks
│   │   ├── lib/        ← Supabase client, tracking, onboarding utils
│   │   └── types/      ← Shared TypeScript types
│   ├── docs/           ← Architecture docs
│   └── vercel.json
├── context/            ← Research docs, archived web landing, keys reference
└── .cursor/plans/      ← AI-generated implementation plans
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| AI SDK | **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`) |
| LLM — routing | OpenAI `gpt-4o-mini` |
| LLM — copy/empathy | Google `gemini-1.5-flash` |
| LLM — embeddings | OpenAI `text-embedding-3-small` |
| Database | **Supabase** (Postgres + pgvector) |
| Auth | Supabase Auth (Google OAuth) |
| Vector search | pgvector (widget RAG) |
| Biomedical NER | **OpenMed** (Docker service) |
| Graph Orchestration | **LangGraph** (Chat Agent, Graph Agent, Insight Agent) |
| Long-term Memory | **Mem0** (cloud API) |
| Package manager | npm (lockfile present) |
| Runtime | Node.js (Vercel deployment) |

---

## Agent architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐          ┌──────────────────────────────────┐    │
│   │     ClueChat        │          │         ChatCanvas               │    │
│   │  ┌───────────────┐  │          │  ┌────────────────────────────┐  │    │
│   │  │ ChatMessages  │  │  ←────→  │  │  GraphCanvas (Reagraph)    │  │    │
│   │  │ ChatInput     │  │  refresh │  │  • Symptom nodes (red)     │  │    │
│   │  │ useChat hook  │  │  trigger │  │  • Factor nodes (teal)     │  │    │
│   │  └───────────────┘  │          │  │  • Clue nodes (gold)       │  │    │
│   └──────────┬──────────┘          │  │  • Unknown nodes (gray)    │  │    │
│              │                      │  │    ↳ tap → sends question │  │    │
│              │ sendMessage          │  └────────────────────────────┘  │    │
│              ▼                      │              ▲                    │    │
└──────────────┼──────────────────────┼──────────────┼────────────────────┘
               │                      │              │
               │ POST /api/chat       │ GET /api/graph
               ▼                      │              │
┌─────────────────────────────────────┼──────────────┼────────────────────────┐
│                         BACKEND (Next.js API)       │                        │
├─────────────────────────────────────────────────────┼────────────────────────┤
│                                                     │                        │
│   ┌─────────────────────────────────────────────────┼──────────────────┐    │
│   │                    /api/chat (route.ts)         │                  │    │
│   │  ┌────────────────────────────────────────────┐ │                  │    │
│   │  │  1. getRelevantMemories(userId, query)     │ │                  │    │
│   │  │  2. getGraphSummary(userId)                │ │                  │    │
│   │  │  3. buildSystemPrompt(memories, graph)     │ │                  │    │
│   │  │  4. streamText(gpt-5.4, tools)             │ │                  │    │
│   │  └────────────────────────────────────────────┘ │                  │    │
│   │                      │                          │                  │    │
│   │                      │ onFinish callback        │                  │    │
│   │                      ▼                          │                  │    │
│   │  ┌────────────────────────────────────────────┐ │                  │    │
│   │  │         GRAPH UPDATE PIPELINE              │ │                  │    │
│   │  │  ┌──────────────────────────────────────┐  │ │                  │    │
│   │  │  │ 1. storeMemory() → extractAtomicFacts│  │ │                  │    │
│   │  │  │ 2. extractEntities() → LLM extraction│  │ │                  │    │
│   │  │  │ 3. upsertGraphNodes() → Supabase     │  │ │                  │    │
│   │  │  │ 4. updateClues() → LLM insights      │  │ │                  │    │
│   │  │  │ 5. pickNextQuestions() → unknowns    │  │ │                  │    │
│   │  │  └──────────────────────────────────────┘  │ │                  │    │
│   │  └────────────────────────────────────────────┘ │                  │    │
│   └─────────────────────────────────────────────────┘                  │    │
│                                                                        │    │
│   ┌────────────────────────────────────────────────────────────────────┘    │
│   │  /api/graph (route.ts)                                                  │
│   │  • getUserGraph(userId) → nodes + edges                                 │
│   │  • enrichNodesWithLogs() → severity, timing from log tables             │
│   └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER (Supabase)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  KNOWLEDGE GRAPH                                                    │   │
│   │  ┌───────────────────┐    ┌───────────────────┐                    │   │
│   │  │   graph_nodes     │    │   graph_edges     │                    │   │
│   │  │  • id, user_id    │    │  • source_node_id │                    │   │
│   │  │  • type (enum)    │◄──►│  • target_node_id │                    │   │
│   │  │  • name, sub_label│    │  • relationship   │                    │   │
│   │  │  • confidence     │    │  • weight, p_value│                    │   │
│   │  │  • question_text  │    └───────────────────┘                    │   │
│   │  └───────────────────┘                                             │   │
│   │                                                                     │   │
│   │  Node types: symptom | factor | medication | condition | clue | unknown │
│   │  Edge types: SUPPORTED_BY | TRIGGERS | CORRELATES_WITH | NEEDS_INFO │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│   │ symptom_logs    │  │ medication_logs │  │ mood_logs       │           │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│   │ chat_messages   │  │ timeline_entries│  │ insights        │           │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│   │  mem0           │  │  OpenAI         │  │  Google         │           │
│   │  (user memory)  │  │  gpt-4o-mini    │  │  gemini-flash   │           │
│   │                 │  │  gpt-5.4        │  │  (copy/empathy) │           │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Memory And Orchestration

| System | Scope | Purpose | Example |
|--------|-------|---------|---------|
| **Mem0** | Long-term, across sessions | User history, conditions, preferences | "User has history of migraines" |
| **Three-agent LangGraph** | Per turn + post-turn reconciliation | Build reply context, reconcile logs into the graph, store next-turn clue | "User mentioned headache, Graph Agent reconciled it, Insight Agent stored the next best question" |

Mem0 provides long-term context. The three-agent LangGraph flow handles turn-time context assembly and post-turn graph/insight work.

Key files:
- `web-app/src/app/api/chat/route.ts` — streaming chat endpoint + post-turn agent handoff
- `web-app/src/backend/langgraph/agents/chat/` — pre-LLM chat context assembly
- `web-app/src/backend/langgraph/agents/graph-reconciler/` — single writer for graph reconciliation
- `web-app/src/backend/langgraph/agents/insight/` — condition scoring + next-turn clue generation
- `web-app/src/backend/lib/openmed/` — OpenMed client + factor extractor
- `web-app/src/app/api/graph/route.ts` — graph data endpoint for ChatCanvas
- `docker-compose.yml` — local support services such as OpenMed
- `web-app/src/backend/lib/graph/` — knowledge graph module
  - `index.ts` — CRUD operations for nodes/edges
- `health-kg.ts` — deterministic condition scoring inputs
- `info-gain.ts` — next-question ranking logic
- `web-app/src/backend/lib/memory/index.ts` — mem0 + atomic fact extraction
- `web-app/src/backend/lib/ai/providers.ts` — model config
- `web-app/src/components/clue-chat/ChatCanvas.tsx` — Reagraph visualization

---

## Running the app

```bash
cd web-app
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build check
```

Requires `web-app/.env.local` — see `context/web-landing-old-archived/KEYS-REFERENCE.md`.

---

## Code rules (enforce always)

1. **Max 600 lines per class/file.** Split when approaching limit.
2. **Every class, enum, and function must have a JSDoc comment** explaining *why* it exists in the codebase — not what it does line-by-line.
3. **No obvious/narration comments** (`// import the module`, `// return result`). Only non-obvious intent, trade-offs, or constraints.
4. **Do only what is asked.** No bonus features, no unrequested refactors.
5. **Test user-facing behaviour** — no petty unit tests on internals.
6. **Golden folder rule:** if a folder 3 levels deep from root has >4 files, extract into sub-folders.
7. **Skills first:** before starting any task, check `.claude-skills/` for a relevant skill; use it; update it after.
8. **Skills are created only via** `.claude/skills/skill-creator`.
9. **One file per tool** — Clue chat tools live in `web-app/src/backend/agents/clue/tools/definitions/`, one tool per file. Never add tools to an existing file.

---

## AI SDK patterns used in this codebase

- **`streamText`** + `toUIMessageStreamResponse()` for all chat endpoints.
- **`convertToModelMessages(messages)`** to convert `UIMessage[]` before passing to model.
- **`useChat`** with `DefaultChatTransport` on the client.
- **`tool()`** helper for all tool definitions (typed `inputSchema` + `execute`).
- **`stopWhen: stepCountIs(N)`** for multi-step agentic calls (not deprecated `maxSteps`).
- Tool parts accessed via `message.parts` (not `message.content`).
- `UIMessage` format stored in Supabase; loaded back via `loadChat`.

---

## Database tables (Supabase)

| Table | Purpose |
|-------|---------|
| `chat_conversations` | One row per conversation session |
| `chat_messages` | All messages (role + content JSON) |
| `symptom_logs` | Structured symptom entries from intake |
| `medication_logs` | Medication tracking entries |
| `mood_logs` | Daily mood ratings |
| `timeline_entries` | Chronological health events |
| `insights` | Generated pattern insights |
| `graph_nodes` | Knowledge graph nodes (symptom, factor, medication, condition, clue, unknown) |
| `graph_edges` | Knowledge graph relationships (SUPPORTED_BY, TRIGGERS, CORRELATES_WITH, etc.) |
| `widget_embeddings` | pgvector embeddings for 30 UI widgets |
| `user_conversion_context` | Why this user signed up + promise made |
| `ai_generations` | Copy/generation audit log |

---

## Key domain concepts

| Concept | Meaning |
|---------|---------|
| **Flare** | A symptom spike / crash episode |
| **8 Characteristics** | Clinical structure for symptom description (location, duration, frequency, progression, context, associated symptoms, quality, severity) |
| **Baseline** | User's personal "normal" — deviations trigger alerts |
| **Lag effect** | Symptom that appears 24-48 h after a trigger |
| **Top suspects** | Ranked trigger variables (sleep, stress, food …) |
| **Flare mode** | Simplified logging UX when energy is lowest |
| **Doctor pack** | Appointment-ready export (talking points + PDF) |
| **Spoon theory** | Chronic illness energy budgeting metaphor (core user vocabulary) |

---

## What NOT to do

- Do not remove or bypass the Supabase auth gate in `ClueChat.tsx`.
- Do not change model providers without updating `web-app/src/backend/lib/ai/providers.ts`.
- Do not skip `convertToModelMessages()` when passing messages to `streamText`.
- Do not use `maxSteps` — use `stopWhen: stepCountIs(N)` instead (AI SDK v6).
- Do not create files unless absolutely necessary — prefer editing existing ones.
- Do not push to production (`main`) without a passing `npm run build`.
