/**
 * Quick Entry Tab - Placeholder
 * 
 * Why it exists: Fast widget-based logging for under 30 seconds.
 * Currently a placeholder until the quick entry feature is implemented.
 * 
 * Reference: context/Product-Spec.md §Quick Entry
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/design';

export default function QuickEntryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Entry</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.description}>
          Your personalized quick entry widgets will appear here. Log symptoms
          in under 30 seconds.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

