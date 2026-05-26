---
name: brand-guidelines
description: Unified brand identity for Clue Symptom Tracker. Combines visual design (Podia-inspired warmth) with voice/tone (Compassionate Analyst). Use when ensuring brand consistency across UI, copy, marketing, or any user-facing content. Essential reference for maintaining the energy-conscious, validation-first experience Spoonies need.
license: Complete terms in LICENSE.txt
---

# Clue Brand Guidelines

This skill defines the unified brand identity for Clue Symptom Tracker — a prediction-first app for people with chronic, energy-limiting conditions.

## Brand Essence

**Taglines:**
"Track symptoms without draining your energy"
"Low-effort, non-judgmental, flexible symptom tracking that works on bad days and doesn’t create guilt"
"Predict your next flare before it hits."

**Persona:** The **Compassionate Analyst** — warm and understanding, but also capable and trustworthy. Not a taskmaster. Not toxic positivity. Data-driven empathy.

**Target Audience:** "Spoonies" — people with ME/CFS, Fibromyalgia, POTS, Long COVID, Endometriosis, etc. who have limited cognitive and physical reserves.

---

## Visual Identity

### Color Palette

```
Primary Colors
──────────────────────────────────────────
primary:          #20132E   // Dark navy - text, buttons, user chat bubbles
primary-light:    #F3F0FA   // Very light purple - hover states

Backgrounds
──────────────────────────────────────────
background-light: #FDFBF9   // Warm cream - main background (NEVER pure white)
card-light:       #FFFFFF   // White - card surfaces
surface-light:    #FFFFFF   // White - elevated surfaces

Pastel Accents (decorative + functional)
──────────────────────────────────────────
accent-peach:     #E8974F   // Orange - energy, digestive, warmth
accent-blue:      #A4C8D8   // Blue - sleep, calm, decorative blobs
accent-purple:    #D0BDF4   // Purple - selected states, progress
accent-mint:      #B8E3D6   // Teal - positive states, Focus badge

Selection States
──────────────────────────────────────────
pill-hover:       #F3EFFF   // Light purple hover
pill-selected:    #E0D4FC   // Purple selected background

Text
──────────────────────────────────────────
text-main:        #20132E   // Dark navy
text-muted:       #554B66   // Muted purple-gray
```

### Typography

| Role        | Font             | Weights            | Usage                        |
| ----------- | ---------------- | ------------------ | ---------------------------- |
| **Display** | Fraunces (serif) | 300, 600           | Headlines, emotional moments |
| **Body**    | Inter / DM Sans  | 400, 500, 600, 700 | UI text, buttons, body copy  |

**Sizing:**

- Display headlines: 34-40px, Fraunces semibold, tight leading
- Body text: 16-18px, Inter/DM Sans, relaxed leading
- Labels: 12-14px, Inter, uppercase tracking for section labels

### Spacing & Radius

```
Border Radius
──────────────────────────────────────────
DEFAULT:    12px        // Standard elements
xl:         16px        // Cards
2xl:        24px        // Large cards
3xl:        32px        // Chat bubbles
pill:       9999px      // Pills, buttons

Shadows
──────────────────────────────────────────
soft:       0 4px 20px -2px rgba(0, 0, 0, 0.05)
card:       0 2px 12px -2px rgba(32, 20, 69, 0.05)
```

### Visual Elements

**Decorative Blobs:** Soft, positioned absolutely, pointer-events-none. Create warmth without distraction.

**No Emojis:** Icons only. Emojis feel juvenile and inconsistent across platforms.

**Neutral Intensity:** Never color-code judgment (red = bad). Use neutral indicators for symptom scales.

---

## Voice & Tone

### Five Core Principles

#### 1. Reduce Cognitive Load

Brain fog makes processing exhausting. Every word earns its place.

| ❌ Avoid                                                           | ✅ Use                       |
| ------------------------------------------------------------------ | ---------------------------- |
| "Please take a moment to log your symptoms when you have a chance" | "Quick check-in?"            |
| "Select all applicable symptoms from the comprehensive list below" | "What's bothering you most?" |

**Rules:** Simple language. One question per screen. 30-second max check-ins.

#### 2. Validate, Don't Dismiss

Users have been told "it's all in your head." Every interaction signals: we believe you.

