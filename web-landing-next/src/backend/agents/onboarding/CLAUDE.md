# Onboarding Agent

> AI agent that converts landing page visitors into signed-up users by generating hyper-personalized UI components and copy based on their complete journey context.

## Purpose

The Onboarding Agent answers **two critical questions**:

### 1. "Why should this user sign up?" (Pre-Conversion)

**Asked by:** `web-landing-next` via API/Server Action

Transform the onboarding experience into a **context-rich, AI-generated conversion flow** that leverages ALL user data to maximize signup conversion.

**Output:** WatchListPreview with personalized:

- Headline that speaks to their specific pain (Q2)
- "Watching for" items tailored to their condition (Q1)
- Graphs showing what predictions COULD look like
- First-person CTA ("Save my progress", "Know my flare")

### 2. "Why did this user sign up?" (Post-Conversion)

**Asked by:** `Clue Agent` (main app) when user opens the mobile app

Provide stored context about what converted them so the app can personalize their experience immediately.

**Output:** User conversion context including:

- Which ad/landing page resonated with them
- What condition they're managing (Q1)
- What pain point drove them to sign up (Q2)
- What outcome they want (Q4)
- Which generated copy converted them
- The promise we made (so we can deliver on it)

---

**Primary Goal:** Convert users by showing personalized previews, then give the main app everything it needs to deliver on that promise from day one.

---

## Agent Hierarchy

```
CLUE AGENT (Main Orchestrator)
└── onboarding-agent (this agent)
    ├── Context Assembler  → Fetches user journey data
    ├── Copy Generator     → Gemini creates personalized copy
    └── Component Renderer → Template-based UI (future: streamUI)
```

---

## What We Know About Users (Context Sources)

| Source           | Data                         | DB Table                                  | Key Fields                                           |
| ---------------- | ---------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| **Ad Campaign**  | Which ad brought them        | `campaign_config` (config_type='ad')      | headline, description, cta                           |
| **Landing Page** | Product + messaging they saw | `campaign_config` (config_type='landing') | h1, h2, cta, empathy_copy                            |
| **Persona**      | Who they connected with      | `campaign_config` (config_type='persona') | story, description (NOT name)                        |
| **UTM Params**   | Campaign attribution         | `landing_visits`                          | utm_source, utm_campaign, utm_content                |
| **Q1 Answer**    | What brought them here       | `modal_responses`                         | fatigue, flares, migraines, ibs_gut, multiple, other |
| **Q2 Answer**    | Their hardest pain point     | `modal_responses`                         | contextual to Q1                                     |
| **Q3 Answer**    | Product-specific question    | `modal_responses`                         | varies by product                                    |
| **Q4 Answer**    | Desired outcome              | `modal_responses`                         | varies by product                                    |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING AGENT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐   ┌────────────────────┐   ┌──────────────────┐ │
│  │ Context           │   │ Copy               │   │ Component        │ │
│  │ Assembler         │──▶│ Generator          │──▶│ Renderer         │ │
│  │                   │   │ (Gemini)           │   │ (Templates)      │ │
│  │ - Fetch UTM       │   │                    │   │                  │ │
│  │ - Fetch Ad Copy   │   │ - Headlines        │   │ - WatchListPreview│
│  │ - Fetch LP Copy   │   │ - Watch Items      │   │ - SummaryCard    │ │
│  │ - Fetch Persona   │   │ - CTA text         │   │ - Graphs (fake)  │ │
│  │ - Fetch Q1-Q4     │   │ (first person)     │   │                  │ │
│  └───────────────────┘   └────────────────────┘   └──────────────────┘ │
│                                                                         │
│  Skills Used:                                                           │
│  ├── .claude-skills/frontend-design/     (component styling)            │
│  ├── .claude-skills/spoonie-copywriter/  (copy tone)                    │
│  ├── .claude-skills/brand-guidelines/    (visual consistency)           │
│  └── .claude-skills/chat-widgets/        (widget patterns)              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File                      | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `types.ts`                | TypeScript interfaces for context and output       |
| `context/assembler.ts`    | Fetches all user context from Supabase             |
| `generators/copy.ts`      | Calls Gemini with context, returns structured copy |
| `generators/summary.ts`   | Existing summary generator (OpenAI)                |
| `templates/watch-list.ts` | WatchListPreview template configuration            |
| `actions.ts`              | Next.js Server Actions entry point                 |

