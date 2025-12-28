# Clue Marketing Agent

> AI-powered marketing for chronic illness communities using Google ADK

---

## Project Structure

```
marketing/                      # Agent package (ADK convention)
├── __init__.py                 # Exports root_agent
├── agent.py                    # Agent definition + inline tools
├── tools/                      # Modular tool implementations
│   ├── __init__.py             # Tool exports
│   ├── reddit.py               # Imagen 3 ad generation
│   ├── seo.py                  # Website analysis
│   └── analytics.py            # Ad metrics
├── models/                     # (TODO) Pydantic models
│   ├── __init__.py
│   ├── events.py               # MarketingEvent
│   ├── artifacts.py            # MarketingArtifact
│   └── state.py                # MarketingState
├── .env                        # GOOGLE_API_KEY
├── requirements.txt
└── CLAUDE.MD                   # This file
```

---

## Quick Start

```bash
# Setup
cd marketing
pip install -r requirements.txt
echo "GOOGLE_API_KEY=your_key" > .env

# Run (from project root)
adk web                    # → http://localhost:8000
```

---

## Agent Definition Pattern

```python
# agent.py - ADK Best Practice Structure

from google.adk.agents import Agent
from google.adk.tools import google_search

# 1. TOOLS - Functions with clear docstrings (ADK uses these for LLM)
def my_tool(param: str) -> dict:
    """
    One-line description for LLM delegation.
    
    Args:
        param: What this parameter controls
    
    Returns:
        Dict with 'status' key for error handling
    """
    return {"result": param, "status": "success"}

# 2. AGENT - Descriptive name, detailed instruction
root_agent = Agent(
    name="descriptive_snake_case",      # Used for delegation routing
    model="gemini-2.0-flash",
    description="One sentence for sub-agent delegation decisions.",
    instruction="""Detailed persona and behavior guidelines.
    
    Structure:
    1. **Role**: What you are
    2. **Capabilities**: What you can do (reference tools)
    3. **Principles**: How you behave
    4. **Error Handling**: What to do when tools fail
    """,
    tools=[my_tool, google_search],
)
```

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  root_agent (gemini-2.0-flash)                   │
│  "clue_marketing_agent"                          │
├──────────────────────────────────────────────────┤
│  Tools:                                          │
│  ├── analyze_seo()              Website meta     │
│  ├── generate_reddit_image()    Imagen 3         │
│  ├── get_ad_performance()       Mock metrics     │
│  ├── analyze_marketing_copy()   Spoonie score    │
│  ├── get_reddit_community_insights() Subreddit   │
│  ├── create_campaign_artifact() Campaign brief   │
│  └── google_search()            Web grounding    │
└──────────────────────────────────────────────────┘
```

---

## Models (Pydantic)

| Model | Purpose |
|-------|---------|
| `MarketingEvent` | Trigger from onboarding (condition, priority, intent) |
| `MarketingArtifact` | Campaign output (copy, image prompt, channels) |
| `MarketingState` | Active campaigns, segments, spend tracking |

---

## Agent Principles

1. **Spoonie-Friendly** - Low-energy audience, no guilt-inducing copy
2. **No Toxic Positivity** - "We understand" not "Just think positive!"
3. **Doctor-Trust Focus** - Help users communicate with healthcare providers
4. **Community-First** - Authentic engagement over hard selling

---

## ADK Best Practices

### 1. Naming Convention
```python
# ✅ Good - descriptive, snake_case
name="clue_marketing_agent"
description="Marketing expert for chronic illness communities"

# ❌ Bad - vague, unclear scope
name="agent1"
description="Does marketing stuff"
```

### 2. Tool Docstrings (Critical for LLM)
```python
# ✅ Good - LLM knows when to use this
def analyze_seo(url: str) -> dict:
    """Analyzes website SEO. Returns title, meta description, H1 tags."""

# ❌ Bad - LLM can't route properly
def seo(u):
    """Does SEO."""
```

### 3. Error Handling in Tools
```python
# ✅ Always return status for graceful degradation
def my_tool(param: str) -> dict:
    try:
        result = do_something(param)
        return {"data": result, "status": "success"}
    except Exception as e:
        return {"error": str(e), "status": "failed"}
```

### 4. Sub-Agent Delegation (Multi-Agent)
```python
# Root agent instruction should explicitly mention sub-agents
instruction="""
Delegate to `seo_agent` for website analysis.
Delegate to `content_agent` for copy generation.
Handle general queries yourself.
"""
```

---

## File Organization Rules

| File | Contains | Why |
|------|----------|-----|
| `agent.py` | Agent + simple tools | ADK convention, `adk web` expects this |
| `tools/*.py` | Complex tool logic | Separation of concerns, testability |
| `models/*.py` | Pydantic schemas | Type safety, validation |
| `__init__.py` | `from .agent import root_agent` | Package export for ADK |

---

## Deployment Checklist

- [ ] `__init__.py` exports `root_agent`
- [ ] `.env` has `GOOGLE_API_KEY`
- [ ] All tools return `dict` with `status` key
- [ ] Tool docstrings are descriptive
- [ ] `requirements.txt` is up to date

---

## ADK Docs (Curated)

### Essential
- [Python Quickstart](https://google.github.io/adk-docs/get-started/python/index.md)
- [Function Tools](https://google.github.io/adk-docs/tools-custom/function-tools/index.md)
- [Agent Best Practices](https://google.github.io/adk-docs/tutorials/agent-team/index.md)

### Multi-Agent
- [Multi-agent Systems](https://google.github.io/adk-docs/agents/multi-agents/index.md)
- [Sequential Workflows](https://google.github.io/adk-docs/agents/workflow-agents/sequential-agents/index.md)

### Production
- [Session & Memory](https://google.github.io/adk-docs/sessions/index.md)
- [Cloud Run Deploy](https://google.github.io/adk-docs/deploy/cloud-run/index.md)
- [Safety & Security](https://google.github.io/adk-docs/safety/index.md)

---

## Template Usage

To create a new agent from this template:

```bash
# 1. Copy structure
cp -r marketing/ new_agent/

# 2. Update agent.py
#    - Change name, description, instruction
#    - Replace tools with your own

# 3. Update __init__.py
#    - Export your root_agent

# 4. Update CLAUDE.MD
#    - Document your agent's purpose and tools
```
