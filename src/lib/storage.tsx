/**
 * Storage module with MMKV and fallback for Expo Go
 * 
 * Why it exists: MMKV 3.x requires New Architecture (TurboModules).
 * This module provides a fallback using in-memory storage for Expo Go.
 */

import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

const isExpoGo = Constants.appOwnership === 'expo';

// In-memory fallback for Expo Go
const memoryStorage: Record<string, string | boolean> = {};
const listeners = new Map<string, Set<() => void>>();

// Try to create MMKV, fall back to memory storage
type MMKVType = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | boolean) => void;
  getBoolean: (key: string) => boolean | undefined;
  remove: (key: string) => void;
};

let mmkvInstance: MMKVType | null = null;
let useMemoryFallback = isExpoGo;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createMMKV } = require('react-native-mmkv');
    mmkvInstance = createMMKV();
  } catch {
    console.warn('MMKV not available, using in-memory storage (Expo Go mode)');
    useMemoryFallback = true;
  }
}

export const storage = {
  getString: (key: string): string | undefined => {
    if (useMemoryFallback) {
      const val = memoryStorage[key];
      return typeof val === 'string' ? val : undefined;
    }
    return mmkvInstance?.getString(key);
  },
  getBoolean: (key: string): boolean | undefined => {
    if (useMemoryFallback) {
      const val = memoryStorage[key];
      return typeof val === 'boolean' ? val : undefined;
    }
    return mmkvInstance?.getBoolean(key);
  },
  set: (key: string, value: string | boolean): void => {
    if (useMemoryFallback) {
      memoryStorage[key] = value;
      // Notify listeners
      listeners.get(key)?.forEach((cb) => cb());
    } else {
      mmkvInstance?.set(key, value);
    }
  },
  delete: (key: string): void => {
    if (useMemoryFallback) {
      delete memoryStorage[key];
      listeners.get(key)?.forEach((cb) => cb());
    } else {
      mmkvInstance?.remove(key);
    }
  },
};

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  storage.delete(key);
}

/**
 * Hook to use MMKV string value with fallback for Expo Go
 */
export function useMMKVString(
  key: string,
  _instance?: typeof storage
): [string | undefined, (value: string | undefined) => void] {
  if (!useMemoryFallback) {
    // Use real MMKV hook
    // eslint-disable-next-line @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks
    return require('react-native-mmkv').useMMKVString(key);
  }

  // Fallback for Expo Go
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<string | undefined>(() => storage.getString(key));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setter = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, newValue);
      }
      setValue(newValue);
    },
    [key]
  );

  return [value, setter];
}

/**
 * Hook to use MMKV boolean value with fallback for Expo Go
 */
export function useMMKVBoolean(
  key: string,
  _instance?: typeof storage
): [boolean | undefined, (value: boolean | undefined) => void] {
  if (!useMemoryFallback) {
    // Use real MMKV hook
    // eslint-disable-next-line @typescript-eslint/no-require-imports, react-hooks/rules-of-hooks
    return require('react-native-mmkv').useMMKVBoolean(key);
  }

  // Fallback for Expo Go
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState<boolean | undefined>(() => storage.getBoolean(key));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setter = useCallback(
    (newValue: boolean | undefined) => {
      if (newValue === undefined) {
        storage.delete(key);
      } else {
        storage.set(key, newValue);
      }
      setValue(newValue);
    },
    [key]
  );

  return [value, setter];
}
