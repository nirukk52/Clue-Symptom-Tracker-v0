# Landing Page Persona Design

> **Goal:** Create a relatable, trustworthy persona image for ChronicLife landing pages
> **Reference:** makevisible.com hero image style

---

## Persona Context

### Meet "Maya" — Our Landing Page Face

**Demographics:**

- **Age:** 38 years old
- **Appearance:** South Asian or Mediterranean features, dark wavy hair (shoulder length), warm skin tone
- **Expression:** Peaceful but present — someone who has learned to live with unpredictability, not defeated by it

**Her Story:**
Maya manages fibromyalgia and long COVID. She's a project manager who had to step back to part-time work. She's not "sick" in the obvious way — she looks healthy, which is part of her struggle. People say "but you look fine" all the time.

**What She Represents:**

- The invisible illness experience — looks healthy, struggles daily
- Intelligence and capability — not a victim, a problem-solver
- Hope without toxic positivity — realistic optimism
- Self-advocacy — taking control of her health data

**Why This Matters for Conversion:**
Users need to see themselves in Maya. She's not:

- A model looking unrealistically healthy
- Someone in a hospital bed (too scary)
- An abstract illustration (too cold)

She IS:

- Someone who could be their friend, sister, coworker
- Visibly managing life, not just surviving
- Looking forward, not down (hope, not despair)

---

## Visual Style (From Visible Reference)

### What Makes Their Image Work

| Element           | Visible's Approach                         | Why It Works                            |
| :---------------- | :----------------------------------------- | :-------------------------------------- |
| **Background**    | Soft blue-gray, slightly warm              | Calming, medical without being clinical |
| **Lighting**      | Natural, diffused, soft shadows            | Approachable, not harsh studio lighting |
| **Pose**          | Upper body, slight angle, chin slightly up | Confident, hopeful, looking forward     |
| **Expression**    | Peaceful, slight smile, eyes soft          | Not forced happiness, authentic calm    |
| **Clothing**      | Casual striped sweater, warm tones         | Relatable, comfortable, lived-in        |
| **Cropping**      | Right side of frame, leaves room for text  | Allows hero copy on the left            |
| **Color Palette** | Muted: dusty blue, cream, terracotta       | Warm but professional                   |

---

## Image Generation Prompts

### Option A: Midjourney / DALL-E (Photorealistic)

```
Portrait photograph of a 38-year-old South Asian woman with shoulder-length dark wavy hair, wearing a soft cream and terracotta striped sweater. She has a peaceful, slightly hopeful expression, looking slightly upward and to the side. Natural soft lighting, diffused background in muted dusty blue-gray. Upper body shot, positioned on the right side of the frame. The mood is calm, grounded, and resilient. Shot on 85mm lens, shallow depth of field, natural skin texture. No makeup visible, authentic and approachable. --ar 16:9 --style raw --v 6
```

### Option B: Midjourney (Warmer Variant)

```
Professional portrait of a woman in her late 30s with Mediterranean features, dark shoulder-length hair with natural waves, wearing a cozy oversized knit sweater in muted peach and cream stripes. She's looking peacefully into the distance with a soft, knowing expression. Soft natural window light from the left, creating gentle shadows. Background is a soft sage green blur. The feeling is hopeful resilience, quiet strength. Upper body, positioned right of center. Editorial portrait style, not stock photography. --ar 16:9 --style raw --v 6
```

### Option C: For Stock Photo Search

If generating doesn't work, search for:

**Keywords:**

- "woman chronic illness portrait hopeful"
- "woman 30s peaceful portrait soft lighting"
- "invisible illness awareness portrait"
- "woman looking up hopeful natural light"

**Stock Sites:**

