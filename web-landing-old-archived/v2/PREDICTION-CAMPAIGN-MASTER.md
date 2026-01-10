# The Prediction Depth Test: Campaign Master Document

> **Campaign Name:** Prediction Depth Test (`prediction_depth_test`)
> **Budget:** $100 ($10/day for 10 days)
> **Platform:** Reddit
> **Primary KPI:** Click-Through Rate (CTR)
> **Secondary KPI:** Landing Page Conversion (Waitlist Signup)
> **Goal:** Determine _which_ type of prediction drives the most intent: Time (When), Variable (Which), or Action (What now).

---

## Campaign Structure

We are doubling down on the "Prediction" winner (`predict_flares` — 59 clicks, $0.05 CPC). This test splits that winning concept into three distinct value propositions.

| Ad Group             | Theme          | Core Promise                            | Landing Page Slug   | Budget |
| :------------------- | :------------- | :-------------------------------------- | :------------------ | :----- |
| **1: The Forecast**  | Time-Based     | "I'll know **WHEN** it's coming"        | `/flare-forecast`   | $33    |
| **2: The Culprit**   | Variable-Based | "I'll know **WHICH** trigger caused it" | `/top-suspect`      | $33    |
| **3: The Preventer** | Action-Based   | "I'll know **WHAT TO DO** to stop it"   | `/crash-prevention` | $34    |

---

## Visual Anchor (Consistent Across All Ads)

**Base Concept:** "Person in the chair with wires"

- A tired but calm young person sitting in a comfortable armchair
- Thin, gentle monitoring wires connected to them (not medical/scary)
- Flat vector illustration style, minimal, soft pastel colors (beige, navy, calm blue, warm orange accents)
- Medical-tech aesthetic — tech-enabled self-care, not hospital

**What Changes Per Ad:** The object they are looking at or interacting with (cloud, graph, wire, gauge, notification)

---

## Ad Group 1: The Forecast (Time-Based)

**Hypothesis:** Users want an "Early Warning System." The value is knowing WHEN it's coming so they can prepare mentally and logistically. They feel helpless against surprise attacks.

**Target Subreddits:**
`r/ChronicIllness`, `r/Fibromyalgia`, `r/cfs`, `r/migraine`, `r/LongCOVID`, `r/POTS`, `r/ChronicPain`

**Keywords:**

- `predict flare`
- `flare forecast`
- `symptom weather`
- `chronic illness forecast`
- `fibromyalgia flare prediction`
- `when will i crash`
- `health weather report`
- `anticipate flare`
- `flare warning signs`
- `early warning chronic illness`
- `body weather system`
- `symptom prediction app`

---

### Ad 1A — "Flare Forecast"

| Element           | Content                                                                                      |
| :---------------- | :------------------------------------------------------------------------------------------- |
| **UTM Content**   | `flare_forecast`                                                                             |
| **Page Slug**     | `/flare-forecast`                                                                            |
| **Headline**      | Your body has a weather system. See the forecast before it hits.                             |
| **Description**   | A symptom tracker that learns your patterns and gives you a 48-hour heads up before a flare. |
| **Primary CTA**   | See your forecast                                                                            |
| **Secondary CTA** | How prediction works                                                                         |

**Alternate Headlines (for A/B testing):**

