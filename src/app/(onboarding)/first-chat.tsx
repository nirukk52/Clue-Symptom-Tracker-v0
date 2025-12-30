/**
 * Screen 4: "Baseline captured"
 * 
 * Why it exists: Final onboarding screen showing the first value moment - 
 * confirmation, calendar preview promise, and transition to chat.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 6
 */

import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ContinueButton, StepContainer } from '@/components/onboarding';
import { colors } from '@/constants/design';
import { useOnboardingStore } from '@/lib/store/onboarding';

interface ValueCardProps {
  title: string;
  description: string;
  delay?: number;
}

function ValueCard({ title, description, delay = 0 }: ValueCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay, type: 'timing' }}
      style={styles.card}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </MotiView>
  );
}

export default function FirstChatScreen() {
  const { impactQuestion, completeOnboarding } = useOnboardingStore();

  const featureLabel = impactQuestion?.featureId ?? 'your feature';
  const outcomeLabel = impactQuestion?.outcomeId ?? 'your outcome';

  const handleStartChatting = useCallback(() => {
    completeOnboarding();
    router.replace('/(tabs)/chat');
  }, [completeOnboarding]);

  const handleQuickEntry = useCallback(() => {
    completeOnboarding();
    router.replace('/(tabs)/quick-entry');
  }, [completeOnboarding]);

  return (
    <StepContainer
      currentStep={5}
      title="Baseline captured"
      subtitle="You've started building a record your doctor can actually use."
      hideProgress
      continueButton={{
        label: 'Start chatting',
        onPress: handleStartChatting,
      }}
      secondaryAction={{
        label: 'Quick entry',
        onPress: handleQuickEntry,
      }}
    >
      <View style={styles.container}>
        {/* Success checkmark */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={styles.checkmarkContainer}
        >
          <Text style={styles.checkmark}>✓</Text>
        </MotiView>

        {/* Value cards */}
        <ValueCard
          title="Your calendar, filled in"
          description="Each check-in becomes a clean day card you can tap later."
          delay={200}
        />

        <ValueCard
          title="What happens next"
          description={`After 3 days, Clue starts spotting early links between ${featureLabel} and ${outcomeLabel}.\n\nAfter 14 days, you'll unlock a clear 2–4 week trend view.`}
          delay={300}
        />

        <ValueCard
          title="Doctor-ready from day one"
          description="Clue summarizes symptoms in a tight, structured format clinicians recognize (onset, location, severity, what helps, what worsens).\n\nTrends show up as simple graphs so patterns are obvious fast."
          delay={400}
        />
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkmark: {
    fontSize: 40,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});

