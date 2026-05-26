# Widget Catalog Reference

Extended specifications for each widget type.

## SeveritySlider

### Visual Spec

- **Track:** 4px height, rounded, gradient background
- **Thumb:** 24px circle, white with shadow, centered on value
- **Labels:** "Mild | Moderate | Severe" below track
- **Badge:** Top-right showing "N/10"

### Gradient Colors

```css
background: linear-gradient(
  to right,
  #90ee90 0%,
  /* Mild - mint */ #ffd580 50%,
  /* Moderate - peach */ #ffb4b4 100% /* Severe - rose */
);
```

### Interaction

- Drag thumb OR tap anywhere on track
- Haptic feedback on value change
- Value snaps to integers

---

## ChipGroup

### Variants

**Default (outline):**

- Border: 1px solid var(--primary-10)
- Background: white
- Text: var(--text-muted)

**Selected (filled):**

- Border: none
- Background: var(--primary)
- Text: white

**With emoji:**

- Emoji prefix before label
- 6px gap between emoji and text

### Layout

- Horizontal flex-wrap
- 8px gap between chips
- Chips have equal padding (12px h, 8px v)

---

## Toggle

### States

- **Off:** Track gray, thumb left
- **On:** Track accent-peach, thumb right, checkmark

### Animation

- Thumb slides 200ms ease-out
- Track color fades 150ms

---

## VoiceNote

### Recording UI

- Pulsing red indicator during record
- Waveform visualization (canvas-based)
- Timer showing elapsed time

### Playback UI

- Static waveform
- Play/pause button
- Scrubber with current time

### Processing

- Transcription via Whisper API
- Clue extracts structured data from transcript
- Show "Processing..." state during transcription

---

## QuickTapChip

### Touch Target

- Minimum 44x44px for accessibility
- In flare mode: 52x52px minimum

### Feedback

- Scale to 0.95 on press
- Checkmark appears briefly on tap
- Subtle bounce animation

---

## MemoryCard

### Layout

- Icon (MaterialIcon) left
- Text right
- Subtle background (primary/5)
- 12px padding all sides

### Icons by Context

- psychology → remembering/context
- trending_up → pattern detected
- warning → potential trigger
- check_circle → logged successfully

---

## ContextTag

### Color Variants

```
sleep:    bg-blue-100, text-blue-800
stress:   bg-orange-100, text-orange-800
symptom:  bg-red-100, text-red-800
driver:   bg-purple-100, text-purple-800
default:  bg-gray-100, text-gray-800
```

### Usage

Inline within message text:
"Your **{ContextTag:poor sleep}** yesterday often precedes headaches."
