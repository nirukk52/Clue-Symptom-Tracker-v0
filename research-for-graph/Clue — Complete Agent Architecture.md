# Clue — Complete Agent Architecture
## Overview
Clue is a chat-based symptom tracker that finds "clues" from a patient's symptoms, mood, sleep, meditation, and other factors. The user sees a living **clue graph** centered on their current insights, with empty "unknown" leaf nodes that prompt the agent's next best question. The agent's long-term memory is the same graph the patient edits.

***
## System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React / TypeScript)        │
│                                                             │
│   Chat UI ◄──────────────────────────────────────────────► │
│   Clue Graph (Reagraph WebGL)  ← editable nodes/edges       │
│   "Answer this" prompts on Unknown leaf nodes               │
└───────────────────┬─────────────────────────────────────────┘
                    │  REST / WebSocket
┌───────────────────▼─────────────────────────────────────────┐
│               AGENT BACKEND (TypeScript / Python)           │
│                                                             │
│   LangGraph StateGraph                                      │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  retrieve_memory → extract_entities → update_graph   │  │
│   │       → score_conditions → update_clues              │  │
│   │       → pick_next_question → generate_response       │  │
│   │       → save_memory                                  │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
│   Tools:  mem0.search()  |  mem0.add()                      │
│           graph_read()   |  graph_write()                   │
│           symptom_prior() (HealthKnowledgeGraph lookup)     │
└─────────┬────────────────┬────────────────┬─────────────────┘
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────────────┐
   │   Mem0      │  │  HelixDB    │  │ HealthKnowledgeGraph│
   │ (long-term  │  │ (graph +    │  │ (157 diseases,      │
   │  memory)    │  │  vectors)   │  │  491 symptoms,      │
   └─────────────┘  └─────────────┘  │  noisy-OR priors)   │
                                     └────────────────────┘
```

***
## Layer 1 — Agent Orchestration: LangGraph
Use **LangGraph** (TypeScript or Python) as the stateful agent loop. Each turn runs through a fixed StateGraph of nodes:[^1][^2]

```typescript
// Minimal LangGraph state for Clue
interface ClueState {
  messages: BaseMessage[];
  userId: string;
  episodeId: string;
  memoryContext: string;      // retrieved from Mem0
  graphContext: ClueGraph;    // retrieved from HelixDB
  nextQuestion?: string;      // emitted to user
}
```

**StateGraph nodes (in order):**

| Node | Purpose | OSS Used |
|------|----------|----------|
| `retrieve_memory` | Fetch relevant atomic facts from Mem0 for this turn | Mem0 SDK |
| `extract_entities` | LLM tool call to extract Symptoms, Factors from user message | LangGraph tool calling |
| `update_graph` | Write new nodes/edges to HelixDB | HelixDB HQL |
| `score_conditions` | Look up candidate conditions from HealthKnowledgeGraph prior; attach as Condition nodes | clinicalml/HealthKnowledgeGraph |
| `update_clues` | LLM recomputes/updates Clue node text, confidence, SUPPORTED_BY edges | LangGraph LLM node |
| `pick_next_question` | Traverse `CLUE –NEEDS_INFO→ UNKNOWN` edges; rank by information gain | Custom info-gain utility |
| `generate_response` | LLM generates chat reply with retrieved memory + graph context | LangChain / LangGraph |
| `save_memory` | Async `mem0.add()` with metadata tags | Mem0 SDK |

Since you already use Mem0, the `retrieve_memory` and `save_memory` nodes drop in directly with your existing client.[^3][^4][^5]

***
## Layer 2 — Long-Term Memory: Mem0 (already in use)
Mem0 handles semantic extraction and retrieval of atomic facts across sessions. Mem0 with graph memory achieves around 2% higher overall score than the base configuration, and achieves 91% lower p95 latency compared to full-context methods.[^6]

**How to wire Mem0 into Clue:**

```typescript
// On every turn: retrieve before LLM call
const hits = await mem0.search(lastUserMessage, {
  user_id: userId,
  filters: { AND: [{ user_id: userId }] },
  top_k: 6
});

// After response: save with metadata category
await mem0.add([
  { role: "user", content: userMessage },
  { role: "assistant", content: reply }
], {
  user_id: userId,
  metadata: { category: "symptom" }   // or "factor" | "clue" | "condition"
});
```

Use the `metadata.category` field to filter searches by topic. For example, when generating a Clue node, search only `category: "symptom"` and `category: "factor"` memories.[^7][^8]

***
## Layer 3 — Clue Graph DB: HelixDB
**HelixDB** is an open-source graph + vector database built for RAG-style apps, with native vector search, keyword search, and graph traversals.[^9][^10][^11]
### HelixQL Schema
```hql
N::Episode {
  label: String,
  start_time: String,
  end_time: String
}

