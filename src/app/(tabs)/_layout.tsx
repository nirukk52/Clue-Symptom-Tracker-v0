/**
 * Tabs route group layout for main app
 * 
 * Why it exists: Primary navigation for the post-onboarding app experience.
 * Chat is the primary tab, with History, Quick Entry, and Analytics as secondary.
 * 
 * Reference: specs/1-onboarding-flow/PLAN.md §Phase 9
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { colors } from '@/constants/design';

/** Simple emoji-based tab icon (placeholder until proper icons) */
function TabIcon({ emoji }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.inputBorder,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabIcon emoji="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="quick-entry"
        options={{
          title: 'Quick Entry',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚡" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} />,
        }}
      />
    </Tabs>
  );
}

