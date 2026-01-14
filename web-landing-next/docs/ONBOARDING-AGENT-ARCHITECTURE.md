# Onboarding Agent Architecture

> Technical architecture for the AI-powered onboarding conversion system.

## Overview

The Onboarding Agent answers **two critical questions**:

| Question                        | Asked By              | When                         | Output                                 |
| ------------------------------- | --------------------- | ---------------------------- | -------------------------------------- |
| "Why should this user sign up?" | `web-landing-next`    | Pre-conversion (modal)       | WatchListPreview component             |
| "Why did this user sign up?"    | `Clue Agent` (mobile) | Post-conversion (first open) | Conversion context for personalization |

```
User Journey:
Ad Click → Landing Page → Modal Q1-Q4 → WatchListPreview → CTA → Google Sign-in → Mobile App
   ↓            ↓             ↓              ↓               ↓                        ↓
  UTM       Session      Responses      AI-generated     Conversion              Clue asks:
captured    created       saved         copy + UI        context stored       "Why did they
                                                                               sign up?"
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLUE AGENT SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        ONBOARDING AGENT                                │ │
│  │              Location: web-landing-next/src/backend/agents/onboarding  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │ │
│  │   │  Context    │    │    Copy     │    │     Component           │   │ │
│  │   │  Assembler  │───▶│  Generator  │───▶│     Renderer            │   │ │
│  │   │             │    │  (Gemini)   │    │   (Template-based)      │   │ │
│  │   │             │    │             │    │                         │   │ │
│  │   │ Inputs:     │    │ Outputs:    │    │ Outputs:                │   │ │
│  │   │ - UTM       │    │ - Headline  │    │ - WatchListPreview      │   │ │
│  │   │ - Ad copy   │    │ - Watch     │    │ - Graphs (fake data)    │   │ │
│  │   │ - LP copy   │    │   items     │    │ - CTA button            │   │ │
│  │   │ - Persona   │    │ - CTA text  │    │                         │   │ │
│  │   │ - Q1-Q4     │    │             │    │                         │   │ │
│  │   └─────────────┘    └─────────────┘    └─────────────────────────┘   │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        FUTURE AGENTS                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │  Tracking   │  │  Insights   │  │   Doctor    │  │    Chat     │  │ │
│  │  │   Agent     │  │   Agent     │  │   Agent     │  │   Agent     │  │ │
│  │  │ (daily logs)│  │ (patterns)  │  │ (reports)   │  │ (widgets)   │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
web-landing-next/src/backend/
├── agents/
│   └── onboarding/
│       ├── CLAUDE.md              # Agent documentation
│       ├── index.ts               # Main entry point
│       ├── types.ts               # TypeScript interfaces
│       ├── actions.ts             # Next.js Server Actions
│       │
│       ├── context/
│       │   └── assembler.ts       # Fetches user journey context
│       │
│       ├── generators/
│       │   ├── copy.ts            # Gemini copy generation
│       │   └── summary.ts         # OpenAI summary (existing)
│       │
│       ├── templates/
│       │   ├── watch-list.ts      # WatchListPreview template data
│       │   └── graphs.ts          # Fake graph data generators
│       │
│       └── prompts/
│           └── conversion-copy.md # Gemini prompt template
│
├── lib/
│   ├── ai/
│   │   ├── gemini.ts              # Gemini client configuration
│   │   └── openai.ts              # OpenAI client (existing)
│   │
│   └── supabase.ts                # Supabase client (shared)
│
└── components/
    └── WatchListPreview/
        ├── index.tsx              # Main component
        ├── FlareRiskGraph.tsx     # 7-day prediction chart
        ├── SymptomPatternGraph.tsx# Pattern visualization
        └── MedicationTimeline.tsx # Timing optimization
```

---

## Data Flow

### 1. Context Assembly

