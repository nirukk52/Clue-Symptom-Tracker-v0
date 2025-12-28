/**
 * IntentCard - Mode selection card for Screen 2 "What brings you here today?"
 * 
 * Why it exists: Displays intent mode with title and all 5 quotes visible,
 * following the spec requirement of no expand/collapse.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 4
 */

import { MotiPressable } from 'moti/interactions';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/design';

interface IntentCardProps {
  /** Mode icon */
  icon: string;
  /** Mode title */
  title: string;
  /** Tagline subtitle */
  tagline: string;
  /** Array of 5 quotes */
  quotes: string[];
  /** Whether card is selected */
  selected: boolean;
  /** Press handler */
  onPress: () => void;
}

export function IntentCard({
  icon,
  title,
  tagline,
  quotes,
  selected,
  onPress,
}: IntentCardProps) {
  const animationState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return {
          scale: pressed ? 0.98 : 1,
        };
      },
    []
  );

  return (
    <MotiPressable
      onPress={onPress}
      animate={animationState}
      style={[styles.container, selected && styles.selected]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, selected && styles.titleSelected]}>
            {title}
          </Text>
          <Text style={styles.tagline}>— "{tagline}"</Text>
        </View>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Quotes - all visible, no expand */}
      <View style={styles.quotesContainer}>
        {quotes.map((quote, index) => (
          <Text key={index} style={styles.quote}>
            "{quote}"
          </Text>
        ))}
      </View>
    </MotiPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  titleSelected: {
    color: colors.primary,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  quotesContainer: {
    paddingLeft: 36, // Align with title
  },
  quote: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 4,
  },
});

