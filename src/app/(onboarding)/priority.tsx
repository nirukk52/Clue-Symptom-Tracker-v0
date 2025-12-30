/**
 * Screen 1B: "What matters most right now?"
 * 
 * Why it exists: Second onboarding screen where users select their primary
 * focus area for tracking. This drives the first month's charts and Focus Hypothesis.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 2
 */

import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectionChip, StepContainer } from '@/components/onboarding';
import { PRIORITIES, type PriorityId } from '@/constants/priorities';
import { useOnboardingStore } from '@/lib/store/onboarding';

export default function PriorityScreen() {
  const { priority: savedPriority, setPriority } = useOnboardingStore();
  const [selected, setSelected] = useState<PriorityId | null>(savedPriority);

  const handleSelect = useCallback((priorityId: PriorityId) => {
    setSelected(priorityId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selected) {
      setPriority(selected);
      router.push('/(onboarding)/impact');
    }
  }, [selected, setPriority]);

  return (
    <StepContainer
      currentStep={1}
      title="What matters most right now?"
      subtitle="Choose one primary area you want to track to help us personalize your daily log."
      continueButton={{
        onPress: handleContinue,
        disabled: !selected,
      }}
    >
      <View style={styles.container}>
        {PRIORITIES.map((priority, index) => (
          <MotiView
            key={priority.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'timing' }}
          >
            <SelectionChip
              variant="with-description"
              label={priority.label}
              description={priority.description}
              emoji={priority.icon}
              selected={selected === priority.id}
              onPress={() => handleSelect(priority.id)}
            />
          </MotiView>
        ))}
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

