/**
 * Chat Tab - Primary post-onboarding screen
 * 
 * Why it exists: Main interaction surface where users log symptoms via chat,
 * see their Focus hypothesis card, and receive contextual responses.
 * 
 * Reference: specs/1-onboarding-flow/spec.md §User Story 7
 */

import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/design';
import { getFeatureLabel, getOutcomeLabel } from '@/constants/impact-options';
import { useOnboardingStore } from '@/lib/store/onboarding';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** Focus hypothesis card pinned at top */
function FocusCard() {
  const { impactQuestion } = useOnboardingStore();

  if (!impactQuestion) return null;

  const featureLabel = getFeatureLabel(impactQuestion.featureId);
  const outcomeLabel = getOutcomeLabel(impactQuestion.outcomeId);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.focusCard}
    >
      <View style={styles.focusBadge}>
        <Text style={styles.focusBadgeText}>FOCUS</Text>
      </View>
      <Text style={styles.focusLabel}>Hypothesis tracking</Text>
      <Text style={styles.focusQuestion}>
        How does {featureLabel} impact {outcomeLabel}?
      </Text>
      <View style={styles.focusProgress}>
        <Text style={styles.focusProgressLabel}>Progress</Text>
        <Text style={styles.focusProgressValue}>Day 1/7</Text>
        <View style={styles.focusProgressBar}>
          <View style={[styles.focusProgressFill, { width: '14%' }]} />
        </View>
      </View>
    </MotiView>
  );
}

/** Chat message bubble */
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
        ]}
      >
        {message.content}
      </Text>
    </MotiView>
  );
}

/** Quick action pills */
function SuggestionPills({
  onSelect,
}: {
  onSelect: (suggestion: string) => void;
}) {
  const suggestions = ['Mood', 'Pain Level', 'Meds'];

  return (
    <View style={styles.suggestionsContainer}>
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          style={styles.suggestionPill}
          onPress={() => onSelect(suggestion)}
        >
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { conditions, priority, impactQuestion } = useOnboardingStore();

  const [messages, setMessages] = useState<Message[]>(() => {
    // Generate first message based on onboarding context (template-based, no LLM)
    const conditionText =
      conditions.length > 0
        ? `I see you're managing ${conditions.slice(0, 2).join(' and ')}. `
        : '';
    const priorityText = priority
      ? `Your focus is on ${priority.replace('-', ' ')}. `
      : '';
    const questionText = impactQuestion
      ? `We're tracking: "${impactQuestion.questionText}"`
      : "Let's start tracking your symptoms.";

    return [
      {
        id: '1',
        role: 'assistant',
        content: `${conditionText}${priorityText}${questionText}\n\nHow are you feeling right now?`,
      },
    ];
  });

  const [inputText, setInputText] = useState('');

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simulate assistant response (placeholder - would be agent in real app)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "Thanks for sharing. I've logged that for you. Is there anything else you'd like to note about how you're feeling?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  }, [inputText]);

  const handleSuggestion = useCallback((suggestion: string) => {
    // In real app, this would open the appropriate widget
    const responses: Record<string, string> = {
      Mood: "How's your mood right now?",
      'Pain Level': 'On a scale of 0-10, how would you rate your pain?',
      Meds: 'Have you taken your medications today?',
    };

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: responses[suggestion] ?? 'Tell me more about that.',
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Focus card */}
        <FocusCard />

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Suggestion pills */}
        <SuggestionPills onSelect={handleSuggestion} />

        {/* Input area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  focusCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  focusBadge: {
    backgroundColor: colors.accentMint,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  focusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  focusLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  focusQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  focusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusProgressLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  focusProgressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  focusProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.inputBorder,
    borderRadius: 2,
  },
  focusProgressFill: {
    height: '100%',
    backgroundColor: colors.accentMint,
    borderRadius: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextAssistant: {
    color: colors.primary,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.primary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 20,
    color: colors.white,
  },
});

