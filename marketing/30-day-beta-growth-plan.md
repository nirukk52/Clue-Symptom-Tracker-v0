# Clue / ChronicLife — 30-Day Beta Growth Plan

> **Goal (you chose this):** Get **engaged users who actually chat & log** — not vanity signups.
> **Focus channels:** Paid ads (Reddit + Meta) done right · Content/SEO + AI-search · Short-form video.
> **Budget:** $500/month paid.
> **Owner:** Niranjan (Founder/CEO) · **Drafted:** June 11, 2026 · **Status:** Active plan.

---

## 0. The honest diagnosis

Your last Reddit run (`The Clarity Experiment`, ~$100) got **~12 signups**. That's not a failure — it was a *measurement* experiment, and $100 of cold paid traffic to a pre-PMF free product will always be thin. The lesson isn't "Reddit ads don't work," it's **"$100 of cold paid clicks can't be your growth engine."**

For a free, emotionally-driven health product targeting Spoonies, the people most likely to *actually chat and log* come from **trust-rich contexts** — communities they already belong to, content that already answers their question, and faces/voices that feel like one of their own. So this plan weights effort toward **earned + organic-amplified-by-paid**, with paid used as a *targeted accelerant*, not the whole machine.

### What you already have (don't rebuild it)
- **Supabase `campaign_config`** table + `/tracking` dashboard + UTM conventions (`utm_source/medium/campaign/content`).
- **Product-specific landing pages:** `/spoon-saver`, `/flare-forecast`, `/top-suspect`, `/crash-prevention` — each a different *angle* you can A/B at the page level.
- Live campaign `spoon_saver_v3` with 7 ad variants already defined.
- Ad **videos** (ad1, ad2, ad3 + v2/v3 variants) sitting in `context/`.
- A `marketing-campaigns` skill that writes ads + generates tracking URLs automatically.
- Connectors live: **Google Ads, Facebook Pages, PostHog, GA4, Semrush, Canva, YouTube, Klaviyo, HubSpot, Notion, GitHub**.

---

## 1. The North Star: define "engaged" before spending a dollar

You said the goal is engaged users. So the metric we optimize is **NOT signups** — it's the activation funnel:

```
Visit  →  Signup/started  →  First Chat (Clue replies)  →  First Symptom Logged  →  Day-3 Return  →  Day-7 Return
```

### Activation metric (the one number)
> **% of signups who log at least one symptom AND return at least once within 7 days ("Activated Beta User", ABU).**

Everything in this plan is judged by **cost-per-ABU and ABU count**, not raw signups. A channel that brings 5 signups where 4 activate beats a channel that brings 30 signups where 2 activate.

### Tracking plan (instrument this in PostHog — most can already be wired via your Supabase events)
| Event | Where | Why |
|---|---|---|
| `landing_visit` (already tracked) | landing pages | top of funnel + UTM attribution |
| `signup_started` / `signup_completed` | auth modal | signup conversion |
| `first_chat_sent` | chat surface | the real activation trigger |
| `first_symptom_logged` | graph/log | the value moment |
| `knowledge_graph_viewed` | sidebar | the "aha" — this is your differentiator |
| `return_day_3`, `return_day_7` | session | retention |

**Action:** Create a PostHog **funnel insight** for these 6 steps, broken down by `utm_campaign` + `utm_content`. This becomes your single source of truth for *which message produces engaged users*, not just clicks. (I can create this insight via the PostHog connector — see Section 8.)

---

## 2. Positioning lock (so every channel says the same thing)

Your research already converged: **prediction is the #1 validated desire**, ahead of trigger-ID and doctor communication. The landing page hero already reflects this ("Learns your patterns, adapts to your energy").

**Primary promise (lead with this everywhere):**
> *"Predict your next flare before it hits — by chatting for 20 seconds a day."*

**Three supporting angles** (map 1:1 to your existing landing pages — let the page do the A/B work):
| Angle | Pain | Landing page | Best channel |
|---|---|---|---|
| **Prediction / Pattern** | "I'm blindsided by flares" | `/flare-forecast`, `/top-suspect` | Meta (visual pattern reveal), short-form video |
| **Low-effort / Spoons** | "Tracking costs energy I don't have" | `/spoon-saver` | Reddit (community language), short-form |
| **Doctor proof** | "My doctor dismisses me" | `/crash-prevention` (or build `/doctor-pack`) | Google Search (high intent), content/SEO |

**Voice:** keep the Spoonie-copywriter "Language of Care" — validation over instruction, permission over restriction, neutral over judgmental. This is your unfair advantage; bigger competitors (Bearable, Guava, Visible) sound clinical.

---

## 3. The 30-day plan at a glance

