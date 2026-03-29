# Implementation Tasks: Onboarding Flow

**Feature**: 1-onboarding-flow  
**Created**: 2025-12-28  
**Status**: In Progress (Core UI Complete)

---

## Phase 1: Foundation Setup

### 1.1 Dependencies & Configuration

- [X] **T001**: Install PowerSync and Supabase dependencies
  - Files: `package.json`
  - Command: `pnpm add @powersync/react-native @powersync/kysely-driver @supabase/supabase-js`

- [X] **T002**: Install Moti animation library (already installed)
  - Files: `package.json`
  - Command: `pnpm add moti`

- [X] **T003**: Install Fraunces font for display headings
  - Files: `package.json`
  - Command: `npx expo install @expo-google-fonts/fraunces`

- [X] **T004**: Update TypeScript config with stricter rules for data layer (already configured)
  - Files: `tsconfig.json`
  - Add: `noUncheckedIndexedAccess`, `noImplicitReturns`

### 1.2 Design System Foundation

- [X] **T005**: Create design tokens file with colors and spacing
  - Files: `src/constants/design.ts`
  - Tokens: primary, backgroundLight, accentPeach, accentBlue, accentPurple, textMuted

- [X] **T006**: Update Tailwind config with Clue color palette
  - Files: `tailwind.config.js`, `src/components/ui/colors.js`
  - Add custom colors from design tokens

- [ ] **T007**: Configure Fraunces font loading in app config
  - Files: `app.config.ts`, `src/app/_layout.tsx`

### 1.3 State Management

- [X] **T008**: Create onboarding Zustand store with MMKV persistence
  - Files: `src/lib/store/onboarding.ts`
  - State: step, conditions[], priority, intent, impactQuestion, baselineData

- [X] **T009**: Create onboarding data types
  - Files: `src/types/onboarding.ts`
  - Types: Condition, Priority, Intent, ImpactQuestion, BaselineEntry

---

## Phase 2: Shared Onboarding Components

### 2.1 Background & Layout Components

- [X] **T010**: Create BackgroundBlobs component with decorative SVG shapes
  - Files: `src/components/onboarding/BackgroundBlobs.tsx`
  - Features: Peach, blue, purple blobs with opacity-30, Moti entrance animation

- [X] **T011**: Create StepContainer layout wrapper component
  - Files: `src/components/onboarding/StepContainer.tsx`
  - Features: SafeAreaView, BackgroundBlobs, ProgressIndicator, scrollable content, fixed bottom CTA

- [X] **T012**: Create ProgressIndicator component (6-step dots)
  - Files: `src/components/onboarding/ProgressIndicator.tsx`
  - States: active (primary), completed (accent-peach), upcoming (gray-300)

### 2.2 Selection Components

- [X] **T013**: Create SelectionChip component for pill-shaped toggles
  - Files: `src/components/onboarding/SelectionChip.tsx`
  - Variants: default, with-description
  - States: selected (bg-primary), unselected (bg-white border)

- [X] **T014**: Create IntentCard component for mode selection
  - Files: `src/components/onboarding/IntentCard.tsx`
  - Features: Icon + Title + Quote layout, selected border state

- [X] **T015**: Create ContinueButton component
  - Files: `src/components/onboarding/ContinueButton.tsx`
  - Features: Full-width, bg-primary, disabled state, press animation

### 2.3 Widget Components [P]

- [ ] **T016**: Create EnergySlider widget (0-10 scale) [P]
  - Files: `src/components/widgets/EnergySlider.tsx`

- [ ] **T017**: Create PainSlider widget (0-10 scale) [P]
  - Files: `src/components/widgets/PainSlider.tsx`

- [ ] **T018**: Create MoodSelector widget (5 emoji options) [P]
  - Files: `src/components/widgets/MoodSelector.tsx`

- [ ] **T019**: Create NoteInput widget (optional free-text) [P]
  - Files: `src/components/widgets/NoteInput.tsx`

- [X] **T020**: Create onboarding components barrel export
  - Files: `src/components/onboarding/index.ts`

---

## Phase 3: Navigation & Routing Structure

- [X] **T021**: Create onboarding route group layout
  - Files: `src/app/(onboarding)/_layout.tsx`
  - Config: headerShown: false, slide_from_right animation, gestureEnabled: false

