/**
 * Onboarding route group layout
 *
 * Why it exists: Provides stack navigation for the 6-screen onboarding flow
 * with consistent transitions and no gesture-based back navigation.
 *
 * Reference: specs/1-onboarding-flow/PLAN.md §Phase 9
 */

import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent swipe back during onboarding
      }}
    >
      {/* Screen 1A: Conditions selection */}
      <Stack.Screen name="conditions" />
      {/* Screen 1B: Priority selection */}
      <Stack.Screen name="priority" />
      {/* Screen 1C: Impact question */}
      <Stack.Screen name="impact" />
      {/* Screen 2: Intent mode */}
      <Stack.Screen name="intent" />
      {/* Screen 3: Baseline capture */}
      <Stack.Screen name="baseline" />
      {/* Screen 4: First value moment */}
      <Stack.Screen name="first-chat" />
    </Stack>
  );
}
