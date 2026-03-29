# The Clarity Experiment: Campaign Headlines & Landing Pages

> **Campaign Name:** The Clarity Experiment
> **Budget:** $100 ($10/day for 10 days)
> **Platform:** Reddit
> **Primary KPI:** Click-Through Rate (CTR)
> **Goal:** Validate which user pain point resonates most

---

## Campaign Structure

| Ad Group                  | Hypothesis                                                   | Budget |
| ------------------------- | ------------------------------------------------------------ | ------ |
| 1: Exhaustion & Brain Fog | Users' primary pain is the cognitive/energy cost of tracking | $33    |
| 2: Doctor Mistrust        | Users' primary frustration is being dismissed by doctors     | $33    |
| 3: Pattern Discovery      | Users want to understand triggers and predict flares         | $34    |

---

## Ad Group 1: Exhaustion & Brain Fog

### Ad 1.1 — "Spoon Saver"

| Element               | Content                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **UTM Content**       | `spoon_saver`                                                                                      |
| **Page Slug**         | `/spoon-saver`                                                                                     |
| **Reddit Headline**   | Tracking shouldn't cost you a spoon. A chat-based symptom tracker app to save your limited energy. |
| **Landing H1**        | Track symptoms without draining your energy.                                                       |
| **Landing H2**        | 20-second check-ins designed for spoonies. When every task costs energy, tracking shouldn't.       |
| **Primary CTA**       | Start a 20-second check-in                                                                         |
| **Secondary CTA**     | See how it protects your bandwidth                                                                 |
| **Focus Feature**     | Quick Entry (20 seconds), "I'm wiped" mode                                                         |
| **Target Subreddits** | r/ChronicIllness, r/cfs, r/Fibromyalgia, r/POTS                                                    |

**Full URL:**

```
https://chronic-life-landing.vercel.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=spoon_saver
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "Save your spoons for living."
- H1 Alt B: "Tracking that doesn't drain you."
- H1 Alt C: "Built for days when everything is hard."

---

### Ad 1.2 — "Foggy Minds"

| Element               | Content                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **UTM Content**       | `foggy_minds`                                                                               |
| **Page Slug**         | `/foggy-minds`                                                                              |
| **Reddit Headline**   | Brain fog makes tracking impossible. This app remembers so you don't have to.               |
| **Landing H1**        | A second brain for foggy days.                                                              |
| **Landing H2**        | When memory fails, your symptom history shouldn't. Chat-first tracking that thinks for you. |
| **Primary CTA**       | Let it remember for you                                                                     |
| **Secondary CTA**     | See how it works with brain fog                                                             |
| **Focus Feature**     | Chat assistant, History that works with brain fog                                           |
| **Target Subreddits** | r/BrainFog, r/ChronicIllness, r/LongCOVID, r/cfs                                            |

**Full URL:**

```
https://chronic-life-landing.vercel.app/foggy-minds?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=foggy_minds
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "Your memory fails. Your tracker shouldn't."
- H1 Alt B: "When you can't remember, it does."
- H1 Alt C: "Tracking designed for brain fog."

---

## Ad Group 2: Doctor Mistrust

### Ad 2.1 — "Doctor Proof"

| Element               | Content                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| **UTM Content**       | `doctor_proof`                                                                                      |
| **Page Slug**         | `/doctor-proof`                                                                                     |
| **Reddit Headline**   | Tired of being told it's "just stress"? Turn your symptoms into proof doctors can't ignore.         |
| **Landing H1**        | Make your doctor listen.                                                                            |
| **Landing H2**        | Stop being dismissed. Export clean graphs and structured summaries that move conversations forward. |
| **Primary CTA**       | See the Doctor Pack                                                                                 |
| **Secondary CTA**     | How it turns logs into proof                                                                        |
| **Focus Feature**     | Doctor Pack export, clinician-shaped summaries                                                      |
| **Target Subreddits** | r/ChronicIllness, r/BrainFog, r/LongCOVID, r/POTS                                                   |

**Full URL:**