- Alt A: "It's like a weather app, but for your body."
- Alt B: "Your flares have a forecast. See it before it hits."
- Alt C: "What if you could see the storm coming 2 days early?"
- Alt D: "Flare forecast: cloudy with a chance of crashing."
- Alt E: "Check tomorrow's symptom weather before you plan your day."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, minimal medical-tech aesthetic, soft pastel colors (beige, navy, calm blue, warm orange). A tired young person with short hair sitting in a comfortable modern armchair, thin gentle monitoring wires connected to their wrist and chest. They are looking at a smartphone screen. A holographic projection from the phone shows a small stylized storm cloud icon hovering over the word "Tuesday" on a simple calendar grid. Peaceful expression, tech-enabled foresight vibe. Clean background with subtle plant. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=flare_forecast
```

---

### Ad 1B — "Early Warning"

| Element           | Content                                                                                   |
| :---------------- | :---------------------------------------------------------------------------------------- |
| **UTM Content**   | `early_warning`                                                                           |
| **Page Slug**     | `/flare-forecast`                                                                         |
| **Headline**      | Get alerted before the brain fog rolls in.                                                |
| **Description**   | Know what tomorrow looks like, today. A symptom tracker that warns you before flares hit. |
| **Primary CTA**   | Get early warnings                                                                        |
| **Secondary CTA** | See how it works                                                                          |

**Alternate Headlines (for A/B testing):**

- Alt A: "The notification I wish I had 2 days ago."
- Alt B: "What if your phone warned you before a crash?"
- Alt C: "Early warning system for your body."
- Alt D: "48 hours before you crash, your body gives a signal. We catch it."
- Alt E: "Get the heads up your body is trying to give you."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, clean lines, soft pastel medical-tech aesthetic. A tired young person sitting in a comfortable armchair with thin monitoring wires. They are looking up at a floating notification bubble near their head. The wires connected to them are glowing gently with soft amber light. A triangle warning symbol floats in the air. Alert but calm expression. Beige and navy color palette with orange accent on the warning. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=early_warning
```

---

### Ad 1C — "The 2-Day Lookahead"

| Element           | Content                                                                    |
| :---------------- | :------------------------------------------------------------------------- |
| **UTM Content**   | `2_day_lookahead`                                                          |
| **Page Slug**     | `/flare-forecast`                                                          |
| **Headline**      | Stop being blindsided. See your symptom probability for the next 48 hours. |
| **Description**   | Your patterns tell a story. We read it and show you what's coming.         |
| **Primary CTA**   | See your lookahead                                                         |
| **Secondary CTA** | How we predict flares                                                      |

**Alternate Headlines (for A/B testing):**

- Alt A: "See the crash coming 48 hours away."
- Alt B: "Know how you'll feel tomorrow, based on what you did today."
- Alt C: "Your next 48 hours, predicted."
- Alt D: "What if you could see Friday's crash on Wednesday?"
- Alt E: "The 2-day heads up that changes everything."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, analytical medical-tech vibe, soft pastel colors. A young person sitting in a comfortable armchair with thin monitoring wires. They are looking at a semi-transparent line graph floating in the air in front of them. The line shows a steady path that suddenly dips downward at a point marked "48h". Thoughtful strategic expression. Clean beige background with navy and blue accents. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=2_day_lookahead
```

---

## Ad Group 2: The Culprit Predictor (Variable-Based)

**Hypothesis:** Users want to solve the mystery. They're exhausted from guessing "was it the pizza, the weather, or the stress?" The value is identifying the SPECIFIC variable causing the chaos.

**Target Subreddits:**
`r/migraine`, `r/IBS`, `r/Allergies`, `r/ChronicIllness`, `r/Fibromyalgia`, `r/LongCOVID`, `r/MCAS`, `r/Endometriosis`

**Keywords:**

- `find symptom triggers`
- `food sensitivity tracker`
- `migraine triggers`
- `what triggers flares`
- `symptom correlation`
- `autoimmune trigger finder`
- `sleep vs pain`
- `hidden flare causes`
- `diet symptom diary`
- `why do i feel sick`
- `isolate food sensitivity`
- `weather pain correlation`
- `cycle symptoms correlation`
- `stress symptom correlation`
- `what's making me worse`

---

### Ad 2A — "Top Suspect"

| Element           | Content                                                                            |
| :---------------- | :--------------------------------------------------------------------------------- |
| **UTM Content**   | `top_suspect`                                                                      |
| **Page Slug**     | `/top-suspect`                                                                     |
| **Headline**      | Sleep, stress, food, or cycle? Know which one is about to trigger your crash.      |
| **Description**   | Stop guessing. The app that identifies your top suspects and ranks them by impact. |
| **Primary CTA**   | Find your top suspect                                                              |
| **Secondary CTA** | See an example                                                                     |

**Alternate Headlines (for A/B testing):**

