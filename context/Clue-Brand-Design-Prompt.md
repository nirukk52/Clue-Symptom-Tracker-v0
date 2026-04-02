# Clue / Chronic Life — brand, product, and design prompt

Why this exists: One place to copy a **master prompt** into image generators, UI builders (e.g. v0), or design briefs so outputs stay aligned with the real product and `globals.css` tokens.

---

## Master prompt (copy everything below the line)

---

**Product — Chronic Life & Clue**

Chronic Life is a **prediction-first symptom tracker** for people living with **multi-condition chronic illness**. The north-star promise: *“Stop being blindsided by flares.”* The product aims to give users a **24–48 hour heads-up** before a symptom crash, using check-ins, history, and pattern surfacing—not clinical diagnosis.

**Clue** is the **in-app AI companion**: a calm, supportive chat agent that helps users **log how they feel**, **spot connections** between symptoms and life factors (sleep, stress, food, meds), and **make sense of their own data** over time. Clue is **patient-led** and **non-judgmental**; it respects **spoon theory** and **brain fog** (short prompts, forgiving UX, flare mode on hard days). Optional context: users care about **baselines**, **lag effects**, **top suspects** for triggers, and **doctor-ready summaries**—always framed as self-knowledge, not medical advice.

**Visual & emotional vibe**

- **Warm, grounded, quietly premium** — editorial calm, not clinical cold, not startup-neon chaos.
- **Soft human tech** — trustworthy and clear, like a thoughtful health journal with gentle intelligence.
- **Hope without toxic positivity** — companion for hard days; dignity and agency matter more than cheerleading.
- **Cream-and-ink base** with **muted pastel accents** (sage, dusty blue, lavender, peach); **deep aubergine / midnight plum** as the primary anchor, not pure black.

**Color system (use these hex values; do not invent a new palette)**

| Role | Hex | Notes |
|------|-----|--------|
| Primary / ink | `#20132e` | Headings, key UI chrome, Clue mark tile |
| Text muted | `#554b66` | Secondary copy |
| Background cream | `#fdfbf9` | Main app canvas |
| Card / surface | `#ffffff` | Elevated panels |
| Primary tint | `#f3f0fa` | Soft fills, hover hints |
| Accent peach | `#e8974f` | Warm highlights, “insight” moments |
| Accent mint | `#b8e3d6` | Calm, recovery, gentle positive signal |
| Accent blue | `#a4c8d8` | Airy, breathable secondary accent |
| Accent purple | `#d0bdf4` | Soft emphasis, selection states |
| Accent rose | `#f4c4c4` | Human warmth, sparingly |
| Accent yellow | `#f5e6a3` | Soft caution / attention without alarm red |
| Hero / sage wash | `#8ba4a8` | Hero or large background bands only |

**Typography**

- **Display / headlines:** Fraunces (soft serif, modern, readable—not stuffy institutional).
- **UI & body:** DM Sans (clean geometric sans, friendly, highly legible at small sizes).

**UI & composition guidelines**

- **Generous radius** (roughly 12–24px on cards and controls; pills fully rounded where appropriate).
- **Soft shadows** — diffuse, low contrast (`rgba` plum tones), never harsh black drop shadows.
- **Breathing room** — avoid dense dashboards; prioritize **one primary action** per view where possible.
- **Knowledge-graph metaphor (if illustrating data):** nodes and gentle edges—**symptoms** warmer/attention, **factors** cooler/teal family, **“clue” insights** gold/peach accent, **unknowns** neutral gray—always **abstract and non-diagnostic**, no anatomical gore.

**Clue agent mark concept (if generating a logo or mascot)**

- Square tile **`#20132e`** with rounded corners; a **mint** curved path suggesting a **trajectory or emerging pattern**; a **peach** dot marking **early insight** (“seeing it coming”). Abstract only—no literal faces required.

**Avoid**

- Sterile hospital blue-white default, alarmist red-heavy UI, sarcastic or meme-y health tone, **purple-on-white “generic AI” gradients**, stock “happy patient” clichés, implying diagnosis or cure, cluttered charts without narrative.

---

## Short variant (~120 words)

Chronic Life helps chronically ill people **predict flares** before they hit; **Clue** is the in-app AI that supports **logging**, **patterns**, and **self-understanding** with empathy and spoon-theory awareness. Visual language: **cream `#fdfbf9`**, **plum ink `#20132e`**, accents **mint `#b8e3d6`**, **peach `#e8974f`**, soft **lavender `#d0bdf4`** and **dusty blue `#a4c8d8`**. Typography: **Fraunces** + **DM Sans**. Mood: **warm, calm, premium, human**—never clinical cold or toxic positivity. UI: **rounded cards**, **soft plum-tinted shadows**, generous whitespace. No diagnostic claims; **dignity and clarity** first.

---

## Keeping this file honest

When tokens change, update the **hex table** from `web-app/src/app/globals.css` (`:root` and `@theme inline`). The **product sentences** should stay aligned with `CLAUDE.md` (Identity + one-line summary).
