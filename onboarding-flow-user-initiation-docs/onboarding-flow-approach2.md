# **Strategic Product Specification: The Clue Onboarding Architecture & "Spoon-Saver" Ecosystem**

## **1\. Executive Strategy: Inverting the Interaction Cost Model**

### **1.1 The Market Pathology of "Quantified Self"**

The contemporary digital health landscape is built upon a fundamental misalignment between product capability and user capacity. The dominant paradigm, often termed "Quantified Self," operates on the assumption of an optimized, high-agency user—the "worried well" or the "bio-hacker"—who possesses the surplus cognitive and physiological energy required to rigorously document their existence. These users track data for optimization. However, for the demographic identified as "Spoonies"—individuals managing chronic, energy-limiting conditions such as Myalgic Encephalomyelitis (ME/CFS), Fibromyalgia, POTS, and Long COVID—tracking is not an optimization game; it is a survival mechanism.

The "Spoonie Paradox," a central thesis of this architectural specification, articulates the critical market failure: those who need longitudinal health data the most are the least capable of generating it.1 The very act of engaging with a high-friction interface (navigating nested menus, interpreting complex dashboards, managing push notifications) extracts a "cognitive tax" that these users cannot afford. Research indicates that for a patient in a flare, the cognitive load of a standard symptom tracker is not merely annoying—it is inaccessible, often exacerbating symptoms like brain fog and sensory overload.1

Therefore, the architectural mandate for **Clue** is to invert the traditional interaction cost model. We are not building a tool for data maximization; we are building a tool for energy conservation. The strategic value proposition, **"Low-Friction, High-Insight,"** dictates that every pixel and every logic gate must serve to reduce the metabolic cost of usage. If a standard app requires 50 "units" of energy to log a day's worth of data, Clue must achieve the same clinical fidelity with fewer than 5 units. This is the "Spoon Saver" protocol: a design philosophy that treats user energy as a finite, non-renewable currency that the product must protect at all costs.1

### **1.2 The "Compassionate Analyst" Persona**

To bridge the gap between rigorous clinical data collection and the emotional fragility of a chronic illness flare, the system utilizes an AI agent persona defined as the **"Compassionate Analyst."** This persona informs the tone, logic, and structure of the onboarding flow.1

The Compassionate Analyst does not act as a taskmaster. It avoids the toxic positivity of "streak maintenance" and the gamification elements that induce guilt when a user is too sick to log. Instead, it adopts a posture of **"Radical Validation."** It recognizes that a gap in data is often data in itself—a signal that the user was "wiped." The architecture must support this by allowing for "passive" data inference and "forgiving" logging mechanisms that can capture the essence of a clinical event (e.g., a migraine attack) with a single tap, rather than a twenty-step interrogation.1

This report details the comprehensive architecture for the Clue onboarding flow (Q1–Q4). It moves beyond simple wireframing to establish a rigorous clinical and behavioral logic matrix. By mapping specific user pain points—such as the "Good Days Trap" in fatigue or the "Too Late Meds" problem in migraines—to precise widget interactions, we create a system that feels less like a database and more like a prosthetic extension of the user's own limited cognition.

## ---

**2\. Phase I: Contextual Triage (Q1 & Q2 Architecture)**

The onboarding flow is the critical "handshake" where trust is established. For a Spoonie, who has likely been "medical gaslighted" by providers and disappointed by previous apps, this phase must demonstrate immediate, specific competence. We utilize a **Progressive Disclosure** model, starting with broad domain identification (Q1) and rapidly narrowing to specific phenomenological pain points (Q2).

### **2.1 Q1: Domain Identification Logic**

The first question serves as the "triage nurse," sorting the user into one of six primary clinical pathways. This is not merely a tagging exercise; it fundamentally alters the downstream data models, validation rules, and "Doctor Pack" export formats.

**The Q1 Options & Clinical Implications:**

1. **Fatigue that won't quit (Value: fatigue)**
   - _Clinical Context:_ This selection activates the **Energy Envelope** logic engine. It prioritizes the tracking of Post-Exertional Malaise (PEM), a hallmark of ME/CFS and Long COVID. The system prepares to validate against the FACIT-F (Functional Assessment of Chronic Illness Therapy – Fatigue) scale.2
   - _System State:_ Pre-loads the "Battery" visual metaphor widgets and suppresses high-intensity graphical elements that might cause visual fatigue.