```typescript
// context/assembler.ts
export async function assembleContext(
  supabase: SupabaseClient,
  modalSessionId: string
): Promise<UserConversionContext> {
  const [sessionData, responses] = await Promise.all([
    fetchSessionData(supabase, modalSessionId),
    fetchModalResponses(supabase, modalSessionId),
  ]);

  const [ad, landing, persona] = await Promise.all([
    fetchAdContext(supabase, sessionData.utm.content),
    fetchLandingContext(supabase, sessionData.productOffering),
    fetchPersonaContext(supabase, sessionData.personaShown),
  ]);

  return {
    sessionId: sessionData.sessionId,
    modalSessionId,
    utm: sessionData.utm,
    ad,
    landingPage: landing,
    persona,
    answers: responses,
    deviceType: sessionData.deviceType,
  };
}
```

### 2. Copy Generation (Gemini)

```typescript
// generators/copy.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateCopy(
  context: UserConversionContext
): Promise<GeneratedCopy> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = buildCopyPrompt(context);
  const result = await model.generateContent(prompt);

  return parseCopyResponse(result.response.text());
}
```

### 3. Template Rendering

```typescript
// templates/watch-list.ts
export function getWatchListTemplate(condition: string): WatchListTemplateData {
  return {
    graphs: {
      flareRisk: generateFakeFlareRisk(),
      symptomPatterns: generateFakePatterns(condition),
      medicationTiming: generateFakeTiming(),
    },
  };
}
```

### 4. Server Action (Entry Point)

```typescript
// actions.ts
'use server';

import { assembleContext } from './context/assembler';
import { generateCopy } from './generators/copy';
import { getWatchListTemplate } from './templates/watch-list';
import { createClient } from '@/lib/supabase/server';

export async function generateWatchListPreview(modalSessionId: string) {
  const supabase = await createClient();

  // 1. Get all user context
  const context = await assembleContext(supabase, modalSessionId);

  // 2. Generate personalized copy
  const copy = await generateCopy(context);

  // 3. Get template with fake graphs
  const template = getWatchListTemplate(context.answers.q1.answerValue);

  // 4. Log for analytics
  await logAIGeneration(supabase, modalSessionId, copy);

  return {
    headline: copy.headline,
    watchItems: copy.watchItems,
    graphs: template.graphs,
    cta: {
      text: copy.ctaText,
      action: 'google_signin' as const,
    },
  };
}
```

---

## WatchListPreview Component

### Props Interface

```typescript
interface WatchListPreviewProps {
  headline: string;
  watchItems: [string, string, string];
  graphs: {
    flareRisk: FlareRiskData;
    symptomPatterns: PatternData;
    medicationTiming: TimingData;
  };
  cta: {
    text: string;
    action: 'google_signin';
  };
  onCTAClick: () => void;
}
```

### Component Structure

```tsx
export function WatchListPreview({
  headline,
  watchItems,
  graphs,
  cta,
  onCTAClick,
}: WatchListPreviewProps) {
  return (
    <div className="watch-list-container">
      {/* Headline - NO subtitle */}
      <h2 className="watch-list-headline">{headline}</h2>

      {/* Watch Card */}
      <div className="watch-list-card">
        <h3>YOUR NEXT 7 DAYS</h3>

        {/* Graphs */}
        <FlareRiskGraph data={graphs.flareRisk} />

        {/* Watch Items */}
        <div className="watch-items">
          <p className="watch-label">Watching for:</p>
          <ul>
            {watchItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Status */}
        <p className="watch-status">First insight in ~3 days</p>
      </div>

      {/* CTA - First Person */}
      <button onClick={onCTAClick} className="watch-cta">
        {cta.text}
      </button>
    </div>
  );
}
```

---

## Multi-Model Pipeline

### Current Implementation (Template-based)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Context   │    │   Gemini    │    │  Template   │
│  Assembler  │───▶│ (Copy Gen)  │───▶│  Renderer   │
│             │    │             │    │             │
│ All user    │    │ Headlines,  │    │ React       │
│ journey     │    │ watch items,│    │ components  │
│ data        │    │ CTA text    │    │ + graphs    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Future Implementation (streamUI)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Context   │    │   Claude    │    │  streamUI   │
│  Assembler  │───▶│ (Full Gen)  │───▶│  Renderer   │
│             │    │             │    │             │
│ All user    │    │ Copy +      │    │ Streaming   │
│ journey     │    │ component   │    │ React       │
│ data        │    │ decisions   │    │ components  │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## Skills Integration

