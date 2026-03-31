# Rasa Pro (CALM) for Clue Symptom Tracker

Minimal Rasa Pro setup for dialogue state tracking. Uses CALM architecture with 
**controlled slots** — all slot filling happens via API from Next.js backend.

## Architecture

```
Next.js Backend → Rasa Pro API → Redis (state persistence)
     │                ↑
     │                │ POST /conversations/{id}/tracker/events
     │                │ GET  /conversations/{id}/tracker
     └────────────────┘
   
   OpenMed extracts biomedical entities
   LLM extracts factors (sleep, stress, etc.)
   Next.js sets slots via Rasa API
   Rasa just stores and returns slot state
```

## Prerequisites

- Python 3.10-3.13 (Rasa Pro doesn't support 3.14+)
- Redis reachable at the host port in `endpoints.yml` (repo default: **6380** via Docker Compose)
- `RASA_LICENSE_KEY` in `../web-app/.env.local`

## Setup

```bash
# Create virtual environment (Python 3.10/3.11 recommended)
python3.11 -m venv .venv
source .venv/bin/activate

# Install Rasa Pro
pip install uv
uv pip install rasa-pro "numpy<2"

# Export license (required for training)
export RASA_LICENSE=$(grep "RASA_LICENSE_KEY" ../web-app/.env.local | cut -d'=' -f2)

# Train model
rasa train

# Run server
rasa run --enable-api --port 5005 --cors "*"
```

## Controlled Slots

All slots use `type: controlled` — they can only be set via API, not by Rasa NLU/LLM:

| Slot | Type | Description |
|------|------|-------------|
| `current_symptom` | text | Active symptom being discussed |
| `symptom_severity` | float | Severity rating (1-10) |
| `sleep_quality` | float | Sleep hours/quality (0-24) |
| `stress_level` | float | Stress rating (1-10) |
| `energy_level` | float | Energy rating (1-10) |
| `mood_rating` | float | Mood rating (1-10) |
| `current_medication` | text | Active medication being discussed |
| `current_condition` | text | Active condition being discussed |

## API Usage

### Set a slot

```bash
curl -X POST http://localhost:5005/conversations/user-123/tracker/events \
  -H "Content-Type: application/json" \
  -d '{"event": "slot", "name": "current_symptom", "value": "Headache"}'
```

### Get all slots

```bash
curl http://localhost:5005/conversations/user-123/tracker | jq .slots
```

### Reset slots (new session)

```bash
curl -X POST http://localhost:5005/conversations/user-123/tracker/events \
  -H "Content-Type: application/json" \
  -d '{"event": "restart"}'
```

## Files

- `domain.yml` - Slot definitions (all controlled)
- `config.yml` - Minimal CALM config (WhitespaceTokenizer + FlowPolicy)
- `endpoints.yml` - Redis tracker store config
- `data/flows.yml` - Minimal flows for training

## Troubleshooting

### NumPy version error
```
A module that was compiled using NumPy 1.x cannot be run in NumPy 2.x
```
Fix: `uv pip install "numpy<2"`

### Missing RASA_LICENSE
```
rasa --version # shows "Rasa Open Source"
```
Fix: `export RASA_LICENSE=$(grep "RASA_LICENSE_KEY" ../web-app/.env.local | cut -d'=' -f2)`

### Redis connection error
Ensure Redis is running on the port specified in `endpoints.yml` (repo default: 6380).