N::Symptom {
  name: String,
  severity: U32,
  onset_time: String
}

N::Factor {
  factor_type: String,    // "sleep" | "mood" | "meditation" | "medication"
  value: F64,
  unit: String,
  timestamp: String
}

N::Condition {
  name: String,
  icd_code: String,
  status: String          // "suspected" | "confirmed" | "ruled_out"
}

N::Clue {
  summary: String,
  confidence: F64,
  status: String          // "active" | "dismissed" | "resolved"
}

N::Unknown {
  question: String,       // the next-best question to ask
  factor_type: String,    // what type of info we need
  priority: F64           // information gain score
}

E::HAS_SYMPTOM {
  From: Episode,
  To: Symptom,
  Properties: {}
}

E::HAS_FACTOR {
  From: Episode,
  To: Factor,
  Properties: {}
}

E::HAS_CONDITION {
  From: Episode,
  To: Condition,
  Properties: {}
}

E::HAS_CLUE {
  From: Episode,
  To: Clue,
  Properties: {}
}

E::SUPPORTED_BY {
  From: Clue,
  To: Symptom | Factor,
  Properties: { weight: F64 }
}

E::ABOUT {
  From: Clue,
  To: Condition,
  Properties: {}
}

E::NEEDS_INFO {
  From: Clue,
  To: Unknown,
  Properties: { info_gain: F64 }
}

V::ClueEmbedding {
  text: String
}
```

Each `Clue` node also has a vector embedding (via `V::ClueEmbedding`) so the agent can do semantic similarity across past clues.[^9][^11]

***
## Layer 4 — Symptom-Condition Prior: HealthKnowledgeGraph
Use **clinicalml/HealthKnowledgeGraph** as a static prior for which conditions relate to which symptom combinations. This graph was learned from 273,174 de-identified patient records using a noisy-OR Bayesian network, achieving precision of 0.85 at recall 0.6.[^12][^13][^14]

**How to use it in Clue:**

1. Load the CSV (157 diseases × 491 symptoms with edge weights) at startup.
2. When the agent has accumulated ≥2 symptom nodes, query it: "Given symptoms [headache, nausea], which conditions have highest noisy-OR probability?"
3. Create `Condition` nodes for top-3 matches and attach `HAS_CONDITION` edges.
4. For `Unknown` node generation (next best question), find which factor/symptom node connected to the likely condition is currently *missing* — that becomes the question.

```typescript
// Pseudocode: next best question via information gain
function pickNextQuestion(clueId: string, graph: ClueGraph): Unknown {
  const knownNodes = getConnectedNodes(graph, clueId); // symptoms + factors we have
  const topCondition = getTopCondition(graph, clueId);
  const linkedSymptoms = healthKG.getSymptoms(topCondition); // from HealthKnowledgeGraph
  const missing = linkedSymptoms.filter(s => !knownNodes.has(s));
  // rank by information gain: IG = H(condition) - H(condition | symptom_known)
  return missing.sort((a, b) => infoGain(b, topCondition) - infoGain(a, topCondition));
}
```

Information gain \( IG(S, A) = H(S) - H(S|A) \) selects the missing attribute that most reduces uncertainty about the suspected condition.[^15][^16][^17]

***
## Layer 5 — Atomic Memory Pattern: MediQ
Inspired by **MediQ**, decompose patient responses into atomic statements before storing in Mem0. This significantly reduces hallucination and improves retrieval precision.[^18][^19]

```typescript
// Before mem0.add(), decompose into atomic facts
const atomicFacts = await llm.invoke(`
  Extract atomic health facts from this message as a JSON array of short statements.
  Message: "${userMessage}"
  Example output: ["reports headache since 3 days ago", "sleep was 4 hours last night", "mood rated 3/10"]
`);

for (const fact of atomicFacts) {
  await mem0.add([{ role: "user", content: fact }], {
    user_id: userId,
    metadata: { category: classifyFact(fact), episode_id: episodeId }
  });
}
```

***
## Layer 6 — Benchmark / Testing: medaks/medask-benchmarks
Use **SymptomCheck Bench** and **Triage Bench** from `medaks/medask-benchmarks` to evaluate your "next best question" agent. The benchmark:[^20][^21][^22]

- Runs 400 clinical vignettes through your agent, limiting it to 12 questions per case.
- An evaluator agent compares your top-5 differential diagnoses against ground truth.
- Compatible with Claude, GPT-4, and open models.[^21][^20]

***
## Layer 7 — Frontend Graph: Reagraph
**Reagraph** is a WebGL-based React graph library with drag-and-drop nodes, custom node rendering, expand/collapse, and force-directed layouts. Use it to render the patient-visible Clue graph.[^23][^24]

```tsx
import { GraphCanvas } from 'reagraph';