---

## Output: WatchListPreview Component

The main conversion UI showing personalized predictions preview:

```typescript
interface WatchListPreviewProps {
  // Personalized headline (no subtitle)
  headline: string;

  // "Watching for:" items (3 personalized to Q1-Q4)
  watchItems: [string, string, string];

  // Graph data (fake preview)
  graphs: {
    flareRisk: FlareRiskData; // 7-day prediction
    symptomPatterns: PatternData; // Based on Q1 selection
    medicationTiming: TimingData; // Optimization preview
  };

  // CTA (first person)
  cta: {
    text: string; // "Save my progress" / "Know my flare"
    action: 'google_signin';
  };
}
```

### Graph Types (Fake Preview Data)

Since users haven't logged anything yet, graphs show simulated previews:

```typescript
// Flare Risk: 7-day forecast with one "elevated" day
interface FlareRiskData {
  days: Array<{
    date: string;
    risk: 'low' | 'elevated' | 'high';
    label: string;
  }>;
}

// Symptom Patterns: Based on Q1 condition
interface PatternData {
  condition: string;
  pattern: 'energy' | 'pain' | 'migraine' | 'gut';
  preview: number[]; // 7 values
}

// Medication Timing: Shows optimization potential
interface TimingData {
  medications: Array<{
    name: string;
    currentTime: string;
    optimizedTime: string;
  }>;
}
```

---

## Copy Generation Pipeline

### Input (from Context Assembler)

```typescript
interface CopyGenerationInput {
  // User's condition/symptom focus
  q1: { value: string; label: string };

  // Their specific pain point
  q2: { value: string; label: string };

  // Product-specific answers
  q3: { value: string; label: string };
  q4: { value: string; label: string };

  // Ad/landing context
  adHeadline: string | null;
  productOffering: string;
}
```

### Output (from Gemini)

```typescript
interface GeneratedCopy {
  // Main headline for WatchListPreview
  headline: string;

  // Three "Watching for:" items
  watchItems: [string, string, string];

  // CTA text (first person)
  ctaText: string;
}
```

### Prompt Template (Gemini)

```markdown
You are a conversion copywriter for Chronic Life, a symptom tracker.

## User Context

- Condition: {{q1.label}}
- Pain point: {{q2.label}}
- What they want: {{q4.label}}
- Product: {{productOffering}}

## Generate

1. **Headline**: Speak to their Q2 pain point + promise prediction
2. **Watch Items**: 3 things we'll monitor for THEM (specific to Q1)
3. **CTA**: First person, action-oriented ("Save my progress", "Know my flare")

## Rules

- NO emoji
- NO "Based on what you told us" (removed per design)
- First person CTA only
- Warm but not cheesy
- Specific to their condition, not generic
```

---

## Important Constraints

### DO:

- ✅ Use first-person CTAs ("Save my progress", "Know my flare")
- ✅ Reference user's specific condition (Q1) and pain point (Q2)
- ✅ Show fake but realistic preview graphs
- ✅ Mirror ad/landing page language they resonated with
- ✅ Make it feel like the app already understands them

### DON'T:

- ❌ Use "Based on what you told us" subtitle (removed)
- ❌ Use persona names (internal language)
- ❌ Use generic "chronic illness" language
- ❌ Use emojis (brand guideline)
- ❌ Third person CTAs ("Save your progress")
- ❌ Make claims that feel like marketing fluff

---

## API: Two Interfaces

### Interface 1: Pre-Conversion (web-landing-next → Onboarding Agent)

**Question:** "Why should this user sign up?"

```typescript
// Server Action called by web-landing-next modal
'use server';

export async function generateWatchListPreview(modalSessionId: string) {
  // 1. Assemble all user context
  const context = await assembleContext(modalSessionId);

  // 2. Generate personalized copy (Gemini)
  const copy = await generateCopy(context);

  // 3. Get template with fake graph data
  const template = getWatchListTemplate(context.answers.q1.answerValue);

  // 4. Store for post-conversion retrieval
  await storeConversionContext(modalSessionId, context, copy);

  return {
    ...template,
    headline: copy.headline,
    watchItems: copy.watchItems,
    cta: { text: copy.ctaText, action: 'google_signin' },
  };
}
```

