---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for the Clue Symptom Tracker. Use Podia-inspired warm, approachable aesthetics with energy-conscious design for chronic illness users. Generates pixel-perfect React Native code using NativeWind.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces for Clue. The design language is **Podia-inspired**: warm, approachable, and energy-conscious for users with chronic illness and brain fog.

## Architecture note (agent-driven UI)

- **Why this matters**: In `web-landing-next`, some “conversion UI” components (e.g. `ValuePropScreen`) are tightly coupled to onboarding agent output types and are rendered from the “summary” step after Q3.
- **Rule of thumb**: If a React component is user-facing UI, prefer placing it under a UI-oriented folder (`src/components/...`) or a clearly named neutral folder like `src/agent-ui/...` rather than `src/backend/...` to avoid misleading boundaries.

## Design System Reference

### Color Palette

```javascript
// Primary Colors
primary: "#20132E"           // Dark navy - text, buttons, user chat bubbles
"primary-light": "#f3f0fa"   // Very light purple - hover states

// Backgrounds
"background-light": "#FDFBF9" // Warm cream - main background
"card-light": "#FFFFFF"       // White - card surfaces
"surface-light": "#FFFFFF"    // White - elevated surfaces

// Pastel Accents (decorative blobs + category indicators)
"accent-peach": "#E8974F"    // Orange - digestive, energy icons
"accent-blue": "#A4C8D8"     // Blue - sleep icons, decorative
"accent-purple": "#D0BDF4"   // Purple - selected states, progress bars
"accent-mint": "#B8E3D6"     // Teal - Focus badge, positive states

// Selection States
"pill-hover": "#F3EFFF"      // Light purple hover
"pill-selected": "#E0D4FC"   // Purple selected background

// Text
"text-main": "#20132E"       // Dark navy
"text-muted": "#554b66"      // Muted purple-gray
```

### Typography

| Role        | Font             | Weights            | Usage                       |
| ----------- | ---------------- | ------------------ | --------------------------- |
| **Display** | Fraunces (serif) | 300, 600           | Headings, onboarding titles |
| **Body**    | Inter / DM Sans  | 400, 500, 600, 700 | UI text, buttons, body copy |

**Headlines**: Large (34-40px), semibold Fraunces, tight leading
**Body**: 16-18px Inter/DM Sans, relaxed leading
**Labels**: 12-14px Inter, uppercase tracking for section labels

### Spacing & Radius

```javascript
// Border Radius
DEFAULT: "12px"
xl: "16px"       // Cards
"2xl": "24px"    // Large cards
"3xl": "32px"    // Chat bubbles
pill: "9999px"   // Pills, buttons

// Shadows
soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
card: "0 2px 12px -2px rgba(32, 20, 69, 0.05)"
```

### Visual Elements

**Decorative Blobs** (positioned absolutely, pointer-events-none):

```jsx
// Top-right peach blob
<View className="absolute -top-10 -right-10 w-40 h-40 bg-accent-peach/80 rounded-[3rem] rotate-12 blur-sm" />

// Left blue blob
<View className="absolute top-1/4 -left-12 w-32 h-32 bg-accent-blue/60 rounded-full blur-xl" />

// Bottom-right purple blob
<View className="absolute bottom-20 -right-6 w-48 h-48 bg-accent-purple/50 rounded-[4rem] -rotate-12" />
```

**Bottom Gradient Overlay** (for sticky CTAs):

```jsx
<View className="bg-gradient-to-t from-background-light via-background-light to-transparent pt-12" />
```

## Component Patterns

### Pill Chips (Selection)

```jsx
// Unselected
<Pressable className="px-5 py-3 bg-white border border-gray-200 rounded-full shadow-sm">
  <Text className="text-gray-700 font-medium">Option</Text>
</Pressable>

// Selected
<Pressable className="px-5 py-3 bg-pill-selected border border-primary rounded-full">
  <Text className="text-primary font-semibold">Option</Text>
  <Icon name="check" size={16} />
</Pressable>
```

### Cards with Icons

```jsx
<Pressable className="flex-row items-center p-4 bg-white border-2 border-transparent rounded-2xl shadow-soft">
  {/* Icon container with category color */}
  <View className="w-12 h-12 rounded-xl bg-yellow-100 items-center justify-center mr-4">
    <Icon name="bolt" color="#CA8A04" size={24} />
  </View>
  <View className="flex-1">
    <Text className="font-semibold text-lg text-primary">Title</Text>
    <Text className="text-sm text-gray-500">Subtitle description</Text>
  </View>
  {/* Radio indicator */}
  <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
</Pressable>
```

