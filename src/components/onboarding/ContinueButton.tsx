/**
 * ContinueButton - Primary CTA button for onboarding screens
 * 
 * Why it exists: Consistent full-width button for advancing through
 * the onboarding flow with proper disabled states and press feedback.
 * 
 * Reference: all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html
 */

import { MotiPressable } from 'moti/interactions';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/design';

interface ContinueButtonProps {
  /** Press handler */
  onPress: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Button label (default: "Continue") */
  label?: string;
  /** Show arrow icon */
  showArrow?: boolean;
}

export function ContinueButton({
  onPress,
  disabled = false,
  label = 'Continue',
  showArrow = true,
}: ContinueButtonProps) {
  const animationState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return {
          scale: pressed && !disabled ? 0.98 : 1,
        };
      },
    [disabled]
  );

  return (
    <MotiPressable
      onPress={onPress}
      disabled={disabled}
      animate={animationState}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.label}>{label}</Text>
      {showArrow && (
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      )}
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    color: colors.white,
  },
});

