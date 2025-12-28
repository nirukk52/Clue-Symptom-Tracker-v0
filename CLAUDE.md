# CLAUDE.md - Project Intelligence for Clue Symptom Tracker

> This file provides context for AI assistants working on this codebase.
> Read this first before making changes.

## Project Overview

Clue is a **local-first symptom tracker** for people with chronic conditions (endometriosis, PCOS, long COVID, etc.). It prioritizes **energy-conscious design** (brain fog friendly), **doctor-trust output** (evidence-grounded claims), and **zero loading UI** (local SQLite + cloud sync).

**Core Documents**:
- Product vision: [`context/Product-Spec.md`](./context/Product-Spec.md)
- Agent architecture: [`context/Agent-Architecture-Technical.md`](./context/Agent-Architecture-Technical.md)
- Constitution (SSOT): [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)
- Design system: [`.claude-skills/frontend-design/SKILL.md`](./.claude-skills/frontend-design/SKILL.md)

---

## Technical Stack (Decided)

### Core Framework
| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | **Expo SDK 52** + **Expo Router v4** | File-based routing |
| Language | **TypeScript (strict mode)** | Additional rules for agent/data layer |
| Styling | **NativeWind v4** (Tailwind for RN) | Custom components, no UI libraries |
| State | **Zustand** (app state) + **PowerSync** (data queries) | Separate concerns |
| Animations | **Moti** (wraps Reanimated) | Gentle transitions |
| Storage | **MMKV** (fast KV) + **PowerSync SQLite** (structured data) | Local-first |

### Data Layer
| Component | Technology | Notes |
|-----------|------------|-------|
| Local DB | **PowerSync SQLite** | Offline-first, reactive queries |
| ORM | **Raw SQL → Drizzle ORM** (migrate later) | Start simple, add type-safety as it grows |
| Cloud Sync | **PowerSync + Supabase** | Background sync, no loading UI |
| Auth | **Supabase Auth** | Anonymous auth for onboarding → convert later |

### Agent Pipeline
| Component | Approach | Notes |
|-----------|----------|-------|
| Execution | **Client-side (90%)** | Local-first, evidence-grounded |
| Chat UI | **Vercel AI SDK** | For message generation + summarization |
| First Message | **Template-based** | Deterministic, no LLM call |
| Core Pipeline | **Deterministic** | Named queries, golden fixtures |

### Testing
| Type | Tool | Focus |
|------|------|-------|
| Unit | **Jest** | Agent logic with golden DB fixtures |
| E2E | **Maestro** | Onboarding flow, critical paths |
| Component | **React Native Testing Library** | UI behavior |

---

## Project Structure

```
src/
├── app/                      # Expo Router screens
│   ├── (onboarding)/         # Onboarding flow (separate from tabs)
│   │   ├── _layout.tsx
│   │   ├── conditions.tsx    # Screen 1A
│   │   ├── priority.tsx      # Screen 1B
│   │   ├── intent.tsx        # Screen 1C
│   │   ├── impact.tsx        # Screen 2
│   │   ├── baseline.tsx      # Screen 3
│   │   └── first-chat.tsx    # Screen 4
│   └── (tabs)/               # Main app (after onboarding)
│       ├── _layout.tsx
│       ├── chat.tsx          # Primary tab
│       ├── history.tsx       # Placeholder
│       ├── quick-entry.tsx   # Placeholder
│       └── analytics.tsx     # Placeholder
├── components/
│   ├── ui/                   # Primitives (Button, Text, View, etc.)
│   ├── onboarding/           # Onboarding-specific components
│   │   ├── SelectionChip.tsx
│   │   ├── ProgressIndicator.tsx
│   │   ├── BackgroundBlobs.tsx
│   │   └── StepContainer.tsx
│   └── chat/                 # Chat components
│       ├── ChatBubble.tsx
│       ├── MessageInput.tsx
│       └── SuggestionPills.tsx
├── lib/
│   ├── db/                   # PowerSync + schema
│   │   ├── schema.ts         # Table definitions
│   │   ├── queries.ts        # Named queries (versioned)
│   │   ├── mutations.ts      # Named mutations
│   │   └── provider.tsx      # PowerSync provider
│   ├── store/                # Zustand stores
│   │   ├── onboarding.ts     # Onboarding state + persistence
│   │   └── user.ts           # User preferences
│   ├── agent/                # Agent pipeline
│   │   ├── intake.ts         # Free-text → structured data
│   │   ├── templates.ts      # First message templates
│   │   └── queries.ts        # Evidence queries
│   └── hooks/                # Custom hooks
├── types/                    # Shared TypeScript types
└── constants/                # App constants (conditions, intents, etc.)
```

---

## Code Conventions