- Alt A: "Pizza? Rain? Stress? Finally know which one did it."
- Alt B: "Your weekly top suspects, ranked by likelihood."
- Alt C: "Which one is actually making you worse? Find out."
- Alt D: "Stop blaming everything. Find the actual culprit."
- Alt E: "This week's top suspect: Poor Sleep (78% correlation)."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, detective mystery vibe meets medical-tech, soft pastel colors. A young person sitting in a comfortable armchair with thin monitoring wires. They are holding three distinct cables in their hands, each with a simple icon: Moon (Sleep), Apple (Food), Lightning Bolt (Stress). The Stress cable is glowing red/vibrating while the others are calm blue. Curious investigative expression. Beige background with navy accents. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=top_suspect
```

---

### Ad 2B — "The Culprit"

| Element           | Content                                                                        |
| :---------------- | :----------------------------------------------------------------------------- |
| **UTM Content**   | `the_culprit`                                                                  |
| **Page Slug**     | `/top-suspect`                                                                 |
| **Headline**      | Stop guessing. The app that isolates the hidden trigger spiking your symptoms. |
| **Description**   | Log for 2 weeks. Get a definitive answer. No more "maybe it was the..."        |
| **Primary CTA**   | Find the culprit                                                               |
| **Secondary CTA** | How isolation works                                                            |

**Alternate Headlines (for A/B testing):**

- Alt A: "Stop guessing why you feel sick."
- Alt B: "Find the invisible trigger hiding in your daily routine."
- Alt C: "The culprit isn't always what you think. Let data decide."
- Alt D: "Your symptoms have a pattern. We find it."
- Alt E: "End the guessing game. Get evidence."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, analytical medical-tech aesthetic, soft pastel colors. A young person sitting in a comfortable armchair with thin monitoring wires. The wires feed into a sleek small machine on the floor beside them. The machine is outputting/printing a single card that clearly shows "POOR SLEEP" in bold text. Satisfied relieved expression — finally having an answer. Clean beige background. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=the_culprit
```

---

### Ad 2C — "Identify the Trigger"

| Element           | Content                                                                   |
| :---------------- | :------------------------------------------------------------------------ |
| **UTM Content**   | `identify_trigger`                                                        |
| **Page Slug**     | `/top-suspect`                                                            |
| **Headline**      | Find the one variable that tips you over the edge before it happens.      |
| **Description**   | Track sleep, stress, food, cycle, and weather. The app connects the dots. |
| **Primary CTA**   | Identify your trigger                                                     |
| **Secondary CTA** | See how patterns work                                                     |

**Alternate Headlines (for A/B testing):**

- Alt A: "Find the one thing tipping you over the edge."
- Alt B: "One variable is doing 80% of the damage. Find it."
- Alt C: "Your body keeps score. We read the data."
- Alt D: "Connect the dots between your meds, your cycle, and your symptoms."
- Alt E: "Turn 'I think it's related' into 'Here is the data.'"

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, precision medical-tech aesthetic, soft pastel colors. A young person sitting calmly in a comfortable armchair with multiple thin monitoring wires. The scene is mostly calm blue tones, except ONE specific wire connected to their wrist which is colored bright red/orange and visibly vibrating or pulsing. They are looking at it calmly, having found the source. Focused peaceful expression. Clean beige background. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=identify_trigger
```

---

## Ad Group 3: The Crash Preventer (Action-Based)

**Hypothesis:** Users care less about "why" and more about "what do I do NOW?" They want control, agency, and permission to pace themselves. The value is actionable guidance to save their day/week.

**Target Subreddits:**
`r/cfs`, `r/ChronicIllness`, `r/Fibromyalgia`, `r/LongCOVID`, `r/POTS`, `r/ChronicPain`, `r/spoonies`

**Keywords:**

- `pacing chronic fatigue`
- `prevent crash`
- `spoon theory app`
- `energy management`
- `avoiding pem`
- `rest pacing`
- `daily energy budget`
- `activity symptom correlation`
- `when to rest`
- `push vs rest day`
- `chronic fatigue energy budget`
- `spoon theory planner`
- `avoiding crashes`
- `pem prevention`
- `boom bust cycle`

---

### Ad 3A — "Crash Prevention"

| Element           | Content                                                                   |
| :---------------- | :------------------------------------------------------------------------ |
| **UTM Content**   | `crash_prevention`                                                        |
| **Page Slug**     | `/crash-prevention`                                                       |
| **Headline**      | Know exactly when to stop today so you don't pay for it tomorrow.         |
| **Description**   | Break the boom-bust cycle. Get alerts when you're approaching your limit. |
| **Primary CTA**   | Prevent the crash                                                         |
| **Secondary CTA** | How pacing alerts work                                                    |

**Alternate Headlines (for A/B testing):**

- Alt A: "How to stop a bad day from becoming a bad week."
- Alt B: "Catch the flare before it becomes a crash."
- Alt C: "Your body is keeping score. Know when to stop."
- Alt D: "The pacing app that actually tells you when to rest."
- Alt E: "Stop paying tomorrow for what you did today."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, protective medical-tech aesthetic, soft pastel colors. A young person sitting in a comfortable armchair with thin monitoring wires. They are holding up a hand in a calm "Stop" gesture, looking relieved. The wires around them are calm blue (stable/safe). A subtle holographic shield or barrier is visible in front of them. Empowered protected expression. Beige background with blue and soft orange accents. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=crash_prevention
```

