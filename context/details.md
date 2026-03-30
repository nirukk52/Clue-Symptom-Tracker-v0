
## 4. Onboarding Flow

### Screen 1A — "What are you managing?"

**Goal:** Acknowledge reality—users manage multiple conditions.

**UI:** Bottom sheet picker with common chronic clusters + search

**Condition Examples:**

- IBS, migraine, long COVID, fibromyalgia
- Endometriosis, anxiety/depression, autoimmune
- Diabetes, chronic pain, insomnia, fatigue
- POTS, skin conditions

**Output:** Creates initial tracking templates and vocabulary (symptom lists, factors, meds)

---

### Screen 1B — "What matters most right now?"

**Goal:** Reduce overwhelm and create a first win. Pick **1 priority**.

| Priority Options           |
| -------------------------- |
| Fatigue and energy crashes |
| Pain and inflammation      |
| Mood and anxiety           |
| IBS and gut symptoms       |
| Sleep and recovery         |
| Headaches/migraines        |
| Brain fog/focus            |

**Output:** Sets the "first month focus" and default charts

---

### Screen 1C — Impact Question

**Header:** _"How does my [Feature] impact [Outcome]?"_

| Feature Dropdown | Outcome Dropdown |
| ---------------- | ---------------- |
| Medications      | Mood             |
| Sleep            | IBS              |
| Food             | Pain             |
| Stress           | Fatigue          |
| Exercise         | Anxiety          |
| Cycle            | Sleep quality    |
| Work             | Headache         |
| Weather          | Skin             |
| Hydration        | Focus            |
| Supplements      |                  |

**Output:** Becomes the pinned question in chat + the first analytics card

---

### Screen 2 — "Intent"

Users pick the mindset they're in:

#### 🔍 Awareness — "Something is wrong"

> - "Why am I so exhausted again?"
> - "My pain is back with a vengeance."
> - "Everything hurts and no one sees it."
> - "I can't think straight; my brain is mush."
> - "This flare came out of nowhere."

#### 📝 Tracking — "I need history"

> - "I need to log this flare, but I'm so tired."
> - "When did this start last time?"
> - "Did I take my meds on time yesterday?"
> - "I've had five flares this month; I'm losing count."
> - "I wish I could remember what triggered this."

#### 🔎 Insight — "What's causing this?"

> - "Is stress making this worse?"
> - "Could it be the weather or the food I ate?"
> - "Every time I skip lunch, my fatigue spikes."
> - "Maybe it's that new medicine."
> - "I'm trying to connect the dots, but it's overwhelming."

#### ⚡ Action — "What do I do next?"

> - "Should I call my doctor or wait it out?"
> - "How can I prevent this from happening again?"
> - "What can I try to feel better today?"
> - "I need to show my doctor what's been happening."
> - "I want to prepare for my appointment."

**Output:**

- Sets the tone of the app's first week (agent asks fewer/more questions)
- Preconfigures default quick-entry widgets and chat prompts

---

### Screen 3 — First Check-in Widgets

2–3 lightweight, adaptive widgets based on Screen 1B + Screen 2:

| Widget                 | Description                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Baseline slider**    | Today overall rating for priority outcome                                                        |
| **Flare toggle**       | "Is this a flare?" yes/no → If yes: start time + 1–2 symptom chips                               |
| **Top suspects chips** | 3–7 chips relevant to chosen Feature (missed meds, poor sleep, stress spike, food trigger, etc.) |

---

### Screen 4 — First Value (Instant Commitment)

Show three things:

1. **"Baseline captured"** — Clear confirmation
2. **Calendar preview** — What their history will look like once they log
3. **Promise card** (mock insight):
   - _"After 3 days, I'll start spotting patterns between [Feature] and [Outcome]."_
   - _"After 2 weeks, you'll get a doctor-ready 2–4 week trend view."_

> This creates psychological buy-in before the data exists.

---

## 5. Main App Navigation

### Tab 1 — Chat (Primary)

Chat is the front door. It should feel like **texting**—while quietly building **doctor-grade structure**.

**Key Behaviors:**

- **Pinned question:** How does my [Feature] impact [Outcome]?
- **Side drawer:** Saved questions + suggested ones
- **Bottom-sheet pickers** for chips (symptoms, factors, meds)—never heavy forms

#### Chat Intelligence: The "8 Characteristics" Structure

When users describe symptoms, Clue extracts and summarizes the doctor-usable structure and gently prompts for what's missing—without feeling like a checklist.

| Characteristic          | What It Captures                   |
| ----------------------- | ---------------------------------- |
| **Location**            | Where exactly                      |
| **Duration**            | How long                           |
| **Frequency**           | How often                          |
| **Progression**         | Worse/better/same                  |
| **Context**             | What was happening when it started |
| **Associated symptoms** | Related symptoms                   |
| **Quality**             | What it feels like                 |
| **Quantity**            | Severity 1–10                      |
| **Aggravating factors** | What makes it worse                |
| **Alleviating factors** | What helps                         |