### Chat Bubbles

```jsx
// Bot message (left aligned)
<View className="p-6 rounded-[2rem] rounded-bl-none bg-white border border-black/5 shadow-card">
  <Text className="text-[17px] leading-relaxed font-medium text-primary">
    Message content
  </Text>
</View>

// User message (right aligned)
<View className="p-6 rounded-[2rem] rounded-br-none bg-primary">
  <Text className="text-[17px] leading-relaxed font-medium text-white/95">
    Message content
  </Text>
</View>
```

### Focus Card (Hypothesis Tracking)

```jsx
<View className="rounded-[2.5rem] border border-primary/5 bg-white p-7 shadow-soft">
  {/* Badge */}
  <View className="flex-row items-center px-4 py-1.5 rounded-full bg-accent-mint/40">
    <Icon name="push-pin" size={18} className="text-teal-800" />
    <Text className="text-xs font-bold uppercase tracking-wider text-teal-900">
      Focus
    </Text>
  </View>

  {/* Hypothesis with highlighted terms */}
  <Text className="text-xl font-bold text-primary">
    How does{' '}
    <Text className="bg-accent-purple/30 px-2 rounded-lg">Poor Sleep</Text>{' '}
    impact{' '}
    <Text className="bg-accent-peach/40 px-2 rounded-lg text-orange-900">
      Joint Pain
    </Text>
    ?
  </Text>

  {/* Progress bar */}
  <View className="h-3 w-full rounded-full bg-primary-light overflow-hidden">
    <View className="h-full w-[65%] rounded-full bg-accent-purple" />
  </View>
</View>
```

### Primary Button (Sticky CTA)

```jsx
<Pressable className="w-full py-4 bg-primary rounded-full shadow-lg flex-row items-center justify-center">
  <Text className="text-white text-lg font-bold">Continue</Text>
  <Icon name="arrow-forward" color="white" className="ml-2" />
</Pressable>
```

## Energy-Conscious UX Principles

1. **Large touch targets**: Minimum 48px, preferably 56px for primary actions
2. **One-tap actions**: Prefer toggles and chips over text input
3. **Progressive disclosure**: Show minimal UI upfront, expand on demand
4. **Gentle transitions**: Soft animations, no jarring movements
5. **Clear hierarchy**: One primary CTA per screen, secondary actions subtle
6. **Forgiving interactions**: Easy to undo, skip, or "do later"

## Screen Structure

```jsx
// Standard onboarding screen
<SafeAreaView className="flex-1 bg-background-light">
  {/* Decorative blobs */}
  <DecorativeBlobs />

  {/* Content */}
  <View className="flex-1 px-6 pt-12">
    {/* Progress indicator */}
    <ProgressBar step={1} total={3} />

    {/* Title */}
    <Text className="font-display text-4xl font-semibold text-primary mb-3">
      Screen Title
    </Text>

    {/* Subtitle */}
    <Text className="text-gray-600 text-lg leading-relaxed mb-8">
      Helpful description
    </Text>

    {/* Scrollable content */}
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Options */}
    </ScrollView>
  </View>

  {/* Sticky CTA */}
  <View className="p-6 bg-gradient-to-t from-background-light via-background-light to-transparent">
    <PrimaryButton title="Continue" />
  </View>
</SafeAreaView>
```

## UI Source References

| Screen                | Design Source                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Onboarding 1A         | [`all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/`](../../all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/)             |
| Onboarding 1B         | [`all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/`](../../all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/) |
| Onboarding 2 (Intent) | [`all-ui-images-and-code/onboarding-screen-4-design-inspiration/`](../../all-ui-images-and-code/onboarding-screen-4-design-inspiration/) (pill style)            |
| Chat                  | [`all-ui-images-and-code/chat/`](../../all-ui-images-and-code/chat/)                                                                                             |
| Design Philosophy     | [`context/design-inspiration-overview.md`](../../context/design-inspiration-overview.md)                                                                         |

## Hero Pattern: Visible-Style Persona Layout (Landing Pages)

> **Inspiration:** makevisible.com — Clean, trustworthy, human-centered design.
> **Use for:** Marketing landing pages, not in-app screens.