---

### Ad 3B — "Rest Day Alert"

| Element           | Content                                                                        |
| :---------------- | :----------------------------------------------------------------------------- |
| **UTM Content**   | `rest_day_alert`                                                               |
| **Page Slug**     | `/crash-prevention`                                                            |
| **Headline**      | Wake up knowing if today is a 'Push' day or a 'Rest' day.                      |
| **Description**   | Your body knows. The app reads the signals and tells you before you overdo it. |
| **Primary CTA**   | Check today's status                                                           |
| **Secondary CTA** | How daily alerts work                                                          |

**Alternate Headlines (for A/B testing):**

- Alt A: "Is today a Push day or a Rest day? Check your battery."
- Alt B: "Your daily permission slip to rest (or push)."
- Alt C: "Morning check: Can I do things today, or should I protect my energy?"
- Alt D: "The app that tells you what kind of day you're going to have."
- Alt E: "Finally, an excuse to rest that's backed by data."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, gentle restful medical-tech aesthetic, soft pastel colors. A young person sitting peacefully in a comfortable armchair with thin monitoring wires, eyes closed, looking restful. Above their head floats a battery icon that is half-full but glowing green/stable (not draining, not critical). Permission to rest vibe. Warm beige background with soft green accent on the battery. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=rest_day_alert
```

---

### Ad 3C — "Energy Budget"

| Element           | Content                                                                        |
| :---------------- | :----------------------------------------------------------------------------- |
| **UTM Content**   | `energy_budget`                                                                |
| **Page Slug**     | `/crash-prevention`                                                            |
| **Headline**      | Spend your spoons wisely. Get real-time alerts when you're nearing your limit. |
| **Description**   | Track your daily energy budget. Know how much you have left before you crash.  |
| **Primary CTA**   | Track your budget                                                              |
| **Secondary CTA** | How spoon tracking works                                                       |

**Alternate Headlines (for A/B testing):**

- Alt A: "Stop overspending your spoons. Get an alert when you're low."
- Alt B: "Your energy account has a balance. Check it before you overdraw."
- Alt C: "Spoon budgeting, but make it automatic."
- Alt D: "How many spoons do you have left today? There's an app for that."
- Alt E: "Real-time energy tracking for people who crash when they overdo it."

**Image Prompt (Midjourney/Ideogram):**

```
Flat vector illustration, monitoring dashboard medical-tech aesthetic, soft pastel colors. A young person sitting in a comfortable armchair with thin monitoring wires. They are looking at a gauge (like a fuel gauge or speedometer) attached to the armrest of the chair. The needle is in the "Yellow" zone, indicating caution but not critical. Aware managing expression. Beige background with yellow/amber accent on the gauge warning zone. --ar 1:1 --style raw
```

**Full URL:**

```
https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_test&utm_content=energy_budget
```

---

## Landing Page Strategy

Three variants of the core landing page, customized hero sections to match Ad Group promise.

### Landing Page 1: `/flare-forecast`

| Element                  | Content                                                              |
| :----------------------- | :------------------------------------------------------------------- |
| **Hero H1**              | Predict your next flare.                                             |
| **Hero H2**              | See the storm coming. Get a 48-hour forecast based on your patterns. |
| **Primary CTA**          | Start predicting flares                                              |
| **Secondary CTA**        | How pattern detection works                                          |
| **Focus Visuals**        | Calendar with weather icons, timeline with "storm approaching"       |
| **Lead Feature Section** | Lag Effect Detection (24-48h warning)                                |

**Hero Alternates:**

- H1 Alt A: "Your flares have a forecast."
- H1 Alt B: "See it before it hits."
- H2 Alt A: "Stop being blindsided. Know what's coming based on your data."
- H2 Alt B: "Your body gives signals 48 hours early. We catch them."

---

### Landing Page 2: `/top-suspect`

| Element                  | Content                                                                 |
| :----------------------- | :---------------------------------------------------------------------- |
| **Hero H1**              | Find the hidden trigger.                                                |
| **Hero H2**              | Was it the sleep or the stress? Isolate the culprit causing your crash. |
| **Primary CTA**          | Find your trigger                                                       |
| **Secondary CTA**        | See an example insight                                                  |
| **Focus Visuals**        | Correlation cards, "Top Suspect" ranking, variable comparison           |
| **Lead Feature Section** | Pattern Recognition Engine                                              |

**Hero Alternates:**

- H1 Alt A: "Stop guessing what's making you sick."
- H1 Alt B: "Identify the culprit."
- H2 Alt A: "Track sleep, stress, food, and cycle. Let the app connect the dots."
- H2 Alt B: "Your symptoms have a pattern. We find it."

---

### Landing Page 3: `/crash-prevention`

| Element                  | Content                                                                      |
| :----------------------- | :--------------------------------------------------------------------------- |
| **Hero H1**              | Prevent the crash.                                                           |
| **Hero H2**              | Know exactly when to rest. Manage your energy budget so you don't overspend. |
| **Primary CTA**          | Start preventing crashes                                                     |
| **Secondary CTA**        | How pacing alerts work                                                       |
| **Focus Visuals**        | Battery/gauge icon, Push/Rest day indicator, energy timeline                 |
| **Lead Feature Section** | Daily Pacing Alerts                                                          |

**Hero Alternates:**

- H1 Alt A: "Break the boom-bust cycle."
- H1 Alt B: "Stop paying tomorrow for today."
- H2 Alt A: "Get daily alerts when you're approaching your limit."
- H2 Alt B: "Your body keeps score. The app helps you pace."

---

## Success Metrics & Benchmarks

### Primary: Click-Through Rate (CTR)

The ad group with highest CTR wins. CTR indicates which prediction angle has the strongest emotional pull.

### Secondary: Landing Page Conversion

Waitlist signups after clicking indicate how well the promise converts to commitment.

### Benchmarks (Reddit)

| Metric                  | Poor   | OK       | Good   |
| :---------------------- | :----- | :------- | :----- |
| CTR                     | < 0.5% | 0.5-1.5% | > 1.5% |
| Landing Page Click Rate | < 5%   | 5-15%    | > 15%  |
| Signup Conversion       | < 3%   | 3-10%    | > 10%  |

---

## Post-Campaign Actions

### If Ad Group 1 (Forecast/Time) Wins:

- Prioritize **Lag Effect Detection** in product development
- Build **"Next 48h" dashboard** as primary feature
- Focus on **calendar/timeline visualizations**
- Marketing angle: "Early warning system for your body"

### If Ad Group 2 (Culprit/Variable) Wins:

- Prioritize **Correlation Engine** and **Top Suspects ranking**
- Build **variable comparison views** (sleep vs food vs stress)
- Focus on **evidence/proof language**
- Marketing angle: "Finally know what's causing it"

### If Ad Group 3 (Preventer/Action) Wins:

- Prioritize **Daily Pacing Alerts** and **Energy Budget tracking**
- Build **Push/Rest Day indicator** as primary feature
- Focus on **actionable guidance** over analysis
- Marketing angle: "The pacing app that tells you when to stop"

---

## Quick Reference: All 17 URLs (Prediction Depth Test v2)

### Ad Group 1: Flare Forecast (Time-Based) — $5-12/day

**Keywords:**

- `predict flare`, `flare forecast`, `symptom weather`
- `chronic illness forecast`, `fibromyalgia flare prediction`
- `when will i crash`, `health weather report`
- `anticipate flare`, `flare warning signs`
- `early warning chronic illness`, `body weather system`
- `symptom prediction app`

| Ad  | Headline                      | UTM Content           | Full URL                                                                                                                                    |
| :-- | :---------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| 1A  | "Your flares have a forecast" | `forecast_default`    | `https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=forecast_default`    |
| 1B  | "See flares 48h early"        | `forecast_48h`        | `https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=forecast_48h`        |
| 1C  | "No more surprise flares"     | `forecast_blindsided` | `https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=forecast_blindsided` |
| 1D  | "See the storm coming"        | `forecast_storm`      | `https://chroniclife.app/flare-forecast?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=forecast_storm`      |