**Usage in Modal:**

```tsx
import { WatchListPreview } from '@/components/WatchListPreview';

<WatchListPreview data={previewData} onCTAClick={handleGoogleSignIn} />;
```

---

### Interface 2: Post-Conversion (Clue Agent → Onboarding Agent)

**Question:** "Why did this user sign up?"

```typescript
// API endpoint or Server Action called by Clue main agent
export async function getConversionContext(
  userId: string
): Promise<ConversionContext> {
  // Fetch stored context from when they converted
  const context = await fetchStoredContext(userId);

  return {
    // What brought them
    source: {
      adHeadline: context.ad?.headline,
      landingPage: context.landingPage.productOffering,
      utmCampaign: context.utm.campaign,
    },

    // What they're managing
    condition: {
      primary: context.answers.q1.answerLabel, // "Fatigue that won't quit"
      painPoint: context.answers.q2.answerLabel, // "I pay for today's effort tomorrow"
    },

    // What they want
    desiredOutcome: context.answers.q4.answerLabel, // "Rest before it hits"

    // The promise we made (that converted them)
    promiseMade: {
      headline: context.generatedCopy.headline,
      watchItems: context.generatedCopy.watchItems,
      ctaClicked: context.generatedCopy.ctaText,
    },

    // For first-run personalization
    suggestedFirstMessage: generateFirstMessage(context),
  };
}
```

**Usage by Clue Agent (mobile app):**

```typescript
// When user opens app for first time after sign-up
const conversionContext = await getConversionContext(user.id);

// Clue agent can now say:
// "Welcome! You signed up to predict your fatigue crashes.
//  Let's set up your 48-hour early warning system."

// Instead of generic:
// "Welcome! Let's set up your symptom tracker."
```

---

## Supabase Tables

### Read:

- `campaign_config` - Ad copy, landing copy, personas
- `landing_visits` - UTM params, persona shown
- `modal_sessions` - Session context
- `modal_responses` - Q1-Q4 answers

### Write:

- `ai_generations` - Store generated copy + conversion tracking
- `user_conversion_context` - Full context for post-signup personalization

---

## Stored Conversion Context (for Clue Agent)

When a user converts, we store everything needed for personalization:

````typescript
interface StoredConversionContext {
  // User identifier (linked after Google sign-in)
  user_id: string;
  modal_session_id: string;

  // Attribution
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  ad_headline: string | null;
  landing_page: string;

  // User's stated needs (Q1-Q4)
  condition_primary: string;      // Q1: "fatigue", "flares", etc.
  condition_label: string;        // Q1: "Fatigue that won't quit"
  pain_point: string;             // Q2: "delayed_payback", etc.
  pain_point_label: string;       // Q2: "I pay for today's effort tomorrow"
  product_need: string;           // Q3 answer
  desired_outcome: string;        // Q4 answer

  // The promise we made (generated copy that converted them)
  generated_headline: string;
  generated_watch_items: string[];
  generated_cta: string;

  // Conversion metadata
  converted_at: timestamp;
  conversion_method: 'google_signin' | 'email_create';

  // For tracking promise delivery
  promise_category: 'prediction' | 'trigger_discovery' | 'validation' | 'pattern_finding';
}

---

## Future: Vercel AI SDK streamUI

Current implementation uses template-based rendering. Future migration to streamUI:

```typescript
// Future implementation
import { streamUI } from '@ai-sdk/rsc';

export async function streamWatchListPreview(context: UserContext) {
  return streamUI({
    model: anthropic('claude-sonnet-4-20250514'),
    prompt: buildPrompt(context),
    tools: {
      renderWatchList: {
        generate: async function* (params) {
          yield <LoadingPreview />;
          return <WatchListPreview {...params} />;
        },
      },
    },
  });
}
````

---

## Related Files

- `web-landing-next/src/components/modal/SummaryStep.tsx` - Current conversion step
- `web-landing-next/src/lib/tracking.ts` - UTM/session tracking
- `.claude-skills/frontend-design/SKILL.md` - Design system
- `.claude-skills/spoonie-copywriter/SKILL.md` - Copy guidelines
- `.claude-skills/brand-guidelines/SKILL.md` - Brand rules

---

_Last Updated: January 12, 2026_
