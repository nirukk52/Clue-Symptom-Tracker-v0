This is currently deprecated.

Based on your architecture documents, I have mapped the "6 into 5" combinations.

I have interpreted **Q1 (What matters most)** as the **6 Core Symptom Domains** derived from your "Screen 1B" list.
I have interpreted **Q2 (User Mode)** as the **4 Core Modes** from "Screen 2" + **1 "Flare" Mode** (which your Screen 3 logic treats as a distinct, high-priority state).

Here is the architecture for the **Screen 3 Adaptive Check-in Questions**, designed to populate the `widget_spec` table.

### The Matrix Definition

- **Axis 1: The 6 Domains (Q1)**

1. **Pain** (Somatic: Joint, Nerve, Migraine)
2. **Fatigue** (Systemic: Crash, PEM, Low Battery)
3. **GI/Gut** (Visceral: IBS, Nausea, Bloating)
4. **Mood** (Psychological: Anxiety, Depression, Overwhelm)
5. **Sleep** (Restorative: Insomnia, Quality)
6. **Neuro/Cog** (Functional: Brain Fog, Focus, Dizziness)

- **Axis 2: The 5 Modes (Q2)**

1. **Awareness** (Validate feelings; low friction; qualitative)
2. **Tracking** (Gather baseline data; numeric; rigorous)
3. **Insight** (Find triggers/correlations; "Why" questions)
4. **Action** (Test interventions; "Did it work" questions)
5. **Flare** (Crisis management; triage; high empathy)

---

### The Question Architecture (6x5)

#### 1. Domain: Pain / Inflammation

_Best for: Chronic Pain, Migraines, Fibromyalgia, Arthritis_

| Mode          | Widget Question (Prompt)                                                | UI Component                                           | Data Point (Output)     |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| **Awareness** | "How much is the pain occupying your mind right now?"                   | Slider (Not noticeable → All I can think about)        | `impact_score`          |
| **Tracking**  | "Rate your pain intensity and locate the primary area."                 | 0–10 Scale + Body Map Tap                              | `severity`, `location`  |
| **Insight**   | "Think back 2 hours—did any physical activity or posture precede this?" | Chip Select (Sitting, Walking, Lifting, None)          | `potential_trigger`     |
| **Action**    | "You took [Med/Relief] earlier. Has the edge taken off?"                | Options: "No change", "Slightly better", "Much better" | `intervention_efficacy` |
| **Flare**     | "Is this 'new' pain or the usual suspect flaring up?"                   | Options: "Usual Suspect", "New/Scary", "Just Worse"    | `flare_type`            |

#### 2. Domain: Fatigue / Energy

_Best for: CFS/ME, Long COVID, Autoimmune Exhaustion_

| Mode          | Widget Question (Prompt)                                        | UI Component                                           | Data Point (Output)   |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------ | --------------------- |
| **Awareness** | "How big is your 'battery' right now compared to your best?"    | Visual Battery Fill (0% → 100%)                        | `subjective_capacity` |
| **Tracking**  | "Rate your current energy level."                               | 0–10 Scale (0=Bedbound, 10=Energetic)                  | `energy_level`        |
| **Insight**   | "How was your pacing yesterday? Did you push through a limit?"  | Options: "Paced well", "Pushed a little", "Overdid it" | `pem_driver`          |
| **Action**    | "If you rest for 15 minutes now, do you think you'll recharge?" | Options: "Yes", "Maybe", "No (Crash)"                  | `recovery_potential`  |
| **Flare**     | "Are you in a crash? (PEM / Post-Exertional Malaise)"           | Binary: Yes/No + "When did it hit?"                    | `crash_status`        |

#### 3. Domain: GI / Gut Health

_Best for: IBS, Crohn's, Food Sensitivities_

| Mode          | Widget Question (Prompt)                                | UI Component                                                 | Data Point (Output)  |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------ | -------------------- |
| **Awareness** | "How 'safe' does your stomach feel right now?"          | Options: "Solid", "Fragile", "Urgent", "Painful"             | `gi_sensation`       |
| **Tracking**  | "Log your latest movement (Bristol Scale style)."       | Visual Icons (Constipated → Liquid)                          | `stool_type`         |
| **Insight**   | "How long after your last meal did the symptoms start?" | Options: "Immediately", "1-2 Hours", "3+ Hours", "Unrelated" | `timing_correlation` |
| **Action**    | "Did avoiding [Trigger Food] help with bloating today?" | Options: "Yes", "No", "Didn't avoid"                         | `diet_efficacy`      |
| **Flare**     | "Is the pain sharp/cramping or just discomfort?"        | Options: "Sharp/Severe", "Dull Ache", "Bloating Only"        | `symptom_quality`    |