### Desktop Layout (min-width: 768px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  SOLID BACKGROUND COLOR (accent-blue: #A4C8D8)                      │
│  ┌──────────────────────────┐    ┌─────────────────────────────────┐│
│  │  LEFT 45-50%             │    │  RIGHT 50-55%                   ││
│  │  ─────────────           │    │  ─────────────                  ││
│  │  H1: Fraunces, white     │    │                                 ││
│  │  "Your flares have       │    │     [PERSONA IMAGE]             ││
│  │   a forecast."           │    │     PNG cutout on solid bg      ││
│  │                          │    │     Position: right edge,       ││
│  │  H2: DM Sans, white/80%  │    │     bleeds off container        ││
│  │  "Get a 48-hour..."      │    │                                 ││
│  │                          │    │     object-position: top right  ││
│  │  [Condition Pills]       │    │     max-height: 90vh            ││
│  │  white borders, semi-    │    │                                 ││
│  │  transparent bg          │    │                                 ││
│  │                          │    │                                 ││
│  │  [CTA Button →]          │    │                                 ││
│  │  White bg, dark text     │    │                                 ││
│  └──────────────────────────┘    └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (max-width: 767px)

**Option A: Card Style** (Visible's iPhone screenshot)

```
┌─────────────────────────────────┐
│  CARD with rounded corners      │
│  (inside a cream background)    │
│  ─────────────────────────      │
│       H1 (centered)             │
│       H2 (centered)             │
│                                 │
│       [Condition Pills]         │
│       (wrapped, centered)       │
│                                 │
│       [CTA Button →]            │
│                                 │
│       [PERSONA IMAGE]           │
│       (below text, centered,    │
│        smaller, full visible)   │
└─────────────────────────────────┘
```

**Option B: Full-Width Background** (alternate variant)

```
┌─────────────────────────────────┐
│  FULL BLEED BACKGROUND          │
│  Persona as subtle bg image     │
│  (opacity 20%, positioned       │
│   bottom-right, fixed)          │
│  ─────────────────────────      │
│       H1 (centered)             │
│       H2 (centered)             │
│       [Pills] [CTA]             │
└─────────────────────────────────┘
```

### CSS Implementation

```css
/* Hero container - solid color background */
.hero-visible {
  background-color: #a4c8d8; /* accent-blue */
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Desktop: Image positioned right, bleeds off edge */
@media (min-width: 768px) {
  .hero-persona {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 90vh;
    max-height: 800px;
    width: auto;
    object-fit: contain;
    object-position: bottom right;
    /* Allow image to bleed off right edge */
    transform: translateX(5%);
  }
}

/* Mobile Option A: Card with image below text */
@media (max-width: 767px) {
  .hero-visible {
    background-color: #fdfbf9; /* cream wrapper */
    padding: 1rem;
  }

  .hero-card {
    background-color: #a4c8d8;
    border-radius: 2rem;
    padding: 2rem 1.5rem;
    overflow: hidden;
  }

  .hero-persona {
    position: relative;
    width: 80%;
    max-width: 300px;
    margin: 2rem auto 0;
    display: block;
  }
}

/* Condition pills - semi-transparent on colored bg */
.condition-pill {
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  backdrop-filter: blur(4px);
}

/* CTA button - white on colored bg */
.hero-cta {
  background: white;
  color: #20132e;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.2);
}
```

### Key Visual Properties

| Element            | Desktop                    | Mobile (Card)               |
| :----------------- | :------------------------- | :-------------------------- |
| **Background**     | Solid `#A4C8D8` full-bleed | Cream outer, card has color |
| **Container**      | `max-w-7xl mx-auto`        | `rounded-[2rem]` card       |
| **Text align**     | Left                       | Center                      |
| **Image size**     | 90vh height, auto width    | 80% width, centered         |
| **Image position** | Absolute, right edge bleed | Relative, below text        |
| **CTA**            | Inline with text           | Full width or centered      |

### A/B Testing Support

```html
<!-- Headlines stored as data attributes for easy swapping -->
<h1 data-variant="default">Your flares have a forecast.</h1>
<h1 data-variant="alt-1" class="hidden">See flares coming 48 hours early.</h1>
<h1 data-variant="alt-2" class="hidden">Stop being blindsided by flares.</h1>

<!-- Toggle via JS based on UTM or cookie -->
<script>
  const variant =
    new URLSearchParams(location.search).get('headline') || 'default';
  document.querySelectorAll('h1[data-variant]').forEach((el) => {
    el.classList.toggle('hidden', el.dataset.variant !== variant);
  });
</script>
```

### UTM-Based Condition Pills

```javascript
// Show relevant conditions based on subreddit/UTM source
const utmContent = new URLSearchParams(location.search).get('utm_content');
const conditionMap = {
  fibromyalgia: ['Fibromyalgia', 'Chronic Pain', 'ME/CFS'],
  long_covid: ['Long COVID', 'Post-Viral', 'ME/CFS'],
  endo: ['Endometriosis', 'PCOS', 'Chronic Pain'],
  default: ['Long COVID', 'ME/CFS', 'Fibromyalgia', 'POTS', 'EDS'],
};
const conditions = conditionMap[utmContent] || conditionMap.default;
```

---

## Spoon Saver Landing Page Patterns

> **Product Direction:** "Low-effort, non-judgmental, flexible symptom tracking that works on bad days and doesn't create guilt."

### Testimonial Cards (Social Proof)

```jsx
// Testimonial card with pain point badge
<div className="hover-lift group rounded-[2rem] border border-primary/5 bg-white p-6 shadow-soft">
  {/* Pain point badge - colored by category */}
  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-accent-purple/30 text-purple-800">
    <span className="size-1.5 rounded-full bg-current" />
    Feeling judged
  </div>

  {/* Quote - Fraunces display font */}
  <blockquote className="font-display text-primary mb-4 text-lg leading-relaxed">
    "Quote from user"
  </blockquote>

  {/* Attribution - anonymous avatar (no real faces for privacy) */}
  <div className="flex items-center gap-3">
    <div className="flex size-10 items-center justify-center rounded-full bg-accent-purple/20">
      <Icon name="person" className="text-primary/60" size="sm" />
    </div>
    <div>
      <p className="text-sm font-medium text-primary">r/ChronicIllness</p>
      <p className="text-xs text-text-muted">Fibromyalgia</p>
    </div>
  </div>
</div>
```

**Pain Point Color Mapping:**
| Pain Point | Color Class |
|------------|-------------|
| burden | `bg-accent-rose/20 text-red-700` |
| judgment | `bg-accent-purple/30 text-purple-800` |
| brain_fog | `bg-accent-blue/30 text-blue-800` |
| relief | `bg-accent-mint/40 text-teal-800` |
| aspiration | `bg-accent-peach/40 text-orange-800` |
| validation | `bg-accent-mint/30 text-teal-700` |

### "No Guilt" Comparison Cards

```jsx
// Problem card (what other apps do) - NOTE: This shows BAD patterns to avoid
<div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-6">
  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-600">
    Other Apps
  </p>
  <div className="flex items-center gap-3">
    <Icon name="sentiment_dissatisfied" size="lg" className="text-red-500" />
    <span className="text-sm text-red-700">Pain Level: 8/10 - AWFUL</span>
  </div>
  <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-100 p-2 text-sm text-red-700">
    <Icon name="warning" size="sm" className="text-red-500" />
    You broke your 14-day streak!
  </div>
</div>

// Solution card (our approach)
<div className="rounded-2xl border-2 border-accent-mint bg-accent-mint/10 p-6 shadow-soft">
  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
    Chronic Life
  </p>
  <div className="flex items-center gap-3">
    <div className="flex size-8 items-center justify-center rounded-full bg-accent-purple/20">
      <Icon name="circle" size="sm" className="text-primary/60" />
    </div>
    <span className="text-sm text-primary">Intensity: 8/10 - High intensity</span>
  </div>
  <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent-mint/30 p-2 text-sm text-teal-800">
    <Icon name="check_circle" size="sm" className="text-teal-600" />
    Logged. Tough day — hope you can rest.
  </div>
</div>
```

### Section Badge Pattern

```jsx
// Standard section badge
<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-peach/30 px-4 py-2 text-sm font-semibold text-primary">
  <Icon name="groups" size="sm" />
  From the Spoonie Community
</div>

// Badge color by section
// - Testimonials: bg-accent-peach/30
// - No Guilt: bg-accent-purple/20
// - Brain Fog: bg-accent-blue/20
// - Flare Mode: bg-accent-rose/30
```

### Onboarding Q3 Widget Patterns

Based on `onboarding-flow.json`, use these widget types:

```jsx
// Visual Battery Fill (energy_envelope)
<div className="flex items-center gap-4">
  <div className="h-16 w-8 rounded-full border-2 border-primary/20 overflow-hidden">
    <div
      className="w-full bg-accent-purple transition-all"
      style={{ height: `${value}%` }}
    />
  </div>
  <span className="text-lg font-medium text-primary">{value}%</span>
</div>

// Traffic Light Select (stability)
<div className="flex gap-3">
  {['green', 'yellow', 'red'].map(color => (
    <button className={`
      size-16 rounded-xl transition-all
      ${selected === color ? 'ring-2 ring-primary scale-110' : ''}
      ${color === 'green' && 'bg-green-400'}
      ${color === 'yellow' && 'bg-yellow-400'}
      ${color === 'red' && 'bg-red-400'}
    `}>
      {color === 'green' && 'Go'}
      {color === 'yellow' && 'Caution'}
      {color === 'red' && 'Cancel'}
    </button>
  ))}
</div>

// Multi-select chips (triggers)
<div className="flex flex-wrap gap-2">
  {options.map(opt => (
    <button className={`
      px-4 py-2 rounded-full border transition-all
      ${selected.includes(opt.value)
        ? 'bg-pill-selected border-primary text-primary font-semibold'
        : 'bg-white border-gray-200 text-gray-700'}
    `}>
      {opt.label}
    </button>
  ))}
</div>
```

### Memory Stream Visualization (Brain Fog)

```jsx
// Pattern connection between past and present
<div className="rounded-2xl rounded-bl-none border border-primary/5 bg-accent-blue/5 p-4">
  <p className="text-primary leading-relaxed">
    You logged{' '}
    <span className="rounded bg-accent-purple/20 px-1.5 py-0.5 font-medium">
      Poor Sleep
    </span>{' '}
    on Tuesday. Is today's{' '}
    <span className="rounded bg-accent-rose/20 px-1.5 py-0.5 font-medium">
      migraine
    </span>{' '}
    related?
  </p>
</div>;

{
  /* Pattern detected badge */
}
<div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-mint/20 p-3">
  <Icon name="insights" size="sm" className="text-teal-600" />
  <span className="text-sm font-medium text-teal-800">
    Pattern Detected: 70% of your migraines follow poor sleep by 48 hours
  </span>
</div>;
```

---

## Anti-Patterns (AVOID)

### CRITICAL: No Emojis

- ❌ **NEVER use emojis in UI, code, or content** — Emojis feel juvenile, inconsistent across platforms, and clash with our sophisticated Podia-inspired aesthetic. Use icons from our icon system instead.

### General Design Anti-Patterns

- ❌ Generic fonts (Inter alone is fine, but pair with Fraunces for display)
- ❌ Pure white backgrounds (use warm cream #FDFBF9)
- ❌ Sharp corners on cards (always round 16px+)
- ❌ Heavy drop shadows (use soft, low-opacity shadows)
- ❌ Dense forms or multiple text inputs per screen
- ❌ Purple gradients on white (use warm pastels instead)
- ❌ Aggressive animations or transitions
- ❌ Small touch targets (minimum 48px)
- ❌ Stock photos of smiling people (use authentic, hopeful imagery)
- ❌ Abstract illustrations instead of product UI mockups
- ❌ Rainbow gradients (stick to single accent color per section)

### Chronic Illness UX Anti-Patterns (CRITICAL)

- ❌ **Judgmental iconography**: Sad faces 😢, red angry faces, "awful" labels
- ❌ **Streak gamification**: "You broke your streak!" messages
- ❌ **Color-coded judgment**: Red = bad day (use neutral intensity scales instead)
- ❌ **Guilt-inducing language**: "You missed 3 days" without empathy
- ❌ **Complex navigation**: Nested menus requiring multiple taps
- ❌ **Required daily logging**: Must allow gaps without penalty
- ❌ **Text-heavy inputs**: Typing is hard with brain fog, use taps
- ❌ **Bright flashy UI**: Painful during migraines or sensory sensitivity
- ❌ **Social feeds in tracking**: Users want focus, not distraction
- ❌ **One-size-fits-all scales**: "6/10 is bad" — but for chronic pain, 6 might be a GOOD day

### Language Anti-Patterns (Per Language of Care guidelines)

- ❌ "Bad day" → Use "High intensity day" (neutral)
- ❌ "You should..." → Use "You might try..." (permission)
- ❌ "Track everything" → Use "Track what matters to YOUR question"
- ❌ Generic messages → Personalize with user's context
- ❌ Clinical jargon without context → Use accessible language
