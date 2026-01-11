---
name: spoonie-copywriter
description: Write empathetic, energy-conscious copy for chronic illness (Spoonie) users. Use for all UI text, onboarding flows, notifications, error messages, and marketing copy in the Clue Symptom Tracker. Applies "Language of Care" principles - validation over instruction, permission over restriction, neutral language over judgment. Essential when writing for users with brain fog, fatigue, or anxiety.
license: Complete terms in LICENSE.txt
---

# Spoonie Copywriter

This skill guides writing empathetic, energy-conscious copy for the Clue Symptom Tracker. The target audience is "Spoonies" - people with chronic, energy-limiting conditions (ME/CFS, Fibromyalgia, POTS, Long COVID, etc.) who have limited cognitive and physical reserves.

## Core Philosophy: The "Compassionate Analyst"

The app persona is a **Compassionate Analyst** - warm and understanding, but also capable and trustworthy. It does not act as a taskmaster. It avoids toxic positivity and gamification that induces guilt. Instead, it adopts **Radical Validation** - recognizing that a gap in data is often data itself (the user was "wiped").

## Five Core Principles

### 1. Reduce Cognitive Load

Brain fog makes processing information exhausting. Every word must earn its place.

| ❌ Avoid                                                           | ✅ Use                        |
| ------------------------------------------------------------------ | ----------------------------- |
| "Please take a moment to log your symptoms when you have a chance" | "Quick check-in?"             |
| "We noticed you haven't logged in 3 days"                          | "Welcome back. Ready to log?" |
| "Select all applicable symptoms from the comprehensive list below" | "What's bothering you most?"  |

**Guidelines:**

- Use simple, direct language
- Break complex requests into small steps
- One question per screen
- 30-second max for any check-in

### 2. Validate, Don't Dismiss

Users have been told "it's all in your head" by doctors. Every interaction must signal: we believe you.

| ❌ Avoid                           | ✅ Use                                |
| ---------------------------------- | ------------------------------------- |
| "Try to stay positive!"            | "That sounds incredibly challenging." |
| "Most people feel better after..." | "Your experience is valid."           |
| "It's probably just..."            | "I hear you."                         |

**Guidelines:**

- Acknowledge difficulty explicitly
- Reference their own words and data
- Never minimize or reframe their experience
- Use phrases: "I hear you", "That's tough", "Makes sense"

### 3. Permission, Not Restriction

Language should empower choice, not impose limitations. Users already feel restricted by their conditions.

| ❌ Avoid                        | ✅ Use                                    |
| ------------------------------- | ----------------------------------------- |
| "You should rest"               | "Rest might help today"                   |
| "You need to track this"        | "You might want to note this"             |
| "You must take your medication" | "Medication reminder (when you're ready)" |
| "Stop overdoing it"             | "Your body might be asking for a break"   |

**Guidelines:**

- Frame as suggestions, not commands
- Use "might", "could", "when you're ready"
- Treat recommendations as experiments
- Daily Push/Rest indicator = permission, not restriction

### 4. Neutral, Not Judgmental

The app must never make users feel worse about bad days.

| ❌ Avoid                           | ✅ Use                        |
| ---------------------------------- | ----------------------------- |
| "Bad day"                          | "High intensity day"          |
| "Awful"                            | "Challenging"                 |
| "You only logged 2 days this week" | "You logged 2 days this week" |
| Pain: 😢                           | Pain: ● (neutral indicator)   |
| "Streak broken!"                   | (no mention of streaks)       |

**Guidelines:**

- Never use sad face emojis for high pain
- No color-coded judgment (red = bad)
- No streak gamification
- Intensity scales, not good/bad scales
- 6/10 might be a victory for chronic pain - don't assume

### 5. Personalize for Connection

Generic messages feel cold. Reference their specific context.

| ❌ Avoid              | ✅ Use                                     |
| --------------------- | ------------------------------------------ |
| "Track your symptoms" | "How's the fatigue today, Sarah?"          |
| "You logged data"     | "You logged 3 days in a row - nice work"   |
| "Check your insights" | "Your sleep patterns are ready to explore" |

**Guidelines:**

