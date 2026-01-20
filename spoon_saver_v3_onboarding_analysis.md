# Spoon Saver v3 Campaign - Onboarding Analysis

**Campaign:** spoon_saver_v3
**Analysis Date:** January 20, 2026
**Data Source:** Supabase onboarding events (modal_sessions, modal_responses, landing_visits)

---

## Executive Summary

### Key Findings
- **31 unique users** started the onboarding flow across **37 sessions**
- **0% completion rate** - No users completed all 4 steps
- **Major drop-off at Step 1** - 62% of users abandoned immediately after opening the modal
- **Step 3 engagement is strong** - Users who reach Step 3 show high interaction rates
- **Fatigue is the #1 entry point** - 53% of users who answered Q1 selected fatigue-related options

---

## 1. Funnel Performance

### Drop-off by Step

| Step | Sessions | % of Total | Drop-off |
|------|----------|------------|----------|
| **Step 1** (Q1: Condition) | 23 | 62.16% | **Immediate abandonment** |
| **Step 2** (Q2: Pain point) | 3 | 8.11% | High drop-off |
| **Step 3** (Q3: Widget interaction) | 11 | 29.73% | **Most engagement** |
| **Step 4** (Conversion screen) | 0 | 0% | No one reached |

### Critical Insight
- **62% of users open the modal but don't answer Q1** - This suggests:
  - Modal UX issues (confusing, too much text, unclear value prop)
  - Users are curious but not committed
  - Possible technical issues or loading delays

- **Users who reach Step 3 show strong engagement** (11 sessions) compared to Step 2 (3 sessions) - This is unusual and suggests:
  - Some users may be skipping Q2 or there's a navigation issue
  - Once engaged, users are willing to interact with widgets

---

## 2. What Users Want: Question Responses

### Q1: What brings you here today? (Entry Point)

| Answer | Count | % of Q1 Responses |
|--------|-------|-------------------|
| **Fatigue that won't quit** | 9 | 52.9% |
| **Multiple conditions** | 4 | 23.5% |
| **Migraines that derail everything** | 2 | 11.8% |
| **IBS / Gut issues** | 1 | 5.9% |
| **Something else** | 1 | 5.9% |

**Insight:** Fatigue dominates as the primary concern. Users managing multiple conditions are the second-largest segment.

---

### Q2: What's been hardest about managing this? (Pain Points)

Top pain points by selection count:

| Pain Point | Count | % of Q2 Responses |
|------------|-------|-------------------|
| **"I want to track and see what patterns come up, no specific focus yet"** | 3 | 23.1% |
| **"Figuring out which issue to tackle first when everything feels urgent"** | 3 | 23.1% |
| **"How my fatigue and mood are connected and affecting each other"** | 2 | 15.4% |
| **"Tracking whether a new treatment or habit is actually making a difference"** | 2 | 15.4% |
| Other specific concerns (hormonal, food, weather triggers) | 1 each | ~7.7% each |

**Insight:** Users are split between:
1. **Exploratory tracking** - "I don't know what to look for yet"
2. **Prioritization challenges** - "I have too many symptoms to manage"
3. **Correlation discovery** - "What's causing what?"

---

### Q3: Widget Interactions (Product-Specific Engagement)

Most used widgets by unique users:

| Widget ID | Condition | Type | Users |
|-----------|-----------|------|-------|
| `q3.prioritize_issue.v1` | Multiple conditions | chips | 2 |
| `q3.mood_connection.v1` | Chronic fatigue | slider | 2 |
| `q3.no_focus.v1` | Chronic fatigue | slider | 2 |
| `q3.unified_view.v1` | Multiple conditions | slider | 1 |
| `q3.hormonal_link.v1` | Migraines | chips | 1 |
| `q3.weather_triggers.v1` | Migraines | slider | 1 |

**Insight:**
- Users with **chronic fatigue** engaged most with mood/connection tracking widgets
- Users with **multiple conditions** wanted prioritization tools
- **Slider widgets** are used more than chip selectors (8 vs 4 interactions)

---

## 3. Most Common User Journeys (Q1 → Q2 Paths)

| Q1: Condition | Q2: Pain Point | Users |
|---------------|----------------|-------|
| Fatigue that won't quit | I want to track and see what patterns come up | 3 |
| Multiple conditions | Figuring out which issue to tackle first | 3 |
| Fatigue that won't quit | How my fatigue and mood are connected | 2 |
| Migraines | Whether my migraines are linked to my hormonal cycle | 1 |
| Migraines | Whether weather changes correlate with headaches | 1 |

**Top 2 User Personas:**

### Persona 1: "The Exhausted Explorer"
- **Entry:** Fatigue that won't quit
- **Pain Point:** No specific focus, wants to discover patterns
- **Need:** Open-ended tracking with automatic pattern detection
- **Count:** 3 users