<GraphCanvas
  nodes={clueGraphNodes}   // typed by node.type: "clue"|"symptom"|"factor"|"condition"|"unknown"
  edges={clueGraphEdges}
  layoutType="radialOut2d"  // Clue in center, everything radiates out
  renderNode={({ node, size, color }) => <ClueNode node={node} size={size} color={color} />}
  onNodeClick={(node) => openEditPanel(node)}
/>
```

**Node styling by type:**

| Node Type | Color | Shape | Notes |
|-----------|-------|-------|-------|
| `clue` | Gold `#F6C90E` | Star / large circle | Center node, always visible |
| `symptom` | Red `#FF6B6B` | Circle | Filled when known |
| `factor` | Blue `#4ECDC4` | Circle | mood, sleep, meditation, meds |
| `condition` | Purple `#9B59B6` | Rounded rect | shows status badge |
| `unknown` | Gray `#AAAAAA` | Dashed circle | pulses; tap = answer question |

Clicking an `unknown` node opens an inline answer panel directly in the chat, which feeds back into the agent loop.

***
## Complete Data Flow (One Turn)
```
User sends message: "I have had a headache for 3 days, slept only 4 hours"
          │
          ▼
[^1] retrieve_memory
    mem0.search("headache sleep", { user_id, top_k: 6 })
    → "User reported stress last week", "User has history of migraines"
          │
          ▼
[^2] extract_entities  (LLM tool call)
    → Symptom: { name: "headache", severity: 7, onset: "3 days ago" }
    → Factor:  { factor_type: "sleep", value: 4, unit: "hours" }
          │
          ▼
[^3] update_graph  (HelixDB write)
    MERGE Episode(ep_123) -HAS_SYMPTOM-> Symptom(headache)
    MERGE Episode(ep_123) -HAS_FACTOR->  Factor(sleep_4h)
          │
          ▼
[^4] score_conditions  (HealthKnowledgeGraph lookup)
    Symptoms: [headache, nausea(prior)]  → top match: Migraine (0.72), Tension Headache (0.51)
    MERGE Episode(ep_123) -HAS_CONDITION-> Condition(migraine, "suspected")
          │
          ▼
[^5] update_clues  (LLM)
    Update Clue: "Sleep deprivation may be triggering your migraines"
    confidence: 0.65
    CLUE -SUPPORTED_BY-> Symptom(headache), Factor(sleep_4h)
    CLUE -ABOUT-> Condition(migraine)
          │
          ▼
[^6] pick_next_question  (info-gain on HealthKnowledgeGraph)
    Migraine strongly linked to: stress, caffeine, menstrual cycle (missing from graph)
    Highest IG: "stress"
    CREATE Unknown { question: "How stressed have you been this week? (1–10)", priority: 0.81 }
    CLUE -NEEDS_INFO-> Unknown(stress)
          │
          ▼
[^7] generate_response  (LLM with memory + graph context)
    "Sorry to hear about your headache. Based on your 4 hours of sleep and prior stress history,
    this could be a tension or migraine episode. How stressed have you been this week?"
          │
          ▼
[^8] save_memory  (async)
    mem0.add([user_msg, assistant_msg], { category: "symptom", episode_id: "ep_123" })
```

***
## Patient-Visible Clue Graph (Example)
Below is the JSON payload sent to the Reagraph frontend for one episode. **Gray dashed nodes are "unknown" leaf nodes** — each one has a `question` field rendered as a clickable prompt.

