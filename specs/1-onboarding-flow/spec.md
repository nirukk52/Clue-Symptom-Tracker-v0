# Feature Specification: Onboarding Flow

**Feature Branch**: `1-onboarding-flow`  
**Created**: 2025-12-28  
**Status**: Draft  
**Input**: User description: "Build the onboarding flow for the Clue Symptom Tracker app with 6 screens leading to the chat interface"
OG prompt - .prompts/onboarding-prompt
---

## Overview

The onboarding flow captures essential user context to personalize the Clue experience. It collects conditions, priority outcomes, impact questions, and user intent mode before establishing a baseline and transitioning to the main chat interface.

**Flow Summary**:
```
Screen 1A → 1B → 1C → Screen 2 → Screen 3 → Screen 4 → Chat Tab
```

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Condition Selection (Priority: P1)

**Screen**: 1A - "What are you managing?"

A new user opens Clue for the first time and needs to indicate which chronic conditions or symptoms they're managing. They can select up to 3 conditions from categorized options or search for specific ones.

**UI Reference**: 
- Design: [`all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/screen.png`](../../all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/screen.png)
- Code: [`all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html`](../../all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html)

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 1A

**Why this priority**: First touch point that acknowledges user's multi-condition reality. Creates initial tracking templates and symptom vocabulary. Required for all downstream personalization.

**Independent Test**: Can be tested by launching app fresh, selecting conditions, and verifying they persist to local SQLite immediately.

**UI Elements**:
| Element | Content |
|---------|---------|
| Title | "What are you managing?" |
| Subtitle | "Select up to 3 chronic conditions or symptoms to personalize your tracking." |
| Search placeholder | "Search conditions, symptoms..." |
| Primary CTA | "Continue" (with arrow) |
| Secondary CTA | "I'll choose later" |

**Categories** (with colored icon badges):
- **Common Picks**: Chronic Pain, Fatigue, Anxiety, Insomnia
- **Digestive** (peach badge): IBS, Crohn's Disease, Bloating, Acid Reflux
- **Pain + Inflammation** (purple badge): Migraines, Fibromyalgia, Arthritis, Back Pain
- **Mental Health**, **Sleep + Energy**, **Neuro**, **Hormonal**, **Autoimmune**, **Other**

**Acceptance Scenarios**:

1. **Given** user is on Screen 1A with no selections, **When** they tap a condition chip, **Then** chip displays selected state (dark primary background, checkmark icon) and selection count updates
2. **Given** user has selected 3 conditions, **When** they attempt to select a 4th, **Then** system prevents selection and shows feedback (shake animation or toast)
3. **Given** user types in search, **When** text matches condition names, **Then** filtered results appear below search input
4. **Given** user has 1+ selections, **When** they tap "Continue", **Then** selections are saved to local SQLite immediately and user advances to Screen 1B
5. **Given** user taps "I'll choose later", **When** no conditions selected, **Then** user still advances (lands on symptoms-first setup later)

---

### User Story 2 - Priority Selection (Priority: P1)

**Screen**: 1B - "What matters most right now?"

User selects one primary area they want to track to reduce overwhelm and create a first win.

**UI Reference**: 
- Design: [`all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/screen.png`](../../all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/screen.png)
- Code: [`all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/code.html`](../../all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/code.html)

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 1B

**Why this priority**: Sets the "first month focus" and default charts. Critical for Focus Hypothesis creation.

**Independent Test**: Can be tested by selecting a priority and verifying it becomes the default outcome in impact question (Screen 1C).

**UI Elements**:
| Element | Content |
|---------|---------|
| Progress indicator | "Step 1 of 3" with progress bar (1/3 filled) |
| Title | "What matters most right now?" |
| Subtitle | "Choose one primary area you want to track to help us personalize your daily log." |
| Primary CTA | "Continue" (with arrow) |

**Priority Options** (card style with icons):
| Option | Icon | Color | Description |
|--------|------|-------|-------------|
| Energy crashes | ⚡ bolt | Yellow | "Fatigue, stamina, spoon theory" |
| Pain & Inflammation | 🩹 healing | Red | "Joint pain, headaches, flare-ups" |
| Mood & Anxiety | 🧠 psychology | Purple | "Depression, brain fog, stress" |
| Sleep Quality | 🌙 bedtime | Blue | "Insomnia, restfulness, vivid dreams" |
| Digestion & Gut | 🌿 spa | Green | "Bloating, nausea, appetite" |

**Acceptance Scenarios**:

1. **Given** user is on Screen 1B, **When** they tap an option card, **Then** card displays selected state (border color change, filled radio indicator) and previous selection deselects
2. **Given** user has made a selection, **When** they tap "Continue", **Then** selection is saved to SQLite and user advances to Screen 1C
3. **Given** user taps "Continue" without selection, **Then** system shows validation message "Pick one priority to continue"

---

### User Story 3 - Impact Question Setup (Priority: P1)

**Screen**: 1C - "Your first impact question"

User creates their first hypothesis by selecting a Feature and an Outcome. This becomes the pinned Focus question in the chat.

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 1C

**Why this priority**: Creates the single active Focus Hypothesis that drives the 7-day experiment. Core to the Clue value proposition.

**Independent Test**: Can be tested by selecting Feature + Outcome and verifying the hypothesis card appears on Screen 4 and Chat tab.

**UI Elements**:
| Element | Content |
|---------|---------|
| Title | "What's the question you're trying to answer?" |
| Main prompt | "How does my [Feature] impact [Outcome]?" |
| Subtitle | "Start with one question. You can add more later." |
| Feature dropdown | Label: "Feature", Placeholder: "Choose one" |
| Outcome dropdown | Label: "Outcome", Placeholder: "Choose one" |
| Primary CTA | "Get started" |
| Validation | "Choose both a feature and an outcome" |

**Feature Options** (Bottom Sheet):
- Meds + supplements, Sleep, Food, Stress, Exercise
- Cycle / hormones, Work + routine, Weather, Hydration, Social / outings

**Outcome Options** (Bottom Sheet):
- Your priority (from Screen 1B), Pain, Fatigue, Mood, IBS
- Sleep quality, Headache, Anxiety, Brain fog / focus, Skin

**Acceptance Scenarios**:

1. **Given** user taps Feature dropdown, **When** bottom sheet opens, **Then** all Feature options are visible and tappable
2. **Given** user selects both Feature and Outcome, **When** they tap "Get started", **Then** Focus Hypothesis is created in SQLite with structure: "How does [Feature] impact [Outcome]?"
3. **Given** user's priority from 1B was "Pain & Inflammation", **When** Outcome bottom sheet opens, **Then** "Pain" appears first as "Your priority"

---

### User Story 4 - Intent Mode Selection (Priority: P2)

**Screen**: 2 - "What brings you here today?" (Intent Selection)

User selects their current mindset from 4 modes, each with 5 representative quotes. This tunes the app's first week behavior.

**UI Reference**: 
- Design Style: [`all-ui-images-and-code/onboarding-screen-4-design-inspiration/screen.png`](../../all-ui-images-and-code/onboarding-screen-4-design-inspiration/screen.png) (pill chip layout)
- Code: [`all-ui-images-and-code/onboarding-screen-4-design-inspiration/code.html`](../../all-ui-images-and-code/onboarding-screen-4-design-inspiration/code.html)

**Content Reference**: [`README.md`](../../README.md) lines 140-172

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 2

**Why this priority**: Sets app tone and preconfigures widgets/prompts. Important for personalization but not blocking for core functionality.

**Independent Test**: Can be tested by selecting a mode and verifying first chat messages and widget selection match the mode's behavior.

**Mode Options** (displayed as cards/sections with quotes visible):

**🔍 Awareness — "Something is wrong"**
- "Why am I so exhausted again?"
- "My pain is back with a vengeance."
- "Everything hurts and no one sees it."
- "I can't think straight; my brain is mush."
- "This flare came out of nowhere."

**📝 Tracking — "I need history"**
- "I need to log this flare, but I'm so tired."
- "When did this start last time?"
- "Did I take my meds on time yesterday?"
- "I've had five flares this month; I'm losing count."
- "I wish I could remember what triggered this."

**🔎 Insight — "What's causing this?"**
- "Is stress making this worse?"
- "Could it be the weather or the food I ate?"
- "Every time I skip lunch, my fatigue spikes."
- "Maybe it's that new medicine."
- "I'm trying to connect the dots, but it's overwhelming."

**⚡ Action — "What do I do next?"**
- "Should I call my doctor or wait it out?"
- "How can I prevent this from happening again?"
- "What can I try to feel better today?"
- "I need to show my doctor what's been happening."
- "I want to prepare for my appointment."

**Acceptance Scenarios**:

1. **Given** user is on Screen 2, **When** they view the screen, **Then** all 4 modes with their 5 quotes each are visible (no expand required)
2. **Given** user taps a mode, **When** mode is selected, **Then** it displays selected state (pill-selected background color)
3. **Given** user selects a mode and taps "Next", **When** advancing, **Then** mode is saved to SQLite and affects widget/prompt configuration

---

### User Story 5 - First Check-in (Priority: P1)