2. **Unpredictable flares (Value: flares)**
   - _Clinical Context:_ This activates the **Crisis Management** protocol. The system prioritizes "Delta Detection"—identifying the rapid change from baseline to acute illness. It prepares the "Flare Mode" toggle as a persistent, high-priority UI element.1
   - _System State:_ Sets the "Missing Data" forgiveness threshold to maximum, acknowledging that flare periods often result in logging gaps.
3. **Migraines that derail everything (Value: migraines)**
   - _Clinical Context:_ This activates the **Prodrome Detection** engine. The focus shifts to identifying "pre-headache" symptoms (yawning, neck stiffness, aura) to enable timely abortive intervention. It aligns with the ICHD-3 diagnostic criteria for migraine phases.3
   - _System State:_ Immediately enables "Dark Mode" by default to accommodate photophobia.
4. **IBS / Gut issues I can't figure out (Value: ibs_gut)**
   - _Clinical Context:_ This activates the **Motility & Trigger** engine. It prepares widgets based on the Bristol Stool Scale and the IBS Symptom Severity Scale (IBS-SSS). The logic engine prepares for "lag analysis" to correlate dietary intake (often 4-24 hours prior) with current symptoms.4
   - _System State:_ Prioritizes meal-time context prompts.
5. **Managing multiple conditions (Value: multiple)**
   - _Clinical Context:_ This activates the **Complexity Management** layer. This is the most challenging user type, often suffering from "Symptom Blur." The system prepares to allow "Multi-Select" logging without overwhelming the user with duplicate questions.1
   - _System State:_ Activates a specialized "Triage Widget" in Q3 that helps users attribute symptoms to specific conditions without exhaustive logging.
6. **Something else (Value: other)**
   - _Clinical Context:_ This activates the **Discovery Mode**. The system uses open-ended, structured text inputs (NLP) to learn the user's specific vocabulary before crystallizing into fixed widgets.

### **2.2 Q2: The Phenomenological Deep Dive**

Once the domain is established, Q2 drills down into the specific _behavioral_ or _experiential_ pain point. This is the "Empathy Hook." By presenting options that mirror the user's internal monologue (e.g., "Good days trick me"), the app proves it understands the lived reality of the condition.

The following sections analyze the specific Q2_OPTIONS provided, detailing the psychological mechanism of each and how it dictates the architectural response.

#### **2.2.1 Fatigue Domain Deep Dive**

- **"I never know how much I can safely do" (energy_envelope)**
  - _Analysis:_ This user suffers from a lack of proprioceptive awareness regarding their energy limits. They need **Predictive Pacing**. The system must function as an external fuel gauge.
  - _Architectural Response:_ The Q3 widget will establish a "Subjective Capacity" baseline (0-100% battery). The Q4 payoff will promise a "Crash Prediction" based on historical exertion data.
- **"Good days trick me into overdoing it" (good_days_trap)**
  - _Analysis:_ This is the classic "Boom and Bust" cycle. On high-energy days, the user exerts too much, triggering PEM 24-48 hours later.
  - _Architectural Response:_ The system must identify "High Energy" logs not just as "good," but as "Risk States." The Q3 widget will ask about "Activity Intensity" relative to baseline.
- **"Brain fog makes everything harder" (brain_fog)**
  - _Analysis:_ Cognitive dysfunction makes memory unreliable. This user cannot recall if they took meds or when symptoms started.
  - _Architectural Response:_ The interface switches to "Ultra-Low Friction." No typing. Only tap-based icons. The Q3 widget becomes a "Cognitive Clarity" check using visual metaphors (fog vs. sun).

#### **2.2.2 Migraine Domain Deep Dive**

- **"By the time I notice, it's too late for meds to help" (too_late_meds)**
  - _Analysis:_ This is a failure of **Prodrome Recognition**. Triptans are most effective when taken early. The user misses the subtle signals (yawning, mood change) that precede the pain.
  - _Architectural Response:_ The system must act as an early warning radar. The Q3 widget focuses on "Subtle Body Checks" (neck stiffness, irritability) rather than pain.
- **"I lose entire days when they hit" (lost_days)**
  - _Analysis:_ This reflects the **Postdrome** and disability impact. The user needs validation of the _severity_ and the _time lost_ to communicate with employers or disability adjudicators.
  - _Architectural Response:_ The Q3 widget prioritizes a "Functionality Scale" (e.g., Brief Pain Inventory "Interference" items) over simple pain intensity.