```json
{
  "nodes": [
    {
      "id": "clue_001",
      "type": "clue",
      "label": "Sleep deprivation may be triggering your migraines",
      "subLabel": "Confidence: 65%",
      "fill": "#F6C90E",
      "size": 18
    },
    {
      "id": "sym_headache",
      "type": "symptom",
      "label": "Headache",
      "subLabel": "Severity 7/10 · 3 days",
      "fill": "#FF6B6B",
      "size": 10
    },
    {
      "id": "sym_nausea",
      "type": "symptom",
      "label": "Nausea",
      "subLabel": "Severity 4/10",
      "fill": "#FF6B6B",
      "size": 8
    },
    {
      "id": "fac_sleep",
      "type": "factor",
      "label": "Sleep",
      "subLabel": "4 hrs last night",
      "fill": "#4ECDC4",
      "size": 10
    },
    {
      "id": "fac_mood",
      "type": "factor",
      "label": "Mood",
      "subLabel": "3 / 10",
      "fill": "#4ECDC4",
      "size": 9
    },
    {
      "id": "cond_migraine",
      "type": "condition",
      "label": "Migraine",
      "subLabel": "Suspected",
      "fill": "#9B59B6",
      "size": 10
    },
    {
      "id": "unk_stress",
      "type": "unknown",
      "label": "Stress level?",
      "subLabel": "Tap to answer",
      "question": "How stressed have you been this week? (1–10)",
      "fill": "#AAAAAA",
      "size": 8,
      "animated": true
    },
    {
      "id": "unk_caffeine",
      "type": "unknown",
      "label": "Caffeine intake?",
      "subLabel": "Tap to answer",
      "question": "How many cups of coffee or tea did you have today?",
      "fill": "#AAAAAA",
      "size": 7,
      "animated": true
    },
    {
      "id": "unk_water",
      "type": "unknown",
      "label": "Hydration?",
      "subLabel": "Tap to answer",
      "question": "How much water have you had today?",
      "fill": "#AAAAAA",
      "size": 7,
      "animated": true
    }
  ],
  "edges": [
    { "id": "e1", "source": "clue_001", "target": "sym_headache", "label": "SUPPORTED_BY" },
    { "id": "e2", "source": "clue_001", "target": "sym_nausea",   "label": "SUPPORTED_BY" },
    { "id": "e3", "source": "clue_001", "target": "fac_sleep",    "label": "SUPPORTED_BY" },
    { "id": "e4", "source": "clue_001", "target": "fac_mood",     "label": "SUPPORTED_BY" },
    { "id": "e5", "source": "clue_001", "target": "cond_migraine","label": "ABOUT" },
    { "id": "e6", "source": "clue_001", "target": "unk_stress",   "label": "NEEDS_INFO", "dashed": true },
    { "id": "e7", "source": "clue_001", "target": "unk_caffeine", "label": "NEEDS_INFO", "dashed": true },
    { "id": "e8", "source": "clue_001", "target": "unk_water",    "label": "NEEDS_INFO", "dashed": true }
  ]
}
```

The user can:
- **Edit** any filled node (symptom severity, factor value, condition status).
- **Dismiss** a Clue node ("this doesn't feel right").
- **Answer** an `unknown` node by tapping it — this converts it to a real Factor/Symptom node, removes the `NEEDS_INFO` edge, and triggers the agent to recompute confidence.

***
## OSS Stack Reference
| Part | Library | Repo / Docs | What it replaces |
|------|---------|-------------|-----------------|
| Agent orchestration | LangGraph | `langchain-ai/langgraph` | Custom state machines |
| Long-term memory | **Mem0** (already in use) | `mem0ai/mem0` | Zep, Redis, custom vector store |
| Graph + vector DB | HelixDB | `HelixDB/helix-db` | Neo4j + separate vector DB |
| Symptom-condition prior | HealthKnowledgeGraph | `clinicalml/HealthKnowledgeGraph` | Manual ontology |
| Atomic memory pattern | MediQ | `arxiv:2406.00922` | Raw chat storage |
| Benchmark / test harness | medaks/medask-benchmarks | `medaks/medask-benchmarks` | Manual QA |
| Frontend graph | Reagraph | `reagraph.dev` | D3.js, Cytoscape.js |

***
## What to Build vs. What to Reuse
**Build (thin layer only):**
- LangGraph StateGraph wiring (< 200 lines)
- HelixDB schema (as above)
- `pick_next_question` info-gain utility (< 50 lines)
- Reagraph `ClueNode` custom component with edit modal
- `classifyFact()` utility for Mem0 metadata tagging

**Reuse directly:**
- Mem0 SDK — your existing setup[^3][^5]
- HealthKnowledgeGraph CSV — load once at startup[^14]
- SymptomCheck Bench — run against your agent before launch[^20][^22]
- Reagraph `GraphCanvas` — drop-in React component[^23][^24]

---

## References

