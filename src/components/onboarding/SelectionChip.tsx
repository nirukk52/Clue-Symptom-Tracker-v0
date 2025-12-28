/**
 * SelectionChip - Pill-shaped toggle button for multi/single select options
 * 
 * Why it exists: Primary selection UI for onboarding screens. Supports both
 * simple chips (conditions) and description variants (priorities).
 * 
 * Reference: all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html
 */

import { MotiPressable } from 'moti/interactions';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/design';

interface SelectionChipProps {
  /** Display label */
  label: string;
  /** Optional emoji prefix */
  emoji?: string;
  /** Whether chip is currently selected */
  selected: boolean;
  /** Whether chip is disabled (e.g., max selections reached) */
  disabled?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Chip style variant */
  variant?: 'default' | 'with-description';
  /** Description text (only for with-description variant) */
  description?: string;
}

export function SelectionChip({
  label,
  emoji,
  selected,
  disabled = false,
  onPress,
  variant = 'default',
  description,
}: SelectionChipProps) {
  const animationState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return {
          scale: pressed && !disabled ? 0.95 : 1,
        };
      },
    [disabled]
  );

  if (variant === 'with-description') {
    return (
      <MotiPressable
        onPress={onPress}
        disabled={disabled}
        animate={animationState}
        style={[
          styles.cardContainer,
          selected && styles.cardSelected,
          disabled && styles.disabled,
        ]}
      >
        {emoji && <Text style={styles.cardEmoji}>{emoji}</Text>}
        <View style={styles.cardContent}>
          <Text
            style={[styles.cardLabel, selected && styles.cardLabelSelected]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.cardDescription,
                selected && styles.cardDescriptionSelected,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </MotiPressable>
    );
  }

  const chipStyle = [
    styles.chipContainer,
    selected ? styles.chipSelected : undefined,
    disabled ? styles.disabled : undefined,
  ];

  return (
    <MotiPressable
      onPress={onPress}
      disabled={disabled}
      animate={animationState}
      style={chipStyle}
    >
      {emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
      {selected && <Text style={styles.chipCheck}>✓</Text>}
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  // Default chip styles
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  chipLabelSelected: {
    color: colors.white,
  },
  chipCheck: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 4,
  },

  // Card variant styles (with-description)
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cardDescriptionSelected: {
    color: colors.textMuted,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
});

