# Clue — Symptom & Mood Tracker

**Product Overview**

Clue is a chat-first symptom tracker designed specifically for chronic illness patients managing multiple conditions. It solves the problem that existing symptom tracking apps drain users' limited energy while producing outputs that doctors don't trust or engage with. The product focuses on making tracking "lighter than remembering" while generating doctor-ready summaries structured in the clinical formats physicians actually use.

**Target User**: Multi-condition chronic illness patients (like Sarah, 42, managing 3-4 conditions, seeing 5+ providers) who need to track symptoms for sense-making and doctor reporting but lack the energy for traditional tracking apps.

---

## Core Features

### Chat-Based Configuration Engine
- **Not a daily logging interface** - chat serves as the setup and investigation tool that builds the user's personalized quick entry panel
- Users describe their situation and ask questions like "how do meds impact mood?" to configure what gets tracked
- Chat remains available post-onboarding for: asking new tracking questions (which reconfigures quick entry), flare detail capture, and appointment preparation
- Uses **dynamic widget insertion** - the agent embeds interactive elements (sliders, chip selectors, body diagrams) into conversational flow to gather structured data without requiring typing
- Implements **"8 characteristics" extraction** - the system pulls location, duration, frequency, progression, context, associated symptoms, quality, quantity, aggravating factors, and alleviating factors from natural language to build clinician-ready summaries

### Personalized Quick Entry Panel (Primary Daily Interface)
- **10-30 second daily logging** - designed for users with minimal energy
- Auto-configured based on user's conditions, priority outcome, and active questions from chat
- Contains 5-8 adaptive widgets based on: priority outcome, flare state, most frequent logs
- Widgets include: severity sliders, symptom chips, factor toggles, medication checkboxes
- **Core tension to be solved post-launch**: preventing panel bloat while allowing evolution as users ask new questions

### Comprehensive Onboarding (Required for MVP)

**Screen 1A - Condition Selection**
- Select 1-3 conditions from categorized bottom sheet (Common, Digestive, Pain, Mental Health, Sleep, Neuro, Hormonal, Autoimmune)
- Examples: IBS, migraine, long COVID, fibromyalgia, endometriosis, chronic pain, anxiety
- Creates initial tracking templates and symptom vocabulary

**Screen 1B - Priority Setting**
- Single-select from: Energy crashes, Pain, Mood/anxiety, IBS/gut, Sleep/recovery, Headaches, Brain fog, Skin/flare-ups
- Sets first month focus and default charts

**Screen 1C - Impact Question**
- **Required**: "How does my [Feature] impact [Outcome]?"
- Feature dropdown: medications, sleep, food, stress, exercise, cycle, work, weather, hydration, supplements
- Outcome dropdown: mood, IBS, pain, fatigue, anxiety, sleep quality, headache, skin, focus
- Becomes pinned question in chat and first analytics card

**Screen 2 - Intent Selection**
- Choose one mode from four options with exact user quotes:
  - **Awareness**: "Something is wrong" ("Why am I so exhausted again?", "My pain is back with a vengeance")
  - **Tracking**: "I need history" ("When did this start last time?", "Did I take my meds on time yesterday?")
  - **Insight**: "What's causing this?" ("Is stress making this worse?", "Could it be the weather or food?")
  - **Action**: "What do I do next?" ("Should I call my doctor?", "How can I prevent this again?")
- Sets app's first week tone and preconfigures widgets/prompts

**Screen 3 - First Check-in (2-3 adaptive widgets)**
- Widget A: Baseline slider for priority outcome (0-10 scale)
- Widget B: Flare toggle (if Awareness/Action selected)
- Widget C: Top suspects chips (3-7 options based on chosen Feature)
- **Takes 20 seconds** to establish baseline

**Screen 4 - First Value Moment**
- Shows "Baseline captured" confirmation
- Calendar preview of future history view
- Promise card: "After 3 days, I'll start spotting patterns. After 2 weeks, you'll get a doctor-ready 2-4 week trend view."
- Creates psychological buy-in before data exists

### Flare Mode (MVP Must-Have)

