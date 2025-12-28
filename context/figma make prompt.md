# Figma Make Prompt — Clue Symptom & Mood Tracker

> Copy this entire prompt into Figma Make to generate the prototype.

---

## Project Overview

Create a mobile health tracking app called "Clue" — a chat-first symptom tracker for chronic illness patients managing multiple conditions. The app helps users quickly log symptoms, discover patterns, and generate doctor-trustworthy summaries for appointments.

**Platform:** Mobile app (iPhone 15 Pro dimensions: 393×852)
**Target user:** 42-year-old woman managing 3-4 chronic conditions, seeing multiple providers, limited energy

---

## Design System

### Color Palette (Podia-inspired, soft pastels + dark accents)

**Backgrounds:**
- Primary background: #F8F4F0 (warm off-white)
- Card backgrounds: #F6F7F8 (pale gray)
- Section backgrounds: #E2EEF4 (light blue)

**Pastel Accents:**
- Soft orange: #EFA24C
- Dusty blue: #A8C8DA
- Soft violet: #BFA7EC
- Peach: #F7B182
- Medium blue: #7CAEC5

**Dark Accents:**
- Primary CTA: #0B233D (dark navy)
- Secondary CTA: #3B1760 (deep plum)
- Text: #0A2A3A (near-black navy)
- Accent brown: #5B3022

### Typography
- Use a modern geometric sans-serif (similar to Poppins or Nunito)
- Headlines: Bold, generous letter spacing
- Body: Regular weight, rounded forms
- Keep it friendly and approachable

### UI Elements
- Buttons: Solid dark with white text, strongly rounded corners (12-16px radius)
- Cards: Rounded rectangles (16px radius) with subtle shadows
- Chips: Pill-shaped selection items with pastel backgrounds
- Icons: Line-based, rounded corners
- Use organic, asymmetric decorative shapes in backgrounds

---

## Screens to Build

### Screen 1A — Condition Selection
**Header:** "What are you managing?"
**Subtitle:** "Pick up to 3. This helps Clue tailor symptoms, meds, and charts to you."

**Content:**
- Search bar with placeholder: "Search conditions or symptoms"
- Helper text: "Not sure? Pick symptoms (pain, fatigue, IBS) — you can refine later."
- Grid of selectable chips (3 columns):
  - Chronic pain, Fatigue, IBS
  - Migraine, Anxiety, Depression
  - Insomnia, Long COVID, Fibromyalgia
  - Endometriosis, Diabetes, Autoimmune
- Chips should have pastel backgrounds, darker text, and a checkmark when selected
- Sticky bottom button: "Continue" (dark navy #0B233D)
- Secondary link below: "I'll choose later"

**Interaction:** Tapping a chip selects it (max 3), showing a subtle animation and checkmark.

---

### Screen 1B — Priority Selection
**Header:** "What matters most right now?"
**Subtitle:** "Start with one priority. Clue will still track the rest."
**Helper:** "This sets your first check-in and your first charts."

**Content:**
- Single-select list of options (card-style, vertical):
  - ⚡ Energy crashes / fatigue
  - 🔥 Pain / inflammation
  - 💭 Mood / anxiety
  - 🫁 IBS / gut symptoms
  - 😴 Sleep / recovery
  - 🤕 Headaches / migraines
  - 🧠 Brain fog / focus
  - ✨ Skin / flare-ups
  - ✏️ Other (type it)
- Selected card has a violet border (#BFA7EC) and slight scale-up
- Sticky bottom: "Continue" button

---

### Screen 1C — Impact Question Builder
**Header:** "What's the question you're trying to answer?"
**Main prompt:** "How does my [Feature] impact [Outcome]?"
**Subtitle:** "Start with one question. You can add more later."

**Content:**
- Two dropdown selectors styled as rounded input fields:
  - First: "Feature" with placeholder "Choose one"
  - Second: "Outcome" with placeholder "Choose one"
- When tapped, show a bottom sheet picker
- Feature options: Meds + supplements, Sleep, Food, Stress, Exercise, Cycle / hormones, Work + routine, Weather, Hydration, Social / outings
- Outcome options: Pain, Fatigue, Mood, IBS, Sleep quality, Headache, Anxiety, Brain fog / focus, Skin
- Sticky bottom: "Get started" button (deep plum #3B1760)

---

### Screen 2 — Mode Selection
**Header:** "What brings you here today?"
**Subtitle:** "This tunes your first week so Clue feels helpful fast."

**Content:**
- Four selectable cards (2x2 grid):

**Card 1 - Awareness 🔍**
"Something is wrong"
- "Why am I so exhausted again?"
- "This flare came out of nowhere."

**Card 2 - Tracking 📝**
"I need history"
- "When did this start last time?"
- "I've had five flares this month."

**Card 3 - Insight 🔎**
"What's causing this?"
- "Is stress making this worse?"
- "Every time I skip lunch, my fatigue spikes."

**Card 4 - Action ⚡**
"What do I do next?"
- "Should I call my doctor or wait?"
- "I need to prepare for my appointment."

- Cards have soft pastel backgrounds, selected card has dark navy border
- Sticky bottom: "Next" button

---

### Screen 3 — First Check-in
**Header:** "Quick check-in"
**Subtitle:** "20 seconds. Enough to capture a baseline."

**Content:**

**Widget A — Severity Slider**
- Label: "Your [fatigue] today" (dynamic based on priority)
- Horizontal slider 0-10
- Helper: "0 = none, 10 = worst"
- Show current value in a floating bubble above thumb

**Widget B — Flare Toggle**
- Label: "Is this a flare?"
- Two pill buttons: "Yes" / "No"
- If Yes selected, show time picker: "When did it start?"
  - Options: Just now, Earlier today, Yesterday, Pick time

**Widget C — Driver Chips**
- Label: "Any likely drivers?" 
- Helper: "Pick any that fit. Skip if you're wiped."
- Horizontal scrolling chips: missed meds, poor sleep, stress spike, food trigger, skipped meals, dehydration
- Chips are optional, can select multiple

- Sticky bottom: "Save check-in" button with a checkmark icon

---

### Screen 4 — First Value Moment
**Header:** "Baseline captured ✓"
**Subtitle:** "You've started building a record your doctor can actually use."

**Content:**
Three vertical cards:

**Card 1 — Calendar Preview**
- Mini calendar widget showing today marked with a colored dot
- Caption: "Each check-in becomes a clean day card you can tap later."

**Card 2 — Timeline Promise**
- Small timeline graphic with milestones
- "After 3 days, Clue starts spotting early links between [Feature] and [Outcome]."
- "After 14 days, you'll unlock a clear 2-4 week trend view."

**Card 3 — Doctor Trust**
- Small document icon
- "Clue summarizes symptoms in a tight, structured format clinicians recognize."
- "Trends show up as simple graphs so patterns are obvious fast."

**Actions:**
- Primary CTA: "Start chatting" (dark navy, full width)
- Secondary CTA: "Quick entry" (outlined, below primary)

---

## Visual Style Notes

- Use curved section dividers instead of hard lines
- Add floating organic shapes (circles, blobs) in pastel colors as background decoration
- Generous white space and padding (16-24px)
- Subtle shadows on cards (4px blur, 10% opacity)
- Smooth transitions between screens (300ms ease-out)
- Keep everything feeling light, approachable, not clinical
- Avoid pure white (#FFFFFF) — use warm off-whites
- No harsh blacks — use navy tones for text

---

## First Step

Build Screen 1A (Condition Selection) first with the full chip grid, search bar, and sticky CTA button. Make the chip selection interactive with a satisfying tap animation.