- Use their name when appropriate
- Reference their selected focus/condition
- Connect to their stated goals
- Personalize based on Q1/Q2 onboarding answers

---

## Specific Copy Patterns

### Check-in Prompts

```
Morning:
- "Good morning. How did you sleep?"
- "Ready for a quick check-in?"

Low energy detected:
- "Take it easy today?"
- "Minimal logging mode?"

Returning after gap:
- "Welcome back. No pressure - just glad you're here."
- "We're here when you're ready."
```

### Flare Mode Messages

```
Entering flare:
- "Got it. Rest up."
- "Logging basics only. Rest is the priority."
- "I've noted a tough day. Details can wait."

Post-flare return:
- "Hope you're feeling a bit better."
- "Ready to fill in any gaps? (Or skip, that's fine too)"
```

### Insight Delivery

```
Pattern found:
- "Noticed something: your migraines often follow poor sleep by 48 hours."
- "Your fatigue tends to spike on days after high activity."

Correlation detected:
- "When you logged 'stress', your pain was 40% higher the next day."
- "Weather changes and your symptoms seem connected."

No pattern yet:
- "Still learning your patterns. Keep logging when you can."
- "Need more data to spot trends - no rush."
```

### Error/Empty States

```
No data:
- "Nothing here yet. Start with a quick check-in?"
- "Your insights will appear once we have a few days of data."

Connection error:
- "Couldn't save that one. It's stored locally - we'll sync when we can."
- "Offline mode active. Everything's safe."

Missing required field:
- "One more thing before we save..."
- "Just need [field] to continue"
```

### Doctor Pack Messages

```
Export ready:
- "Your report is ready. Show your doctor what your days really look like."
- "Structured for clinicians - your experience, their language."

Encouraging export:
- "This isn't just a log - it's evidence they can't dismiss."
- "Turn your daily experience into data doctors take seriously."
```

---

## Anti-Patterns (NEVER Use)

### Guilt-Inducing

- ❌ "You broke your streak!"
- ❌ "You haven't logged in X days"
- ❌ "Don't forget to..."
- ❌ "You should really..."

### Toxic Positivity

- ❌ "Stay positive!"
- ❌ "Every day is a fresh start!"
- ❌ "You've got this!"
- ❌ "Mind over matter"

### Medical Minimization

- ❌ "It's probably nothing"
- ❌ "Try not to worry"
- ❌ "Most people with X feel better when..."
- ❌ "It's just anxiety"

### Clinical Coldness

- ❌ "Submit symptom log"
- ❌ "Data entry required"
- ❌ "Symptom severity: [1-10]"
- ❌ "Patient reported outcome"

### Gamification

- ❌ Streaks
- ❌ Points
- ❌ Leaderboards
- ❌ Achievements/badges for logging

---

## The "Traffic Light" Tone Guide

Adapt tone based on user's apparent energy state:

### 🟢 Green (Good Day)

User seems energetic, engaged. Can use slightly longer copy, offer more options.

- "Want to explore your patterns? We found something interesting."
- "Good time for a detailed check-in?"

### 🟡 Yellow (Moderate)

User shows fatigue signs. Simplify, shorten.

- "Quick check-in?"
- "Just the basics today?"

### 🔴 Red (Flare/Crisis)

User is struggling. Minimal words, maximum support.

- "Got it."
- "Rest up."
- "We're here."

---

## Onboarding Copy Guidelines

Q1-Q4 onboarding uses conversational, empathetic tone:

### Q1 (Primary Concern)

- Lead with "What's been the hardest to manage lately?"
- Options describe lived experience, not clinical terms
- Example: "Fatigue that won't quit" not "Chronic fatigue syndrome"

### Q2 (Specific Focus)

- Mirror their selection back empathetically
- "What do you hope to figure out about your fatigue?"
- Options should feel like they came from the community

### Q3 (Baseline)

- Frame as establishing "where you're starting from"
- Use gentle widget language: "Where is your battery level right now?"
- Never clinical: avoid "rate your symptom severity"

### Q4 (Value Prop)

- Show immediate value: "We've captured your baseline."
- Promise specific insight: "Give us 3 days, we'll spot the crash before it hits."
- CTA: "Sign in to save your today"

---

## Quick Reference: Word Swaps

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
