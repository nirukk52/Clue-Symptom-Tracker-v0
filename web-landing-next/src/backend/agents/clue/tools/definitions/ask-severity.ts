/**
 * ask_severity Tool
 *
 * Why this exists: Asks the user to rate a health metric via an interactive slider UI.
 * Returns structured data that the client renders as a RatingSlider component.
 * Deterministic, tool-based rating collection removes dependency on prompt phrasing.
 *
 * Supports different label presets for context-appropriate vocabulary:
 * - severity: Mild / Moderate / Severe (default for symptoms)
 * - energy: Low / Medium / High
 * - mood: Poor / Okay / Good
 * - stress: Low / Moderate / High
 * - pain: Mild / Moderate / Severe
 * - sleep: Poor / Fair / Good
 */

import { tool } from 'ai';
import { z } from 'zod';

export const askSeverity = tool({
  description:
    'Ask the user to rate something on a 1-10 scale. Use for symptom severity, energy level, mood, stress, pain, or sleep quality. The UI will show an interactive slider with appropriate labels.',
  inputSchema: z.object({
    metric: z.string().describe('What is being rated (e.g. "headache", "energy level", "mood")'),
    prompt: z.string().optional().describe('Optional custom prompt text to show above the slider'),
    labelPreset: z.enum(['severity', 'energy', 'mood', 'stress', 'pain', 'sleep']).optional()
      .describe('Label preset for the slider. Defaults to "severity" for symptoms. Use "energy" for energy level, "mood" for mood, etc.'),
  }),
  execute: async ({ metric, prompt, labelPreset }) => {
    // Determine default label preset based on metric name
    const defaultPreset = metric.toLowerCase().includes('energy') ? 'energy'
      : metric.toLowerCase().includes('mood') ? 'mood'
      : metric.toLowerCase().includes('stress') ? 'stress'
      : metric.toLowerCase().includes('sleep') ? 'sleep'
      : 'severity';
    
    return {
      interactive: true,
      type: 'rating-slider',
      metric,
      // Backwards compat: keep symptom field for existing client code
      symptom: metric,
      prompt: prompt || `Rate your ${metric}.`,
      initialValue: 5,
      labels: labelPreset || defaultPreset,
    };
  },
});
