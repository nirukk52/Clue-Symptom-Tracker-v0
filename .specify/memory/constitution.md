# Clue Symptom Tracker Constitution

> The single source of truth for architectural decisions, design principles, and technical constraints.

## Core Principles

### I. Local-First, Evidence-Grounded

Every interaction writes to **local SQLite first** before cloud sync. This ensures:
- **Zero loading UI** for core interactions (check-ins, chat, history)
- **Offline-capable** tracking when users have low energy or poor connectivity
- **Deterministic retrieval** with evidence snapshots (exact row IDs + metric IDs) for doctor trust

**Source**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §1 Data Spine

### II. Energy-Conscious Design (NON-NEGOTIABLE)

Everything is designed for users with brain fog and limited energy:
- Quick Entry: **under 30 seconds** daily logging
- Flare Mode: **one-tap + optional 1-2 follow-ups** (never interrogate when depleted)
- Chat: accepts minimal input and gracefully moves on when user is exhausted
- Max **2 follow-ups per message** unless in Appointment Prep Mode

**Source**: [`context/Product-Spec.md`](../../context/Product-Spec.md) §Key UX Principles

### III. Doctor-Trust Output

Every clue, chart, and export must:
- Store **evidence_snapshot_id** with exact rows/metric IDs used
- Use **8 characteristics structure** for symptom summaries (OLDCARTS/OPQRST)
- Generate **clinician-shaped formatting** (graphs + tight structured paragraphs)
- Include **clear time windows** (14/30/90 days) + units + missing-data flags

**Source**: [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) §5 Doctor Trust Pack Requirements

### IV. Single Focus Hypothesis (MVP)

- **Strictly 1** active pinned hypothesis at a time
- Guided structure only: Feature dropdown → Outcome dropdown (no free-text)
- 7-day experiment window with progress tracking
- Multi-focus is explicitly **Later** scope

**Source**: [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) §11.1 Focus Hypothesis

### V. Widget Budget & Bloat Prevention

Quick Entry has **hard budgets**:
- Normal mode: **5-8 widgets max**
- Flare/wiped mode: **2-3 widgets max**
- Interaction target: **under 20-30 seconds**
- Auto-demotion if check-in completion ↓, median time ↑, or skip rate ↑

**Source**: [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) §10 System Features

---

## Technical Decisions

### Data Sync: PowerSync + Supabase

**Decision**: Use **PowerSync** for local-first sync with Supabase backend.

**Rationale**:
- Best fit for "no loading UI" requirement (local writes first, cloud later)
- Minimal custom sync plumbing
- Built for Supabase integration

**Source**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §1 Sync Options

### Query Layer Architecture

**Decision**: All database access goes through a **named, versioned query layer**.

```
sqlite.read(query_id, params)
sqlite.write(mutation_id, payload)
```

**Rationale**:
- Enables deterministic retrieval for evidence snapshots
- Supports regression testing (stable query IDs)
- Matches Agent-Architecture tooling model
- No free-form DB access

**Source**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §4 Tooling Model

### Styling: NativeWind (Tailwind for React Native)

**Decision**: Use **NativeWind** for styling in React Native.

**Rationale**:
- Pixel-perfect UI matching HTML designs
- Same mental model as web Tailwind
- Modern, well-maintained ecosystem
- Theming support for future dark mode / marketing campaigns

### Theming Architecture (SSOT)

**Decision**: Centralized theming in a single location, even though dark mode is not MVP.

**Location**: `src/lib/theme/` (or equivalent single source of truth)

**Scope**:
- Color tokens (primary, accents, backgrounds)
- Typography scale (font families, sizes, weights)
- Spacing/radius tokens
- Component variants

**Rationale**: Enables future dark mode, marketing campaigns, website design consistency without refactoring.

### Agent Activation Points

| Trigger | Agent | What Happens |
|---------|-------|--------------|
| Screen 3 "Save check-in" | **Intake Agent** | Widget data → structured episode/tags |
| Screen 4 "Start chatting" + first message | **Intake Agent** | Chat → structured data extraction |
| Any free-text input (flare, questions) | **Intake Agent** | Natural language → 8 characteristics |
| Day card materialization | **Timeline Agent** | Events → day summaries + flare boundaries |
| 3+ days of data | **Trend Agent** | Early signal computation |
| Clue qualification | **Clue Agent** | Evidence-backed insights |

**Source**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §2 Core Agents

---

