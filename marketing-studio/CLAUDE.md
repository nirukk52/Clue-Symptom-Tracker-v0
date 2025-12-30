# Marketing Studio Agent

> LangGraph-powered marketing agent for Chronic Life with RAG over knowledge base.

## Quick Start

```bash
# 1. Setup
cd marketing-studio
pip install -r requirements.txt
cp env.example .env
# Edit .env with your GOOGLE_API_KEY

# 2. Index knowledge base
python -c "from rag.indexer import index_knowledge; index_knowledge()"

# 3. Launch LangGraph Studio
# Option A: If using conda, activate environment first
# conda activate base  # or your env name
# langgraph dev

# Option B: Use full path to langgraph
/Users/priyankalalge/miniconda3/bin/langgraph dev

# Option C: Install langgraph-cli globally
# pip install langgraph-cli
# langgraph dev

# Opens at http://localhost:8123
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Studio UI                       │
│     Chat Interface | State Inspector | Graph Visualization   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Agent                           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ Retrieve │──▶│  Agent   │──▶│  Tools   │──▶│ Respond  │ │
│  │  (RAG)   │   │(Reasoning)│   │(Execute) │   │          │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ search_knowledge │ │generate_image│ │ create_campaign  │
│   (RAG Tool)     │ │  (Imagen 3)  │ │  (Artifact Gen)  │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

## Project Structure

```
marketing-studio/
├── agent/                    # LangGraph agent
│   ├── __init__.py
│   ├── graph.py              # Graph definition + compiled app
│   ├── nodes.py              # Node functions
│   └── state.py              # AgentState schema
├── rag/                      # Retrieval Augmented Generation
│   ├── __init__.py
│   ├── embeddings.py         # Gemini text-embedding-004
│   ├── indexer.py            # Index markdown → LanceDB
│   └── retriever.py          # search_knowledge tool
├── tools/                    # Agent tools
│   ├── __init__.py
│   ├── image.py              # generate_image (Imagen 3)
│   ├── campaign.py           # create_campaign
│   └── copy.py               # analyze_copy, generate_utm_url
├── knowledge/                # Indexed knowledge base
│   ├── research/             # Pain points, user insights
│   ├── brand/                # Guidelines, audience, value props
│   ├── campaigns/            # Campaign registry + logs
│   ├── competitors/          # Competitor analysis
│   ├── prompts/              # Image prompt library
│   ├── workflows/            # Multi-step processes
│   └── context/              # Current priorities
├── assets/                   # Marketing assets
├── vectorstore/              # LanceDB storage (gitignored)
├── langgraph.json            # LangGraph Studio config
├── requirements.txt
└── CLAUDE.md                 # This file
```

## Agent Tools

| Tool               | Purpose                             | When Used                    |
| ------------------ | ----------------------------------- | ---------------------------- |
| `search_knowledge` | Semantic search over knowledge base | Auto-runs on every query     |
| `generate_image`   | Create ad images via Imagen 3       | User requests image/creative |
| `create_campaign`  | Generate campaign brief artifact    | User requests new campaign   |
| `analyze_copy`     | Score copy for Spoonie-friendliness | User shares copy for review  |
| `generate_utm_url` | Create trackable URL                | Part of campaign creation    |

## Agent Principles

1. **Spoonie-Friendly** - Low-energy audience, no guilt-inducing copy
2. **No Toxic Positivity** - "We understand" not "Just think positive!"
3. **Doctor-Trust Focus** - Help users communicate with healthcare providers
4. **Community-First** - Authentic engagement over hard selling
5. **Evidence-Grounded** - Cite sources from knowledge base

## Knowledge Base

### Research

- `pain-points.md` - Top 10 pain points ranked by severity
- `index.md` - Research overview and summary

### Brand

- `guidelines.md` - Colors, typography, voice
- `audience.md` - Target personas, Reddit targeting
- `value-props.md` - Core messaging pillars

### Campaigns

- `index.md` - Campaign registry with performance
- `{name}.md` - Individual campaign logs

### Workflows

- `new-campaign.md` - Step-by-step campaign creation

## Adding to Knowledge Base

1. Add markdown file to appropriate folder
2. Re-run indexer: `python -c "from rag.indexer import index_knowledge; index_knowledge()"`
3. Agent will automatically search new content

## Model Configuration

| Component  | Model                     | Purpose             |
| ---------- | ------------------------- | ------------------- |
| Agent      | `gemini-2.0-flash`        | Main reasoning      |
| Embeddings | `text-embedding-004`      | RAG semantic search |
| Image Gen  | `imagen-3.0-generate-002` | Ad creatives        |

## Debugging with LangGraph Studio

LangGraph Studio provides:

- **Graph View**: See agent flow visually
- **State Inspector**: Examine state at each node
- **Trace View**: Step through tool calls
- **Replay**: Re-run specific inputs

## Environment Variables

```bash
GOOGLE_API_KEY=your_key_here
```
