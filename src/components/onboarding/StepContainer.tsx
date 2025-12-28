/**
 * StepContainer - Layout wrapper for all onboarding screens
 * 
 * Why it exists: Provides consistent layout structure including
 * background blobs, progress indicator, scrollable content, and fixed bottom CTA.
 * 
 * Reference: specs/1-onboarding-flow/PLAN.md §2.4 StepContainer
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/design';

import { BackgroundBlobs } from './BackgroundBlobs';
import { BackButton } from './BackButton';
import { ContinueButton } from './ContinueButton';
import { ProgressIndicator } from './ProgressIndicator';

interface StepContainerProps {
  /** Current step (0-indexed) */
  currentStep: number;
  /** Total steps (default: 6) */
  totalSteps?: number;
  /** Screen title */
  title: string;
  /** Screen subtitle/description */
  subtitle?: string;
  /** Main content */
  children: React.ReactNode;
  /** Continue button props */
  continueButton?: {
    label?: string;
    disabled?: boolean;
    onPress: () => void;
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Hide progress indicator */
  hideProgress?: boolean;
  /** Show back button (default: true if currentStep > 0) */
  showBackButton?: boolean;
  /** Custom back button handler */
  onBackPress?: () => void;
}

export function StepContainer({
  currentStep,
  totalSteps = 6,
  title,
  subtitle,
  children,
  continueButton,
  secondaryAction,
  hideProgress = false,
  showBackButton,
  onBackPress,
}: StepContainerProps) {
  const insets = useSafeAreaInsets();
  const shouldShowBack = showBackButton ?? currentStep > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundLight }]}>
      <BackgroundBlobs />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
          {/* Back button */}
          {shouldShowBack && (
            <View style={styles.backButtonContainer}>
              <BackButton onPress={onBackPress} />
            </View>
          )}

          {/* Progress indicator */}
          {!hideProgress && (
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>

        {/* Fixed bottom CTA area */}
        {continueButton && (
          <View
            style={[
              styles.bottomArea,
              { paddingBottom: insets.bottom + 16 },
            ]}
          >
            <ContinueButton
              label={continueButton.label}
              disabled={continueButton.disabled}
              onPress={continueButton.onPress}
            />
            {secondaryAction && (
              <Text style={styles.secondaryAction} onPress={secondaryAction.onPress}>
                {secondaryAction.label}
              </Text>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButtonContainer: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textMuted,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for bottom CTA
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: colors.backgroundLight,
  },
  secondaryAction: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
});

