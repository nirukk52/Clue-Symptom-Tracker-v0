'use server';

/**
 * Intake Sub-Agent
 *
 * Why this exists: Turns free-text chat messages into structured data.
 * Handles symptom logging, check-ins, and captures user input in a
 * schema-first way.
 *
 * Inputs: chat_message, widget_submit, current focus_hypothesis, user mode
 * Outputs: event_log, episode, episode_facts, day_observation, med_log, symptom_log, note
 *
 * Rules:
 * - Only fills allowed fields; unknown stays null
 * - Low energy flag → skip follow-ups, store minimal baseline
 * - Ambiguous text → write raw note + ask 1 clarifying widget
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

import type { MessageContext, WidgetSpec } from '../types';

// Schema for extracted data
const extractedDataSchema = z.object({
  severity: z
    .number()
    .min(0)
    .max(10)
    .nullable()
    .describe('Pain/symptom severity 0-10'),
  symptoms: z.array(z.string()).describe('Mentioned symptoms'),
  drivers: z.array(z.string()).describe('Potential triggers mentioned'),
  medications: z
    .object({
      taken: z.boolean().nullable(),
      timing: z.string().nullable(),
      notes: z.string().nullable(),
    })
    .nullable(),
  sleep: z
    .object({
      quality: z.number().min(0).max(10).nullable(),
      duration: z.string().nullable(),
    })
    .nullable(),
  mood: z.number().min(0).max(10).nullable(),
  isFlare: z.boolean().nullable(),
  freeText: z.string().describe('Any text that could not be structured'),
  confidence: z.number().min(0).max(1).describe('Confidence in extraction'),
});

type ExtractedData = z.infer<typeof extractedDataSchema>;

/**
 * Process user message and extract structured data
 */
export async function processIntake(
  message: string,
  context: MessageContext
): Promise<{
  extracted: ExtractedData;
  followUpWidget: WidgetSpec | null;
  responseText: string;
}> {
  // In low energy mode, do minimal extraction
  if (context.agentState.energyState === 'low_energy') {
    return minimalIntake(message, context);
  }

  // Extract structured data using LLM
  const extracted = await extractData(message, context);

  // Determine if we need a follow-up widget
  const followUpWidget = determineFollowUp(extracted, context);

  // Generate response text
  const responseText = generateResponse(extracted, context);

  return { extracted, followUpWidget, responseText };
}

/**
 * Extract structured data from message
 */
async function extractData(
  message: string,
  context: MessageContext
): Promise<ExtractedData> {
  const systemPrompt = `You are extracting symptom tracking data from a user message.

Context:
- User condition: ${context.user.primaryCondition}
- Focus: ${context.focus ? `${context.focus.featureLabel} → ${context.focus.outcomeLabel}` : 'none'}
- Today: ${context.today?.isFlare ? 'FLARE day' : 'normal day'}

Extract any mentioned:
- Severity levels (0-10 scale)
- Symptoms (pain, fatigue, nausea, etc.)
- Drivers/triggers (stress, weather, food, etc.)
- Medication info (taken, timing)
- Sleep quality/duration
- Mood level
- Flare status

Be conservative - only extract what's clearly stated. Set confidence based on clarity.`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: extractedDataSchema,
      system: systemPrompt,
      prompt: message,
    });

    return result.object;
  } catch {
    // Return minimal extraction on error
    return {
      severity: null,
      symptoms: [],
      drivers: [],
      medications: null,
      sleep: null,
      mood: null,
      isFlare: null,
      freeText: message,
      confidence: 0,
    };
  }
}

/**
 * Minimal intake for low-energy mode
 */
function minimalIntake(
  message: string,
  _context: MessageContext
): {
  extracted: ExtractedData;
  followUpWidget: WidgetSpec | null;
  responseText: string;
} {
  // Simple pattern matching for numbers (severity)
  const severityMatch = message.match(
    /(\d+)\s*\/\s*10|(\d+)\/10|level\s*(\d+)/i
  );
  const severity = severityMatch
    ? parseInt(severityMatch[1] || severityMatch[2] || severityMatch[3])
    : null;

  // Check for flare keywords
  const flareKeywords = ['flare', 'flaring', 'crash', 'bad day', 'terrible'];
  const isFlare = flareKeywords.some((kw) =>
    message.toLowerCase().includes(kw)
  );

  return {
    extracted: {
      severity,
      symptoms: [],
      drivers: [],
      medications: null,
      sleep: null,
      mood: null,
      isFlare: isFlare || null,
      freeText: message,
      confidence: 0.3,
    },
    followUpWidget: null, // No follow-ups in low energy mode
    responseText: 'Got it. Rest up. 💜',
  };
}

/**
 * Determine if we need a follow-up widget
 */
function determineFollowUp(
  extracted: ExtractedData,
  context: MessageContext
): WidgetSpec | null {
  // Don't ask follow-ups if confidence is high
  if (extracted.confidence > 0.8) {
    return null;
  }

  // If we couldn't extract severity, ask for it
  if (extracted.severity === null && context.focus) {
    return {
      widgetId: crypto.randomUUID(),
      type: 'outcome_slider',
      label: `How's your ${context.focus.outcomeLabel.toLowerCase()} right now?`,
      description: 'Quick check-in',
      writesTo: 'day_observations',
      reason: 'Clarifying severity for tracking',
    };
  }

  // If flare mentioned but not confirmed
  if (
    extracted.isFlare === null &&
    extracted.freeText.toLowerCase().includes('bad')
  ) {
    return {
      widgetId: crypto.randomUUID(),
      type: 'flare_toggle',
      label: 'Is this a flare day?',
      description: 'Helps track flare patterns',
      writesTo: 'day_cards',
      reason: 'Confirming flare status',
    };
  }

  return null;
}

/**
 * Generate response text based on extraction
 */
function generateResponse(
  extracted: ExtractedData,
  context: MessageContext
): string {
  const parts: string[] = [];

  // Acknowledge what we captured
  if (extracted.severity !== null) {
    parts.push(`Logged ${extracted.severity}/10`);
    if (context.focus) {
      parts.push(`for ${context.focus.outcomeLabel.toLowerCase()}`);
    }
  }

  if (extracted.symptoms.length > 0) {
    parts.push(`Noted: ${extracted.symptoms.join(', ')}`);
  }

  if (extracted.isFlare) {
    parts.push('Marked as a flare day');
  }

  if (parts.length === 0) {
    return "Got it, I've saved that.";
  }

  return parts.join('. ') + '.';
}
