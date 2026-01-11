# Onboarding UI Copy

> Screens 1A → 4

---

## Screen 1A — What are you managing?

**Selection:** 1–3 items

| Element                | Copy                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| **Title**              | What are you managing?                                                  |
| **Subtitle**           | Pick up to 3. This helps Clue tailor symptoms, meds, and charts to you. |
| **Search placeholder** | Search conditions or symptoms                                           |
| **Helper microcopy**   | Not sure? Pick symptoms (pain, fatigue, IBS) — you can refine later.    |

### Section Labels (Bottom Sheet)

- Common
- Digestive
- Pain + Inflammation
- Mental health
- Sleep + Energy
- Neuro
- Hormonal
- Autoimmune
- Other

### Quick Picks (Examples)

|               |            |                      |
| ------------- | ---------- | -------------------- |
| Chronic pain  | Fatigue    | IBS                  |
| Migraine      | Anxiety    | Depression           |
| Insomnia      | Long COVID | Fibromyalgia         |
| Endometriosis | Diabetes   | Autoimmune flare-ups |

### Actions

| Element              | Copy                                                      |
| -------------------- | --------------------------------------------------------- |
| **CTA (sticky)**     | Continue                                                  |
| **Validation**       | Select at least 1 to continue                             |
| **Secondary action** | I'll choose later _(still lands on symptoms-first setup)_ |

---

## Screen 1B — What matters most right now?

**Selection:** Pick 1

| Element              | Copy                                                     |
| -------------------- | -------------------------------------------------------- |
| **Title**            | What matters most right now?                             |
| **Subtitle**         | Start with one priority. Clue will still track the rest. |
| **Helper microcopy** | This sets your first check-in and your first charts.     |

### Options (Single-select)

- Energy crashes / fatigue
- Pain / inflammation
- Mood / anxiety
- IBS / gut symptoms
- Sleep / recovery
- Headaches / migraines
- Brain fog / focus
- Skin / flare-ups
- Other (type it)

### Actions

| Element        | Copy                          |
| -------------- | ----------------------------- |
| **CTA**        | Continue                      |
| **Validation** | Pick one priority to continue |

---

## Screen 1C — Your first "impact question"

**Required**

| Element         | Copy                                             |
| --------------- | ------------------------------------------------ |
| **Title**       | What's the question you're trying to answer?     |
| **Main prompt** | How does my `[Feature]` impact `[Outcome]`?      |
| **Subtitle**    | Start with one question. You can add more later. |

### Dropdowns

| Dropdown | Label   | Placeholder |
| -------- | ------- | ----------- |
| Feature  | Feature | Choose one  |
| Outcome  | Outcome | Choose one  |

### Actions

| Element        | Copy                                 |
| -------------- | ------------------------------------ |
| **Sticky CTA** | Get started                          |
| **Validation** | Choose both a feature and an outcome |

### Bottom Sheet — Feature

**Header:** Choose a feature

- Meds + supplements
- Sleep
- Food
- Stress
- Exercise
- Cycle / hormones
- Work + routine
- Weather
- Hydration
- Social / outings

### Bottom Sheet — Outcome

**Header:** Choose what it impacts

- Your priority _(from 1B)_
- Pain
- Fatigue
- Mood
- IBS
- Sleep quality
- Headache
- Anxiety
- Brain fog / focus
- Skin

---

## Screen 2 — Choose your mode

**Selection:** Pick 1

| Element      | Copy                                                                  |
| ------------ | --------------------------------------------------------------------- |
| **Title**    | What brings you here today?                                           |
| **Subtitle** | This tunes your first week so Clue feels helpful fast.                |
| **Cards**    | Awareness / Tracking / Insight / Action _(use your exact quote sets)_ |
| **CTA**      | Next                                                                  |

---

## Screen 3 — First check-in

**Widgets:** 2–3 (adaptive)

| Element      | Copy                                      |
| ------------ | ----------------------------------------- |
| **Title**    | Quick check-in                            |
| **Subtitle** | 20 seconds. Enough to capture a baseline. |

### Widget A — Always shown

