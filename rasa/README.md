# Rasa Dialogue Manager for Clue

Handles short-term dialogue state and form-based slot filling.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DIALOGUE FLOW                             │
├─────────────────────────────────────────────────────────────┤
│  User: "I have a headache, 7/10"                            │
│          ↓                                                   │
│  OpenMed: {symptom: "headache"}                             │
│  LLM:     {severity: 7}                                      │
│          ↓                                                   │
│  Rasa:   slots = {current_symptom: "headache",              │
│                   symptom_severity: 7}                       │
│          form = symptom_detail_form (complete)              │
│          ↓                                                   │
│  Next.js: Create Symptom node in Supabase                   │
│           Delete Unknown node (if existed)                   │
│           Call HealthKG for next question                   │
└─────────────────────────────────────────────────────────────┘
```

## Slots

| Slot | Type | Range | Maps To |
|------|------|-------|---------|
| `current_symptom` | text | — | Symptom node |
| `symptom_severity` | float | 1-10 | Symptom.subLabel |
| `sleep_quality` | float | 0-24 | Factor: Sleep |
| `stress_level` | float | 1-10 | Factor: Stress |
| `energy_level` | float | 1-10 | Factor: Energy |
| `mood_rating` | float | 1-10 | Factor: Mood |

## Forms

| Form | Required Slots | When Triggered |
|------|---------------|----------------|
| `symptom_detail_form` | symptom, severity | User reports symptom |
| `daily_checkin_form` | sleep, stress, energy | Returning user greets |
| `full_intake_form` | All 6 slots | New user onboarding |

## Local Development

> **Note**: Rasa 3.x uses TensorFlow which requires AVX2 CPU instructions not available
> in Docker Desktop on Apple Silicon (M1/M2/M3). Run Rasa natively using Python 3.10.

### First-time setup

```bash
# Install Python 3.10 (required — Rasa needs Python <3.11)
brew install python@3.10

# Create virtualenv and install Rasa
cd rasa/
/opt/homebrew/bin/python3.10 -m venv .venv
.venv/bin/pip install --upgrade "setuptools<71"
.venv/bin/pip install rasa==3.6.20

# Train the model
.venv/bin/rasa train --fixed-model-name clue-model
```

### Start Rasa (run every dev session)

```bash
cd rasa/
# Redis must be running (via docker-compose up -d redis openmed)
REDIS_URL=redis://localhost:6380/0 .venv/bin/rasa run \
  --enable-api --cors "*" --debug --endpoints endpoints.yml
```

### Retrain after domain/stories changes

```bash
cd rasa/
.venv/bin/rasa train --fixed-model-name clue-model
```

### Other services (Docker)

```bash
# Start OpenMed + Redis (these run fine in Docker)
docker-compose up -d redis openmed

# View OpenMed logs
docker-compose logs -f openmed
```

## API Usage

```bash
# Send message and get slots
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender": "user123", "message": "I have a headache, 7/10"}'

# Get current tracker state (all slots)
curl http://localhost:5005/conversations/user123/tracker

# Manually set a slot
curl -X POST http://localhost:5005/conversations/user123/tracker/events \
  -H "Content-Type: application/json" \
  -d '{"event": "slot", "name": "symptom_severity", "value": 7}'
```

## Integration with Next.js

Rasa doesn't generate responses — it just tracks state. The flow:

1. **Before LLM**: Call Rasa to update slots based on extracted entities
2. **Get state**: Read filled slots from Rasa tracker
3. **Sync to Supabase**: Create/update graph nodes from filled slots
4. **Delete Unknown**: If a slot answers a pending question, delete the Unknown node
5. **Generate response**: LLM uses slot state + HealthKG to craft reply