```
https://chronic-life-landing.vercel.app/doctor-proof?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=doctor_proof
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "Walk in with data, not just a diary."
- H1 Alt B: "Proof they can't dismiss."
- H1 Alt C: "Stop being told it's 'just anxiety'."

---

### Ad 2.2 — "Appointment Prep"

| Element               | Content                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **UTM Content**       | `appointment_prep`                                                                                                                   |
| **Page Slug**         | `/appointment-prep`                                                                                                                  |
| **Reddit Headline**   | Stop forgetting symptoms at appointments. Walk in prepared for your next doctor's appointment.                                       |
| **Landing H1**        | Stop forgetting symptoms at appointments.                                                                                            |
| **Landing H2**        | Appointment Prep Mode organizes what helped, what worsened, and what changed — so you never leave feeling like you forgot something. |
| **Primary CTA**       | Try Appointment Prep                                                                                                                 |
| **Secondary CTA**     | Preview a Doctor Summary                                                                                                             |
| **Focus Feature**     | Appointment Prep Mode, structured export                                                                                             |
| **Target Subreddits** | r/ChronicIllness, r/BrainFog, r/Fibromyalgia                                                                                         |

**Full URL:**

```
https://chronic-life-landing.vercel.app/appointment-prep?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=appointment_prep
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "Never leave an appointment kicking yourself."
- H1 Alt B: "Remember everything. Even when you can't."
- H1 Alt C: "Prepared for the doctor's office."

---

## Ad Group 3: Pattern Discovery

### Ad 3.1 — "Find Triggers"

| Element               | Content                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **UTM Content**       | `find_triggers`                                                                                      |
| **Page Slug**         | `/find-triggers`                                                                                     |
| **Reddit Headline**   | Sleep, stress, food, cycle, weather — which one is actually making you worse?                        |
| **Landing H1**        | Connect the dots your brain can't.                                                                   |
| **Landing H2**        | Track in 20 seconds. Let the app find the patterns. Discover what's actually triggering your flares. |
| **Primary CTA**       | Start connecting dots                                                                                |
| **Secondary CTA**     | See an example insight                                                                               |
| **Focus Feature**     | Pattern detection, evidence-backed insights                                                          |
| **Target Subreddits** | r/migraine, r/Allergies, r/cfs, r/IBS, r/Fibromyalgia                                                |

**Full URL:**