### Ad Group 2: Top Suspect (Variable-Based) — $5-12/day

**Keywords:**

- `find symptom triggers`, `food sensitivity tracker`
- `migraine triggers`, `what triggers flares`
- `symptom correlation`, `autoimmune trigger finder`
- `sleep vs pain`, `hidden flare causes`
- `diet symptom diary`, `why do i feel sick`
- `isolate food sensitivity`, `weather pain correlation`
- `cycle symptoms correlation`, `stress symptom correlation`
- `what's making me worse`

| Ad  | Headline                                | UTM Content       | Full URL                                                                                                                             |
| :-- | :-------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| 2A  | "Stop guessing what's making you sick"  | `suspect_default` | `https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=suspect_default` |
| 2B  | "Find the culprit behind your flares"   | `suspect_culprit` | `https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=suspect_culprit` |
| 2C  | "Was it the pizza or the stress?"       | `suspect_pizza`   | `https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=suspect_pizza`   |
| 2D  | "Finally know what's really causing it" | `suspect_ranked`  | `https://chroniclife.app/top-suspect?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=suspect_ranked`  |

### Ad Group 3: Crash Prevention (Action-Based) — $5-12/day

**Keywords:**

- `pacing chronic fatigue`, `prevent crash`
- `spoon theory app`, `energy management`
- `avoiding pem`, `rest pacing`
- `daily energy budget`, `activity symptom correlation`
- `when to rest`, `push vs rest day`
- `chronic fatigue energy budget`, `spoon theory planner`
- `avoiding crashes`, `pem prevention`
- `boom bust cycle`