| Week | Paid ($500/mo ≈ $115/wk) | Content / SEO / AI-search | Short-form video | Community (organic, free) |
|---|---|---|---|---|
| **Week 1 — Foundation** | Set up Meta pixel + conversions API; rebuild Reddit campaign w/ new creative; **don't spend yet** | Publish 1 cornerstone comparison page + `llms.txt` + `/pricing.md`; submit sitemap | Film/edit 3 vertical clips from existing ad videos + 1 founder talking-head | Warm up: comment authentically in 5 target subreddits, no links |
| **Week 2 — Launch** | Launch Meta ($8/day) + Reddit ($8/day) split-test, prediction vs spoons angle | Publish 2 long-tail "answer" articles targeting AI-search queries | Post 4 clips (TikTok + Reels + Shorts), reply to every comment | 1 genuine value post in r/ChronicIllness or r/cfs (story, not pitch) |
| **Week 3 — Read & cut** | Kill bottom 50% of ads by **cost-per-ABU**; shift budget to winner angle | Publish 2 more articles; internal-link cluster; pitch 1 guest post / Reddit AMA | Double down on best-performing clip format; 4 more posts | Engage Discord/FB groups; soft-launch a founder "build in public" thread |
| **Week 4 — Scale winner** | Scale the single winning ad set 20–30%; add retargeting of site visitors | Refresh top article w/ stats + FAQ schema; measure AI citations | 4 posts; 1 longer-form YouTube explainer ("how flare prediction works") | Recruit 3–5 most-engaged users as "founding members" for testimonials |

**Weekly ritual (your 8am standup fits perfectly):** every Monday, pull the PostHog ABU-funnel by `utm_content`, log it to the repo, kill losers, scale winners. I can automate this as a cron (Section 9).

---

## 4. PAID — $500/month, done right

### Why Meta + Reddit (and a sliver of Google), not just Reddit
- **Reddit** = where Spoonies *talk*; great for resonance + cheap clicks, but lower conversion-to-action and clunky pixel. Keep it, but cap it.
- **Meta (FB/IG)** = best creative + retargeting + lookalikes; your prediction angle is *visual* (knowledge graph, flare forecast) which Meta rewards. This should be your primary paid engine.
- **Google Search** = tiny but **highest-intent**: people typing "symptom tracker for chronic illness" or "app to track flares" are bottom-funnel. A $2/day search campaign on 10 exact keywords can produce your best-activating users.

### Budget split (testing phase, Weeks 2–3)
| Channel | Daily | Monthly | Objective | Optimized for |
|---|---|---|---|---|
| **Meta** | $8 | ~$240 | Conversions (signup/first_chat) | cost-per-ABU |
| **Reddit** | $6 | ~$180 | Traffic → conversion | CTR + activation |
| **Google Search** | $2.50 | ~$75 | High-intent capture | conversions |
| *Reserve* | — | ~$5 | buffer | — |

After Week 3, **consolidate into the single best channel/angle** (scaling phase: one winner gets the budget).

### The #1 thing that will 3x your results: **conversion tracking + a real CTA**
Two pre-launch blockers from the audit:
1. **Landing page CTA isn't clearly visible** in the page content I pulled. Every paid landing page needs ONE obvious above-the-fold CTA ("Start a 20-second check-in") that goes straight into chat — no friction, no long signup. *Fix before spending.*
2. **Meta Pixel + Conversions API** must fire `signup_completed` and `first_chat_sent`. Without this, Meta optimizes for clicks (cheap, useless) instead of engaged users. *This is the single highest-leverage setup task.*

**Pre-launch checklist (do all before $1 is spent):**
- [ ] Meta Pixel installed + Conversions API + `signup` and `first_chat` events
- [ ] Google Ads conversion tag on signup
- [ ] Every ad URL uses the UTM convention (Section 6) so PostHog attributes ABUs
- [ ] One clear CTA above the fold on each landing page
- [ ] Mobile load < 3s (most Spoonies browse on phone in bed)
- [ ] Reddit ads re-pointed to new creative (Section 5)

> Detailed campaign builds, ad copy, targeting, and the exact Reddit + Meta + Google structures are in **`paid-ads-campaign.md`**.

---

## 5. CONTENT / SEO + AI-SEARCH

Spoonies are *researchers* — they Google and now ChatGPT/Perplexity their symptoms constantly. Getting **cited by AI answers** and ranking for long-tail health-tracking queries is the cheapest durable engine you have. (Per Princeton GEO research, citing sources +40% and adding statistics +37% to AI citation rates.)

### Three content types that get cited most (prioritize these)
1. **Comparison pages** (~33% of AI citations): *"Bearable vs ChronicLife"*, *"Best symptom trackers for chronic illness 2026"*, *"Guava vs Visible vs ChronicLife"*. High-intent, structured, AI-friendly.
2. **Definitive guides**: *"How to track symptoms when you have brain fog"*, *"How to predict a chronic illness flare"*.
3. **Original data/research**: you sit on a goldmine — anonymized aggregate patterns ("Across N Clue users, fatigue rose 40% after <6h sleep"). Original stats get cited 37–40% more.

