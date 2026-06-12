# Marketing — Knowledge Base & Record Log

> This folder is the living marketing record for **ChronicLife / Clue**. Treat it as the single source of truth for strategy, campaigns, and results. Update it every week.

## Contents
| File | Purpose |
|---|---|
| [`30-day-beta-growth-plan.md`](./30-day-beta-growth-plan.md) | **Start here.** The master 30-day GTM plan: goal, North Star metric, channel strategy, weekly calendar, success criteria. |
| [`paid-ads-campaign.md`](./paid-ads-campaign.md) | Ready-to-ship paid campaigns (Meta + Reddit + Google), copy, targeting, $500/mo budget split, optimization rules. |
| [`content-seo-ai-search-plan.md`](./content-seo-ai-search-plan.md) | Content calendar, 15 target queries, AI-search/GEO technical setup, first cornerstone articles. |
| [`short-form-video-plan.md`](./short-form-video-plan.md) | TikTok/Reels/Shorts strategy, hook bank, 8 ready-to-shoot scripts. |
| `weekly-logs/` | Weekly growth-standup results (ABU funnel, spend, kill/scale decisions). Added each Monday. |

## Context (June 11, 2026)
- **Goal:** engaged beta users who actually chat & log (Activated Beta Users), not vanity signups.
- **Budget:** $500/month paid.
- **Focus:** paid (done right) + content/SEO + AI-search + short-form video.
- **Prior result:** ~12 signups from ~$100 Reddit ads (`The Clarity Experiment`).
- **Positioning lock:** "Predict your next flare before it hits — by chatting for 20 seconds a day."

## North Star metric
**Activated Beta User (ABU)** = a signup who logs ≥1 symptom AND returns ≥once within 7 days.
Optimize every channel by **cost-per-ABU and ABU count**, never raw signups.

## How this connects to existing infra
- Ads/UTMs flow through the existing Supabase `campaign_config` table + `/tracking` dashboard (see `.claude-skills/marketing-campaigns/`).
- Attribution: UTM → `landing_visits` → PostHog ABU funnel.
- Live landing pages: `/spoon-saver`, `/flare-forecast`, `/top-suspect`, `/crash-prevention`.
