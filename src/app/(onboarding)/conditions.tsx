/**
 * Screen 1A: "What are you managing?"
 * 
 * Why it exists: First onboarding screen where users select up to 3
 * chronic conditions to personalize their tracking experience.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 1
 */

import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SelectionChip, StepContainer } from '@/components/onboarding';
import {
  CONDITION_CATEGORIES,
  CONDITIONS,
  MAX_CONDITIONS,
  type Condition,
  type ConditionCategory,
} from '@/constants/conditions';
import { colors } from '@/constants/design';
import { useOnboardingStore } from '@/lib/store/onboarding';

export default function ConditionsScreen() {
  const { conditions: savedConditions, setConditions } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(savedConditions);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = useCallback((conditionId: string) => {
    setSelected((prev) => {
      if (prev.includes(conditionId)) {
        return prev.filter((id) => id !== conditionId);
      }
      if (prev.length >= MAX_CONDITIONS) {
        // TODO: Add shake animation feedback
        return prev;
      }
      return [...prev, conditionId];
    });
  }, []);

  const handleContinue = useCallback(() => {
    setConditions(selected);
    router.push('/(onboarding)/priority');
  }, [selected, setConditions]);

  const handleSkip = useCallback(() => {
    setConditions([]);
    router.push('/(onboarding)/priority');
  }, [setConditions]);

  // Filter conditions based on search
  const filteredConditions = searchQuery
    ? CONDITIONS.filter((c) =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Group conditions by category
  const groupedConditions = CONDITIONS.reduce(
    (acc, condition) => {
      if (!acc[condition.category]) {
        acc[condition.category] = [];
      }
      acc[condition.category]?.push(condition);
      return acc;
    },
    {} as Record<ConditionCategory, Condition[]>
  );

  return (
    <StepContainer
      currentStep={0}
      title="What are you managing?"
      subtitle="Select up to 3 chronic conditions or symptoms to personalize your tracking."
      continueButton={{
        onPress: handleContinue,
        disabled: selected.length === 0,
      }}
      secondaryAction={{
        label: "I'll choose later",
        onPress: handleSkip,
      }}
    >
      {/* Search input */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conditions, symptoms..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Selection counter */}
      <Text style={styles.counter}>
        {selected.length} of {MAX_CONDITIONS} selected
      </Text>

      {/* Search results or grouped conditions */}
      {filteredConditions ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.chipsContainer}
        >
          {filteredConditions.map((condition, index) => (
            <MotiView
              key={condition.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 30 }}
            >
              <SelectionChip
                label={condition.label}
                emoji={condition.emoji}
                selected={selected.includes(condition.id)}
                disabled={
                  !selected.includes(condition.id) &&
                  selected.length >= MAX_CONDITIONS
                }
                onPress={() => handleToggle(condition.id)}
              />
            </MotiView>
          ))}
        </MotiView>
      ) : (
        Object.entries(groupedConditions).map(([category, categoryConditions]) => (
          <View key={category} style={styles.categorySection}>
            {/* Category header */}
            <View style={styles.categoryHeader}>
              {category !== 'common' && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        CONDITION_CATEGORIES[category as ConditionCategory]
                          ?.color ?? colors.textMuted,
                    },
                  ]}
                />
              )}
              <Text style={styles.categoryTitle}>
                {CONDITION_CATEGORIES[category as ConditionCategory]?.label}
              </Text>
            </View>

            {/* Condition chips */}
            <View style={styles.chipsContainer}>
              {categoryConditions.map((condition: Condition, index: number) => (
                <MotiView
                  key={condition.id}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 50, type: 'timing' }}
                >
                  <SelectionChip
                    label={condition.label}
                    emoji={condition.emoji}
                    selected={selected.includes(condition.id)}
                    disabled={
                      !selected.includes(condition.id) &&
                      selected.length >= MAX_CONDITIONS
                    }
                    onPress={() => handleToggle(condition.id)}
                  />
                </MotiView>
              ))}
            </View>
          </View>
        ))
      )}
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
  },
  counter: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