**Your `[priority outcome]` today**

| Element     | Copy                 |
| ----------- | -------------------- |
| Scale label | 0–10                 |
| Helper      | 0 = none, 10 = worst |

### Widget B — Conditional

_Shown if Awareness/Action mode OR high severity_

**Is this a flare?**

| Option | Follow-up                      |
| ------ | ------------------------------ |
| Yes    | **Prompt:** When did it start? |
| No     | —                              |

**If Yes → Options:**

- Just now
- Earlier today
- Yesterday
- Pick time

### Widget C — Based on Feature

**Any likely drivers?** _(optional)_

| Element | Copy                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| Helper  | Pick any that fit. Skip if you're wiped.                                       |
| Chips   | _Varies by Feature:_ missed meds, poor sleep, stress spike, food trigger, etc. |

### Actions

| Element | Copy          |
| ------- | ------------- |
| **CTA** | Save check-in |

---

## Screen 4 — First value moment

**Immediate payoff**

| Element      | Copy                                                           |
| ------------ | -------------------------------------------------------------- |
| **Title**    | Baseline captured                                              |
| **Subtitle** | You've started building a record your doctor can actually use. |

### Card 1: Your calendar, filled in

> Each check-in becomes a clean day card you can tap later.

### Card 2: What happens next

> After **3 days**, Clue starts spotting early links between `[Feature]` and `[Outcome]`.

> After **14 days**, you'll unlock a clear 2–4 week trend view.

### Card 3: Doctor-ready from day one

> Clue summarizes symptoms in a tight, structured format clinicians recognize (onset, location, severity, what helps, what worsens).

> Trends show up as simple graphs so patterns are obvious fast.

### Actions

| Element           | Copy           |
| ----------------- | -------------- |
| **Primary CTA**   | Start chatting |
| **Secondary CTA** | Quick entry    |

---

## First 20 Chat Prompts

> Doctor-trustful, not form-y

These prompts mix daily + flare + provider-quality structure. Each is short, single-purpose, and only asks for "what's missing."

| #   | Prompt                                                                                |
| --- | ------------------------------------------------------------------------------------- |
| 1   | "Quick check-in: how's your `[priority outcome]` right now (0–10)?"                   |
| 2   | "Which condition is this tied to today? (pick one)"                                   |
| 3   | "Anything new since yesterday: meds, sleep, food, stress, or activity?"               |
| 4   | "Do you want to keep this as a normal day or mark it as a flare?"                     |
| 5   | "If flare: when did it start?"                                                        |
| 6   | "Where do you feel it most?"                                                          |
| 7   | "What does it feel like (cramping, burning, stabbing, pressure, ache, nausea, etc.)?" |
| 8   | "Severity right now (0–10)?"                                                          |
| 9   | "Is it constant, or does it come and go?"                                             |
| 10  | "Has it been getting worse, better, or staying the same?"                             |
| 11  | "What were you doing when it started?"                                                |
| 12  | "Any symptoms that came with it?"                                                     |
| 13  | "What makes it worse?"                                                                |
| 14  | "What helps, even a little?"                                                          |
| 15  | "Any meds taken today that could relate? (on time / missed / changed)"                |
| 16  | "Sleep last night: hours + quality (0–10)?"                                           |
| 17  | "Food trigger check: anything unusual, skipped meals, or late eating?"                |
| 18  | "Stress check: low / medium / high?"                                                  |
| 19  | "Want a doctor-ready 3–4 line summary for today?"                                     |
| 20  | "Want me to compare this flare to your last one (duration, peak, what helped)?"       |

---

## "Missing-info" Rules

> So it never feels like an interrogation

- Ask **max 2 follow-ups** per message unless user is in "Appointment Prep Mode"
- If severity is high OR user selects "I'm wiped" → switch to:
  > "One tap answers only. We'll fill details later."

---

## Output Format

> What Clue stores (tight provider paragraph)

**One paragraph per symptom episode** using OLDCARTS/OPQRST-style elements:

- Onset
- Location
- Duration/timing
- Character/quality
- Severity
- Aggravating/alleviating factors
- Associated symptoms