The agent uses these skills for consistent output:

| Skill                | Usage                                         |
| -------------------- | --------------------------------------------- |
| `frontend-design`    | Component styling, color palette, typography  |
| `spoonie-copywriter` | Copy tone, validation language, no guilt      |
| `brand-guidelines`   | Visual consistency, anti-patterns             |
| `chat-widgets`       | Widget patterns (for future chat integration) |

### Skill Application

```typescript
// In copy generator prompt
const SKILL_CONSTRAINTS = `
## Tone (spoonie-copywriter)
- Warm but not cheesy
- Validate, don't dismiss
- Permission, not restriction
- First person CTAs

## Visual (frontend-design)
- NO emojis (use icons)
- Warm cream backgrounds
- Soft shadows, rounded corners

## Copy (brand-guidelines)
- "High intensity day" not "bad day"
- "Quick check-in" not "log your data"
- Personalize to their condition
`;
```

---

## Database Schema

### Tables Used

```sql
-- Read
SELECT * FROM campaign_config WHERE config_type IN ('ad', 'landing', 'persona');
SELECT * FROM landing_visits WHERE id = ?;
SELECT * FROM modal_sessions WHERE id = ?;
SELECT * FROM modal_responses WHERE modal_session_id = ?;

-- Write (pre-conversion)
INSERT INTO ai_generations (
  modal_session_id,
  session_id,
  generated_headline,
  generated_watch_items,
  generated_cta,
  model_used,
  was_converted
) VALUES (...);

-- Write (post-conversion)
INSERT INTO user_conversion_context (...) VALUES (...);
```

### New Table: user_conversion_context

Stores full context for Clue Agent to retrieve after sign-up:

```sql
CREATE TABLE user_conversion_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  modal_session_id UUID REFERENCES modal_sessions(id),

  -- Attribution
  utm_source TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  ad_headline TEXT,
  landing_page TEXT NOT NULL,

  -- User's stated needs (Q1-Q4)
  condition_primary TEXT NOT NULL,      -- Q1 value: "fatigue"
  condition_label TEXT NOT NULL,        -- Q1 label: "Fatigue that won't quit"
  pain_point TEXT NOT NULL,             -- Q2 value
  pain_point_label TEXT NOT NULL,       -- Q2 label
  product_need TEXT,                    -- Q3 answer
  desired_outcome TEXT,                 -- Q4 answer

  -- The promise we made
  generated_headline TEXT NOT NULL,
  generated_watch_items TEXT[] NOT NULL,
  generated_cta TEXT NOT NULL,

  -- Promise category for tracking
  promise_category TEXT NOT NULL,       -- 'prediction', 'trigger_discovery', etc.

  -- Metadata
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  conversion_method TEXT NOT NULL,      -- 'google_signin', 'email_create'

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Index for fast lookup by user
CREATE INDEX idx_conversion_context_user ON user_conversion_context(user_id);
```

---

## Clue Agent Integration

When user opens the mobile app for the first time, Clue Agent:

```typescript
// In mobile app's first-run flow
async function handleFirstLogin(userId: string) {
  // Ask onboarding agent: "Why did this user sign up?"
  const context = await fetch('/api/onboarding/conversion-context', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }).then((r) => r.json());

  // Now Clue can personalize the experience
  if (context.promiseMade) {
    // Show: "Welcome! You signed up to predict your fatigue crashes."
    // Instead of: "Welcome! Let's set up your tracker."

    // Pre-configure their focus based on Q1/Q2
    await setUserFocus(context.condition.primary);

    // Generate first message that delivers on the promise
    const firstMessage = generateWelcomeMessage(context);
  }
}

function generateWelcomeMessage(context: ConversionContext): string {
  // Use the SAME language that converted them
  return (
    `Welcome! You signed up because "${context.condition.painPoint}". ` +
    `Let's set up your ${context.promiseMade.watchItems[0]} right now.`
  );
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Models
OPENAI_API_KEY=...          # For summary generation
GEMINI_API_KEY=...          # For copy generation
ANTHROPIC_API_KEY=...       # For future streamUI

