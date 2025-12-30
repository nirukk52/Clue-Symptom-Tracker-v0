# Clue Automation Module (n8n)

> Visual workflow automation for marketing and market analysis

---

## Why This Exists

The `marketing/` module uses Google ADK for AI-powered marketing agents. This `automation/` module complements it with **visual, no-code workflows** using n8n for:

1. **Reddit Market Analysis** - Scan subreddits for business opportunities
2. **Scheduled Tasks** - Cron-based automation (daily/weekly scans)
3. **Multi-Service Integration** - Connect Reddit, OpenAI, Google Sheets, Gmail
4. **Visual Debugging** - See data flow, test individual nodes

---

## Quick Start

```bash
# 1. Start n8n
cd automation
docker compose up -d

# 2. Access n8n UI
open http://localhost:5678
# Login: admin / clue-n8n-local (change in production!)

# 3. Import workflows
# In n8n UI: Settings → Import from File → select workflows/*.json
```

---

## Project Structure

```
automation/
├── docker-compose.yml          # n8n container setup
├── .env.example                # Environment template
├── workflows/                  # Exportable workflow JSONs
│   └── reddit-market-analysis.json
├── CLAUDE.md                   # This file
└── README.md                   # User-facing docs
```

---

## Workflows

### 1. Reddit Market Analysis

**Purpose**: Identify business opportunities from Reddit posts

**Flow**:

```
Manual Trigger
    ↓
Get Posts (Reddit API)
    ↓
Filter Posts By Features (upvotes > 2, has content, < 180 days)
    ↓
Select Key Fields (upvotes, url, date, content)
    ↓
Analysis Content By AI (GPT-4o-mini: is this a business problem?)
    ↓
Filter Posts By Content (only "yes" responses)
    ↓
┌─────────────────────────────────────┐
│ Parallel Processing:                │
│ ├── Post Summarization              │
│ ├── Find Proper Solutions           │
│ └── Post Sentiment Analysis         │
└─────────────────────────────────────┘
    ↓
Merge 3 Inputs
    ↓
Output The Results (Google Sheets)
    ↓
Email Drafts (Gmail: Positive/Neutral/Negative)
```

**Required Credentials**:

- Reddit OAuth2
- OpenAI API
- Google Sheets OAuth2
- Gmail OAuth2

**Subreddits to Monitor** (customize in workflow):

- `smallbusiness`
- `chronicillness`
- `Endometriosis`
- `PCOS`
- `covidlonghaulers`

---

## Credential Setup

### Reddit API

1. Go to https://www.reddit.com/prefs/apps
2. Create a "script" type application
3. Note: Client ID (under app name), Client Secret
4. In n8n: Credentials → Reddit OAuth2 → Add your credentials

### OpenAI API

1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. In n8n: Credentials → OpenAI → Add API key

### Google Sheets & Gmail

1. In n8n: Credentials → Google Sheets OAuth2
2. Follow OAuth flow to authorize
3. Repeat for Gmail OAuth2

---

## Configuration

### Environment Variables

| Variable                  | Default        | Description            |
| ------------------------- | -------------- | ---------------------- |
| `N8N_PORT`                | 5678           | n8n web UI port        |
| `N8N_BASIC_AUTH_USER`     | admin          | Login username         |
| `N8N_BASIC_AUTH_PASSWORD` | clue-n8n-local | Login password         |
| `GENERIC_TIMEZONE`        | Asia/Kolkata   | Timezone for schedules |

### Docker Volumes

| Volume        | Purpose                                       |
| ------------- | --------------------------------------------- |
| `n8n_data`    | Persists workflows, credentials, executions   |
| `./workflows` | Mount point for importing/exporting workflows |

---

## Usage Patterns

### Manual Execution

1. Open workflow in n8n
2. Click "Test Workflow" or "Execute Workflow"
3. View execution results in sidebar

### Scheduled Execution

1. Replace "Manual Trigger" with "Schedule Trigger"
2. Set cron expression (e.g., `0 9 * * 1` for Monday 9am)
3. Activate workflow (toggle in top right)

### Webhook Trigger

1. Replace trigger with "Webhook" node
2. Copy webhook URL
3. Call from external service or curl

---

## Maintenance

### Export Workflows

```bash
# In n8n UI: Workflow → Export → Download
# Save to automation/workflows/ for version control
```

### Backup Data

```bash
# Stop n8n
docker compose down

# Backup volume
docker run --rm -v clue-n8n-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/n8n-backup-$(date +%Y%m%d).tar.gz /data

# Restart
docker compose up -d
```

### Update n8n

```bash
docker compose pull
docker compose up -d
```

---

## Troubleshooting

### n8n won't start

```bash
# Check logs
docker compose logs -f n8n

# Common fixes:
# - Port 5678 in use: change N8N_PORT in docker-compose.yml
# - Permission issues: check volume permissions
```

### Workflow errors

1. Check execution logs in n8n UI
2. Test individual nodes with "Execute Node"
3. Verify credentials are valid
4. Check API rate limits (Reddit, OpenAI)

### Credential issues

- Reddit: Ensure "script" app type, not "web app"
- Google: Re-authorize if tokens expired
- OpenAI: Check API key has sufficient credits

---

## Integration with Marketing Module

The `automation/` and `marketing/` modules serve different purposes:

| Aspect     | `marketing/` (ADK) | `automation/` (n8n)    |
| ---------- | ------------------ | ---------------------- |
| Interface  | Chat/API           | Visual workflow        |
| Best for   | AI conversations   | Multi-step automations |
| Scheduling | External (cron)    | Built-in               |
| Debugging  | Code/logs          | Visual node inspection |

**Recommended Flow**:

1. Use n8n for data collection and initial processing
2. Send processed data to ADK agent for AI-powered decisions
3. Use n8n for output distribution (emails, sheets, notifications)

---

## Security Notes

- **Change default password** before exposing to network
- **Don't commit `.env`** - use `.env.example` as template
- **Credentials are encrypted** in n8n data volume
- **Consider VPN/tunnel** for remote access instead of exposing port

---

## References

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Docker Setup](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Environment Variables](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [Reddit API Docs](https://www.reddit.com/dev/api/)