| ❌ Avoid                | ✅ Use                                |
| ----------------------- | ------------------------------------- |
| "Try to stay positive!" | "That sounds incredibly challenging." |
| "It's probably just..." | "I hear you."                         |

**Rules:** Acknowledge difficulty explicitly. Never minimize or reframe their experience.

#### 3. Permission, Not Restriction

Empower choice, don't impose limitations. Users already feel restricted by their conditions.

| ❌ Avoid                 | ✅ Use                        |
| ------------------------ | ----------------------------- |
| "You should rest"        | "Rest might help today"       |
| "You need to track this" | "You might want to note this" |

**Rules:** Frame as suggestions. Use "might", "could", "when you're ready".

#### 4. Neutral, Not Judgmental

The app must never make users feel worse about bad days.

| ❌ Avoid                 | ✅ Use                      |
| ------------------------ | --------------------------- |
| "Bad day"                | "High intensity day"        |
| "You only logged 2 days" | "You logged 2 days"         |
| Pain: 😢                 | Pain: ● (neutral indicator) |

**Rules:** No sad emojis. No streak gamification. 6/10 might be a victory — don't assume.

#### 5. Personalize for Connection

Generic messages feel cold. Reference their specific context.

| ❌ Avoid              | ✅ Use                                     |
| --------------------- | ------------------------------------------ |
| "Track your symptoms" | "How's the fatigue today?"                 |
| "Check your insights" | "Your sleep patterns are ready to explore" |

---

## Word Swaps (Quick Reference)

| Clinical/Cold       | Warm/Human           |
| ------------------- | -------------------- |
| Symptom severity    | How intense          |
| Log your data       | Quick check-in       |
| Submit              | Save                 |
| Patient             | You                  |
| Chronic illness     | What you're managing |
| Compliance          | Consistency          |
| Baseline assessment | Starting point       |
| Track               | Note / Capture       |
| Analyze             | Understand           |
| Data visualization  | Your patterns        |

---

## Tone Adaptation (Traffic Light)

### 🟢 Good Day

User seems energetic. Can use slightly longer copy, offer more options.

- "Want to explore your patterns? We found something interesting."

### 🟡 Moderate

User shows fatigue signs. Simplify, shorten.

- "Quick check-in?"
- "Just the basics today?"

### 🔴 Flare/Crisis

User is struggling. Minimal words, maximum support.

- "Got it."
- "Rest up."
- "We're here."

---

## Anti-Patterns (NEVER Use)

### Visual

- ❌ Pure white backgrounds (use warm cream #FDFBF9)
- ❌ Sharp corners on cards (always round 16px+)
- ❌ Heavy drop shadows
- ❌ Emojis (use icons from design system)
- ❌ Judgmental iconography (sad faces, red = bad)
- ❌ Small touch targets (minimum 48px)

### Copy

- ❌ "You broke your streak!"
- ❌ "You haven't logged in X days"
- ❌ "Stay positive!"
- ❌ "Mind over matter"
- ❌ "It's probably nothing"
- ❌ "Submit symptom log" (clinical coldness)

### UX

- ❌ Streak gamification
- ❌ Points/badges/leaderboards
- ❌ Required daily logging
- ❌ Multiple text inputs per screen
- ❌ Dense forms
- ❌ Aggressive animations

---

## Brand Application Examples

### Insight Message

```
✅ "Noticed something: your migraines often follow poor sleep by 48 hours."
❌ "Data analysis shows a 73% correlation between sleep deficit and migraine onset."
```

### Flare Mode Entry

```
✅ "Got it. Rest up. Logging basics only."
❌ "Flare mode activated. Required metrics will still be tracked."
```

### Error State

```
✅ "Couldn't save that one. It's stored locally — we'll sync when we can."
❌ "Error: Network request failed. Retry?"
```

### Doctor Pack Export

```
✅ "Your report is ready. Show your doctor what your days really look like."
❌ "PDF export complete. 47 data points included."
```

---

## Design System References

- **Full visual patterns:** `.claude-skills/frontend-design/SKILL.md`
- **Full copy guidelines:** `.claude-skills/spoonie-copywriter/SKILL.md`
- **Design source images:** `all-ui-images-and-code/`
- **Design philosophy:** `context/design-inspiration-overview.md`