# Feature Flags
NEXT_PUBLIC_USE_AI_COPY=true
NEXT_PUBLIC_USE_STREAM_UI=false  # Future
```

---

## API Reference

### Interface 1: Pre-Conversion (web-landing-next → Agent)

**Question:** "Why should this user sign up?"

```typescript
// Server Action - called by modal when user reaches final step
export async function generateWatchListPreview(
  modalSessionId: string
): Promise<WatchListData>;

// Returns personalized UI data
interface WatchListData {
  headline: string;
  watchItems: [string, string, string];
  graphs: GraphData;
  cta: { text: string; action: 'google_signin' };
}
```

### Interface 2: Post-Conversion (Clue Agent → Onboarding Agent)

**Question:** "Why did this user sign up?"

```typescript
// API endpoint - called by mobile app on first login
export async function getConversionContext(
  userId: string
): Promise<ConversionContext>;

// Returns everything needed for personalization
interface ConversionContext {
  source: {
    adHeadline: string | null;
    landingPage: string;
    utmCampaign: string | null;
  };
  condition: {
    primary: string; // "Fatigue that won't quit"
    painPoint: string; // "I pay for today's effort tomorrow"
  };
  desiredOutcome: string; // Q4 answer
  promiseMade: {
    headline: string;
    watchItems: string[];
    ctaClicked: string;
  };
  suggestedFirstMessage: string;
}
```

### Supporting Actions

```typescript
// Store context after conversion
storeConversionContext(modalSessionId: string, userId: string): Promise<void>

// Generate summary (existing, used by SummaryStep)
generateSummary(context: UserContext, apiKey: string): Promise<SummaryResult>

// Mark conversion for analytics
markAIGenerationConverted(sessionId: string, method: string): Promise<void>
```

### Types

```typescript
// Full type definitions in types.ts
interface UserConversionContext { ... }
interface GeneratedCopy { ... }
interface WatchListData { ... }
interface StoredConversionContext { ... }
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/context-assembler.test.ts
describe('Context Assembler', () => {
  it('fetches all context for valid session', async () => {
    const context = await assembleContext(mockSupabase, 'session_123');
    expect(context.answers.q1).toBeDefined();
    expect(context.utm).toBeDefined();
  });

  it('returns defaults for missing data', async () => {
    const context = await assembleContext(mockSupabase, 'invalid');
    expect(context.answers.q1.answerValue).toBe('flares');
  });
});
```

### Integration Tests

```typescript
// __tests__/watch-list-preview.test.ts
describe('WatchList Preview Generation', () => {
  it('generates personalized copy', async () => {
    const result = await generateWatchListPreview('session_123');
    expect(result.headline).not.toContain('Based on what you told us');
    expect(result.cta.text).toMatch(/^(Save my|Know my|Start my)/);
  });
});
```

---

## Migration from summary-generation-agent

The existing `summary-generation-agent/` folder will be:

1. **Moved** to `web-landing-next/src/backend/agents/onboarding/`
2. **Restructured** into the new folder layout
3. **Extended** with:
   - Copy generator (Gemini)
   - WatchList templates
   - Graph generators
4. **Integrated** with existing modal flow

### Migration Checklist

- [ ] Move `types.ts` → `backend/agents/onboarding/types.ts`
- [ ] Move `context-assembler.ts` → `backend/agents/onboarding/context/assembler.ts`
- [ ] Move `summary-generator.ts` → `backend/agents/onboarding/generators/summary.ts`
- [ ] Create new `generators/copy.ts` (Gemini)
- [ ] Create `templates/watch-list.ts`
- [ ] Create `templates/graphs.ts`
- [ ] Update imports in `SummaryStep.tsx`
- [ ] Delete old `summary-generation-agent/` folder

---

_Last Updated: January 12, 2026_
