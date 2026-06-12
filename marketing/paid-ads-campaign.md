# Paid Ads Campaign — Ready to Ship ($500/mo)

> Companion to `30-day-beta-growth-plan.md`. Optimized for **cost-per-Activated-Beta-User (ABU)**, not clicks.
> Drafted June 11, 2026. All ads route through the existing `campaign_config` + UTM system.

---

## 0. PRE-LAUNCH GATES (do not spend until all ✅)

1. **Meta Pixel + Conversions API live**, firing `signup_completed` + `first_chat_sent`. This makes Meta optimize for engaged users, not cheap clicks. **Highest-leverage task in the whole plan.**
2. **Google Ads conversion action** on signup, imported.
3. **Clear above-the-fold CTA** on each landing page → straight into chat ("Start a 20-second check-in").
4. **Mobile load < 3s** (Spoonies browse on phones, in bed, fatigued).
5. **UTMs verified** end-to-end: click an ad → confirm `landing_visit` row in Supabase with correct `utm_content`.

---

## 1. Budget & structure (testing phase, Weeks 2–3)

| Platform | Daily | Objective | Optimize for | Why |
|---|---|---|---|---|
| Meta (FB/IG) | $8 | Conversions | `first_chat_sent` | Visual prediction angle + retargeting + lookalikes; primary engine |
| Reddit | $6 | Traffic→conv | CTR then activation | Native Spoonie language; cheap resonance test |
| Google Search | $2.50 | Conversions | signup | Tiny spend, highest intent, best activators |

After Week 3 → **consolidate budget into the single best channel × angle** (cost-per-ABU winner).

Naming convention: `[PLATFORM]_[Objective]_[Audience]_[Angle]_[Date]`
e.g. `META_Conv_LongCOVID_Prediction_2026-06`.

---

## 2. META campaign (primary)

**Campaign:** `META_Conv_Chronic_2026-06` · Objective: **Conversions** (optimize `first_chat_sent`, fallback `signup_completed`).

### Ad sets (2 to start — test ANGLE, the biggest lever)
| Ad set | Audience | Landing page | UTM |
|---|---|---|---|
| **AS1 — Prediction** | Interests: chronic illness, fibromyalgia, Long COVID, POTS, autoimmune, spoonie; Age 25–55; broad placements (Reels + Feed + Stories) | `/flare-forecast` | `utm_source=meta&utm_medium=paid&utm_campaign=flare_predict_v1&utm_content={ad}` |
| **AS2 — Spoons/Low-effort** | Same interests + "chronic fatigue", "invisible illness" | `/spoon-saver` | `utm_source=meta&utm_medium=paid&utm_campaign=spoon_saver_v4&utm_content={ad}` |

Each ad set = **3 ads** (rotate concepts, never 1 ad/set).

### Meta ad copy — AS1 Prediction (route to `/flare-forecast`)

**Ad 1 — `predict_blindsided`**
- Primary text: *"Blindsided by another flare? Your body leaves clues before a crash — you just can't see them in the moment. ChronicLife learns your patterns from 20-second daily chats and gives you a heads-up before the next one hits. Free during beta."*
- Headline: **Predict your next flare**
- Description: Chat 20 seconds a day. No forms.
- CTA button: **Learn More**

**Ad 2 — `predict_graph_reveal`** (visual: knowledge-graph / pattern screenshot)
- Primary text: *"What if you could see WHY your symptoms keep coming back? ChronicLife connects your symptoms → triggers → patterns into one picture — built from a quick daily chat. Your personal flare forecast. Free beta."*
- Headline: **See the pattern. Stop the surprise.**
- Description: Symptoms → triggers → prediction.
- CTA: **Learn More**

