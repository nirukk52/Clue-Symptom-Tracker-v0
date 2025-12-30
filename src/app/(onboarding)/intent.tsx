/**
 * Screen 2: "What brings you here today?"
 * 
 * Why it exists: Fourth onboarding screen where users select their current mindset
 * from 4 modes, each with 5 representative quotes. This tunes first-week behavior.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 4
 */

import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IntentCard, StepContainer } from '@/components/onboarding';
import { INTENT_MODES, INTENT_TAGLINES } from '@/constants/intents';
import { useOnboardingStore } from '@/lib/store/onboarding';
import type { IntentId } from '@/types/onboarding';

export default function IntentScreen() {
  const { intent: savedIntent, setIntent } = useOnboardingStore();
  const [selected, setSelected] = useState<IntentId | null>(savedIntent);

  const handleSelect = useCallback((intentId: IntentId) => {
    setSelected(intentId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selected) {
      setIntent(selected);
      router.push('/(onboarding)/baseline');
    }
  }, [selected, setIntent]);

  return (
    <StepContainer
      currentStep={3}
      title="What brings you here today?"
      subtitle="Pick the one that resonates most. This helps Clue adapt to your needs."
      continueButton={{
        onPress: handleContinue,
        disabled: !selected,
      }}
    >
      <View style={styles.container}>
        {INTENT_MODES.map((mode, index) => (
          <MotiView
            key={mode.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'timing' }}
          >
            <IntentCard
              icon={mode.icon}
              title={mode.title}
              tagline={INTENT_TAGLINES[mode.id]}
              quotes={mode.quotes}
              selected={selected === mode.id}
              onPress={() => handleSelect(mode.id)}
            />
          </MotiView>
        ))}
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4, // IntentCard has marginBottom built in
  },
});