#### **2.2.3 Flare Domain Deep Dive**

- **"I waste good days waiting for the other shoe to drop" (anxiety_waiting)**
  - _Analysis:_ This is **Anticipatory Anxiety**. The user lives in a state of hyper-vigilance, scanning their body for threats. This chronic stress can itself become a trigger.
  - _Architectural Response:_ The system must provide "Safety Signals." The Q3 widget should focus on "Stability Checks"—validating that, right now, the user is safe, reducing the psychological burden.

#### **2.2.4 IBS/Gut Domain Deep Dive**

- **"Reactions are delayed so I can't connect them" (delayed_reactions)**
  - _Analysis:_ The gastrocolic reflex or food sensitivities often have a 4–24 hour lag. The user fails to link yesterday's dairy to today's bloating.
  - _Architectural Response:_ The system must automate **Lag Analysis**. The Q3 widget captures specific symptom timestamps, while the backend prepares to correlate this with meal logs from previous "Day Cards."

#### **2.2.5 Multiple Conditions Deep Dive**

- **"I can't tell which condition is causing what" (symptom_overlap)**
  - _Analysis:_ This is the "Diagnostic Blur." Is the fatigue from ME/CFS, or is it a depressive episode? Is the dizziness POTS or a migraine aura?
  - _Architectural Response:_ The system acts as a **Differential Analyzer**. The Q3 widget uses a "Symptom Cluster" approach to help disentangle the signals (e.g., "Is the dizziness accompanied by high heart rate (POTS) or visual spots (Migraine)?").

## ---

**3\. Phase II: The Logic Matrix (Q3 Architecture)**

The third step of the onboarding (Q3) is the "First Check-in." It must be a seamless transition from the pain point selection in Q2. We do not ask generic questions. We ask the _exact_ question that the user's pain point implies is unanswerable for them.

The following matrix defines the specific Q3 Widget configuration for every provided Q2 option.

### **3.1 Fatigue Domain Matrix**

| Q2 Selection (Pain Point)                                 | Q3 Widget Strategy      | Widget Type             | Specific Question Text (Q3)                                                                                         | Data Model Target           |
| :-------------------------------------------------------- | :---------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------ | :-------------------------- |
| energy_envelope ("I never know how much I can safely do") | **Capacity Baseline**   | visual_battery_fill     | "Where is your battery level right now compared to your absolute best?"                                             | subjective_capacity (0-100) |
| good_days_trap ("Good days trick me into overdoing it")   | **Exertion Check**      | chip_select_intensity   | "How was your activity level yesterday compared to usual?" _(Options: Rested, Balanced, Pushed Limits, Overdid It)_ | pem_risk_factor             |
| brain_fog ("Brain fog makes everything harder")           | **Cognitive Clarity**   | visual_weather_icons    | "What's the weather inside your head right now?" _(Options: Clear Sun, Hazy, Thick Fog, Stormy)_                    | cognitive_clarity_score     |
| not_understood ("People don't understand...")             | **Functionality Scale** | slider_discrete         | "How much is your fatigue limiting what you can physically do today?" _(0: No limit \- 10: Bedbound)_               | functional_impairment       |
| delayed_payback ("I pay for today's effort tomorrow")     | **PEM Status**          | binary_toggle_plus_time | "Are you feeling the 'crash' (PEM) right now?" _(If Yes \-\> When did it hit?)_                                     | pem_status, onset_time      |

### **3.2 Migraine Domain Matrix**

| Q2 Selection (Pain Point)                             | Q3 Widget Strategy    | Widget Type          | Specific Question Text (Q3)                                                                                                       | Data Model Target       |
| :---------------------------------------------------- | :-------------------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| too_late_meds ("By the time I notice, it's too late") | **Prodrome Scanner**  | multi_select_chips   | "Do you notice any subtle 'pre-headache' signs right now?" _(Options: Yawning, Neck Stiffness, Irritability, Thirst, Aura, None)_ | prodrome_symptoms       |
| unknown_triggers ("Can't figure out triggers")        | **Context Snapshot**  | multi_select_context | "Let's capture the scene. What's happening around you?" _(Options: Bright Light, Stormy Weather, Missed Meal, High Stress)_       | environmental_context   |
| lost_days ("I lose entire days")                      | **Disability Impact** | slider_0_10          | "How much is the migraine interfering with your ability to function?" _(0: Not at all \- 10: Total shutdown)_                     | pain_interference_score |
| miss_warning ("Miss warning signs")                   | **Body Scan**         | body_map_tap         | "Where do you feel the very first tension or sensation?" _(User taps neck, eye, temple)_                                          | symptom_location        |
| no_patterns ("Can't find patterns")                   | **Timeline Logger**   | time_picker_scroll   | "When did you last feel completely 'clear' (pain-free)?"                                                                          | episode_clear_interval  |