- [Stocksy](https://www.stocksy.com/) — Best for authentic, non-stock-looking images
- [The Disabled Collection](https://www.thedisabledcollection.com/) — Authentic disability representation
- [Tonl](https://tonl.co/) — Diverse, authentic imagery

**What to Look For:**

- NOT smiling too much (feels fake)
- NOT looking directly at camera (too confrontational)
- NOT in workout clothes (we're not a fitness app)
- NOT in medical setting (too clinical)

---

## Color Palette for Hero Section

Based on Visible's approach, adapted to our brand:

| Element             | Visible                     | ChronicLife Adaptation               |
| :------------------ | :-------------------------- | :----------------------------------- |
| **Background**      | `#8BA4A8` (dusty blue-gray) | `#A4C8D8` (accent-blue) or `#B8D4D4` |
| **Text**            | White, clean                | `#20132E` (primary) or white on dark |
| **CTA Button**      | Soft yellow `#F5E6A3`       | `#E8974F` (accent-peach) or white    |
| **Condition Pills** | White with border           | White with `border-primary/20`       |

---

## Hero Layout Options

### Layout 1: Visible Style (Image Right)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐    ┌─────────────────────────────────┐│
│  │                      │    │                                 ││
│  │  Predict your next   │    │         [PERSONA IMAGE]         ││
│  │  flare before        │    │                                 ││
│  │  it hits.            │    │         Maya looking up,        ││
│  │                      │    │         peaceful expression     ││
│  │  Join 1,000+ people  │    │                                 ││
│  │  using the tracker   │    │                                 ││
│  │  designed for...     │    │                                 ││
│  │                      │    │                                 ││
│  │  [Condition Pills]   │    │                                 ││
│  │                      │    │                                 ││
│  │  [Get Started →]     │    │                                 ││
│  │                      │    │                                 ││
│  └──────────────────────┘    └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Layout 2: Full-Width Background (Current predict-flares.html style)

Keep current UI mockup cards but add subtle persona image in background or as a testimonial section.

---

## Implementation Notes

### For AI-Generated Images

1. Generate at high resolution (at least 2048px wide)
2. Run through [Topaz Gigapixel](https://www.topazlabs.com/gigapixel-ai) or similar for upscaling
3. Color-correct to match our palette
4. Save as WebP for web (with PNG fallback)

### For Stock Photos

1. Purchase highest resolution available
2. Get commercial license with web/advertising rights
3. Verify no exclusive use restrictions

### File Naming

```
web-landing/assets/
├── persona-maya-hero.webp      # Primary hero image
├── persona-maya-hero@2x.webp   # Retina version
├── persona-maya-mobile.webp    # Cropped for mobile
└── persona-maya-og.png         # For social sharing
```

---

## Alternate Persona Options

If "Maya" doesn't test well, consider:

### "Jordan" — Non-Binary, Younger (28)

```
Portrait of a 28-year-old person with short curly hair and androgynous features, wearing a soft olive green sweater. They have a thoughtful, slightly tired but hopeful expression. Natural lighting, sitting by a window. The mood is quiet strength and self-awareness. Soft focus background in warm cream tones. --ar 16:9 --style raw --v 6
```

### "Elena" — Older, White (52)

```
Portrait of a 52-year-old woman with silver-streaked brown hair in a loose bun, wearing a soft lavender cardigan. She has warm eyes and a gentle, knowing smile. Natural soft lighting, muted sage background. The expression is experienced wisdom and quiet resilience. --ar 16:9 --style raw --v 6
```

### "Marcus" — Black Man (40)

```
Portrait of a 40-year-old Black man with a short beard, wearing a soft gray henley shirt. He has a calm, present expression, looking slightly to the side with quiet confidence. Natural lighting, dusty blue background. The mood is grounded strength and self-advocacy. --ar 16:9 --style raw --v 6
```

---

## A/B Test Plan

Once we have persona images:

1. **Test A:** Current predict-flares.html (UI mockup cards, no person)
2. **Test B:** Maya persona image (Visible style)
3. **Test C:** Condition-specific personas (rotate based on UTM or subreddit)

Measure: CTR from ad → Landing page conversion rate

---

_Created: January 2, 2026_
