---
name: chat-widgets
description: Chat component selection and creation for Clue symptom tracker. Use when building chat UI elements, selecting widgets for agent responses, or implementing interactive components like sliders, chips, toggles, voice notes, and severity scales. Guides which widget to render based on question type, user energy level, and context.
---

# Chat Widgets

Component catalog and selection logic for Clue's chat-based symptom tracker.

## Core Principle

Widgets exist to **reduce cognitive load** for people with chronic illness. Every tap saved is a spoon preserved.

## Widget Selection Decision Tree

```
Question Type → Widget
─────────────────────────────────────
Severity/intensity (0-10)     → SeveritySlider
Multi-select options          → ChipGroup
Binary yes/no                 → Toggle
Time/date entry               → TimePicker
Open-ended short              → NoteInput
Voice when low energy         → VoiceNote
Context display               → MemoryCard
```

## Widget Catalog

### 1. SeveritySlider

**When:** Rating intensity, pain levels, energy, sleep quality
**Props:** `label`, `value`, `onChange`, `min=1`, `max=10`
**Visual:** Gradient track (green→orange→red), draggable thumb, value badge

```tsx
<SeveritySlider
  label="How bad is the headache?"
  value={6}
  onChange={setValue}
/>
```

### 2. ChipGroup (Multi-select)

**When:** Symptoms, suspects/drivers, tags
**Props:** `options[]`, `selected[]`, `onChange`, `maxSelect?`
**Visual:** Horizontal wrap, pill-shaped, selected=filled

```tsx
<ChipGroup
  options={['Headache', 'Fatigue', 'Brain fog', 'Nausea']}
  selected={['Fatigue']}
  onChange={setSelected}
  maxSelect={5}
/>
```

### 3. Toggle

**When:** Binary states (flare mode, meds taken)
**Props:** `label`, `value`, `onChange`, `description?`

```tsx
<Toggle
  label="Flare mode"
  description="Low-energy tracking"
  value={isFlare}
  onChange={setFlare}
/>
```

### 4. VoiceNote

**When:** User energy is low, typing is hard, flare mode active
**Props:** `onRecordComplete`, `maxDuration=60`
**Visual:** Waveform visualization, record button, playback

```tsx
<VoiceNote
  onRecordComplete={(audio, transcript) => processVoice(audio, transcript)}
/>
```

### 5. QuickTapChip

**When:** One-tap logging, frequent actions
**Props:** `label`, `emoji?`, `onTap`, `variant='outline'|'filled'`

```tsx
<QuickTapChip emoji="😴" label="Poor sleep" onTap={logPoorSleep} />
```

### 6. MemoryCard

**When:** Showing remembered context, pattern detection
**Props:** `icon`, `text`, `timestamp?`

```tsx
<MemoryCard icon="psychology" text="Remembering last 3 days..." />
```

### 7. ContextTag

**When:** Inline context references in messages
**Props:** `label`, `variant='sleep'|'stress'|'symptom'|'driver'`

```tsx
<ContextTag label="poor sleep" variant="sleep" />
```

## Flare Mode Adaptations

When `flareMode=true`:

- Reduce options (top 3-5 only)
- Larger touch targets (+20%)
- Voice note prominent
- Skip optional fields
- One question at a time

## Styling Tokens

```
--widget-bg: var(--bg-cream)
--widget-border: var(--primary-10)
--widget-selected: var(--accent-peach)
--widget-track-low: #90EE90
--widget-track-mid: #FFD580
--widget-track-high: #FFB4B4
--widget-radius: 16px
```

## Selection by Context

| User State       | Prefer               | Avoid                |
| ---------------- | -------------------- | -------------------- |
| High energy      | Multi-step, detailed | -                    |
| Low energy/flare | Voice, one-tap chips | Multi-select, typing |
| Morning check-in | Quick chips          | Long forms           |
| Evening review   | Sliders, notes       | -                    |

## Implementation Notes

- All widgets should be **accessible** (screen reader labels, color contrast)
- Animations: subtle scale on press (0.95), no jarring transitions
- Save immediately on interaction (no submit buttons)
- Support both light/dark themes via CSS variables
