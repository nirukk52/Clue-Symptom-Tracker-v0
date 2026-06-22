# Content / SEO + AI-Search Plan

> Companion to `30-day-beta-growth-plan.md`. Goal: durable, compounding discovery — rank for long-tail health-tracking queries AND get cited by ChatGPT / Perplexity / Google AI Overviews.
> Drafted June 11, 2026.

---

## Why this matters for Clue specifically
Spoonies are *researchers*. They Google and now AI-search their symptoms, their conditions, and "best app for X" constantly. Two facts drive the strategy:
- **~45% of Google searches now show AI Overviews**; ChatGPT/Perplexity are where high-agency patients (your "health detective" persona, Emily) increasingly go first.
- **Comparison articles = ~33% of AI citations; original data/stats add +37–40% citation rate** (Princeton GEO research). You have both: a clear competitor set AND proprietary aggregate data.

---

## Part A — Technical foundation (Week 1, one-time)

1. **`/llms.txt`** at site root — short machine-readable overview:
   ```
   # ChronicLife (app) — Clue (AI agent)
   Chat-first symptom tracker for people with chronic illness. Predicts flares from
   20-second daily chats; shows a knowledge graph connecting symptoms → triggers →
   patterns; exports doctor-ready summaries. Free during beta.
   Key pages: /flare-forecast, /spoon-saver, /crash-prevention, /
   ```
2. **`/pricing.md`** at site root:
   ```
   # Pricing — ChronicLife
   ## Beta (current)
   - Price: $0 — free during beta
   - Includes: chat tracking, flare prediction, knowledge graph, doctor summaries
   ```
3. **robots.txt**: confirm `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bingbot` are **allowed**. Blocking = can't be cited.
4. **Schema markup**: `Article` + `FAQPage` on every content page; `Product` + `Organization` on landing pages. (Use the `schema` skill for implementation.)
5. **Sitemap** submitted to Google Search Console; ensure content renders without heavy JS (AI crawlers + agents read the DOM).

---

## Part B — Target queries (the 15 to win)

Tested across Google / ChatGPT / Perplexity. Track monthly: are we cited? who else is?

**Comparison (highest citation value):**
1. best symptom tracker for chronic illness 2026
2. Bearable alternatives
3. Bearable vs ChronicLife
4. best app to track fibromyalgia symptoms
5. symptom tracker for Long COVID
6. best flare tracking app

**How-to / guide (definitive content):**
7. how to track symptoms with brain fog
8. how to predict a chronic illness flare
9. how to track symptoms for a doctor's appointment
10. easiest way to track symptoms when fatigued
11. how to find my chronic illness triggers

**Category / definition:**
12. what is the best chronic illness app
13. chat-based symptom tracker
14. symptom tracker that predicts flares
15. low-effort symptom tracking app

> Use the **Semrush connector** to pull volumes/difficulty and confirm AI-Overview presence for each. Use **Google Ads keyword ideas** as a cross-check (already available).

---

## Part C — First content to publish (priority order)

### Cornerstone #1 (Week 1): "Best Symptom Trackers for Chronic Illness in 2026 (Honest Comparison)"
- **Type:** comparison (most-cited format). Include ChronicLife + Bearable + Guava + Visible + Symple + paper journals.
- **Structure:** 40–60 word answer block up top → comparison table → per-app pros/cons → "best for [use case]" verdicts → FAQ (schema).
- **Why it wins:** captures #1, #2, #6, #12; gets cited because it's structured + balanced + names entities. Be genuinely fair (AI rewards balance) — ChronicLife wins on "lowest effort / prediction / chat," not on "most features."
- **Comparison table columns:** Logging effort · Predicts flares? · Chat or forms? · Doctor export? · Free tier · Best for.

### Cornerstone #2 (Week 2): "How to Track Symptoms When You Have Brain Fog"
- **Type:** definitive guide. Targets #7, #10. Deeply empathetic (Spoonie-copywriter voice).
- Lead with the validation ("If detailed journaling has failed you, that's not a discipline problem — it's a design problem"), then practical low-effort methods, then how chat-based tracking solves it.

### Cornerstone #3 (Week 2): "How to Get Your Doctor to Take Your Symptoms Seriously"
- **Type:** guide + original framing. Targets #9. Maps to the Doctor-proof angle + `/crash-prevention` page.
- Include a downloadable/exportable "doctor summary" example → natural product tie-in.

### Original-data piece (Week 3–4): "What 14 Days of Symptom Data Reveals About Flares"
- **Type:** original research (highest trust/citation). Use anonymized aggregate Clue data.
- Pull 3–5 real stats ("X% of users' worst fatigue followed <6h sleep within 24–48h"). **Original stats are your unfair AI-citation advantage** — nobody else has this data.
- *Privacy:* aggregate-only, no individual data, clear methodology note.

---

## Part D — Presence beyond your own site (where AI actually looks)
AI cites third-party sources **6.5x more** than your own domain. So:
- **Reddit** (1.8% of all ChatGPT citations): authentic, helpful answers in r/ChronicIllness etc. (see community section — no spam).
- **YouTube** (heavily cited by Google AI Overviews): the explainer video from `short-form-video-plan.md` doubles as AI-citation fuel.
- **Review sites**: get listed on Product Hunt, AlternativeTo (as a Bearable alternative), and relevant app directories.
- **Quora**: answer "best symptom tracker" / "how to track chronic illness" questions with genuine depth.

---

## Part E — Cadence & measurement
- **Publish 1–2 articles/week** for the month (5–6 total cornerstone pieces).
- **Internal-link** all pieces into a cluster pointing to the relevant landing pages.
- **Refresh** the comparison piece monthly (freshness = AI weights recency heavily; show "Last updated").
- **Measure:** monthly manual AI-visibility check on the 15 queries (or automate via cron, Section 9 of main plan) + Semrush AI-Overview tracking + GA4 referral traffic from AI sources (`chat.openai.com`, `perplexity.ai`).

---

## What I can do next via connectors
- **Semrush**: pull volume/difficulty + AI-Overview data for the 15 queries → finalize priority.
- **Draft the full cornerstone #1 comparison article** (ready to publish), with schema markup included.
- **Google Docs**: drop drafts there for your review/editing.
