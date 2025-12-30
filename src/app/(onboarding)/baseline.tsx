/**
 * Screen 3: "Quick check-in"
 * 
 * Why it exists: Fifth onboarding screen where users provide their first baseline
 * data using adaptive widgets. This triggers the Intake Agent for the first time.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 5
 */

import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { StepContainer } from '@/components/onboarding';
import { colors } from '@/constants/design';
import { getPriorityLabel } from '@/constants/priorities';
import { useOnboardingStore } from '@/lib/store/onboarding';

const FLARE_START_OPTIONS = [
  { id: 'just-now', label: 'Just now' },
  { id: 'earlier-today', label: 'Earlier today' },
  { id: 'yesterday', label: 'Yesterday' },
] as const;

const DRIVER_OPTIONS = [
  { id: 'missed-meds', label: 'Missed meds', emoji: '💊' },
  { id: 'poor-sleep', label: 'Poor sleep', emoji: '😴' },
  { id: 'stress-spike', label: 'Stress spike', emoji: '😤' },
  { id: 'food-trigger', label: 'Food trigger', emoji: '🍽️' },
  { id: 'weather', label: 'Weather', emoji: '🌤️' },
  { id: 'overexertion', label: 'Overexertion', emoji: '🏃' },
];

export default function BaselineScreen() {
  const { priority, intent, setBaseline } = useOnboardingStore();

  const [severity, setSeverity] = useState(5);
  const [isFlare, setIsFlare] = useState(false);
  const [flareStart, setFlareStart] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [note, setNote] = useState('');

  // Show flare toggle for Awareness or Action modes
  const showFlareWidget = intent === 'awareness' || intent === 'action';

  const handleToggleDriver = useCallback((driverId: string) => {
    setDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId]
    );
  }, []);

  const handleContinue = useCallback(() => {
    setBaseline({
      severity,
      isFlare,
      flareStartTime: flareStart ?? undefined,
      drivers,
      note: note || undefined,
      capturedAt: Date.now(),
    });
    router.push('/(onboarding)/first-chat');
  }, [severity, isFlare, flareStart, drivers, note, setBaseline]);

  const priorityLabel = priority ? getPriorityLabel(priority) : 'your symptom';

  return (
    <StepContainer
      currentStep={4}
      title="Quick check-in"
      subtitle="20 seconds. Enough to capture a baseline."
      continueButton={{
        label: 'Save check-in',
        onPress: handleContinue,
      }}
    >
      {/* Widget A: Severity slider (always shown) */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.widget}
      >
        <Text style={styles.widgetLabel}>
          Your {priorityLabel.toLowerCase()} today
        </Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={severity}
            onValueChange={setSeverity}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.inputBorder}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0 = none</Text>
            <Text style={styles.sliderValue}>{severity}</Text>
            <Text style={styles.sliderLabelText}>10 = worst</Text>
          </View>
        </View>
      </MotiView>

      {/* Widget B: Flare toggle (conditional) */}
      {showFlareWidget && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.widget}
        >
          <Text style={styles.widgetLabel}>Is this a flare?</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleButton, !isFlare && styles.toggleButtonActive]}
              onPress={() => setIsFlare(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isFlare && styles.toggleTextActive,
                ]}
              >
                No
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, isFlare && styles.toggleButtonActive]}
              onPress={() => setIsFlare(true)}
            >
              <Text
                style={[styles.toggleText, isFlare && styles.toggleTextActive]}
              >
                Yes
              </Text>
            </Pressable>
          </View>

          {/* Flare start time options */}
          {isFlare && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={styles.flareStartContainer}
            >
              <Text style={styles.flareStartLabel}>When did it start?</Text>
              <View style={styles.flareStartOptions}>
                {FLARE_START_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.flareStartButton,
                      flareStart === option.id && styles.flareStartButtonActive,
                    ]}
                    onPress={() => setFlareStart(option.id)}
                  >
                    <Text
                      style={[
                        styles.flareStartText,
                        flareStart === option.id && styles.flareStartTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </MotiView>
          )}
        </MotiView>
      )}

      {/* Widget C: Driver chips (optional) */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={styles.widget}
      >
        <Text style={styles.widgetLabel}>Any likely drivers?</Text>
        <Text style={styles.widgetHint}>
          Pick any that fit. Skip if you're wiped.
        </Text>
        <View style={styles.driversContainer}>
          {DRIVER_OPTIONS.map((driver) => (
            <Pressable
              key={driver.id}
              style={[
                styles.driverChip,
                drivers.includes(driver.id) && styles.driverChipActive,
              ]}
              onPress={() => handleToggleDriver(driver.id)}
            >
              <Text style={styles.driverEmoji}>{driver.emoji}</Text>
              <Text
                style={[
                  styles.driverLabel,
                  drivers.includes(driver.id) && styles.driverLabelActive,
                ]}
              >
                {driver.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </MotiView>

      {/* Optional note */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300 }}
        style={styles.widget}
      >
        <Text style={styles.widgetLabel}>Anything else? (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Add a quick note..."
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={2}
        />
      </MotiView>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  widgetLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  widgetHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  flareStartContainer: {
    marginTop: 16,
  },
  flareStartLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  flareStartOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flareStartButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.primaryLight,
  },
  flareStartButtonActive: {
    backgroundColor: colors.primary,
  },
  flareStartText: {
    fontSize: 14,
    color: colors.primary,
  },
  flareStartTextActive: {
    color: colors.white,
  },
  driversContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  driverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.primaryLight,
    gap: 6,
  },
  driverChipActive: {
    backgroundColor: colors.primary,
  },
  driverEmoji: {
    fontSize: 14,
  },
  driverLabel: {
    fontSize: 14,
    color: colors.primary,
  },
  driverLabelActive: {
    color: colors.white,
  },
  noteInput: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.primary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 8,
  },
});