**Ad 3 — `predict_data_proof`** (lead with a stat — boosts trust)
- Primary text: *"\"Your fatigue increases 40% on days following less than 6 hours of sleep.\" That's the kind of pattern ChronicLife surfaces from your own data — only when it can show the evidence. Chat 20 sec/day, see your forecast. Free during beta."*
- Headline: **Patterns, backed by your data**
- Description: We only call a pattern when we can prove it.
- CTA: **Learn More**

### Meta ad copy — AS2 Spoons (route to `/spoon-saver`)

**Ad 4 — `spoons_tracking_cost`**
- Primary text: *"Tracking symptoms shouldn't cost spoons you don't have. ChronicLife is a 20-second chat — not a 40-field form. Log how you feel, even on wiped-out days, and let the app remember the rest. Free during beta."*
- Headline: **Tracking shouldn't cost spoons**
- Description: 20-second chat. Flare mode for bad days.
- CTA: **Learn More**

**Ad 5 — `spoons_wiped_mode`**
- Primary text: *"On the days you can't even look at a screen, ChronicLife has an 'I'm wiped' mode — tap once, done. No guilt, no streak to break. Gentle tracking built for chronic life. Free beta."*
- Headline: **Built for the days you can't**
- Description: 'I'm wiped' mode. One tap.
- CTA: **Learn More**

**Ad 6 — `spoons_chat_not_forms`**
- Primary text: *"Too tired to track symptoms? Same. So we made it a chat, not a form. Tell Clue how you feel like you'd text a friend — it logs everything and finds the patterns. Free during beta."*
- Headline: **Chat, don't fill forms**
- Description: Symptom tracking that respects your energy.
- CTA: **Learn More**

### Creative direction (use Canva connector + existing ad videos)
- **Video ads win in this niche.** Repurpose ad1/ad2/ad3 → 9:16 + captions (see `short-form-video-plan.md`).
- Static fallback: real faces (not stock), warm/dim "in bed / on couch" settings, the knowledge-graph UI screenshot, the "Pattern Detected — based on 14 data points" card.
- Keep text overlay minimal; native, soft, non-clinical look (Podia-inspired warmth per brand guidelines).

---

## 3. REDDIT campaign (resonance test) — `spoon_saver_v4`

Reuse your strongest existing variants + add prediction. Route to `/spoon-saver` and `/flare-forecast`. Keep headlines **under 7 words** (the 20-Second Rule).

| utm_content | Headline | Angle | Subreddits |
|---|---|---|---|
| `tracking_cost_spoons` | Tracking shouldn't cost spoons. | spoons | r/cfs, r/ChronicIllness, r/Fibromyalgia |
| `chat_not_forms` | Too tired to track? Chat, don't fill forms. | spoons | r/ChronicIllness, r/POTS |
| `predict_next_flare` | Predict your next flare. | prediction | r/Fibromyalgia, r/migraine, r/LongCOVID |
| `wiped_mode` | "I'm wiped" mode for bad days. | low-effort | r/cfs, r/MyalgicEncephalomyelitis |
| `doctor_summaries` | Summaries your doctor will read. | doctor | r/ChronicIllness, r/POTS |

- **Promoted Post** format (looks native) beats banner. Use the spoon photo + one product screenshot.
- Reddit pixel on landing page if available; otherwise rely on UTM → Supabase → PostHog ABU funnel.

---

## 4. GOOGLE SEARCH campaign (high-intent capture) — `intent_capture_v1`

Tiny budget, best activators. **One ad group, exact + phrase match.**

**Ad group structure:**
- AG1 [symptom tracker intent]: keywords → RSA1

