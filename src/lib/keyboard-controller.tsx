/**
 * Keyboard Controller shim for Expo Go compatibility
 * 
 * Why it exists: react-native-keyboard-controller requires native modules
 * that aren't available in Expo Go. This provides fallback components.
 */

import Constants from 'expo-constants';
import React from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  ScrollView,
} from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

// Export real or fallback components
let KeyboardAvoidingView: React.ComponentType<React.ComponentProps<typeof RNKeyboardAvoidingView>>;
let KeyboardAwareScrollView: React.ComponentType<React.ComponentProps<typeof ScrollView>>;
let KeyboardProvider: React.ComponentType<{ children: React.ReactNode }>;

if (isExpoGo) {
  // Fallbacks for Expo Go
  KeyboardAvoidingView = RNKeyboardAvoidingView;
  KeyboardAwareScrollView = ScrollView;
  KeyboardProvider = ({ children }) => <>{children}</>;
} else {
  // Real implementations for dev builds
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const controller = require('react-native-keyboard-controller');
    KeyboardAvoidingView = controller.KeyboardAvoidingView;
    KeyboardAwareScrollView = controller.KeyboardAwareScrollView;
    KeyboardProvider = controller.KeyboardProvider;
  } catch {
    // Fallback if import fails
    KeyboardAvoidingView = RNKeyboardAvoidingView;
    KeyboardAwareScrollView = ScrollView;
    KeyboardProvider = ({ children }) => <>{children}</>;
  }
}

export { KeyboardAvoidingView, KeyboardAwareScrollView, KeyboardProvider };

