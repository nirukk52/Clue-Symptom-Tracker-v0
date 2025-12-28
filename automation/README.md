# n8n Automation for Clue Marketing

Self-hosted n8n instance for visual workflow automation.

## Quick Start

```bash
# 1. Start n8n
cd automation
docker compose up -d

# 2. Open n8n
open http://localhost:5678

# 3. Login
# Username: admin
# Password: clue-n8n-local
```

## Setup Credentials

After first login, set up these credentials in n8n UI:

1. **OpenAI** → Settings → Credentials → OpenAI → Add API key
2. **Reddit** → Settings → Credentials → Reddit OAuth2 → Add client ID/secret
3. **Google Sheets** → Settings → Credentials → Google Sheets OAuth2 → Authorize
4. **Gmail** → Settings → Credentials → Gmail OAuth2 → Authorize

## Import Workflows

1. Go to Workflows → Import from File
2. Select `workflows/reddit-market-analysis.json`
3. Update credential references in imported workflow

## Included Workflows

| Workflow               | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| Reddit Market Analysis | Scan subreddits for business opportunities using AI |

## Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f n8n

# Update n8n
docker compose pull && docker compose up -d
```

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

See `CLAUDE.md` for detailed documentation.