| Ad  | Headline                                     | UTM Content            | Full URL                                                                                                                                       |
| :-- | :------------------------------------------- | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| 3A  | "The app that tells you when to stop"        | `prevention_default`   | `https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=prevention_default`   |
| 3B  | "Break the boom-bust cycle"                  | `prevention_boom_bust` | `https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=prevention_boom_bust` |
| 3C  | "Stop paying tomorrow for today"             | `prevention_tomorrow`  | `https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=prevention_tomorrow`  |
| 3D  | "The pacing app that tells you when to rest" | `prevention_pacing`    | `https://chroniclife.app/crash-prevention?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=prevention_pacing`    |

### Ad Group 4: Spoon Saver (Low-Energy UX) — $5-12/day

**Keywords:**

- `low energy tracking`, `brain fog friendly app`
- `symptom tracking fatigue`, `easy health tracking`
- `quick symptom log`, `voice health diary`
- `chronic illness app simple`, `minimal symptom tracker`
- `bad day tracking`, `spoon counting app`
- `energy tracking app`, `chronic fatigue tracker`
- `one tap symptom log`

| Ad  | Headline                                      | UTM Content      | Full URL                                                                                                                            |
| :-- | :-------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| 4A  | "Track symptoms without draining energy"      | `spoon_default`  | `https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=spoon_default`  |
| 4B  | "20-second check-ins for spoonies"            | `spoon_20sec`    | `https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=spoon_20sec`    |
| 4C  | "Stop spending spoons on tracking"            | `spoon_spending` | `https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=spoon_spending` |
| 4D  | "Tracking shouldn't cost you a spoon"         | `spoon_cost`     | `https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=spoon_cost`     |
| 4E  | "Finally answer your biggest health question" | `spoon_focus`    | `https://chroniclife.app/spoon-saver?utm_source=reddit&utm_medium=paid&utm_campaign=prediction_depth_v2&utm_content=spoon_focus`    |

---

## Tracking Implementation

