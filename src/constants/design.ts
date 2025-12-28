/**
 * Design tokens for Clue Symptom Tracker
 * 
 * Why it exists: Centralized source of truth for the Podia-inspired design system.
 * All colors, spacing, and typography values should reference these tokens.
 * 
 * Reference: .specify/memory/constitution.md §Design System
 */

export const colors = {
  /** Dark navy - primary text, buttons, user chat bubbles */
  primary: '#20132E',
  /** Lighter tint of primary for backgrounds */
  primaryLight: '#f3f0fa',
  
  /** Warm cream - main app background */
  backgroundLight: '#FDFBF9',
  /** Pure white - card surfaces */
  cardLight: '#FFFFFF',
  
  /** Peach/orange - decorative blob, digestive category, selected accents */
  accentPeach: '#E8974F',
  /** Soft blue - decorative blob, sleep category */
  accentBlue: '#A4C8D8',
  /** Lavender purple - decorative blob, selected states */
  accentPurple: '#D0BDF4',
  /** Teal/mint - Focus badge, positive indicators */
  accentMint: '#B8E3D6',
  
  /** Muted gray for secondary text */
  textMuted: '#666666',
  /** Light gray for input borders */
  inputBorder: '#E5E5E5',
  
  /** Pure white */
  white: '#FFFFFF',
  /** Pure black */
  black: '#000000',
} as const;

export const spacing = {
  /** 4px - tight spacing */
  xs: 4,
  /** 8px - small gaps */
  sm: 8,
  /** 16px - standard spacing */
  md: 16,
  /** 24px - section gaps */
  lg: 24,
  /** 32px - large sections */
  xl: 32,
  /** 48px - hero spacing */
  xxl: 48,
} as const;

export const borderRadius = {
  /** 8px - subtle rounding */
  sm: 8,
  /** 16px - card corners */
  md: 16,
  /** 24px - larger cards */
  lg: 24,
  /** 32px - prominent cards */
  xl: 32,
  /** 9999px - pills and buttons */
  full: 9999,
} as const;

export const shadows = {
  /** Soft card shadow */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  /** Subtle shadow for elevated elements */
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;

export const typography = {
  /** Display headings - Fraunces serif */
  display: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
  },
  /** Large headings */
  heading: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
  },
  /** Body text - Inter */
  body: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
  },
  /** Small body text */
  bodySmall: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 20,
  },
  /** Caption text */
  caption: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

