/**
 * Screen 1C: "Your first impact question"
 * 
 * Why it exists: Third onboarding screen where users create their Focus Hypothesis
 * by selecting a Feature and Outcome: "How does [Feature] impact [Outcome]?"
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 3
 */

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StepContainer } from '@/components/onboarding';
import {
  FEATURES,
  generateImpactQuestion,
  OUTCOMES,
  type FeatureOption,
  type OutcomeOption,
} from '@/constants/impact-options';
import { colors } from '@/constants/design';
import { useOnboardingStore } from '@/lib/store/onboarding';
import type { FeatureId, OutcomeId } from '@/types/onboarding';

export default function ImpactScreen() {
  const { setImpactQuestion, priority } = useOnboardingStore();
  const [selectedFeature, setSelectedFeature] = useState<FeatureId | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeId | null>(null);

  const featureSheetRef = useRef<BottomSheetModal>(null);
  const outcomeSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['50%'], []);

  const handleContinue = useCallback(() => {
    if (selectedFeature && selectedOutcome) {
      setImpactQuestion({
        featureId: selectedFeature,
        outcomeId: selectedOutcome,
        questionText: generateImpactQuestion(selectedFeature, selectedOutcome),
      });
      router.push('/(onboarding)/intent');
    }
  }, [selectedFeature, selectedOutcome, setImpactQuestion]);

  const openFeatureSheet = useCallback(() => {
    featureSheetRef.current?.present();
  }, []);

  const openOutcomeSheet = useCallback(() => {
    outcomeSheetRef.current?.present();
  }, []);

  const selectFeature = useCallback((feature: FeatureOption) => {
    setSelectedFeature(feature.id);
    featureSheetRef.current?.dismiss();
  }, []);

  const selectOutcome = useCallback((outcome: OutcomeOption) => {
    setSelectedOutcome(outcome.id);
    outcomeSheetRef.current?.dismiss();
  }, []);

  const featureLabel = selectedFeature
    ? FEATURES.find((f) => f.id === selectedFeature)?.label
    : null;

  const outcomeLabel = selectedOutcome
    ? OUTCOMES.find((o) => o.id === selectedOutcome)?.label
    : null;

  // Move "Your priority" to the top of outcomes
  const sortedOutcomes = useMemo(() => {
    const priorityOutcome = OUTCOMES.find((o) => o.id === 'your-priority');
    const otherOutcomes = OUTCOMES.filter((o) => o.id !== 'your-priority');
    return priorityOutcome ? [priorityOutcome, ...otherOutcomes] : OUTCOMES;
  }, []);

  return (
    <StepContainer
      currentStep={2}
      title="What's the question you're trying to answer?"
      subtitle="Start with one question. You can add more later."
      continueButton={{
        label: 'Get started',
        onPress: handleContinue,
        disabled: !selectedFeature || !selectedOutcome,
      }}
    >
      {/* Question preview */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.questionCard}
      >
        <Text style={styles.questionLabel}>How does my</Text>
        <View style={styles.questionRow}>
          <Pressable style={styles.dropdown} onPress={openFeatureSheet}>
            <Text
              style={[
                styles.dropdownText,
                selectedFeature && styles.dropdownTextSelected,
              ]}
            >
              {featureLabel ?? 'Feature'}
            </Text>
            <Text style={styles.dropdownCaret}>▼</Text>
          </Pressable>
        </View>
        <Text style={styles.questionLabel}>impact</Text>
        <View style={styles.questionRow}>
          <Pressable style={styles.dropdown} onPress={openOutcomeSheet}>
            <Text
              style={[
                styles.dropdownText,
                selectedOutcome && styles.dropdownTextSelected,
              ]}
            >
              {outcomeLabel ?? 'Outcome'}
            </Text>
            <Text style={styles.dropdownCaret}>▼</Text>
          </Pressable>
        </View>
        <Text style={styles.questionMark}>?</Text>
      </MotiView>

      {/* Validation message */}
      {!selectedFeature || !selectedOutcome ? (
        <Text style={styles.validationText}>
          Choose both a feature and an outcome
        </Text>
      ) : null}

      {/* Feature Bottom Sheet */}
      <BottomSheetModal
        ref={featureSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Choose a feature</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {FEATURES.map((feature) => (
              <Pressable
                key={feature.id}
                style={[
                  styles.sheetOption,
                  selectedFeature === feature.id && styles.sheetOptionSelected,
                ]}
                onPress={() => selectFeature(feature)}
              >
                <Text style={styles.sheetOptionEmoji}>{feature.emoji}</Text>
                <Text
                  style={[
                    styles.sheetOptionLabel,
                    selectedFeature === feature.id &&
                      styles.sheetOptionLabelSelected,
                  ]}
                >
                  {feature.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Outcome Bottom Sheet */}
      <BottomSheetModal
        ref={outcomeSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Choose an outcome</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sortedOutcomes.map((outcome) => (
              <Pressable
                key={outcome.id}
                style={[
                  styles.sheetOption,
                  selectedOutcome === outcome.id && styles.sheetOptionSelected,
                ]}
                onPress={() => selectOutcome(outcome)}
              >
                <Text style={styles.sheetOptionEmoji}>{outcome.emoji}</Text>
                <Text
                  style={[
                    styles.sheetOptionLabel,
                    selectedOutcome === outcome.id &&
                      styles.sheetOptionLabelSelected,
                  ]}
                >
                  {outcome.label}
                  {outcome.id === 'your-priority' && priority && (
                    <Text style={styles.priorityHint}> (Your focus)</Text>
                  )}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 18,
    color: colors.textMuted,
    marginVertical: 8,
  },
  questionRow: {
    width: '100%',
    marginVertical: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  dropdownText: {
    fontSize: 17,
    color: colors.textMuted,
  },
  dropdownTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dropdownCaret: {
    fontSize: 12,
    color: colors.textMuted,
  },
  questionMark: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  validationText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  sheetBackground: {
    backgroundColor: colors.white,
    borderRadius: 24,
  },
  sheetIndicator: {
    backgroundColor: colors.inputBorder,
    width: 40,
  },
  sheetContent: {
    flex: 1,
    padding: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sheetOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  sheetOptionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  sheetOptionLabel: {
    fontSize: 16,
    color: colors.primary,
  },
  sheetOptionLabelSelected: {
    fontWeight: '600',
  },
  priorityHint: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