**Screen**: 3 - "Quick check-in"

User provides their first baseline data using 2-3 adaptive widgets. This triggers the Intake Agent for the first time.

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 3

**Agent Reference**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §2A Intake Agent

**Why this priority**: Establishes baseline data and activates the Intake Agent. Critical for demonstrating immediate value.

**Independent Test**: Can be tested by completing widgets, tapping "Save check-in", and verifying day_observation and episode records exist in SQLite.

**UI Elements**:
| Element | Content |
|---------|---------|
| Title | "Quick check-in" |
| Subtitle | "20 seconds. Enough to capture a baseline." |
| Primary CTA | "Save check-in" |

**Widgets** (adaptive based on Screen 1B + Screen 2):

**Widget A - Always shown**:
- Label: "Your [priority outcome] today"
- Type: 0-10 slider
- Helper: "0 = none, 10 = worst"

**Widget B - Conditional** (shown if Awareness/Action mode OR high severity):
- Label: "Is this a flare?"
- Type: Yes/No toggle
- If Yes → "When did it start?" options: Just now, Earlier today, Yesterday, Pick time

**Widget C - Based on Feature** (optional):
- Label: "Any likely drivers?"
- Type: Multi-select chips
- Helper: "Pick any that fit. Skip if you're wiped."
- Chips vary by Feature: missed meds, poor sleep, stress spike, food trigger, etc.

**Acceptance Scenarios**:

1. **Given** user's priority was "Pain & Inflammation", **When** Screen 3 loads, **Then** Widget A shows "Your Pain & Inflammation today" with slider
2. **Given** user moves slider to value 8, **When** they release, **Then** value displays and is stored in component state
3. **Given** user taps "Save check-in", **When** Intake Agent activates, **Then** day_observation record is written to SQLite with severity value, focus_hypothesis_id, and timestamp
4. **Given** user selected Awareness mode, **When** Screen 3 loads, **Then** Widget B (flare toggle) is visible
5. **Given** user taps "Yes" on flare toggle, **When** followup appears, **Then** "When did it start?" options are shown

---

### User Story 6 - First Value Moment (Priority: P1)

**Screen**: 4 - "Baseline captured"

User sees immediate payoff: confirmation, calendar preview, and promise of future insights. Then transitions to Chat.

**Spec Reference**: [`context/onboarding-flow.md`](../../context/onboarding-flow.md) §Screen 4

**Why this priority**: Creates psychological buy-in before data exists. Transitions user to main app experience.

**Independent Test**: Can be tested by verifying all cards render correctly and "Start chatting" navigates to Chat tab.

**UI Elements**:
| Element | Content |
|---------|---------|
| Title | "Baseline captured" |
| Subtitle | "You've started building a record your doctor can actually use." |
| Primary CTA | "Start chatting" |
| Secondary CTA | "Quick entry" |

**Cards**:

**Card 1: Your calendar, filled in**
> "Each check-in becomes a clean day card you can tap later."

**Card 2: What happens next**
> "After **3 days**, Clue starts spotting early links between [Feature] and [Outcome]."
> "After **14 days**, you'll unlock a clear 2–4 week trend view."

**Card 3: Doctor-ready from day one**
> "Clue summarizes symptoms in a tight, structured format clinicians recognize (onset, location, severity, what helps, what worsens)."
> "Trends show up as simple graphs so patterns are obvious fast."

**Acceptance Scenarios**:

1. **Given** user completed Screen 3, **When** Screen 4 loads, **Then** cards display with correct Feature/Outcome placeholders from user's hypothesis
2. **Given** user taps "Start chatting", **When** navigating, **Then** onboarding flow ends and Chat tab becomes active
3. **Given** user taps "Quick entry", **When** navigating, **Then** onboarding flow ends and Quick Entry tab becomes active

---

### User Story 7 - Chat Initialization (Priority: P1)

**Screen**: Chat Tab (Post-Onboarding)

User lands on Chat with their Focus hypothesis card visible and receives their first dynamically generated message from the agent.

**UI Reference**: 
- Design: [`all-ui-images-and-code/chat/screen.png`](../../all-ui-images-and-code/chat/screen.png)
- Code: [`all-ui-images-and-code/chat/code.html`](../../all-ui-images-and-code/chat/code.html)

**Agent Reference**: [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) §4 Chat Agent Feature List

**Why this priority**: Core experience that users return to daily. Must feel personal and grounded in their onboarding choices.

**Independent Test**: Can be tested by completing onboarding and verifying Focus card displays correct hypothesis and first message is contextually relevant.

