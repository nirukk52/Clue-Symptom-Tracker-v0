/**
 * ProgressIndicator - 6-step dot indicator for onboarding flow
 * 
 * Why it exists: Shows users their progress through the onboarding flow
 * with visual distinction between completed, active, and upcoming steps.
 * 
 * Reference: specs/1-onboarding-flow/PLAN.md §2.3 ProgressIndicator
 */

import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/design';

interface ProgressIndicatorProps {
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total number of steps (default: 6) */
  totalSteps?: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps = 6,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <MotiView
            key={index}
            animate={{
              backgroundColor: isActive
                ? colors.primary
                : isCompleted
                  ? colors.accentPeach
                  : colors.inputBorder,
              scale: isActive ? 1.2 : 1,
            }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.dot}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