### **3.3 Flare Domain Matrix**

| Q2 Selection (Pain Point)                   | Q3 Widget Strategy   | Widget Type          | Specific Question Text (Q3)                                                                                          | Data Model Target    |
| :------------------------------------------ | :------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------- |
| cant_plan ("Can't plan anything")           | **Stability Index**  | traffic_light_select | "How 'stable' does your body feel regarding plans for the next 4 hours?" _(Green: Go, Yellow: Caution, Red: Cancel)_ | predictability_score |
| no_warning ("Hit without warning")          | **Sudden Onset Log** | slider_velocity      | "How quickly did your symptoms ramp up today?" _(Slow build \-\> Instant hit)_                                       | onset_velocity       |
| unknown_triggers ("Unknown triggers")       | **Suspect Lineup**   | chip_select_dynamic  | "Any 'usual suspects' present in the last 24 hours?" _(Options: Poor sleep, Weather change, Stress, Food)_           | trigger_hypothesis   |
| cancel_constantly ("Cancel constantly")     | **Social Impact**    | binary_check         | "Did you have to cancel or change plans today because of symptoms?"                                                  | social_interference  |
| anxiety_waiting ("Waste good days waiting") | **Safety Check**     | affirmation_toggle   | "Are you currently in a safe zone (symptoms manageable)?" _(Yes / No \- I need help)_                                | safety_status        |

### **3.4 IBS / Gut Domain Matrix**

| Q2 Selection (Pain Point)                            | Q3 Widget Strategy     | Widget Type             | Specific Question Text (Q3)                                                                      | Data Model Target    |
| :--------------------------------------------------- | :--------------------- | :---------------------- | :----------------------------------------------------------------------------------------------- | :------------------- |
| unsafe_foods ("Can't tell safe foods")               | **Reaction Check**     | time_since_meal         | "How long has it been since your last meal or snack?" _(0-30m, 1-2h, 3-4h, Fasting)_             | post_prandial_window |
| delayed_reactions ("Reactions are delayed")          | **24h Recall**         | chip_select_food_groups | "Think back to yesterday. Did you eat any of these?" _(Dairy, Gluten, High Sugar, Fried, Spicy)_ | dietary_exposure_24h |
| inconsistent ("Same food, different reactions")      | **Context Multiplier** | slider_stress           | "Gut reactions often depend on stress. What's your stress level right now?"                      | stress_multiplier    |
| elimination_exhausting ("Elimination is exhausting") | **Simple Stool Log**   | bristol_visual_select   | "Let's just track the output for now. Which shape matches best?" _(Visual Bristol Stool Scale)_  | stool_type           |
| eating_gamble ("Eating out is a gamble")             | **Safety Perception**  | binary_toggle           | "Does your stomach feel 'safe' or 'fragile' right now?"                                          | visceral_sensitivity |

### **3.5 Multiple Conditions Matrix**

| Q2 Selection (Pain Point)                     | Q3 Widget Strategy   | Widget Type           | Specific Question Text (Q3)                                                                                  | Data Model Target    |
| :-------------------------------------------- | :------------------- | :-------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------- |
| symptom_overlap ("Can't tell causing what")   | **Dominant Symptom** | single_select_primary | "If you could remove ONE symptom right now, which would it be?" _(Lists symptoms from all selected domains)_ | primary_driver       |
| competing_needs ("Helping one hurts another") | **Trade-off Log**    | text_short_entry      | "Did a treatment for one condition flare another today?" _(e.g., 'Salt for POTS hurt my Stomach')_           | interaction_effect   |
| tracking_burden ("Full-time job")             | **One-Tap Summary**  | traffic_light_global  | "Let's keep it simple. How is the 'System' doing overall?" _(Green / Yellow / Red)_                          | global_health_status |
| medical_silos ("Doctors don't connect dots")  | **Report Tag**       | multi_select_provider | "Who needs to know about today's symptoms?" _(Cardiologist, Rheum, GP, Neuro)_                               | provider_relevance   |
| all_blurs ("Blurs into one bad day")          | **Symptom Cluster**  | multi_select_cluster  | "Which 'cluster' is active right now?" _(Pain+Fatigue, Dizzy+Nausea, Brain Fog+Pain)_                        | symptom_cluster_id   |