- [X] **T022**: Create tabs route group layout (placeholder)
  - Files: `src/app/(tabs)/_layout.tsx`
  - Tabs: chat, history, quick-entry, analytics

- [X] **T023**: Update root layout with onboarding/tabs routing logic
  - Files: `src/app/_layout.tsx`
  - Logic: Check isOnboardingComplete, route to (onboarding) or (tabs)

---

## Phase 4: Screen 1A - Conditions Selection

- [X] **T024**: Create conditions screen with multi-select chips
  - Files: `src/app/(onboarding)/conditions.tsx`
  - Features: Header, condition chips (max 3), "2 of 3 selected" counter
  - Validation: At least 1, max 3

- [X] **T025**: Create conditions data constant
  - Files: `src/constants/conditions.ts`
  - Data: Common Picks, Digestive, Pain+Inflammation, Mental Health, etc.

- [X] **T026**: Implement condition search/filter functionality
  - Files: `src/app/(onboarding)/conditions.tsx`
  - Features: Search input, filtered results

---

## Phase 5: Screen 1B - Priority Selection

- [X] **T027**: Create priority screen with single-select cards
  - Files: `src/app/(onboarding)/priority.tsx`
  - Features: 5 priority options with icons and descriptions
  - Validation: Exactly 1 selection required

- [X] **T028**: Create priorities data constant
  - Files: `src/constants/priorities.ts`
  - Data: Energy crashes, Pain & Inflammation, Mood & Anxiety, Sleep Quality, Digestion & Gut

---

## Phase 6: Screen 1C - Impact Question Setup

- [X] **T029**: Create impact question screen with dropdowns
  - Files: `src/app/(onboarding)/impact.tsx`
  - Features: Feature dropdown, Outcome dropdown, "How does [Feature] impact [Outcome]?" preview
  - Validation: Both Feature and Outcome required

- [X] **T030**: Create BottomSheetSelector component for dropdowns (using BottomSheetModal directly)
  - Files: `src/app/(onboarding)/impact.tsx`
  - Features: Bottom sheet with scrollable options

- [X] **T031**: Create features and outcomes data constants
  - Files: `src/constants/impact-options.ts`
  - Data: Features (Meds, Sleep, Food, etc.), Outcomes (Pain, Fatigue, Mood, etc.)

---

## Phase 7: Screen 2 - Intent Mode Selection

- [X] **T032**: Create intent screen with mode cards showing quotes
  - Files: `src/app/(onboarding)/intent.tsx`
  - Features: 4 modes with 5 quotes each visible (no expand)
  - Validation: Exactly 1 mode required

- [X] **T033**: Create intent modes data constant
  - Files: `src/constants/intents.ts`
  - Data: Awareness, Tracking, Insight, Action with 5 quotes each

---

## Phase 8: Screen 3 - First Check-in (Baseline)

- [X] **T034**: Create baseline screen with adaptive widgets
  - Files: `src/app/(onboarding)/baseline.tsx`
  - Features: Priority-based slider, optional flare toggle, driver chips
  - Widget A: Always shown (priority outcome slider)
  - Widget B: Conditional (flare toggle for Awareness/Action mode)
  - Widget C: Optional (driver chips based on Feature)

- [X] **T035**: Create FlareToggle component with follow-up options (inline in baseline.tsx)
  - Files: `src/app/(onboarding)/baseline.tsx`
  - Features: Yes/No toggle, "When did it start?" options if Yes

- [X] **T036**: Create DriverChips component for trigger selection (inline in baseline.tsx)
  - Files: `src/app/(onboarding)/baseline.tsx`
  - Features: Multi-select chips (missed meds, poor sleep, stress, etc.)

---

## Phase 9: Screen 4 - First Value Moment

- [X] **T037**: Create baseline-captured confirmation screen
  - Files: `src/app/(onboarding)/first-chat.tsx`
  - Features: 3 info cards, "Start chatting" CTA, "Quick entry" secondary CTA

- [X] **T038**: Create ValueCard component for confirmation cards (inline in first-chat.tsx)
  - Files: `src/app/(onboarding)/first-chat.tsx`
  - Cards: Calendar preview, What happens next, Doctor-ready from day one

---

## Phase 10: Chat Tab (Post-Onboarding)

- [X] **T039**: Create chat screen with Focus card and message list
  - Files: `src/app/(tabs)/chat.tsx`
  - Features: Header, Focus hypothesis card (Day 1/7), message bubbles, input

