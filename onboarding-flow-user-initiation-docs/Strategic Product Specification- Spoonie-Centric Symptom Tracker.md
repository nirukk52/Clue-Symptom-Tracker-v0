# Strategic Product Specification: Clue - The Spoonie-Centric Symptom Tracker Landing Page

## 1\. Executive Strategy & Market Psychographics

### 1.1 The "Spoonie" Paradox and Market Opportunity

The digital health market is saturated with quantification tools, yet a massive demographic remains underserved: the "Spoonie" community. This term, derived from Christine Miserandino's "Spoon Theory," describes individuals living with chronic, energy-limiting conditions such as ME/CFS, Fibromyalgia, POTS, Ehlers-Danlos Syndrome, and Long COVID.<sup>1</sup> The fundamental paradox characterizing this user base is the inverse relationship between their need for data and their capacity to generate it. These individuals require the most rigorous longitudinal data to manage complex, multi-systemic conditions and communicate with skeptical healthcare providers, yet they possess the lowest physiological and cognitive reserves-or "spoons"-to perform the labor of tracking.<sup>1</sup>

Current market solutions operate on the assumption of a "healthy" user-one who has the energy to navigate complex menus, interpret raw data, and maintain perfect consistency. For a Spoonie, however, the cognitive load of such applications often exacerbates their condition. Research indicates that users view tracking as "a full-time job" that is "exhausting and overwhelming," leading to high churn rates labeled as "non-compliance" but which are actually product failures.<sup>1</sup>

This specification outlines a landing page strategy for "Clue," a mobile application designed to invert this dynamic. The overarching value proposition is "Low-Friction, High-Insight." The landing page must not only sell a product but also validate the user's lived experience, signaling immediately that this tool was built with an understanding of energy economics. By leveraging the aesthetic principles of Podia.com-friendly, approachable, and soft-we aim to reduce the "clinical anxiety" often associated with medical apps.<sup>1</sup>

### 1.2 Design Language System: Therapeutic Aesthetics

The visual strategy is not merely cosmetic; it is a functional component of the user experience. High-contrast, stark white, or "medical blue" interfaces can trigger sensory overload in patients with migraines or dysautonomia.<sup>1</sup> Therefore, we will adopt a "Therapeutic Aesthetic" derived from the Podia design system, characterized by organic shapes, pastel tones, and fluid transitions.<sup>1</sup>

Color Psychology & Palette:

The palette is engineered to lower physiological arousal.