## ---

**4\. Phase III: The Value Bridge (Q4 Architecture)**

Q4 is the "Close." It is the psychological bridge between the effort of the first check-in (Q3) and the promise of future relief. The user has just expended "spoons" to give us data; Q4 must immediately demonstrate the return on investment (ROI).

The architecture for Q4 involves a dynamic "Insight Card" that changes based on the Q2/Q3 path. This screen concludes with the requested Call to Action: **"Sign in to save your today."**

### **4.1 The "Prediction" Hook (For "Pattern" Pain Points)**

_Target Segments:_ energy_envelope, good_days_trap, too_late_meds, delayed_reactions.

**Q4 Screen Content:**

- **Headline:** "We've captured your baseline."
- **Dynamic Insight:** "By tracking your today, Clue can start predicting your risk for tomorrow."
- **Visual Proof:** A simplified graph showing a "Risk Curve" derived from the user's input (e.g., High Exertion today \= High Crash Risk tomorrow).
- **The Promise:** "Give us 3 days of data, and we'll help you spot the crash before it hits."
- **CTA:** **"Sign in to save your today."**

### **4.2 The "Validation" Hook (For "Understanding" Pain Points)**

_Target Segments:_ not_understood, not_believed, medical_silos, lost_days.

**Q4 Screen Content:**

- **Headline:** "Evidence locked in."
- **Dynamic Insight:** "You just created a clinical record of your \[Q2 Pain Point\]. This isn't just a log; it's proof for your next appointment."
- **Visual Proof:** A thumbnail of the "Doctor Pack"—a PDF-style document showing the Q3 data point formatted in "medical speak" (e.g., "Patient reports functional impairment of 8/10...").
- **The Promise:** "Turn your daily experience into data your doctor can't ignore."
- **CTA:** **"Sign in to save your today."**

### **4.3 The "Safety" Hook (For "Anxiety" Pain Points)**

_Target Segments:_ anxiety_waiting, eating_gamble, cant_plan.

**Q4 Screen Content:**

- **Headline:** "Safe zone established."
- **Dynamic Insight:** "You've flagged your stability level. Clue will monitor for changes so you don't have to constantly scan for threats."
- **Visual Proof:** A "Shield" icon or "Stability Gauge" that rests in the green zone, reinforcing psychological safety.
- **The Promise:** "Offload the worry. We'll watch the patterns so you can live your life."
- **CTA:** **"Sign in to save your today."**

## ---

**5\. Technical & Clinical Infrastructure**

To support this "Low-Friction" architecture, the backend must be as robust as the frontend is gentle. We employ a **Local-First (SQLite)** architecture to ensure speed and privacy, backed by a sophisticated **Agent Rules Engine**.

### **5.1 The "Widget Planner Agent"**

The logic described in the Matrix (Section 3\) is executed by the "Widget Planner Agent," a localized heuristic engine.1

- **Function:** It accepts the user_context (Q1/Q2 selections) and the current_state (Time of day, Time since last log) to generate the widget_spec.
- **Priority Logic:**
  1. **Flare Override:** If flare_detected \== true, override all "Insight" widgets with "Crisis" widgets (simple toggles).
  2. **Missing Data:** If critical clinical data (e.g., onset time) is missing for an active episode, prioritize that widget.
  3. **User Priority:** Serve the widget mapped to the Q2 "Priority Outcome."

### **5.2 Clinical Validation Standards**

The widgets in Q3 are not arbitrary; they are mapped to validated clinical instruments to ensure the "Doctor Pack" (Q4) is credible.

- **Fatigue Logic:** Mapped to the **FACIT-F** (Functional Assessment of Chronic Illness Therapy). Specifically, items related to "I feel fatigued" and "I have trouble starting things".2
- **IBS Logic:** Mapped to the **IBS-SSS** (Severity Score System). Specifically, the visual analog scales for "Severity of Abdominal Pain" and "Dissatisfaction with Bowel Habits".4
- **Migraine Logic:** Mapped to **ICHD-3** diagnostic criteria for Prodrome (premonitory phase) and Aura. The "Functionality Scale" maps to the **MIDAS** (Migraine Disability Assessment) or **BPI** (Brief Pain Inventory) interference items.3

