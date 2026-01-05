# Summary Generation Agent (Login Conversion Agent)

> AI agent that generates hyper-personalized conversion summaries based on user's complete journey context.

## Purpose

Transform the template-based summary into a **context-rich, AI-generated conversion hook** that leverages ALL user data to maximize signup conversion.

**Goal:** The more personalized the summary, the higher the conversion rate.

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
┌─────────────────────────────────────────────────────────────┐
│                  summary-generation-agent                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ Context          │    │ Summary          │               │
│  │ Assembler        │───▶│ Generator        │               │
│  │                  │    │ (LLM)            │               │
│  │ - Fetch UTM      │    │                  │               │
│  │ - Fetch Ad Copy  │    │ Uses prompt      │               │
│  │ - Fetch LP Copy  │    │ template with    │               │
│  │ - Fetch Persona  │    │ full context     │               │
│  │ - Fetch Q1-Q4    │    │                  │               │
│  └──────────────────┘    └────────┬─────────┘               │
│                                   │                         │
│                                   ▼                         │
│                        ┌──────────────────┐                 │
│                        │ Output:          │                 │
│                        │ - Title          │                 │
│                        │ - 3 Benefits     │                 │
│                        │ - CTA text       │                 │
│                        └──────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `src/types.ts`                  | TypeScript interfaces for context and output      |
| `src/context-assembler.ts`      | Fetches all user context from Supabase            |
| `src/summary-generator.ts`      | Calls LLM with context, returns structured output |
| `prompts/conversion-summary.md` | The prompt template (where the magic is)          |

---

## Output Format

```typescript
interface ConversionSummary {
  title: string; // "We'll give you a 48-hour heads up before your fatigue crashes"
  benefits: string[]; // 3 personalized benefits
  ctaText: string; // "Start predicting"
}
```

---

## Important Constraints

### DO:

- ✅ Reference the user's specific pain point (Q2 answer)
- ✅ Mirror the ad/landing page language they already resonated with
- ✅ Use the persona's story for social proof (NOT their name)
- ✅ Focus on the specific product value proposition
- ✅ Make it feel like the app already understands them

### DON'T:

- ❌ Use persona names (internal language)
- ❌ Use generic "we help with chronic illness" language
- ❌ Make claims that feel like marketing fluff
- ❌ Ignore the specific answers they gave

---

## Supabase Tables Used

### Read:

- `campaign_config` - Ad copy, landing copy, personas
- `landing_visits` - UTM params, persona shown
- `modal_sessions` - Session context
- `modal_responses` - Q1-Q4 answers

### Write:

- `ai_generations` - Store generated summary + conversion tracking

---

## Integration Point

Called from `web-landing/campaign-modal.js` in the `generateSummary()` function.

```javascript
// Old: Template-based
const summary = buildSummary();

// New: LLM-based
const context = await assembleContext(modalSessionId);
const summary = await generateSummary(context);
```

---

## Related Files

- `web-landing/campaign-modal.js` - Modal that calls this agent
- `web-landing/v2/MODAL-ONBOARDING-FLOW.md` - Question flow specification
- `web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md` - Campaign strategy

---

_Last Updated: January 4, 2026_