#### 4. Domain: Mood / Mental

_Best for: Anxiety, Depression, PMDD_

| Mode          | Widget Question (Prompt)                                                            | UI Component                                             | Data Point (Output)                 |
| ------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| **Awareness** | "What's the 'weather' in your head right now?"                                      | Weather Icons (Sunny, Foggy, Stormy, Heavy Rain)         | `mood_metaphor`                     |
| **Tracking**  | "Rate your anxiety and low mood separately."                                        | Dual Sliders (0–10)                                      | `anxiety_score`, `depression_score` |
| **Insight**   | "Is this mood coming from _inside_ (brain chemistry) or _outside_ (stress/events)?" | Options: "Internal/Random", "External Event", "Both"     | `mood_origin`                       |
| **Action**    | "Did you get a chance to do your [Coping Mechanism] today?"                         | Options: "Yes & Helped", "Yes but No Help", "Skipped it" | `coping_efficacy`                   |
| **Flare**     | "Do you feel safe right now?"                                                       | Binary: Yes / "Need Help" (Triggers Resource Mode)       | `safety_check`                      |

#### 5. Domain: Sleep / Restoration

_Best for: Insomnia, Apnea, Poor Recovery_

| Mode          | Widget Question (Prompt)                           | UI Component                                      | Data Point (Output)               |
| ------------- | -------------------------------------------------- | ------------------------------------------------- | --------------------------------- |
| **Awareness** | "Do you feel rested, or did you just 'lose time'?" | Options: "Rested", "Groggy", "Exhausted", "Wired" | `waking_state`                    |
| **Tracking**  | "Total hours slept + Number of wake-ups."          | Number Stepper + Counter                          | `sleep_duration`, `interruptions` |
| **Insight**   | "What was the last thing you did before bed?"      | Icons: Phone, TV, Read, Meditate, Eat, Argue      | `hygiene_factor`                  |
| **Action**    | "Did you keep the room cool/dark as planned?"      | Options: "Yes", "Sort of", "No"                   | `environment_check`               |
| **Flare**     | "Is this a streak? How many bad nights in a row?"  | Number Counter                                    | `insomnia_streak`                 |

#### 6. Domain: Neuro / Brain Fog

_Best for: POTS, ADHD, Migraine Aura_

| Mode          | Widget Question (Prompt)                              | UI Component                                                      | Data Point (Output)   |
| ------------- | ----------------------------------------------------- | ----------------------------------------------------------------- | --------------------- |
| **Awareness** | "How clear is your thinking? (Can you read a book?)"  | Options: "Crystal Clear", "Fuzzy", "Can't Focus", "Total Blank"   | `fog_severity`        |
| **Tracking**  | "Rate your dizziness/vertigo severity."               | 0–10 Scale                                                        | `vertigo_score`       |
| **Insight**   | "Did you stand up too fast or stay upright too long?" | Options: "Stood up fast", "Standing long time", "Heat", "Unknown" | `orthostatic_trigger` |
| **Action**    | "Did electrolytes/salt/water help the fog?"           | Options: "Cleared it up", "Helped a bit", "No change"             | `hydration_efficacy`  |
| **Flare**     | "Are you sensitive to light or sound right now?"      | Multi-select: Light, Sound, Smell, Motion                         | `sensory_overload`    |

---

### Implementation Spec (Widget Planner Agent)

In your `Widget Planner Agent`, you will use a lookup table based on `user_context` (Q1) and `current_mode` (Q2).

**Example `widget_spec` JSON for [Pain] x [Insight]:**

```json
{
  "widget_id": "pain_insight_trigger_check",
  "domain": "pain",
  "mode": "insight",
  "question_text": "Think back 2 hours—did any physical activity or posture precede this?",
  "ui_type": "chip_select",
  "options": [
    { "label": "Sitting/Desk", "value": "posture_sedentary" },
    { "label": "Walking/Active", "value": "movement_active" },
    { "label": "Lifting/Chore", "value": "exertion_heavy" },
    { "label": "None/Random", "value": "none" }
  ],
  "write_target": {
    "table": "day_observation",
    "field": "context_json"
  },
  "unlocks": "Enables 'Activity vs Pain' correlation graph in 3 days."
}
```

**Selection Logic Rule:**

1. **Check Q1:** `user_context.priority_outcome` (e.g., Pain)
2. **Check Q2:** `user_settings.mode` (e.g., Insight)
3. **Check State:** If `flare_detected == true`, **OVERRIDE** Q2 and serve **Flare Mode** question for that Domain.

on sign in screen - right save your progress instead of sign in with google
