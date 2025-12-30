/**
 * BackButton - Back navigation button for onboarding screens
 * 
 * Why it exists: Allows users to navigate back through onboarding screens
 * with a consistent, accessible back button UI.
 */

import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/design';

interface BackButtonProps {
  /** Callback when back is pressed */
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>←</Text>
        <Text style={styles.label}>Back</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  icon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: 6,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

