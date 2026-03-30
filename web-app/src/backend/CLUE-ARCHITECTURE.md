# Clue Backend Architecture

> Complete architecture documentation for the Clue AI agent system.
> This replaces the generic Vercel AI SDK guide with Clue-specific patterns.

## Overview

The Clue backend implements a **multi-agent system** with:

- **Onboarding Agent** - Pre/post conversion (landing page → sign-up)
- **Clue Agent** - Main orchestrator (router pattern)
- **Sub-agents** - Specialized agents (intake, insight, widget-planner)

All agents use the **Vercel AI SDK** with RAG-powered widget selection.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLUE BACKEND                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         LIB/AI                                         │  │
│  │                                                                        │  │
│  │  providers.ts          embedding.ts                                    │  │
│  │  ├── OpenAI (router)   ├── generateEmbedding()                        │  │
│  │  ├── Gemini (copy)     ├── findRelevantWidgets() ← RAG                │  │
│  │  └── Models config     └── storeWidgetEmbeddings()                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       AGENTS                                           │  │
│  │                                                                        │  │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────────┐   │  │
│  │  │  ONBOARDING AGENT   │    │          CLUE AGENT                 │   │  │
│  │  │                     │    │                                     │   │  │
│  │  │  Pre-conversion:    │    │  ┌─────────────────────────────┐    │   │  │
│  │  │  • WatchListPreview │    │  │        ROUTER               │    │   │  │
│  │  │  • Copy generation  │    │  │  (OpenAI gpt-4o-mini)       │    │   │  │
│  │  │                     │    │  └──────────────┬──────────────┘    │   │  │
│  │  │  Post-conversion:   │    │                 │                   │   │  │
│  │  │  • getConversionCtx │    │    ┌───────────┼───────────┐        │   │  │
│  │  │                     │    │    ▼           ▼           ▼        │   │  │
│  │  └─────────────────────┘    │  ┌─────┐   ┌─────┐   ┌──────────┐   │   │  │
│  │                             │  │INTAKE│   │INSIGHT│  │WIDGET    │   │   │  │
│  │                             │  │Agent │   │Agent │  │PLANNER   │   │   │  │
│  │                             │  │      │   │      │  │(RAG)     │   │   │  │
│  │                             │  └─────┘   └─────┘   └──────────┘   │   │  │
│  │                             └─────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       LIB/DB                                           │  │
│  │                                                                        │  │
│  │  widget_embeddings     user_conversion_context    ai_generations       │  │
│  │  ├── 30 widgets        ├── Why they signed up     ├── Copy logs        │  │
│  │  ├── pgvector          └── Promise made           └── Conversion       │  │
│  │  └── Semantic search                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Model Strategy

| Use Case          | Model                  | Provider | Why                    |
| ----------------- | ---------------------- | -------- | ---------------------- |
| Router decisions  | gpt-4o-mini            | OpenAI   | Fast, accurate routing |
| Copy generation   | gemini-1.5-flash       | Google   | Empathetic, creative   |
| Widget selection  | gpt-4o-mini            | OpenAI   | Structured output      |
| Data extraction   | gpt-4o-mini            | OpenAI   | Reliable JSON          |
| Embeddings        | text-embedding-3-small | OpenAI   | Cost-efficient         |
| Complex reasoning | gpt-4o                 | OpenAI   | Deep analysis          |

---

## RAG-Powered Widget Selection

### Knowledge Base

The widget knowledge base comes from `src/content/onboarding-flow.json`:

- **30 widgets** mapped to Q2 pain points
- Pre-embedded using `text-embedding-3-small`
- Stored in Supabase with pgvector

### Embedding Content

Each widget is embedded with rich context:

```typescript
const embeddingContent = [
  `Widget: ${widget.name}`,
  `Question: ${question}`,
  `Condition: ${condition}`,
  `Value: ${widget.q4_value}`,
  `Captures: ${widget.captures.join(', ')}`,
  `Type: ${widget.main_widget.type}`,
].join('. ');
```

### Retrieval Flow

```
User Message → generateEmbedding() → match_widgets() → Ranked Candidates
     │                                    │
     │                                    └── pgvector cosine similarity
     └── "I want to track my energy patterns"
```

### Search Function

```typescript
const results = await findRelevantWidgets(
  'I want to understand my energy levels throughout the day',
  {
    condition: 'fatigue',
    limit: 5,
    similarityThreshold: 0.4,
  }
);
```

---

## Folder Structure