- [X] **T040**: Create FocusCard component for pinned hypothesis (inline in chat.tsx)
  - Files: `src/app/(tabs)/chat.tsx`
  - Features: FOCUS badge, hypothesis text, Day X/7 progress bar

- [X] **T041**: Create ChatBubble component for messages (inline in chat.tsx)
  - Files: `src/app/(tabs)/chat.tsx`
  - Variants: user (right, primary bg), assistant (left, light bg)

- [X] **T042**: Create MessageInput component with send button (inline in chat.tsx)
  - Files: `src/app/(tabs)/chat.tsx`
  - Features: Full-width input, arrow send button

- [X] **T043**: Create SuggestionPills component for quick actions (inline in chat.tsx)
  - Files: `src/app/(tabs)/chat.tsx`
  - Pills: Mood, Pain Level, Meds (widget shortcuts)

- [X] **T044**: Create placeholder tab screens
  - Files: `src/app/(tabs)/history.tsx`, `src/app/(tabs)/quick-entry.tsx`, `src/app/(tabs)/analytics.tsx`

---

## Phase 11: Database Schema & Persistence

- [ ] **T045**: Create PowerSync schema definition
  - Files: `src/lib/db/schema.ts`
  - Tables: user_profile, episodes, episode_fields, messages

- [ ] **T046**: Create PowerSync provider wrapper
  - Files: `src/lib/db/provider.tsx`
  - Features: PowerSync initialization, Supabase connector

- [ ] **T047**: Create named queries for onboarding data
  - Files: `src/lib/db/queries.ts`
  - Queries: user.profile.v1, user.conditions.v1, baseline.symptoms.v1

- [ ] **T048**: Create named mutations for data writes
  - Files: `src/lib/db/mutations.ts`
  - Mutations: onboarding.progress.v1, episode.create.v1, message.create.v1

---

## Phase 12: Agent Integration

- [X] **T049**: Create first message template generator (NO LLM)
  - Files: `src/lib/agent/templates.ts`
  - Function: generateFirstMessage(context: OnboardingContext)

- [ ] **T050**: Create intake agent activation hook
  - Files: `src/lib/agent/intake.ts`
  - Function: normalizeBaseline(data: BaselineData) → structured episode

---

## Phase 13: Polish & Validation

- [X] **T051**: Add Moti entrance animations to all onboarding screens
  - Files: All `src/app/(onboarding)/*.tsx` files
  - Animations: Fade + stagger for chips/cards

- [X] **T052**: Add keyboard-aware behavior to input screens
  - Files: `src/app/(onboarding)/conditions.tsx`, `src/components/onboarding/StepContainer.tsx`

- [ ] **T053**: Add shake animation for max selection validation
  - Files: `src/app/(onboarding)/conditions.tsx`
  - Trigger: When user tries to select 4th condition

- [ ] **T054**: Verify all screens render correctly on iOS + Android
  - Manual testing on Expo Go

---

## Definition of Done Checklist

- [X] All 6 onboarding screens implemented and navigable (1A → 1B → 1C → 2 → 3 → 4)
- [ ] Designs match reference images (pixel-perfect)
- [X] Data persists per-screen to MMKV (SQLite pending PowerSync setup)
- [X] First message is template-generated (no LLM call)
- [ ] Baseline triggers intake agent normalization
- [ ] Works on iOS simulator + Android emulator
- [X] No TypeScript errors (except pre-existing test file)
- [X] No ESLint warnings

---

## Task Dependencies

```
T001-T004 (deps) → T005-T009 (foundation) → T010-T020 (components)
                                                    ↓
T021-T023 (routing) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←┘
        ↓
T024-T026 (Screen 1A) → T027-T028 (Screen 1B) → T029-T031 (Screen 1C)
                                                        ↓
T032-T033 (Screen 2) → T034-T036 (Screen 3) → T037-T038 (Screen 4)
                                                        ↓
T039-T044 (Chat Tab) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┘
        ↓
T045-T048 (Database) → T049-T050 (Agent) → T051-T054 (Polish)
```

**Parallel Tasks [P]**: T016, T017, T018, T019 can run simultaneously.

---

## References

- [Specification](./spec.md)
- [Implementation Plan](./PLAN.md)
- [Constitution](../../.specify/memory/constitution.md)
- [Design System](../../.claude-skills/frontend-design/SKILL.md)