### 1. Component Files
```typescript
/**
 * SelectionChip - Pill-shaped toggle for multi-select options
 * 
 * Why it exists: Onboarding screens need distinctive, accessible selection
 * UI that matches Podia-inspired design language.
 */
export function SelectionChip({ ... }: SelectionChipProps) { ... }
```

### 2. Database Queries (Named + Versioned)
```typescript
// lib/db/queries.ts
export const queries = {
  /** Get user's selected conditions for personalization */
  'user.conditions.v1': `
    SELECT * FROM user_conditions 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `,
  
  /** Get baseline symptoms for comparison */
  'baseline.symptoms.v1': `
    SELECT * FROM baseline_entries 
    WHERE user_id = ? AND type = 'symptom'
  `,
} as const;
```

### 3. Zustand Stores (with MMKV persistence)
```typescript
// lib/store/onboarding.ts
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 0,
      conditions: [],
      priority: null,
      intent: null,
      // ...
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

### 4. Agent Templates (Deterministic First Messages)
```typescript
// lib/agent/templates.ts
export function generateFirstMessage(context: OnboardingContext): string {
  const { conditions, priority, intent } = context;
  
  // Template-based, no LLM call
  return `I see you're managing ${formatConditions(conditions)}. ` +
    `Your focus is on "${priority}". ` +
    `Let's start with: ${getImpactQuestion(intent)}`;
}
```

---

## Design System Quick Reference

### Colors (CSS Variables)
```css
--primary: #20132E;           /* Dark navy - text, buttons */
--background-light: #FDFBF9;  /* Warm cream - main background */
--accent-peach: #E8974F;      /* Selection states */
--accent-blue: #A4C8D8;       /* Decorative blobs */
--accent-purple: #D0BDF4;     /* Highlights */
--text-muted: #666666;        /* Secondary text */
```

### Typography
- **Display**: Fraunces (serif) - emotional headings
- **Body**: Inter - clean readability
- **Sizes**: `text-4xl` (display), `text-lg` (body), `text-sm` (captions)

### Spacing
- Section gaps: `space-y-8`
- Element gaps: `space-y-4`
- Padding: `p-6` (containers), `px-4 py-3` (buttons/chips)

---

## Key Constraints

### NON-NEGOTIABLE
1. **No loading UI** for core interactions (check-ins, chat history)
2. **Evidence snapshots** for all agent claims (row IDs, metric IDs)
3. **Under 30 seconds** for daily logging
4. **Immediate per-screen saves** during onboarding (for analytics)
5. **Custom components** - no UI libraries (Podia-inspired design)

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2s
- Onboarding completion: < 3 minutes

---

## Development Workflow

### Feature Branches
```
1-onboarding-flow/
├── spec.md           # Feature specification
├── checklists/       # Quality gates
└── [implementation]  # Code changes
```

### Testing Priority
1. **Agent logic** - Golden DB fixtures, deterministic replay
2. **Onboarding E2E** - Maestro flows
3. **Data persistence** - SQLite + sync correctness

### Before Committing
- [ ] Run `pnpm lint` (ESLint + TypeScript)
- [ ] Run `pnpm test` (Jest)
- [ ] Check Expo Go on both iOS and Android
- [ ] Verify no loading spinners in core flows

---

## Common Patterns

### Local-First Data Write
```typescript
// Always write locally first, sync happens in background
await db.execute(mutations['episode.create.v1'], {
  id: generateId(),
  user_id: userId,
  timestamp: Date.now(),
  // ...
});
// PowerSync handles sync automatically
```

### Onboarding Step Persistence
```typescript
// Save immediately on each step (for analytics)
const saveStep = async (step: number, data: Partial<OnboardingData>) => {
  useOnboardingStore.setState({ step, ...data });
  await db.execute(mutations['onboarding.progress.v1'], { step, ...data });
};
```

### Evidence-Grounded Agent Response
```typescript
// Always include evidence snapshot
const response = {
  message: "Your fatigue increased 23% this week",
  evidence: {
    query_id: 'fatigue.weekly.v1',
    row_ids: ['ep_123', 'ep_456'],
    calculated_at: Date.now(),
  }
};
```

---

## Files to Read First

1. [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) - Architectural decisions
2. [`specs/1-onboarding-flow/spec.md`](./specs/1-onboarding-flow/spec.md) - Current feature spec
3. [`.claude-skills/frontend-design/SKILL.md`](./.claude-skills/frontend-design/SKILL.md) - Design system
4. [`context/Agent-Architecture-Technical.md`](./context/Agent-Architecture-Technical.md) - Agent pipeline

---

## Quick Commands

```bash
# Development
pnpm start           # Expo Go
pnpm ios             # iOS simulator
pnpm android         # Android emulator

# Quality
pnpm lint            # ESLint + TypeScript
pnpm test            # Jest
pnpm typecheck       # TypeScript only

# Build
pnpm build:android   # EAS Build (Android)
pnpm build:ios       # EAS Build (iOS)
```