### UTM Structure

- `utm_source`: reddit
- `utm_medium`: paid
- `utm_campaign`: prediction_depth_v2
- `utm_content`: [ad-specific identifier from table above]

### Event Flow (New 2-Step Modal)

```
page_view → landing_visits (log visit + persona)
    ↓
cta_click → modal_sessions (start)
    ↓
Step 1 (3 questions) → modal_responses
    ↓
Step 2 (2 questions) → modal_responses
    ↓
AI Summary → ai_generations
    ↓
email_submit → beta_signups + ai_generations.converted = true
```

### Supabase Tables (New)

| Table              | Purpose                                              |
| :----------------- | :--------------------------------------------------- |
| `campaign_config`  | All ad copy, landing copy, modal questions, personas |
| `landing_visits`   | Enhanced page views with persona, UTM, engagement    |
| `modal_sessions`   | Modal open/complete tracking with step progression   |
| `modal_responses`  | Individual question answers with timing              |
| `ai_generations`   | AI-generated summaries with context and conversion   |
| `marketing_events` | Legacy: page views, CTA clicks                       |
| `beta_signups`     | Email submissions with UTM attribution               |

---

## Modal Questions Summary

### Step 1: Universal Questions (All CTAs)

1. **What's your primary condition?** — Fibromyalgia, Long COVID/ME/CFS, PCOS/Endo, Migraine, IBS, Multiple
2. **How do you track symptoms now?** — Don't, Notes/paper, Other app, Spreadsheet
3. **How's your energy today?** — Good, Okay, Rough

### Step 2: Product-Specific Questions

**Flare Forecast:**

- "If you could see a flare coming, what would you do?"
- "How much warning would change your life?"

**Top Suspect:**

- "Which trigger are you most unsure about?"
- "What would 'proof' look like for you?"

**Crash Prevention:**

- "What would 'permission to rest' look like?"
- "What's your biggest pacing struggle?"

**Spoon Saver:**

- "What kills tracking for you?"
- "What's the minimum you'd log on a bad day?"

---

## File Reference

| File                                           | Purpose                       |
| :--------------------------------------------- | :---------------------------- |
| `web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md` | This document                 |
| `web-landing/campaign-modal.js`                | Shared 2-step modal component |
| `web-landing/flare-forecast.html`              | Ad Group 1 landing page ✓     |
| `web-landing/top-suspect.html`                 | Ad Group 2 landing page ✓     |
| `web-landing/crash-prevention.html`            | Ad Group 3 landing page ✓     |
| `web-landing/spoon-saver.html`                 | Ad Group 4 landing page ✓     |
| `web-landing/tracking.html`                    | Campaign dashboard ✓          |
| `web-landing/url-builder.html`                 | URL generator tool            |

---

## Campaign Launch Checklist

- [ ] Deploy landing pages to Vercel
- [ ] Verify all 17 URLs load correctly
- [ ] Test modal flow on mobile and desktop
- [ ] Verify Supabase tables are receiving data
- [ ] Create Reddit ads in Reddit Ads Manager
- [ ] Set daily budget: $5/ad group (total $20/day)
- [ ] Target subreddits: r/ChronicIllness, r/Fibromyalgia, r/cfs, r/migraine, r/LongCOVID
- [ ] Schedule ads to run for 5-10 days
- [ ] Monitor tracking dashboard daily

---

## Tracking Audit: Complete User Journey

### Journey Flow (Ad Click → Chat)

```
Reddit Ad → Landing Page → Modal Q1-Q4 → Summary → Auth → Chat
    ↓            ↓             ↓           ↓        ↓      ↓
utm_content  landing_visits  modal_     ai_gen-  beta_   chat_
captured     + marketing_    sessions   erations signups conver-
             events          + modal_           + user_  sations
                             responses          contexts + chat_
                                                         messages
```

### Supabase Tables & What They Track