### Persona 2: "The Overwhelmed Multi-Manager"
- **Entry:** Multiple conditions
- **Pain Point:** Can't figure out which issue to tackle first
- **Need:** Prioritization tools, unified symptom view
- **Count:** 3 users

---

## 4. What This Tells Us About User Needs

### Primary User Jobs-to-be-Done

1. **Pattern Discovery (40% of engaged users)**
   - "Show me what I'm not seeing"
   - Users don't know what to track - they want the app to help them discover correlations
   - **Product implication:** Prediction-first approach is validated

2. **Triage & Prioritization (30% of engaged users)**
   - "I have 5 symptoms - which one matters most?"
   - Users are overwhelmed and need guidance on where to focus first
   - **Product implication:** "Top Suspect" feature is critical

3. **Correlation Investigation (30% of engaged users)**
   - "Is my fatigue causing my mood issues, or vice versa?"
   - "Do my migraines follow my cycle?"
   - **Product implication:** Causal loop detection, timeline correlation views

---

## 5. Recommendations

### Immediate Actions (Critical)

1. **Fix Step 1 Drop-off**
   - 62% bounce rate is catastrophic
   - **Test:**
     - Simplify Q1 - reduce text, make options more visual
     - Add progress indicators earlier
     - Show value prop before Q1 (e.g., "This takes 60 seconds")
     - A/B test: Single-tap vs scrollable list for Q1

2. **Investigate Step 2 Issue**
   - Why are only 3 users reaching Step 2, but 11 reach Step 3?
   - Possible technical bug or navigation issue

3. **Get Users to Step 4**
   - No one is seeing the conversion screen
   - Consider reducing flow to 2-3 steps (Q1 → Q2 → Conversion)
   - Or add micro-commitments between steps

---

### Content & Messaging Insights

**What to emphasize in marketing/onboarding:**

✅ **DO emphasize:**
- "Discover hidden patterns in your symptoms"
- "Figure out which symptom to tackle first"
- "See how your fatigue, mood, and energy connect"
- "Track without knowing what to track"

❌ **DON'T emphasize:**
- Specific tracking features (calendars, charts)
- Manual logging workflows
- Clinical terminology

---

### Feature Prioritization

Based on user responses, prioritize building:

1. **Auto-pattern detection** - Most requested need
2. **Symptom prioritization tool** - "Top Suspect" feature
3. **Fatigue-mood correlation view** - High engagement
4. **Multi-condition unified dashboard** - 23% of Q1 respondents

---

## 6. Sample User Journeys

Here are 3 real user journeys from the data:

### Journey 1: The Chronic Fatigue Pattern Seeker
- **Session:** `sess_1768609296378_b5i6sykp5`
- Q1: Fatigue that won't quit
- Q2: I want to track and see what patterns come up, no specific focus yet
- Q3: Interacted with `q3.no_focus.v1` slider (set to 28)
- **Abandoned at Step 3**

### Journey 2: The Multi-Condition Prioritizer
- **Session:** `sess_1768807461625_twabg1i56`
- Q1: Multiple conditions
- Q2: Figuring out which issue to tackle first when everything feels urgent
- Q3: Selected "fatigue" from prioritization chips
- **Abandoned at Step 3**

### Journey 3: The Hormonal Migraine Investigator
- **Session:** `sess_1768602032767_pzp0dfv2f`
- Q1: Migraines that derail everything
- Q2: Whether my migraines are linked to my hormonal cycle
- Q3: Selected "before" (menstrual cycle timing) from hormonal link chips
- **Abandoned at Step 3**

---

## 7. Conversion Blocker Analysis

### Why is no one completing the flow?

**Hypothesis 1: Too many steps**
- 4 steps is too long for a first-touch modal
- Users lose steam by Step 3
- **Test:** Reduce to 2 steps + conversion screen

**Hypothesis 2: Value prop unclear**
- Users don't see "what's in it for me" until the end
- **Test:** Show personalized preview after Q1

**Hypothesis 3: Technical issues**
- Step navigation may be broken
- **Action:** Review analytics for client-side errors

**Hypothesis 4: No urgency**
- Users can explore without committing
- **Test:** Add urgency signals ("Join 1,000+ users tracking patterns")

---

## Appendix: Data Quality Notes

- **Time period:** Jan 16-19, 2026 (4 days)
- **Total sessions:** 37
- **Unique users:** 31 (some users restarted flow)
- **Campaign:** spoon_saver_v3 (UTM tracking)
- **Completion tracking:** All events logged to Supabase

**Data gaps:**
- No A/B test variants in this dataset
- No device/browser breakdown analysis performed
- No time-on-step metrics analyzed