### **5.3 Local-First & Privacy**

Given the sensitivity of health data (especially reproductive data often tracked alongside these conditions), the architecture is **Local-First**.

- **Data Storage:** All Q1-Q4 inputs are written immediately to a local SQLite database on the device.
- **Sync:** Data is only synced to the cloud if the user explicitly opts in during the "Sign In" phase (post-Q4). This "Try before you trust" model is essential for the paranoid/anxious user demographic identified in other \-\> not_believed.1

## ---

**6\. Conclusion: The "Spoon Saver" Ecosystem**

The Clue onboarding architecture represents a fundamental shift in digital health design. By explicitly acknowledging the energy limitations of its user base, the system transforms the "burden" of tracking into an act of "energy conservation."

The flow from **Q1 (Domain Triage)** to **Q2 (Pain Point Validation)** builds emotional resonance. The **Q3 (Matrix-Driven Check-in)** delivers immediate, low-friction utility by asking the _right_ question rather than _every_ question. Finally, **Q4 (The Value Bridge)** solidifies the habit loop by offering immediate clinical proof and predictive insight.

This is not just an app interface; it is a therapeutic intervention. By saving spoons during the logging process, Clue empowers the user to spend those spoons where they matter most: living their life.

---

Citations:  
1 \- Spoonie Market Strategy & Design Language  
1 \- Market Research on Symptom Tracking Fatigue  
1 \- Compassionate Analyst Persona & Tone  
1 \- Technical Architecture & Widget Logic  
1 \- Onboarding Flows & User Needs  
2 \- FACIT-F Fatigue Scale Validation  
4 \- IBS-SSS & Bristol Scale Validation  
3 \- Migraine Prodrome & Disability Scales

#### **Works cited**

1. Experiences of Spoonies with Symptom Tracking Apps.docx
2. FACIT-F, accessed January 10, 2026, [https://www.facit.org/measures/facit-f](https://www.facit.org/measures/facit-f)
3. Prodrome: Spotting the first signs of a migraine attack, accessed January 10, 2026, [https://migrainetrust.org/prodrome-spotting-the-first-signs-of-a-migraine-attack/](https://migrainetrust.org/prodrome-spotting-the-first-signs-of-a-migraine-attack/)
4. THE GASTROINTESTINAL SYMPTOM RATING SCALE (GSRS) IRRITABLE BOWEL SYNDROME (IBS) VERSION \- AstraZeneca, accessed January 10, 2026, [https://www.astrazeneca.com/content/dam/az/orphan-page-files/Patient%20Reported%20Outcomes/2024/gastro/GSRS-IBS-v2000-Orig-Paper-English-UK-20Dec2016-AZPRO.pdf](https://www.astrazeneca.com/content/dam/az/orphan-page-files/Patient%20Reported%20Outcomes/2024/gastro/GSRS-IBS-v2000-Orig-Paper-English-UK-20Dec2016-AZPRO.pdf)
5. Behavioral Medicine Management of Irritable Bowel Syndrome: A Referral Toolkit for Gastroenterology Providers \- VA.gov, accessed January 10, 2026, [https://www.mirecc.va.gov/VISN16/docs/ibs-referral-toolkit.pdf](https://www.mirecc.va.gov/VISN16/docs/ibs-referral-toolkit.pdf)
6. Taming the Tummy: Understanding and Managing IBS with the IBS-SSS Severity Score, accessed January 10, 2026, [https://digbihealth.com/blogs/science-talk/taming-the-tummy-understanding-and-managing-ibs-with-the-ibs-sss-severity-score](https://digbihealth.com/blogs/science-talk/taming-the-tummy-understanding-and-managing-ibs-with-the-ibs-sss-severity-score)
7. Brief Pain Inventory—Short Form \- ExchangeCME.com, accessed January 10, 2026, [https://www.exchangecme.com/resourcePDF/chronicpain/resource2.pdf](https://www.exchangecme.com/resourcePDF/chronicpain/resource2.pdf)
8. Brief Pain Inventory (BPI-SF): A Comprehensive Guide for Researchers and Clinicians, accessed January 10, 2026, [https://resref.com/brief-pain-inventory-bpi-sf-guide/](https://resref.com/brief-pain-inventory-bpi-sf-guide/)