**UI Elements**:
| Element | Content |
|---------|---------|
| Header | "Chat" with menu (left) and share (right) icons |
| Focus Card | Pinned hypothesis with "Day 1/7" progress |
| Tab buttons | Top-right: History, Quick Entry, Analytics (TBD navigation) |
| Message input | Placeholder: "Type a message..." |
| Quick chips | Mood, Pain Level, Meds (widget shortcuts) |

**Focus Card Content**:
- Badge: "FOCUS" (teal/mint background)
- Label: "Hypothesis tracking"
- Hypothesis: "How does [Feature] impact [Outcome]?"
- Progress: "Progress" label, "Day 1/7" counter, progress bar

**Acceptance Scenarios**:

1. **Given** user just completed onboarding with hypothesis "Poor Sleep → Joint Pain", **When** Chat loads, **Then** Focus card shows "How does Poor Sleep impact Joint Pain?" with "Day 1/7"
2. **Given** Chat loads for first time, **When** Intake Agent generates first message, **Then** message is contextually relevant to user's priority and mode (not hardcoded)
3. **Given** user taps a quick chip (e.g., "Pain Level"), **When** chip activates, **Then** appropriate widget appears inline in chat

---

### Edge Cases

- What happens when user force-quits during onboarding?
  → Partial data does NOT persist. User starts from Screen 1A on next launch.

- What happens when user's selected Feature is the same as their Outcome?
  → System should prevent this selection or show warning.

- What happens if local SQLite write fails?
  → Show error state with retry option. Do not advance until write succeeds.

- What happens if user has no internet during onboarding?
  → Onboarding completes normally (local-first). Sync happens when connection restored.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display onboarding screens in sequence: 1A → 1B → 1C → 2 → 3 → 4 → Chat
- **FR-002**: System MUST save each screen's selections to local SQLite immediately upon "Continue"
- **FR-003**: System MUST enforce maximum 3 condition selections on Screen 1A
- **FR-004**: System MUST enforce single-selection on Screens 1B, 1C, and 2
- **FR-005**: System MUST validate that both Feature and Outcome are selected before advancing from Screen 1C
- **FR-006**: System MUST display all 4 intent modes with all 5 quotes visible (no expand) on Screen 2
- **FR-007**: System MUST trigger Intake Agent on "Save check-in" (Screen 3) to write structured data
- **FR-008**: System MUST show Focus hypothesis card with "Day 1/7" progress after onboarding
- **FR-009**: System MUST generate first chat message dynamically based on user's mode and priority
- **FR-010**: System MUST clear partial onboarding state if user abandons mid-flow
- **FR-011**: System MUST position tab navigation buttons (History, Quick Entry, Analytics) at top-right of Chat screen

### Key Entities

- **User**: User profile, conditions array, priority_outcome
- **Condition**: Condition ID, name, category
- **Focus Hypothesis**: feature_id, outcome_id, created_at, state (active), day_count
- **Day Observation**: obs_id, day_id, field_id, value, source_event_id
- **Episode**: episode_id, start_ts, is_flare, primary_symptom_id

**Data Model Reference**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §7 Data Model

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users complete full onboarding flow (Screen 1A → Chat) in under 3 minutes
- **SC-002**: 90% of users who start onboarding complete through Screen 4
- **SC-003**: First check-in (Screen 3) takes under 30 seconds to complete
- **SC-004**: 100% of onboarding data is persisted to local SQLite before user advances to next screen
- **SC-005**: Focus hypothesis card displays correctly on Chat tab within 1 second of navigation
- **SC-006**: First agent-generated message appears within 2 seconds of Chat tab loading
- **SC-007**: All onboarding screens render pixel-perfect on both iOS and Android devices
- **SC-008**: Zero "loading" states visible during onboarding (all writes are local-first)

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| PowerSync | Sync layer | Local SQLite + Supabase sync |
| NativeWind | Styling | Tailwind for React Native |
| Fraunces font | Typography | Display headings |
| Inter/DM Sans font | Typography | Body text |
| Intake Agent | Agent | Activated on Screen 3 |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`context/Product-Spec.md`](../../context/Product-Spec.md) | Full product specification |
| [`context/onboarding-flow.md`](../../context/onboarding-flow.md) | Detailed onboarding copy and UI elements |
| [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) | Agent behavior and rules |
| [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) | Technical architecture |
| [`context/design-inspiration-overview.md`](../../context/design-inspiration-overview.md) | Podia-inspired design principles |
| [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md) | Project constitution and decisions |
| [`.claude-skills/frontend-design/SKILL.md`](../../.claude-skills/frontend-design/SKILL.md) | Frontend design system |