1. [Doctolib: Building an Agentic AI System for Healthcare Support ...](https://www.zenml.io/llmops-database/building-an-agentic-ai-system-for-healthcare-support-using-langgraph) - The agents are orchestrated using LangGraph, a framework from the LangChain ecosystem designed for b...

2. [Building a Multi-Agent Chatbot with LangGraph - Techify Solutions](https://techifysolutions.com/blog/building-a-multi-agent-chatbot-with-langgraph/) - Discover how to create a multi-agent chatbot using LangGraph. Learn to build specialized AI agents f...

3. [Building Long-Term Memory in AI Agents with LangGraph and Mem0](https://www.digitalocean.com/community/tutorials/langgraph-mem0-integration-long-term-ai-memory) - Integrate LangGraph with Mem0 to build AI agents with long-term memory. Learn architecture, setup, a...

4. [5.1 Framework: Langgraph](https://dev.to/sudarshangouda/ai-agent-memory-from-manual-implementation-to-mem0-to-aws-agentcore-2d7c) - Introduction AI agents need memory to remember past conversations, user preferences, and...

5. [LangGraph - Mem0 Docs](https://docs.mem0.ai/integrations/langgraph) - Build customer support agents using LangGraph for conversation flow and Mem0 for personalized respon...

6. [Mem0: Building Production-Ready AI Agents with Scalable Long ...](https://arxiv.org/abs/2504.19413) - We introduce Mem0, a scalable memory-centric architecture that addresses this issue by dynamically e...

7. [Search Memory - Mem0 Docs](https://docs.mem0.ai/core-concepts/memory-operations/search) - How Mem0 Searches Memory. Mem0's search operation lets agents ask natural-language questions and get...

8. [AI Memory Search with Mem0 search() Operation](https://mem0.ai/blog/searching-memories-with-mem0-search()-operation) - AI memory retrieval with Mem0 search() operation. Learn basic queries, advanced filtering, and outpu...

9. [Types System | HelixDB/helix-db | DeepWiki](https://deepwiki.com/HelixDB/helix-db/2.4-types-system) - This page documents the core data types and error handling mechanisms in HelixDB. The Types System f...

10. [Schema Definition - HelixDB Docs](https://docs.helix-db.com/documentation/hql/schema/schema-definition) - How to define schemas for nodes, edges, and vectors in HelixDB with type-safe property definitions

11. [HelixDB is an open-source graph-vector database built ... - GitHub](https://github.com/helixdb/helix-db) - HelixDB has a built-in vector search, keyword search, and graph traversals that can be used to power...

12. [Learning a Health Knowledge Graph from Electronic Medical Records](https://www.nature.com/articles/s41598-017-05778-z) - This study explored an automated process to learn high quality knowledge bases linking diseases and ...

13. [Select language](https://www.proquest.com/docview/1956174693) - Explore millions of resources from scholarly journals, books, newspapers, videos and more, on the Pr...

14. [clinicalml/HealthKnowledgeGraph: Health knowledge graph for 157 ...](https://github.com/clinicalml/HealthKnowledgeGraph) - Health knowledge graph for 157 diseases and 491 symptoms, learned from >270000 patients' data - clin...

15. [How does a decision tree know the next best question to ask from ...](https://towardsdatascience.com/how-does-a-decision-tree-know-the-next-best-question-to-ask-from-the-data-0d44c9433b06/) - The objective of this article is to understand how an impurity measure (eg entropy) is used at each ...

16. [Understanding Information Gain: Choosing the Right Questions](https://dev.to/dev_patel_35864ca1db6093c/understanding-information-gain-choosing-the-right-questions-1mj4) - The algorithm aims to select the feature that provides the most information gain at each step, leadi...

17. [Information Gain - an overview | ScienceDirect Topics](https://www.sciencedirect.com/topics/computer-science/information-gain) - Information gain is a univariate filtration algorithm that evaluates each variable in a dataset and ...

18. [MediQ: Question-Asking LLMs for Adaptive and Reliable Clinical Reasoning](https://arxiv.org/html/2406.00922v2)

19. [MediQ: Question-Asking LLMs and a Benchmark for ...](https://arxiv.org/html/2406.00922v3)

20. [Introducing SymptomCheck Bench - MedAsk](https://medask.tech/blogs/introducing-symptomcheck-bench/) - In this article we introduce SymptomCheck Bench, a novel approach to evaluating AI agents on diagnos...

21. [Introducing SymptomCheck Bench: An Open-Source Benchmark for ...](https://www.reddit.com/r/OpenSourceeAI/comments/1gk7ibp/introducing_symptomcheck_bench_an_opensource/) - We call it SymptomCheck Bench because it tests the core functionality of symptom checker apps—extrac...

22. [medaks/medask-benchmarks - GitHub](https://github.com/medaks/medask-benchmarks) - An OSCE-style benchmark for evaluating diagnostic accuracy of LLM-based medical agents in symptom as...

23. [Reagraph - a high-performance network graph visualization built in ...](https://reagraph.dev) - Reagraph is a high-performance network graph visualization built in WebGL for React with 2D & 3D sup...

24. [reagraph](https://www.npmjs.com/package/reagraph) - WebGL Node-based Graph for React. Latest version: 4.24.2, last published: 2 days ago. Start using re...