```
src/backend/
├── CLAUDE.md                    # Vercel AI SDK RAG guide (reference)
├── CLUE-ARCHITECTURE.md         # This file
│
├── agents/
│   ├── onboarding/              # Pre/post conversion
│   │   ├── CLAUDE.md            # Agent documentation
│   │   ├── index.ts             # Public API
│   │   ├── actions.ts           # Server actions
│   │   ├── types.ts             # Type definitions
│   │   ├── context/
│   │   │   └── assembler.ts     # User context assembly
│   │   ├── generators/
│   │   │   └── copy.ts          # Gemini copy generation
│   │   ├── templates/
│   │   │   ├── graphs.ts        # Fake graph data
│   │   │   └── watch-list.ts    # WatchListPreview template
│   │   └── prompts/
│   │       └── conversion-copy.md
│   │
│   └── clue/                    # Main agent
│       ├── CLAUDE.md            # Agent documentation
│       ├── index.ts             # Public API
│       ├── router.ts            # Message routing
│       ├── types.ts             # Shared types
│       ├── context/
│       │   └── assembler.ts     # Per-message context
│       ├── tools/
│       │   └── index.ts         # Tool registry
│       └── sub-agents/
│           ├── intake.ts        # Chat → Structured data
│           ├── insight.ts       # Clue generation
│           └── widget-planner.ts # RAG-powered actions
│
├── components/
│   └── WatchListPreview/        # React components
│
├── lib/
│   ├── ai/
│   │   ├── index.ts             # Exports
│   │   ├── providers.ts         # Model configuration
│   │   └── embedding.ts         # RAG functions
│   └── db/
│       └── migrations/
│           └── 001_widget_embeddings.sql
│
└── scripts/
    └── seed-widget-embeddings.ts  # Pre-embed widgets
```

---

## Key Patterns

### 1. Context Assembly (Per-Message)

Every message triggers full context assembly:

```typescript
const context = await assembleMessageContext(agentState);
// Returns: user, conversion, focus, today, missingFields, lastSevenDays
```

### 2. Router Pattern (Quick Rules + LLM)

```typescript
// Try quick rules first (no LLM)
const quickRoute = quickRouteRules(message, context);
if (quickRoute) return quickRoute;

// Fall back to LLM routing
const result = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: message,
  system: routerPrompt,
});
```

### 3. RAG Retrieval (Semantic Search)

```typescript
const relevantWidgets = await findRelevantWidgets(searchQuery, {
  condition: context.user.primaryCondition,
  limit: 6,
  similarityThreshold: 0.4,
});
```

### 4. Evidence-Grounded Outputs

Every insight/clue includes evidence:

```typescript
const clue = {
  text: 'After poor sleep, fatigue +2.1 avg',
  confidence: 0.7,
  evidenceSnapshotId: '...', // Provenance
  decisionTraceId: '...', // Reproducibility
};
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd web-landing-next
pnpm add ai @ai-sdk/openai @ai-sdk/google @ai-sdk/rsc zod
```

### 2. Environment Variables

Create `.env.local` in `web-landing-next/`:

```env
# Supabase (get from Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://zvpudxinbcsrfyojrhhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Required for seeding

# OpenAI (for embeddings + agent)
OPENAI_API_KEY=sk-...

# Google (for copy generation)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### 3. Run Migration

Apply the pgvector migration to Supabase (via Dashboard → SQL Editor):

```sql
-- Copy contents of: src/backend/lib/db/migrations/001_widget_embeddings.sql
```

### 4. Seed Widget Embeddings

```bash
cd web-landing-next
npx tsx --env-file=.env.local src/backend/scripts/seed-widget-embeddings.ts
```

This will embed all 30 widgets from `onboarding-flow.json` into Supabase.

---

## API Reference

### Onboarding Agent

```typescript
// Pre-conversion: Generate WatchListPreview
const preview = await generateWatchListPreview(modalSessionId);

// Post-conversion: Get context for Clue agent
const context = await getConversionContext(userId);
```

### Clue Agent

```typescript
// Process a message
const response = await processMessage(userMessage, agentState);

// Assemble context
const context = await assembleMessageContext(agentState);

// Plan next actions (RAG-powered)
const actions = await planNextActions(context, userMessage);
```

### Embedding Functions

```typescript
// Generate single embedding
const embedding = await generateEmbedding('user query');

// Find relevant widgets
const widgets = await findRelevantWidgets('track energy', {
  condition: 'fatigue',
  limit: 5,
});
```

---

## Related Documents

- [`context/Agent-Requirements.md`](../../../../context/Agent-Requirements.md) - Full requirements
- [`context/Agent-Architecture-Technical.md`](../../../../context/Agent-Architecture-Technical.md) - Technical spec
- [`src/content/onboarding-flow.json`](../../content/onboarding-flow.json) - Widget definitions
- [`.claude-skills/chat-widgets/SKILL.md`](../../../../.claude-skills/chat-widgets/SKILL.md) - Widget catalog

---

_Last Updated: January 12, 2026_