**Triggers**:
- Manual: user taps "This is a flare" in quick entry
- Automatic: severity jumps or multiple symptoms spike (rule-based detection)
- Chat-based: system detects flare context in natural language ("everything hurts", "worst day in weeks")

**During Flares**:
- **Simplified logging** - one-tap severity, maximum 1-2 follow-ups (respects that energy is lowest)
- **Timestamps** - captures start time, end time (or "ongoing"), stores duration and peak severity
- **Auto-compare** - "This flare looks like your last 2 flares" with analysis of what was different 24-72h before (sleep dip, missed meds, stress spike)
- Both quick entry and chat interfaces adapt to flare state

### History Calendar
- **Calendar-first interface** - grid view with day markers
- Tap day → day card stack showing: outcomes, symptoms, factors, medications, notes
- "Compare to last flare" entry point when flare mode is active
- Provides proof when memory is unreliable

### Analytics + Doctor View

**Default View** (user-facing):
- Friendly insights showing pattern connections
- Focus on the pinned impact question
- Shows baseline comparisons and trends

**Doctor View Toggle**:
- **2-4 week graphical trends** - clean, minimal charts over clinically relevant windows
- **Baseline comparisons** with threshold alerts ("3+ points worse than baseline")
- **Symptom summaries** - tight paragraphs using the 8 characteristics framework (onset, location, duration, character, severity, aggravating/alleviating factors, associated symptoms)
- **Flare timeline overlay** - start/end markers, severity peaks, duration analysis
- **Temporal patterns** - onset timing, cycles, lag effects
- Goal: **fewer clicks, provider-ready at a glance**

### Appointment Prep Mode + Exports

**Appointment Prep**:
- Explicit mode when user indicates upcoming appointment
- Generates structured talking points:
  - 1 paragraph per key symptom (doctor preference)
  - Includes trend + flare frequency + what helped/hurt
- 14/30/90-day summary reports
- Flare timeline view
- Medication adherence snapshot
- Trigger shortlist (confidence-weighted)

**Export**:
- **PDF export** (provider-ready format)
- Structured in clinical language physicians recognize
- Optional: share/send to provider portal (implementation detail for later, but product promise includes it)
- **Free tier includes basic PDF export** - this is critical to maintain the core value proposition

### Chat Intelligence (First 20 Prompts)

System follows structured progression mixing daily check-ins, flare capture, and doctor-trustworthy detail:

1. "Quick check-in: how's your [priority outcome] right now (0-10)?"
2. "Which condition is this tied to today?"
3. "Anything new since yesterday: meds, sleep, food, stress, or activity?"
4. "Do you want to keep this as a normal day or mark it as a flare?"
5-14. Flare detail collection (when triggered): location, quality, severity, timing, progression, context, associated symptoms, aggravating/alleviating factors
15-18. Factor tracking: medications, sleep quality, food triggers, stress level
19-20. Summary generation: "Want a doctor-ready 3-4 line summary?" / "Want me to compare this flare to your last one?"

**Rules to prevent interrogation feel**:
- **Max 2 follow-ups per message** unless in Appointment Prep Mode
- If severity is high or user selects "I'm wiped": switch to "One tap answers only. We'll fill details later."

---

## User Experience

### Four-Tab Navigation

**Tab 1 - Chat (Front Door)**
- Primary entry point but not primary daily interface
- Pinned question visible: "How does my [Feature] impact [Outcome]?"
- Side drawer: saved questions + suggested ones
- Bottom-sheet pickers for chips (never heavy forms)
- Agent dynamically embeds widgets to gather structured data conversationally

**Tab 2 - History**
- Calendar grid with day markers
- Day card stacks on tap
- Flare comparison entry points

**Tab 3 - Quick Entry**
- Dynamic panel with 5-8 actions
- Top widgets based on: priority outcome, flare state, most frequent logs
- Must stay usable under 10 seconds

**Tab 4 - Analytics + Doctor View**
- Default: friendly insights for user
- Toggle: Doctor View (clinical format)
- Built-in, not hidden

### Key UX Principles