### Technical AI-search must-dos (Week 1)
- Add **`/llms.txt`** (product overview + key links) and **`/pricing.md`** ("Free during beta") to site root.
- Confirm **robots.txt allows** GPTBot, PerplexityBot, ClaudeBot, Google-Extended (blocking them = can't be cited).
- Add **FAQPage + Article + Product schema** to landing + content pages.
- Lead every article section with a **40–60 word self-contained answer block**.

> The full content calendar, the first 3 publishable article drafts, target queries, and schema templates are in **`content-seo-ai-search-plan.md`**.

---

## 6. UTM & tracking convention (extends your existing system)

Keep your existing pattern; just add the new sources so PostHog attributes everything cleanly:

```
https://chroniclife.app/{product}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content_id}
```

| Channel | utm_source | utm_medium | Example campaign |
|---|---|---|---|
| Meta paid | `meta` | `paid` | `flare_predict_v1` |
| Reddit paid | `reddit` | `paid` | `spoon_saver_v4` |
| Google Search | `google` | `cpc` | `intent_capture_v1` |
| TikTok/Reels/Shorts (bio/organic) | `tiktok` / `instagram` / `youtube` | `social` | `shortform_v1` |
| Blog/SEO | `blog` | `organic` | `content_v1` |
| Reddit organic posts | `reddit` | `social` | `community_v1` |

Each new ad → a row in `campaign_config` (your skill does this) so `/tracking` + PostHog stay the source of truth.

---

## 7. SHORT-FORM VIDEO

You already have ad videos — repurpose them into vertical, captioned, native-feeling clips. Spoonie TikTok ("chronic illness TikTok") is huge and high-empathy.

- **Format:** 9:16, captions always (85% watch muted), first 3s = pattern interrupt.
- **3 proven hook angles:** (1) "POV: you forgot your symptoms again because brain fog" (2) "I tracked my flares for 14 days and the app predicted the next one" (3) "Things my doctor finally believed once I showed them this."
- **Cadence:** 4 posts/week across TikTok + Reels + Shorts (same clip, 3 platforms).
- **Founder build-in-public:** 1 talking-head/week — founders in this niche build trust fast.

> Full hook bank, 8 ready-to-shoot scripts, and an editing spec are in **`short-form-video-plan.md`**.

---

## 8. COMMUNITY (free, highest-trust — runs alongside everything)

Paid gets you clicks; community gets you *believers* who activate and tell friends.
- **Warm up first** (Week 1): comment helpfully in r/ChronicIllness, r/cfs, r/Fibromyalgia, r/LongCOVID, r/POTS, r/ChronicPain with **zero links** — build karma + read the room.
- **Value posts, not pitches:** share a genuinely useful insight ("here's how I finally got my doctor to listen") and mention the tool only if asked / in comments.
- **Founding-members program** (Week 4): turn your 3–5 most engaged beta users into named testimonials + a private feedback channel (Discord). This is your retention + word-of-mouth flywheel.
- Most subreddits ban overt promotion — **always read each subreddit's self-promo rules** before posting. Authenticity is the strategy.

---

## 9. Recommended connectors & automations

**Already connected — let's use them:**
- **PostHog** → build the ABU activation funnel + weekly insight (I can create this now).
- **Google Ads / Facebook Pages** → launch + report on campaigns programmatically.
- **GA4** → blended attribution cross-check.
- **Semrush** → keyword + AI-overview tracking for the content plan.
- **Canva** → generate ad creative + carousels at scale.
- **YouTube Data** → publish/repurpose video.
- **GitHub** → this repo stays the marketing log (done — see `/marketing/`).
- **Notion** → optional: mirror the weekly dashboard for stakeholders.

**Worth connecting:**
- **Reddit Ads** (no native connector yet — manage in-platform; I'll prep all creative + targeting).
- **TikTok** (for organic posting cadence; manual for now).
- **YouTube Analytics** (currently disconnected) → connect to measure Shorts performance.

**Automations I can set up (with your OK — each cron run uses credits):**
1. **Weekly Monday 8am "Growth Standup"** — pull PostHog ABU funnel by `utm_content`, Google Ads + Meta spend/results, write the week's log to the repo, and notify you with kill/scale recommendations.
2. **Monthly AI-visibility check** — query ChatGPT/Perplexity/Google for your 15 priority queries, log whether ChronicLife is cited vs competitors.

---

## 10. Success criteria for the 30 days

| Metric | Floor | Target | Stretch |
|---|---|---|---|
| Activated Beta Users (ABU) | 25 | 60 | 120 |
| Cost per ABU (paid) | < $20 | < $10 | < $6 |
| First-chat rate (of signups) | 50% | 65% | 75% |
| Day-7 return rate | 20% | 35% | 50% |
| AI-search citations (of 15 queries) | 1 | 4 | 8 |
| Winning angle identified | — | yes | yes + 2nd validated |

The real deliverable at Day 30 is **clarity + a repeatable engine**: one proven angle, one proven channel, a known cost-per-engaged-user, and content compounding in the background.

---

*This plan is the index. Detailed execution lives in: `paid-ads-campaign.md`, `content-seo-ai-search-plan.md`, `short-form-video-plan.md`. All committed to the repo under `/marketing/`.*
