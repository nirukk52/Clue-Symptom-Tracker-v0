# Creative Brief

How to write image generation prompts for Nano Banana Pro 3.

## Brand Visual Guidelines

### Colors

| Name                    | Hex       | Usage                        |
| ----------------------- | --------- | ---------------------------- |
| Primary (Dark Navy)     | `#20132E` | Text, buttons                |
| Background (Warm Cream) | `#FDFBF9` | Main background              |
| Accent Peach            | `#E8974F` | Selection states, highlights |
| Accent Blue             | `#A4C8D8` | Decorative blobs             |
| Accent Purple           | `#D0BDF4` | Highlights, glow             |
| Accent Mint             | `#B8E3D6` | Success states               |

### Typography

- Display: Fraunces (serif) - emotional headings
- Body: DM Sans - clean readability

### Visual Style

- Warm, calming, premium
- Soft gradients, gentle shadows
- No medical imagery (hospitals, pills, doctors)
- No stock-photo aesthetic
- Fintech-like clarity

## Prompt Structure

```
[Format] of a [aesthetic] [subject] for [purpose].
Scene: [what's shown].
Visual style: [colors, treatment, mood].
[UI elements if applicable].
[Typography rules].
[What to avoid].
[Technical specs].
```

## Example Prompts

### Hero Image (Worked ✅)

```
Vertical and horizontal versions of a modern, calming mobile-app hero image for a chat-first symptom tracker.

Scene: a hand holding a phone showing a clean screen that reads: 'Track symptoms without draining your energy.' Below it, smaller text: '20-second check-ins • Flare Mode • Doctor-ready export'.

Visual style: warm cream background, soft purple + peach accents, minimal gradients, gentle shadows, premium fintech-like clarity.

Include a subtle card UI showing 'How does my Sleep impact my Pain?'

Keep typography perfectly legible, centered, no distortions. No medical imagery, no hospitals, no stock-photo look.

Ultra clean, product-marketing aesthetic, high resolution.
```

### App Screenshot

```
Clean mobile app screenshot showing a symptom check-in screen.

Scene: iPhone frame with app UI. Header: 'Quick Check-in'. Energy slider at 4/10. Pill buttons for suspects: 'Poor sleep' (selected), 'Stress' (selected), 'Weather'.

Visual style: warm cream (#FDFBF9) background, dark navy (#20132E) text, peach (#E8974F) for selected pills, soft card shadows.

Typography: DM Sans for body, clean and legible.

No hand, just the phone. Minimal, breathable layout. High resolution.
```

## Prompt Checklist

- [ ] Specifies format (vertical, horizontal, square)
- [ ] Names brand colors by hex
- [ ] Includes exact text to show
- [ ] Lists what to avoid
- [ ] Ends with "high resolution"

## Iterating on Prompts

When a prompt doesn't work:

1. Identify what's wrong (text illegible, wrong colors, etc.)
2. Add explicit constraint ("text must be perfectly readable")
3. Remove ambiguity ("clean" → "white space around all elements")
4. Log both versions in `knowledge/prompts/library.md`