**Energy-conscious design**:
- Everything designed for users with brain fog and limited energy
- Quick entry must work in under 30 seconds
- Flare mode simplifies to absolute minimum (one-tap + optional 1-2 follow-ups)
- Chat accepts minimal input and gracefully moves on when user is exhausted

**Progressive disclosure**:
- Start with baseline quick entry
- Detail layers available but never required
- Chat asks for missing info gently, never aggressively
- Widget fatigue managed by respecting user's state

**Immediate value creation**:
- First check-in shows calendar preview and promise cards
- Can't wait days for "enough data"
- Mock insights on Screen 4 create psychological buy-in

**Clinical credibility embedded throughout**:
- Doctor view built into analytics (not hidden behind menus)
- Symptom summaries use recognized medical frameworks
- Graphical displays designed for physician scanning patterns
- Export format matches clinical documentation standards

---

## Technical Approach

### Data Model

**Core Entities**:
- Daily check-in (outcome scores + suspects)
- Symptom event (8-characteristics summary + raw chat text)
- Flare (start/end timestamps, peaks, symptom bundle)
- Factors (sleep, stress, food, exercise, cycle, weather, etc.)
- Medications (taken/missed/changed)
- Notes/tags

**Derived Data**:
- Baseline calculations
- Threshold alerts
- Lag effects (yesterday sleep → today outcome)
- Provider paragraphs + graphs

### Widget System
- **Engineering team responsibility**: continuously create new widgets as data/users grow
- Widgets embedded in chat conversationally (not as separate forms)
- Examples: sliders, chip selectors, body diagrams, medication checkboxes, time pickers
- Must feel native to chat interface while capturing structured data

### Flare Detection
- **MVP**: Simple rule-based triggers (severity jumps, multiple symptom spikes)
- Manual override always available
- Chat-based context detection ("everything hurts", "worst day in weeks")

### Pattern Analysis
- Focus on impact questions: "How does [Feature] impact [Outcome]?"
- Lag effect detection (24-72h windows before flares)
- Confidence-weighted trigger identification
- Baseline comparisons with threshold alerts

### Future Consideration: Graph Visualization (MVP 2.0)
- Node-edge view showing connections between clues, days, insights, impacts
- Part of Analytics tab for users wanting to explore connections
- Potentially part of Doctor View
- Must be "super simple intuitive" - deferred to avoid overwhelming users with brain fog

---

## Differentiation

### vs. Apps That "Just Collect Data"
- **Clue**: Generates actionable insights showing connections between symptoms, sleep, medications, dietary choices
- **Others**: Present visualizations without interpretation, leaving pattern detection to exhausted users

### vs. High-Friction Symptom Trackers
- **Clue**: Quick entry designed for 10-30 seconds, chat with embedded widgets eliminates typing
- **Bearable/similar**: Long forms that "hurt thumbs" and require more energy than users have

### vs. Patient Logs Doctors Dismiss
- **Clue**: Structures data using 8-characteristics framework physicians recognize, provides graphical trends over clinical windows (2-4 weeks), generates tight paragraphs instead of novels
- **Others**: Unstructured patient narratives or raw data dumps that physicians don't have time to parse

### Core Competitive Advantage
**Five Pillars**:
1. **Capture**: Fast check-ins + flare logging when symptoms spike
2. **Recall**: Calendar history that works when brain fog hits
3. **Connect**: Pattern analysis that stays understandable
4. **Act**: Gentle next steps and "what to try today" suggestions
5. **Trust**: Doctors take data seriously because of clinical structure

**The "Evidence Layer"**: Behind the user-friendly chat interface sits a rigorous system that extracts, structures, and presents symptom data in formats that meet clinical documentation standards.

---

## Business Model

### Monetization Strategy
**14-day full-access trial** - users experience complete product before paying

**Free Tier (Permanent)**:
- Quick entry + history calendar
- **Basic pattern insights** (enough to prove value and prevent abandonment)
- **Simple PDF export** (basic doctor-ready summaries)
- Core value loop remains functional to avoid abandoning users who can't afford premium

**Premium Features ($5-10/month)**:
- **30+ advanced widgets** for most complete health picture
- **Health platform integrations** (Apple Health, Google Fit)
- **Multiple doctor summaries** (different formats for different specialists)
- **Advanced node-edge graph editing** for chat agent's decision tree
- **Appointment Prep Mode** (advanced)
- **Unlimited export customization**