- **Dusty Blue (#A8C8DA):** Used for background sections to induce calm and stability.<sup>1</sup>
- **Pastel Orange (#EFA24C) & Peach (#F7B182):** Used for "warmth" and human connection, countering the sterile feel of hospitals.<sup>1</sup>
- **Soft Violet (#BFA7EC):** Represents wisdom and insight, used for data visualization elements.<sup>1</sup>
- **Dark Navy (#0B233D):** Provides necessary contrast for accessibility (WCAG AA compliance) without the harshness of pure black.<sup>1</sup>

Typography & Shape:

Rounded corners on all UI elements (buttons, cards, images) communicate softness and flexibility, contrasting with the "rigid" demands of traditional trackers.1 Typography will be large, sans-serif, and airy to accommodate users experiencing "brain fog" or visual processing delays.1

## 2\. Landing Page Section Specifications

The following sections detail the exact specification for the landing page. Each section corresponds to a specific pain point identified in the primary research document.

### 2.1 Section: Addressing Exhaustion & "The Full-Time Job"

Pain Point: "Tracking symptoms feels like a full-time job." Users report that logging every symptom daily is labor-intensive and exhausting, leading to abandonment.1

Strategic Hook: The "Spoon Saver".1

#### 2.1.1 Behavioral Analysis

When a user with chronic illness opens a tracking app, they are often already in a state of depletion. A complex dashboard requiring navigation through multiple screens to log a single headache is an insurmountable barrier. The "cost" of the interaction exceeds the perceived immediate benefit. The landing page must demonstrate that Clue changes this "interaction cost." The goal is to visually prove the "20-second" claim.<sup>1</sup>

#### 2.1.2 Copy Strategy

- **Text Pill:** Energy-Conscious Design
- **Title (H1):** 20 seconds. That's it.
- **Description:** When brain fog hits, the last thing you need is a complex form. We keep it simple. Our chat-based interface adapts to your energy levels, letting you log your entire day in less time than it takes to send a text. Save your spoons for living, not logging.
- **Primary Call to Action:** Start a 20-second check-in.<sup>1</sup>

#### 2.1.3 UI Element: The "Floating Interaction" Animation

Visual Description:

The visual centerpiece is a "floating" smartphone mockup, styled with soft, exaggerated rounded corners to fit the Podia-inspired aesthetic. The phone is surrounded by abstract, organic shapes in Pastel Orange (#EFA24C) and Peach (#F7B182) that gently bob and weave, creating a sense of weightlessness and ease.1

The Interaction:

The screen displays the Personalized Quick Entry Panel.1 We see an animation loop demonstrating the speed of entry:

- **State 1:** The interface asks, _"How is your energy today?"_
- **Action:** A cursor (representing the user's thumb) taps a single button labeled _"Low"_.
- **Reaction:** The UI instantly simplifies. Complex sliders disappear, replaced by a streamlined "I'm Wiped" mode (detailed in later sections).
- **Completion:** A reassuring checkmark appears with the text _"Got it. Rest up."_ The entire loop takes exactly 3 seconds, reinforcing the "speed" claim.

Technical Feasibility Note:

The animation must be a high-frame-rate Lottie file to ensure smoothness. It showcases the "Widget Cap" logic mentioned in the agent requirements, where the interface actively suppresses "insight spam" when the user indicates low energy, reducing the widget count from 8 to 2.1 This visual proof is essential to overcome the skepticism of users who have been burned by "bloated" apps previously.1

### 2.2 Section: Addressing Brain Fog & Cognitive Load

Pain Point: "Fatigue, brain fog, and pain make tracking hard." Cognitive impairment makes complex decision-making impossible on bad days.1

Strategic Hook: "Foggy Minds" / The Second Brain.1

#### 2.2.1 Behavioral Analysis

Brain fog (cognitive dysfunction) is a hallmark of many Spoonie conditions. Users describe living with a "rock in my head".<sup>1</sup> They cannot recall if they took their medication an hour ago, or what they ate yesterday. An app that relies on user memory is destined to fail. The landing page must position Clue as a prosthetic memory-a "second brain" that handles the cognitive load so the user doesn't have to.

#### 2.2.2 Copy Strategy

- **Text Pill:** Cognitive Support
- **Title (H2):** A second brain for foggy days.
- **Description:** Brain fog makes remembering details impossible. Clue remembers context so you don't have to. From tracking medication timing to recalling what triggered your last flare 72 hours ago, the app holds your history safe-even when you can't.
- **Primary Call to Action:** Let Clue remember for you.<sup>1</sup>

#### 2.2.3 UI Element: The "Memory Stream" Visualization

Visual Description:

This section utilizes a "Mid-Page" background in Light Blue (#E2EEF4) with a curved top border to separate it from the previous section.1 The graphic visualizes the Chat-Based Configuration Engine working in tandem with the History Calendar.1

The Interaction:

On the left side of the screen, a stylized "fog" cloud (soft gray/white gradient) hovers over a user avatar. An arrow points from the fog to the Clue interface on the right.

- **The Prompt:** The app interface displays a chat message: _"You logged 'Poor Sleep' on Tuesday. Is today's migraine related?"_
- **The Connection:** A dotted line (animated in Soft Violet #BFA7EC) draws a connection between a "Sleep Widget" from a card dated 3 days ago and the current "Pain Widget."
- **The Insight:** A small "Insight Card" pops up with a clean, rounded border: _"Pattern Detected: 70% of your migraines follow poor sleep by 48 hours."_

Psychological Impact:

This visual demonstrates the "Lag check" feature 1, which analyzes data 24-72 hours prior to an event. By showing the app proactively making connections, we relieve the user of the pressure to "analyze" their own data during a cognitive crash. The soft blue background (#E2EEF4) is chosen specifically to reduce visual stress, which is crucial for users with neuro-cognitive symptoms.1

### 2.3 Section: Addressing Inconsistency & Memory Lapses

Pain Point: "Forgetting to log and inconsistency." Memory issues lead to gaps in data, which users feel guilty about.1

Strategic Hook: Passive Tracking & Smart Reminders.

#### 2.3.1 Behavioral Analysis

Inconsistency is often framed as a moral failure ("I was lazy"), but for Spoonies, it is a functional limitation. The "Guilt" of missing days causes users to avoid the app entirely, breaking the habit loop.<sup>1</sup> The solution is to reframe "forgetting" as a system issue, not a user issue. The app must demonstrate that it is "forgiving" and capable of filling in the gaps.

#### 2.3.2 Copy Strategy

- **Text Pill:** Guilt-Free Consistency
- **Title (H2):** Missed a day? No problem.
- **Description:** We know life happens. Clue doesn't judge. Our "Missing Data" widgets help you backfill crucial details with a single tap, and our smart integrations pull data from your wearables to fill the gaps automatically. No broken streaks, no shame.
- **Primary Call to Action:** See how passive tracking works.

#### 2.3.3 UI Element: The "Auto-Fill" Ecosystem

Visual Description:

A central "Hub" graphic (the Clue App icon, rendered as a rounded organic shape in Peach #F7B182) is surrounded by satellite icons representing external data sources.1

**The Interaction:**

- **Satellites:** Icons for Apple Health, Google Fit, Oura Ring, and Fitbit float around the hub.
- **Data Flow:** Streams of particles (representing data points like "Heart Rate," "Steps," "Sleep Hours") flow gently from the satellites into the central hub.
- **The "Gap Fill":** A calendar view is shown with a "Blank" day. As the particles hit the hub, the blank day fills up with data (Sleep: 7h, Steps: 2000). A small "Smart Guess" notification appears: _"Based on your Oura ring, you had a high pain night. Log Pain Level?"_

Technical Insight:

This visualizes the integration with HealthKit and Google Fit APIs.1 It addresses the user desire for "Integration woes" to be solved.1 By showing the app doing the work for the user, we validate the "Spoon Saver" promise. The design should explicitly show the "Missing-field widgets" mentioned in the Agent Requirements 1, which appear specifically to heal data gaps.

### 2.4 Section: Addressing Medical Gaslighting & Doctor Communication

Pain Point: "Doctors still don't listen to me." Patients feel dismissed and struggle to present credible evidence.1

Strategic Hook: "Doctor Proof" / The Doctor Trust Pack.1

#### 2.4.1 Behavioral Analysis

This is perhaps the most emotionally charged pain point. Users are traumatized by "medical gaslighting"-being told their symptoms are psychosomatic ("It's just anxiety").<sup>1</sup> They desperately want to be believed. However, handing a doctor a 50-page diary is counterproductive; doctors don't have time to read it. The solution is "Translation": turning raw patient data into clinical language that commands respect.

#### 2.4.2 Copy Strategy

- **Text Pill:** Clinical Validation
- **Title (H2):** Make your doctor listen.
- **Description:** Stop being dismissed with "it's just stress." Turn your daily logs into a structured, clinician-ready "Doctor Pack." We translate your experience into the medical language of onset, duration, and severity-creating proof they can't ignore.
- **Primary Call to Action:** Preview a Doctor Report.<sup>1</sup>

#### 2.4.3 UI Element: The "Translation" Split-Screen

Visual Description:

A compelling split-screen comparison illustrating "The Problem" vs. "The Solution."

- **Left Side (The Struggle):** A graphic of a messy, handwritten journal or a chaotic spreadsheet. It is desaturated (grayscale) and looks cluttered.
- **Right Side (The Solution):** A crisp, high-fidelity **Doctor Pack PDF** document.<sup>1</sup> This document is styled with professional, clinical typography (serif headings) but retains the brand's clear layout.

Zoom-In Details:

A magnifying glass graphic hovers over the Doctor Report, highlighting three specific clinical features required by the Agent Requirements 1:

- **The Structured Narrative:** A text block showing "Onset, Location, Quality" in tight paragraphs (e.g., _"Patient reports burning pain in AM..."_).
- **The Flare Timeline:** A horizontal bar chart showing "Severity Peaks" over a 30-day window.
- **The Evidence Footer:** A small code snippet at the bottom of the page reading _"Immutable Evidence Snapshot ID: #8X92,"_ symbolizing data integrity and trustworthiness.

Psychological Impact:

This visual provides "proof of competence." It shows the user that the app understands the medical game. The contrast between the "messy" left side and the "professional" right side visually represents the transition from "hysterical patient" (a common stereotype) to "informed partner."

### 2.5 Section: Addressing the "Flare Day" Reality

Pain Point: "Fatigue... makes tracking hard." Standard apps are unusable during severe episodes (flares).1

Strategic Hook: Adaptive Interface / "I'm Wiped" Mode.1

#### 2.5.1 Behavioral Analysis

A critical failure of most apps is that they demand the same interaction level on a "good day" as a "bad day." When a user is in a flare (e.g., a migraine attack), they cannot navigate menus. They need a "panic button" equivalent-a mode that strips away everything but the essentials. This "Adaptive Interface" is a key differentiator.<sup>1</sup>

#### 2.5.2 Copy Strategy

- **Text Pill:** Adaptive Interface
- **Title (H2):** Built for days when you can't do anything.
- **Description:** When a flare hits, you shouldn't have to manage an app. One tap on "I'm Wiped" switches Clue to survival mode: minimal questions, dark mode visuals to soothe your eyes, and absolutely zero guilt for missing the details.
- **Primary Call to Action:** Try Flare Mode.

#### 2.5.3 UI Element: The "Dimmer Switch" Interactive

Visual Description:

An interactive toggle component embedded in the landing page section.

- **Initial State (Good Day):** The UI shows the standard "Daily Panel" with ~5 widgets (Mood, Pain, Sleep, Diet, Meds) on a light, Dusty Blue (#A8C8DA) background.
- **The Action:** A toggle switch labeled **"Flare Mode"** is clicked.
- **The Transition:**
  - **Color Shift:** The background smoothly transitions to a "Dark Mode" variant (Deep Navy #0B233D), which is visually soothing for photosensitivity.<sup>1</sup>
  - **Content Reduction:** The 5 widgets animate away, leaving only **one** large, simple slider: _"Severity (0-10)"_ and a single text input for _"Key Symptom"_.<sup>1</sup>
  - **Messaging:** A comforting toast notification appears: _"Logging basics only. Rest up."_.<sup>1</sup>

Strategic Rationale:

This interaction proves the "Low-Friction" promise. It demonstrates that the app respects the user's physiological limits. The dark mode transition is particularly potent for migraine sufferers, signaling that the designers understand sensory processing sensitivities.1

### 2.6 Section: Addressing Lack of Insight

Pain Point: "Lack of insight and useful output." Users feel data "just sits there" without providing value.1

Strategic Hook: "Pattern Discovery" / Connect the Dots.1

#### 2.6.1 Behavioral Analysis

Tracking without insight is demoralizing. Spoonies want to know _why_ they feel bad. They are looking for triggers (food, weather, stress). However, correlation does not equal causation, and users struggle to do the math on "lag effects" (e.g., did Tuesday's pizza cause Thursday's pain?). The app must act as a data scientist.

#### 2.6.2 Copy Strategy

- **Text Pill:** Pattern Recognition
- **Title (H2):** Connect the dots your brain can't.
- **Description:** Stop guessing if it was the weather, the food, or the stress. Set a "Focus Question" and let our pattern engine analyze the invisible links between your triggers and your flares-even the ones that happen 3 days later.
- **Primary Call to Action:** Start a Discovery Experiment.<sup>1</sup>

#### 2.6.3 UI Element: The "Correlation Card"

Visual Description:

A large, "Mid-Page" card in a Soft Violet (#BFA7EC) gradient, representing wisdom/insight.1

- **The Question:** At the top of the card, a pinned question reads: _"How does_ **_Poor Sleep_** _impact_ **_Brain Fog_**_?"_ (This is the "Focus Hypothesis" <sup>1</sup>).
- **The Visualization:** A simple dual-axis line graph (using rounded stroke caps) shows two lines:
  - Line A (Sleep Quality): Dashed White Line.
  - Line B (Brain Fog): Solid Navy Line.
- **The Highlight:** A "Lag Indicator" highlights a specific section where a dip in Line A precedes a spike in Line B by 24 hours. A tooltip reads: _"24h Lag Detected"_.<sup>1</sup>
- **The Verdict:** A summary text at the bottom: _"High Confidence: Poor sleep is a consistent trigger."_

Technical Insight:

This visualizes the "Focus Mode" described in the Agent Requirements.1 It shows the user that the app doesn't just display data; it interprets it using "Lag checks" and "Metric computation windows."

### 2.7 Section: Addressing Emotional Toll & Anxiety

Pain Point: "Emotional toll: anxiety, guilt, and feeling judged." Judgmental interfaces (sad faces, red colors) make mental health worse.1

Strategic Hook: Emotional Safety / Neutral Design.

#### 2.7.1 Behavioral Analysis

Many apps use gamification (streaks, badges) or "judgmental" iconography (red sad faces for high pain). For a chronic illness patient, a "bad day" is not a failure; it's a reality. Seeing a red "sad face" when you are already in pain is psychologically damaging. The landing page must signal "Emotional Safety."

#### 2.7.2 Copy Strategy

- **Text Pill:** Empathy First
- **Title (H2):** A tracker that doesn't judge.
- **Description:** No "sad faces" for high pain. No broken "streaks" for missing a day. Clue uses neutral, supportive design that respects your reality. We celebrate your awareness, not just your "good" days.
- **Primary Call to Action:** Experience neutral tracking.

#### 2.7.3 UI Element: The "Neutral Scale" & "Gratitude" Widget

Visual Description:

A comparison of "Standard Apps" vs. "Clue."

- **Standard (Bad):** Shows a scale with a bright red, crying emoji at level 10.
- **Clue (Good):** Shows a sleek, Soft Violet slider. Level 10 is labeled _"High Intensity"_ (neutral language) rather than _"Awful"_.<sup>1</sup>
- **The Balance:** Beside the symptom slider, there is a "Gratitude Widget" or "Small Win" input. This reflects the user desire to "incorporate wellness tracking" and not just focus on the negative.<sup>1</sup> The widget is styled in warm Peach (#F7B182) to evoke positivity.

Strategic Rationale:

This directly addresses the Reddit feedback about "judgmental" interfaces.1 By showing neutral language ("Intensity" vs "Awful"), we demonstrate emotional intelligence.

### 2.8 Section: Addressing Complexity & Setup Friction

Pain Point: "Complex setup and data overload." Users are overwhelmed by blank slates and "analysis paralysis".1

Strategic Hook: Guided Onboarding / Templates.

#### 2.8.1 Behavioral Analysis

Spoonies often have multiple comorbidities (e.g., EDS + POTS + MCAS). Setting up a tracker from scratch for this is daunting. They need "Templates" but also "Customization." The onboarding experience must feel like a guided conversation, not a configuration panel.

#### 2.8.2 Copy Strategy

- **Text Pill:** Instant Setup
- **Title (H2):** Expert templates for your condition.
- **Description:** Don't start from scratch. Whether you have POTS, Fibro, or Long COVID, launch with a pre-built template designed by experts. Then, tweak it to fit your unique body in seconds.
- **Primary Call to Action:** Find your template.

#### 2.8.3 UI Element: The "Condition Selector" Carousel

Visual Description:

A horizontal scrolling carousel of "Template Cards."

- **Card 1:** "POTS Pack" (Icon: Heart Rate + Water Drop). Contains widgets for Salt Intake, Standing Time, Dizziness.
- **Card 2:** "ME/CFS Pack" (Icon: Battery). Contains widgets for PEM (Post-Exertional Malaise), Rest, Energy Envelope.
- **Card 3:** "Migraine Pack" (Icon: Lightning). Contains widgets for Barometric Pressure, Light Sensitivity, Aura.
- **Interaction:** Clicking a card shows it "loading" into the main phone interface instantly.

Strategic Rationale:

This addresses the "blank slate" anxiety.1 By naming specific conditions, we perform "Call-out Marketing," signaling to the user that "this app is for me."

### 2.9 Section: Addressing Customization Limits

Pain Point: "Apps are too inflexible." Users hit limits on how many symptoms they can track.1

Strategic Hook: Unlimited Flexibility.

#### 2.9.1 Behavioral Analysis

Users with complex conditions hate "limits." They often have 50+ symptoms. They need an app that can grow with them. The "Ecosystem" concept is vital here-showing that the app handles the complexity of _their_ specific life.

#### 2.9.2 Copy Strategy

- **Text Pill:** Limitless Tracking
- **Title (H2):** Your health is complex. Your tracker should keep up.
- **Description:** Track 5 symptoms or 50. Add custom tags for "Barometric Pressure," "Gluten," or "Social Interaction" on the fly. Clue adapts to your complexity without cluttering your screen.
- **Primary Call to Action:** Customize your dashboard.

#### 2.9.3 UI Element: The "Dynamic Tag" Cloud

Visual Description:

A dynamic animation showing the "Add Widget" flow.

- **Action:** A user types "Humidity" into a search bar.
- **Result:** A new, beautiful "Chip" widget appears in the dashboard.
- **Visual:** The dashboard organizes these chips using a "Masonry Layout" that fits them neatly, proving that "complexity" doesn't have to mean "clutter." The chips use the Podia pastel palette to keep the aesthetic light even with high data density.<sup>1</sup>

### 2.10 Section: Addressing Privacy Concerns

Pain Point: "Privacy concerns." Fear of data misuse (especially menstrual data).1

Strategic Hook: Local-First Security.

#### 2.10.1 Behavioral Analysis

In the post-Roe v. Wade era, privacy for health apps is non-negotiable. Users are terrified of their data being sold or subpoenaed. The "Local-First" architecture mentioned in the Agent Requirements <sup>1</sup> is a massive selling point.

#### 2.10.2 Copy Strategy

- **Text Pill:** Privacy First
- **Title (H2):** Your data stays on your device. Period.
- **Description:** We don't sell your data. We don't even see it unless you choose to share it. Clue is built with a "Local-First" architecture, meaning your health history lives in a secure vault on your phone, not on a cloud server we control.
- **Primary Call to Action:** Read our Privacy Promise.

#### 2.10.3 UI Element: The "Vault" Visualization

Visual Description:

A 3D-rendered, friendly-looking "Vault" or "Lock" icon in the center of the screen.

- **Visual:** Data streams (represented by small colorful dots) fly _into_ the phone, and a "Lock" icon snaps shut on the screen.
- **Text Overlay:** _"Local Encryption Active."_
- **Compliance Badges:** Small, monochromatic badges for "GDPR Compliant" and "HIPAA Ready" appear below.<sup>1</sup>

### 2.11 Section: Addressing Affordability

Pain Point: "Affordability." Chronic illness is expensive; users resent high subscriptions.1

Strategic Hook: Fair Pricing Model.

#### 2.11.1 Behavioral Analysis

The app must not feel like a "tax on being sick." The freemium model must be generous. The "Premium" features should be framed as "Power Tools" (Doctor Reports), not "Basic Rights" (Symptom Logging).

#### 2.11.2 Copy Strategy

- **Text Pill:** Fair Pricing
- **Title (H2):** Powerful tools, accessible to all.
- **Description:** Health data is a human right. That's why core tracking, flare mode, and unlimited logging are free. Forever. Upgrade only if you need advanced doctor reports and automated pattern discovery.
- **Primary Call to Action:** See Pricing.

#### 2.11.3 UI Element: The Pricing Comparison

Visual Description:

Two simple cards side-by-side using the Podia card style.1

- **"Essential" (Free):** Background: Dusty Blue (#A8C8DA). _Features: Unlimited Logs, Flare Mode, Dark Mode._ Button: "Start Free."
- "Spoonie Plus" (Paid): Background: Pastel Orange (#EFA24C). Features: Doctor Trust Pack, Pattern Engine, Wearable Sync. Button: "Start Trial."
  Note: The "Free" card is visually substantial, not a "reject" option.

### 2.12 Section: Addressing Community (Support w/o Noise)

Pain Point: "Community... mixed feelings." Users want support but hate the "complaining" and "noise" of social feeds in their tracking app.1

Strategic Hook: "Verified Trust" without the Feed.

#### 2.12.1 Behavioral Analysis

Users want to know they aren't alone, but they don't want a Facebook feed inside their health tool. The solution is "Social Proof" (testimonials) rather than "Social Networking" (feeds).

#### 2.12.2 Copy Strategy

- **Text Pill:** Community Verified
- **Title (H2):** Trusted by the Spoonie community.
- **Description:** Built with input from thousands of patients managing POTS, EDS, and Long COVID. We listen to the community, not the trends.
- **Primary Call to Action:** Read User Stories.

#### 2.12.3 UI Element: The "Masonry Grid" of Voices

Visual Description:

A masonry grid of testimonial cards.1

- **Design:** White cards with strongly rounded corners and a subtle drop shadow on a Peach (#F7B182) background.
- **Content:**
  - _User A (POTS):_ "Finally an app that doesn't yell at me for missing a day. The Flare Mode is a lifesaver."
  - _User B (Long COVID):_ "My doctor actually looked at the report. For the first time, we talked about treatment instead of arguing."
- **Constraint:** No "Social Feed" UI. Just static, curated proof.

## 3\. Technical & Implementation Synthesis

### 3.1 Architecture for Low-Energy Interaction

The landing page promises must be backed by rigorous engineering.

- **Local-First (SQLite):** To support the "20-second check-in," the app cannot rely on server round-trips. The architecture is Local-First, syncing only when bandwidth allows. This ensures the app never "hangs" on a bad hospital Wi-Fi connection.<sup>1</sup>
- **HealthKit & Google Fit:** The "Ecosystem" visuals rely on HKHealthStore (iOS) and Sensors Client (Android). The landing page must accurately depict data types (Steps, HR, Sleep) that are _available_ via these APIs to ensure truth in advertising.<sup>1</sup>
- **Accessibility Standards:** The Podia color palette must be vetted against **WCAG 2.1 AA** standards. For example, white text on the Pastel Orange (#EFA24C) might fail contrast ratios; we must use Dark Navy (#0B233D) text on those buttons instead.<sup>1</sup>

### 3.2 The "Doctor Pack" Generation Logic

The "Doctor Proof" section relies on a backend capable of generating high-fidelity PDFs. The tech stack includes a PDF generation engine that ingests the SQLite data, applies a "Clinician Template" (formatting symptoms into medical paragraphs), and stamps it with the "Evidence ID".<sup>1</sup> This technical capability is the "moat" that separates Clue from basic journaling apps.

## 4\. Conclusion

This landing page specification represents a radical departure from standard health app marketing. Instead of selling "Health Optimization" or "Peak Performance"-concepts that alienate the chronic illness community-it sells "Energy Conservation" and "Validation."

By addressing **each** of the 12 identified pain points with a specific, scientifically grounded solution, the landing page acts as the first step in a therapeutic alliance. The Podia-inspired aesthetic creates a safe, non-clinical environment, while the feature set (Flare Mode, Doctor Pack, Pattern Engine) proves that the developers truly understand the "Spoonie" reality. This is not just a product launch; it is a direct response to a community that has been asking to be heard.

_(End of Report)_

#### Works cited

- Experiences of Spoonies with Symptom Tracking Apps.docx