```
https://chronic-life-landing.vercel.app/find-triggers?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=find_triggers
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "Finally see what's driving your symptoms."
- H1 Alt B: "Find the triggers you've been missing."
- H1 Alt C: "No more guessing."
- H1 Alt D: "Discover the why."

---

### Ad 3.2 — "Predict Flares"

| Element               | Content                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **UTM Content**       | `predict_flares`                                                                                          |
| **Page Slug**         | `/predict-flares`                                                                                         |
| **Reddit Headline**   | What if you could predict your next flare instead of being blindsided?                                    |
| **Landing H1**        | Predict your next flare.                                                                                  |
| **Landing H2**        | Stop being blindsided. Connect the dots between sleep, stress, food, and symptoms — before it's too late. |
| **Primary CTA**       | Start predicting flares                                                                                   |
| **Secondary CTA**     | How pattern detection works                                                                               |
| **Focus Feature**     | Flare prediction, lag effect detection                                                                    |
| **Target Subreddits** | r/Fibromyalgia, r/ChronicIllness, r/cfs, r/migraine                                                       |

**Full URL:**

```
https://chronic-life-landing.vercel.app/predict-flares?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=predict_flares
```

**Alternate Headlines (for A/B testing):**

- H1 Alt A: "See the flare coming."
- H1 Alt B: "Anticipate, don't react."
- H1 Alt C: "Know before it hits."

---

## Landing Page Structure

Each landing page follows this section order (with the **Focus Feature** elevated to appear right after hero):

### For Ad Group 1 (Exhaustion/Brain Fog):

1. **Hero** (customized headline + CTA)
2. **Quick Check-ins** ← Focus feature first
3. **Flare Mode** ← Related to low-energy
4. **Personal Assistant**
5. **History View**
6. **Insights**
7. **Doctor Pack**
8. **Multiple Conditions**
9. **Closing CTA**

### For Ad Group 2 (Doctor Mistrust):

1. **Hero** (customized headline + CTA)
2. **Doctor Pack** ← Focus feature first
3. **History View** ← Supports doctor communication
4. **Insights** ← Evidence for doctors
5. **Personal Assistant**
6. **Quick Check-ins**
7. **Flare Mode**
8. **Multiple Conditions**
9. **Closing CTA**

### For Ad Group 3 (Pattern Discovery):

1. **Hero** (customized headline + CTA)
2. **Insights** ← Focus feature first
3. **History View** ← Pattern viewing
4. **Personal Assistant** ← Pattern detection
5. **Quick Check-ins**
6. **Flare Mode**
7. **Doctor Pack**
8. **Multiple Conditions**
9. **Closing CTA**

---

## Tracking Implementation

### CTA Button Tracking

All buttons with `[data-modal-trigger]` attribute are automatically tracked with:

- `event_type`: `cta_click`
- `element_id`: Section ID or button index
- `element_text`: Button text (truncated to 50 chars)
- All UTM parameters from URL

### Event Flow

```
page_view → cta_click → signup_complete
```

### Supabase Tables

- `marketing_events` — All page views and CTA clicks
- `beta_signups` — Email submissions with UTM attribution

---

## Success Metrics

### Primary: Click-Through Rate (CTR)

The ad group with highest CTR wins. CTR indicates message resonance.

### Secondary: Waitlist Conversion

Signups after clicking indicate solution appeal.

### Benchmarks (Reddit)

| Metric                  | Poor   | OK       | Good   |
| ----------------------- | ------ | -------- | ------ |
| CTR                     | < 0.5% | 0.5-1.5% | > 1.5% |
| Landing Page Click Rate | < 5%   | 5-15%    | > 15%  |
| Signup Conversion       | < 3%   | 3-10%    | > 10%  |

---

## Post-Campaign Actions

### If Ad Group 1 (Exhaustion) Wins:

- Prioritize simplifying UI and reducing friction
- Double down on "20-second" messaging
- Focus engineering on low-energy modes

### If Ad Group 2 (Doctor Mistrust) Wins:

- Prioritize Doctor Pack feature
- Explore EHR integration
- Emphasize "proof" and "evidence" in all messaging

### If Ad Group 3 (Pattern Discovery) Wins:

- Prioritize pattern recognition engine
- Focus on insight quality and confidence
- Emphasize "detective" and "discovery" angles

---

## File Reference

| File                                | Purpose                         |
| ----------------------------------- | ------------------------------- |
| `web-landing/spoon-saver.html`      | Ad 1.1 landing page             |
| `web-landing/foggy-minds.html`      | Ad 1.2 landing page             |
| `web-landing/doctor-proof.html`     | Ad 2.1 landing page             |
| `web-landing/appointment-prep.html` | Ad 2.2 landing page             |
| `web-landing/find-triggers.html`    | Ad 3.1 landing page             |
| `web-landing/predict-flares.html`   | Ad 3.2 landing page             |
| `web-landing/index.html`            | Original landing page (control) |
| `web-landing/tracking.html`         | Campaign dashboard              |
| `web-landing/CAMPAIGN-HEADLINES.md` | This document                   |

---

## Quick Reference: All 6 URLs

```
# Ad Group 1: Exhaustion
https://chronic-life-landing.vercel.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=spoon_saver
https://chronic-life-landing.vercel.app/foggy-minds?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=foggy_minds

# Ad Group 2: Doctor Mistrust
https://chronic-life-landing.vercel.app/doctor-proof?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=doctor_proof
https://chronic-life-landing.vercel.app/appointment-prep?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=appointment_prep

# Ad Group 3: Pattern Discovery
https://chronic-life-landing.vercel.app/find-triggers?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=find_triggers
https://chronic-life-landing.vercel.app/predict-flares?utm_source=reddit&utm_medium=paid&utm_campaign=clarity_experiment&utm_content=predict_flares
```

---

_Last Updated: December 30, 2024_
