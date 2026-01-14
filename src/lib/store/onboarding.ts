/**
 * Zustand store for onboarding state with MMKV persistence
 *
 * Why it exists: Manages onboarding flow state across 6 screens with immediate
 * per-screen persistence for analytics. Supports abandonment detection and reset.
 *
 * Reference: specs/1-onboarding-flow/spec.md §FR-002, FR-010
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';
import type { OnboardingActions, OnboardingState } from '@/types/onboarding';

/** MMKV storage adapter for Zustand persist middleware */
const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

/** Initial state for onboarding */
const initialState: OnboardingState = {
  step: 0,
  conditions: [],
  priority: null,
  impactQuestion: null,
  intent: null,
  baseline: null,
  isComplete: false,
  completedAt: null,
};

/**
 * Onboarding store with MMKV persistence
 *
 * Each screen's data is saved immediately on "Continue" press.
 * If user abandons mid-flow, calling reset() clears all partial state.
 */
export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConditions: (conditions) => {
        set({ conditions, step: Math.max(get().step, 1) });
      },

      setPriority: (priority) => {
        set({ priority, step: Math.max(get().step, 2) });
      },

      setImpactQuestion: (impactQuestion) => {
        set({ impactQuestion, step: Math.max(get().step, 3) });
      },

      setIntent: (intent) => {
        set({ intent, step: Math.max(get().step, 4) });
      },

      setBaseline: (baseline) => {
        set({ baseline, step: Math.max(get().step, 5) });
      },

      nextStep: () => {
        const currentStep = get().step;
        if (currentStep < 5) {
          set({ step: currentStep + 1 });
        }
      },

      prevStep: () => {
        const currentStep = get().step;
        if (currentStep > 0) {
          set({ step: currentStep - 1 });
        }
      },

      completeOnboarding: () => {
        set({
          isComplete: true,
          completedAt: Date.now(),
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'clue-onboarding',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

/** Helper to check if onboarding is complete */
export const isOnboardingComplete = () =>
  useOnboardingStore.getState().isComplete;

/** Helper to get current onboarding step */
export const getCurrentStep = () => useOnboardingStore.getState().step;