| Table                | Events Tracked                   | Key Fields                                                                              |
| :------------------- | :------------------------------- | :-------------------------------------------------------------------------------------- |
| `landing_visits`     | Page view + persona + engagement | `session_id`, `utm_content`, `product_offering`, `persona_shown`, `cta_clicked`         |
| `marketing_events`   | CTA clicks + auth events         | `event_type`, `utm_content`, `session_id`, `element_id`                                 |
| `modal_sessions`     | Modal open/progress/completion   | `visit_id`, `step_reached`, `completed`, `time_to_complete_ms`, `utm_content`           |
| `modal_responses`    | Individual Q1-Q4 answers         | `modal_session_id`, `question_key`, `answer_value`, `time_to_answer_ms`                 |
| `ai_generations`     | Summary shown + conversion       | `modal_session_id`, `generated_headline`, `converted`, `cta_clicked`, `summary_variant` |
| `beta_signups`       | Email submission + attribution   | `email`, `utm_source`, `utm_campaign`, `utm_content`                                    |
| `user_contexts`      | Q1-Q4 answers persisted per user | `email`, `q1_condition`, `q2_painpoint`, `product_offering`                             |
| `chat_conversations` | Conversation start + attribution | `modal_session_id`, `user_email`, `utm_content`, `product_offering`                     |
| `chat_messages`      | Each message in conversation     | `conversation_id`, `role`, `content`, `selected_chip`, `was_chip_selection`             |

### Tracking Verification (January 2026)

**✅ Working Correctly:**

1. **Landing Visit Tracking** — `landing_visits` captures session_id, UTM params, product_offering, persona_shown
2. **Modal Session Tracking** — `modal_sessions` tracks open, step progression, completion, abandonment
3. **Modal Response Tracking** — `modal_responses` captures Q1-Q4 answers with timing data
4. **AI Generation Tracking** — `ai_generations` logs headline/features/CTA with conversion flag
5. **Beta Signup Attribution** — `beta_signups` captures email with full UTM attribution
6. **User Context Persistence** — `user_contexts` stores Q1-Q4 answers per email for returning users
7. **Chat Conversation Tracking** — `chat_conversations` links to modal_session + UTM attribution
8. **Chat Message Tracking** — `chat_messages` captures role, content, chip selections

**⚠️ Known Gaps (Minor):**

1. **Chat conversation → modal_session_id**: Currently stored as text, not FK-linked (doesn't affect analysis)
2. **OAuth chat redirect**: UTM params preserved via sessionStorage, verified working
3. **marketing_events table**: Legacy table, still captures CTA clicks for backwards compatibility

### Key Analytics Queries

**Conversion Funnel by UTM Content:**

```sql
SELECT
  lv.utm_content,
  COUNT(DISTINCT lv.session_id) as visits,
  COUNT(DISTINCT ms.id) as modal_opens,
  COUNT(DISTINCT CASE WHEN ms.completed THEN ms.id END) as modal_completions,
  COUNT(DISTINCT ag.id) as summaries_shown,
  COUNT(DISTINCT CASE WHEN ag.converted THEN ag.id END) as signups,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN ag.converted THEN ag.id END) / NULLIF(COUNT(DISTINCT lv.session_id), 0), 1) as conversion_rate
FROM landing_visits lv
LEFT JOIN modal_sessions ms ON lv.session_id = ms.session_id
LEFT JOIN ai_generations ag ON ms.id = ag.modal_session_id
WHERE lv.utm_campaign = 'prediction_depth_v2'
GROUP BY lv.utm_content
ORDER BY signups DESC;
```

**Q1 Answer Distribution by Product:**

```sql
SELECT
  mr.product_offering,
  mr.answer_label as condition,
  COUNT(*) as responses,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY mr.product_offering), 1) as pct
FROM modal_responses mr
WHERE mr.question_key = 'q1_entry'
GROUP BY mr.product_offering, mr.answer_label
ORDER BY mr.product_offering, responses DESC;
```

**Chat Engagement by Product:**

```sql
SELECT
  cc.product_offering,
  COUNT(DISTINCT cc.id) as conversations,
  COUNT(cm.id) as total_messages,
  ROUND(AVG(message_counts.msg_count), 1) as avg_messages_per_conv
FROM chat_conversations cc
LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
LEFT JOIN (
  SELECT conversation_id, COUNT(*) as msg_count
  FROM chat_messages GROUP BY conversation_id
) message_counts ON cc.id = message_counts.conversation_id
GROUP BY cc.product_offering;
```

---

_Last Updated: January 4, 2026_