## Design System

### Color Palette (Podia-Inspired)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#20132E` | Dark navy - text, buttons, user bubbles |
| `background-light` | `#FDFBF9` | Warm cream - main background |
| `card-light` | `#FFFFFF` | White - card surfaces |
| `accent-peach` | `#E8974F` | Orange blob, digestive category |
| `accent-blue` | `#A4C8D8` | Blue blob, sleep category |
| `accent-purple` | `#D0BDF4` | Purple blob, selected states |
| `accent-mint` | `#B8E3D6` | Teal - Focus badge |

**Source**: [`all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html`](../../all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html)

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | **Fraunces** | 600 | Headings, titles |
| Body | **Inter** | 400-600 | Body text, UI elements |

**Source**: [`context/design-inspiration-overview.md`](../../context/design-inspiration-overview.md)

### Visual Language

- **Rounded corners**: `16px-32px` (cards), `9999px` (pills/buttons)
- **Soft shadows**: `0 4px 20px -2px rgba(0,0,0,0.05)`
- **Decorative blobs**: Pastel shapes with blur, positioned absolutely
- **Gradient backgrounds**: From warm cream, via white, to transparent (bottom CTAs)

**Source**: [`all-ui-images-and-code/chat/code.html`](../../all-ui-images-and-code/chat/code.html)

---

## Data Persistence Rules

### Onboarding Data

| Rule | Decision |
|------|----------|
| Save timing | **Immediately per-screen** (for analytics) |
| Abandonment | **Start fresh** (no partial state resumption) |
| First write | Screen 1A condition selection |

**Rationale**: Need first user analytics even if onboarding incomplete, but partial state creates confusion.

### Event Logging

Every user interaction becomes an **event** with:
- `event_id`, `user_id`, `device_id`, `session_id`
- `ts_client`, `screen_id`, `event_type`
- `payload_json`, `pointers_json`
- `schema_version`

**Source**: [`context/Agent-Architecture-Technical.md`](../../context/Agent-Architecture-Technical.md) §6 Event Taxonomy

---

## Navigation Structure

### Onboarding Flow (Separate from Main App)

```
Screen 1A: "What are you managing?" (multi-select conditions)
    ↓
Screen 1B: "What matters most right now?" (single priority)
    ↓
Screen 1C: "Impact question" (Feature → Outcome)
    ↓
Screen 2: "Intent mode" (Awareness/Tracking/Insight/Action)
    ↓
Screen 3: First check-in widgets
    ↓
Screen 4: First value moment → "Start chatting"
    ↓
Chat Tab (main app)
```

### Main App Tabs

| Tab | Location | Status |
|-----|----------|--------|
| Chat | Primary view | MVP |
| History | Top-right tab button | Navigation TBD |
| Quick Entry | Top-right tab button | Navigation TBD |
| Analytics | Top-right tab button | Navigation TBD |

**Note**: Tab buttons positioned at top-right of Chat screen until navigation finalized.

---

## MVP Scope Boundaries

### Must Ship (v1)

- ✅ Expanded onboarding (1A, 1B, 1C, 2, 3, 4)
- ✅ Chat with 8-characteristics extraction + gentle prompts
- ✅ Dynamic widget system embedded in chat
- ✅ Personalized quick entry panel (auto-configured from chat)
- ✅ Flare Mode (manual + simple automatic, timestamps, compare)
- ✅ History calendar with day card stacks
- ✅ Analytics with Doctor View toggle
- ✅ Appointment Prep Mode (basic) + PDF export
- ✅ PowerSync local-first sync
- ✅ Evidence snapshots for all clues/exports

### Explicitly Deferred (Later)

- ❌ Node-edge graph visualization
- ❌ Multi-focus hypotheses
- ❌ Free-text hypothesis creation
- ❌ Health platform integrations (Apple Health, Google Fit)
- ❌ Provider portal connections
- ❌ Dark mode
- ❌ Advanced correlation/lag models

**Source**: [`context/Product-Spec.md`](../../context/Product-Spec.md) §MVP Scope

---

## Governance

- This constitution **supersedes** all other practices
- Amendments require: documentation, team approval, migration plan
- All PRs must verify compliance with constitution principles
- Use [`context/Agent-Requirements.md`](../../context/Agent-Requirements.md) for detailed agent behavior guidance

**Version**: 1.0.0 | **Ratified**: 2025-12-28 | **Last Amended**: 2025-12-28
