---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for the Clue Symptom Tracker. Use Podia-inspired warm, approachable aesthetics with energy-conscious design for chronic illness users. Generates pixel-perfect React Native code using NativeWind.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces for Clue. The design language is **Podia-inspired**: warm, approachable, and energy-conscious for users with chronic illness and brain fog.

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

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| **Display** | Fraunces (serif) | 300, 600 | Headings, onboarding titles |
| **Body** | Inter / DM Sans | 400, 500, 600, 700 | UI text, buttons, body copy |

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
    <Text className="text-xs font-bold uppercase tracking-wider text-teal-900">Focus</Text>
  </View>
  
  {/* Hypothesis with highlighted terms */}
  <Text className="text-xl font-bold text-primary">
    How does <Text className="bg-accent-purple/30 px-2 rounded-lg">Poor Sleep</Text> impact{' '}
    <Text className="bg-accent-peach/40 px-2 rounded-lg text-orange-900">Joint Pain</Text>?
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

| Screen | Design Source |
|--------|---------------|
| Onboarding 1A | [`all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/`](../../all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/) |
| Onboarding 1B | [`all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/`](../../all-ui-images-and-code/onboarding-screen-2-what_matters_most_right_now?_1/) |
| Onboarding 2 (Intent) | [`all-ui-images-and-code/onboarding-screen-4-design-inspiration/`](../../all-ui-images-and-code/onboarding-screen-4-design-inspiration/) (pill style) |
| Chat | [`all-ui-images-and-code/chat/`](../../all-ui-images-and-code/chat/) |
| Design Philosophy | [`context/design-inspiration-overview.md`](../../context/design-inspiration-overview.md) |

## Anti-Patterns (AVOID)

- ❌ Generic fonts (Inter alone is fine, but pair with Fraunces for display)
- ❌ Pure white backgrounds (use warm cream #FDFBF9)
- ❌ Sharp corners on cards (always round 16px+)
- ❌ Heavy drop shadows (use soft, low-opacity shadows)
- ❌ Dense forms or multiple text inputs per screen
- ❌ Purple gradients on white (use warm pastels instead)
- ❌ Aggressive animations or transitions
- ❌ Small touch targets (minimum 48px)