**Negative keywords:**
  Campaign-level:
    - free (we're free but filter freebie-seekers? keep "free" — actually KEEP, we are free) → instead negate:
    - period tracker
    - clue app (avoid confusion w/ the period app "Clue")
    - jobs
    - ovulation
  Ad-group level:
    - AG1: pregnancy, fertility, weather, login

> Note: the period-tracking app **"Clue"** is a major brand. Negate `clue period`, `clue app`, `clue pregnancy` aggressively, and lead with **"ChronicLife"** in headlines to avoid wasted spend + confusion.

**Sitelinks (≥4):**
  - Flare Forecast | Predict your next flare | See patterns early | https://chroniclife.app/flare-forecast
  - For Bad Days | 'I'm wiped' mode | One-tap logging | https://chroniclife.app/spoon-saver
  - Doctor Summaries | Reports doctors read | Clean trends | https://chroniclife.app/crash-prevention
  - How It Works | Chat 20 sec a day | Free during beta | https://chroniclife.app/

**Callouts (≥4, ≤25 chars):**
  - 20-second check-ins
  - Free during beta
  - Built for brain fog
  - Doctor-ready summaries

**RSA1 — Chronic symptom tracker**
  Final URL: https://chroniclife.app/flare-forecast?utm_source=google&utm_medium=cpc&utm_campaign=intent_capture_v1&utm_content=rsa1
  Path1: symptom-tracker   Path2: chronic
  Headlines (15, each ≤30 chars):
    1. ChronicLife Symptom Tracker (27 chars)
    2. Predict Your Next Flare (23 chars)
    3. Track Symptoms in 20 Seconds (28 chars)
    4. Symptom Tracker for Spoonies (28 chars)
    5. Chat-Based Symptom Tracking (27 chars)
    6. Built for Brain Fog Days (24 chars)
    7. See Your Symptom Patterns (25 chars)
    8. Chronic Illness Tracker App (27 chars)
    9. Track Flares Without Forms (26 chars)
    10. Free Symptom Tracker Beta (25 chars)
    11. Doctor-Ready Symptom Logs (25 chars)
    12. Tracking That Saves Spoons (26 chars)
    13. Flare Forecast for Chronic (26 chars)
    14. Log Symptoms by Chatting (24 chars)
    15. Know Your Triggers Sooner (25 chars)
  Descriptions (4, each ≤90 chars):
    1. Chat 20 seconds a day. ChronicLife learns your patterns and predicts flares early. (83 chars)
    2. No 40-field forms. Just a quick chat that works on brain-fog days. Free during beta. (84 chars)
    3. See how symptoms, sleep and triggers connect. Export summaries your doctor will read. (85 chars)
    4. Built for chronic illness and Spoonies. Gentle tracking that respects your energy. (82 chars)
  Pinning: H1=position 1 (pin "ChronicLife Symptom Tracker" to avoid period-app confusion); rest unpinned.

---

## 5. Retargeting (Week 4, Meta)

- Audience: site visitors who hit a landing page but **did not** `signup_completed` (7–30 day window).
- Message: objection-handling + social proof — *"Still thinking about it? It's free, it's 20 seconds, and your data stays yours. See what Clue spots in your first week."*
- Exclude: anyone who already signed up (`signup_completed`).

---

## 6. Optimization rules (apply every Monday)

- **Judge by cost-per-ABU**, not CPC or CPM. A $1.50 click that never chats is worse than a $4 click that activates.
- Kill any ad below **0.8% CTR** (Meta) or whose `first_chat_sent` rate is bottom-half after 100+ clicks.
- Don't touch budgets mid-learning (wait 3–5 days). When scaling, +20–30% only.
- If CPA high but CTR fine → problem is **post-click** (landing page / signup friction), not the ad.
- Refresh creative every ~2 weeks to fight fatigue.

---

## 7. What I can execute for you via connectors
- **Google Ads connector**: create the budget, campaign, ad group, keywords, negatives, and RSA above — ready for your review before enabling.
- **Facebook Pages connector**: publish organic posts; note paid ad *creation* needs Meta Ads Manager (I'll prep everything copy/targeting-ready).
- **PostHog**: build the ABU funnel insight.
- **Canva**: generate the static ad creative set.

Say the word and I'll stand up the Google Search campaign (paused) + PostHog funnel first, since those are fully connector-driven.