### Philosophy on Pricing
- **Won't lose users due to money issues** - core value must remain free
- Target users often on disability with limited resources
- Premium targets power users wanting deeper control and sophistication
- Solve the "compensation increases retention 10x" insight by keeping essential features free

### Go-to-Market Approach
**Phase 1 (MVP)**: B2C focus
- Goal: Get real users logging (prove core value loop)
- Target: Chronic illness support groups, Reddit communities (r/chronicillness, condition-specific), Facebook groups
- Learn behavior patterns before adding complexity

**Future Consideration**: B2B2C
- Provider portal integrations could enable clinics to provide Clue to patients
- Requires proving doctor trust value first
- Not part of MVP scope - focus on direct user acquisition

---

## Success Metrics

### Activation Metrics
- **Onboarding completion rate** (through all 4 screens)
- **First check-in within 2 minutes** of completing onboarding
- Screen 4 "promise card" creates early commitment

### Retention Drivers (Critical Given 80% First-Month Abandonment)
- **Daily check-in consistency** (target: users logging 5+ days/week)
- **Flare mode usage frequency** (validates that highest-value moment is captured)
- **Appointment pack generated** (proves doctor trust value)
- **Week 1 survival rate** (first week is critical drop-off point)

### Trust Metrics
- **"Doctor-ready" export usage** (how many users actually share with providers)
- **"This summary is accurate" feedback** on generated clinical paragraphs
- **Return usage after medical appointments** (did doctor engage with data?)

### Core Loop Completion
Track users moving through: Check-in (10-30s) → Flare mode when needed → Calendar history (proof) → Doctor-trust view → Appointment prep → repeat

### Behavioral Targets
- **Under 30 seconds** average check-in time (friction elimination)
- **Max 2 follow-ups** in chat to prevent interrogation feeling
- **3-day pattern insights** (rapid evidence of value)
- **14-day doctor-ready trends** (clinical credibility window)

---

## MVP Scope

**Must Ship**:
- ✅ Expanded onboarding (Screens 1A, 1B, 1C, 2, first value screen)
- ✅ Chat with 8-characteristics extraction + gentle missing-info prompts
- ✅ Dynamic widget system (sliders, chips, body diagrams embedded in chat)
- ✅ Personalized quick entry panel (auto-configured from chat)
- ✅ Flare Mode (manual + simple automatic triggers, timestamps, compare to past)
- ✅ History calendar with day card stacks
- ✅ Analytics with Doctor View toggle
- ✅ Appointment Prep Mode (basic) + PDF export
- ✅ 14-day full-access trial + free tier with core features

**Explicitly Deferred (MVP 2.0)**:
- Node-edge graph visualization
- Advanced panel management (preventing bloat while allowing evolution)
- Health platform integrations (Apple Health, Google Fit)
- Provider portal connections
- Advanced appointment prep features

---

## Privacy & Trust

### Non-Negotiables
- **Clear data ownership**: User can export + delete anytime
- **Minimal data collection** by default
- **Transparent analytics**: Explain what's being computed and why
- **No data sharing** without explicit user consent

### Compliance References
- **GDPR overview**: https://gdpr.eu/what-is-gdpr/
- **HIPAA overview**: https://www.hhs.gov/hipaa/index.html (if handling HIPAA-regulated flows)

### Future Health Platform Integrations
- **Apple HealthKit**: https://developer.apple.com/documentation/healthkit
- **Google Fit**: https://developers.google.com/fit

---

## Design Philosophy

**Core Tension to Balance**:
- Sarah needs it effortless on bad days (minimal energy)
- Doctors need structured detail for treatment decisions (8 characteristics)

**Resolution**:
- Quick entry provides effortless baseline (10-30s)
- Chat with dynamic widgets adds optional detail without forms
- System extracts clinical structure from minimal input
- Flare mode simplifies to absolute minimum when energy is lowest

**North Star**: Make tracking feel **lighter than remembering** while generating outputs that **doctors take seriously**.