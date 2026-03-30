/**
 * generate_insights Tool
 *
 * Why this exists: Analyzes the user's logged data to find patterns and correlations.
 * Reads from symptom_logs, medication_logs, mood_logs. Writes to insights table.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

export const generateInsights = tool({
  description:
    'Analyze the user\'s tracked data to find patterns, correlations, and trends. Call this when users ask "why" something happens, what triggers their symptoms, or want to understand patterns.',
  inputSchema: z.object({
    focusArea: z.string().optional().describe('Specific symptom or area to focus analysis on'),
    daysBack: z.number().optional().describe('Number of days to analyze. Defaults to 14.'),
  }),
  execute: async ({ focusArea, daysBack }) => {
    const supabase = getSupabase();
    const uid = getUid();
    const lookBack = daysBack || 14;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookBack);

    const [symptomsResult, medsResult, moodsResult] = await Promise.all([
      supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startDate.toISOString())
        .order('logged_at', { ascending: true }),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startDate.toISOString()),
      supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startDate.toISOString()),
    ]);

    const symptoms = symptomsResult.data || [];
    const meds = medsResult.data || [];
    const moods = moodsResult.data || [];

    const totalEntries = symptoms.length + meds.length + moods.length;

    if (totalEntries < 3) {
      return {
        insights: [],
        message: `Only ${totalEntries} entries in the last ${lookBack} days. Need more data to find meaningful patterns. Keep logging and I'll analyze as your data grows.`,
        dataPoints: totalEntries,
      };
    }

    const insightsList: Array<{ content: string; confidence: number }> = [];

    // Symptom frequency analysis
    const symptomCounts: Record<string, { count: number; totalSeverity: number }> = {};
    for (const s of symptoms) {
      if (!symptomCounts[s.symptom_name]) {
        symptomCounts[s.symptom_name] = { count: 0, totalSeverity: 0 };
      }
      symptomCounts[s.symptom_name].count++;
      if (s.severity != null) {
        symptomCounts[s.symptom_name].totalSeverity += s.severity;
      }
    }

    const topSymptom = Object.entries(symptomCounts).sort(
      (a, b) => b[1].count - a[1].count
    )[0];

    if (topSymptom) {
      const avgSeverity =
        topSymptom[1].totalSeverity > 0
          ? (topSymptom[1].totalSeverity / topSymptom[1].count).toFixed(1)
          : null;

      insightsList.push({
        content: `Your most reported symptom is ${topSymptom[0]} (${topSymptom[1].count} times in ${lookBack} days)${avgSeverity ? `, averaging ${avgSeverity}/10 severity` : ''}.`,
        confidence: Math.min(topSymptom[1].count / 7, 0.9),
      });
    }

    // Mood trend
    if (moods.length >= 3) {
      const avgMood = moods.reduce((sum, m) => sum + m.rating, 0) / moods.length;
      const recentMoods = moods.slice(-3);
      const recentAvg = recentMoods.reduce((sum, m) => sum + m.rating, 0) / recentMoods.length;
      const trend = recentAvg > avgMood + 0.5 ? 'improving' : recentAvg < avgMood - 0.5 ? 'declining' : 'stable';

      insightsList.push({
        content: `Your mood has been ${trend} recently. Average: ${avgMood.toFixed(1)}/10 overall, ${recentAvg.toFixed(1)}/10 in the last few entries.`,
        confidence: Math.min(moods.length / 10, 0.8),
      });
    }

    // Medication adherence
    if (meds.length > 0) {
      const taken = meds.filter((m) => m.taken).length;
      const adherence = Math.round((taken / meds.length) * 100);

      insightsList.push({
        content: `Medication adherence: ${adherence}% (${taken}/${meds.length} doses logged as taken).`,
        confidence: 0.95,
      });
    }

    // Focus area specific insights
    if (focusArea && symptomCounts[focusArea.toLowerCase()]) {
      const focused = symptoms.filter(
        (s) => s.symptom_name.toLowerCase() === focusArea.toLowerCase()
      );
      if (focused.length >= 2) {
        const avgSev =
          focused.reduce((sum, s) => sum + (s.severity || 0), 0) / focused.length;
        insightsList.push({
          content: `${focusArea} specifically: ${focused.length} occurrences with average severity ${avgSev.toFixed(1)}/10.`,
          confidence: Math.min(focused.length / 5, 0.85),
        });
      }
    }

    // Save insights to database
    if (insightsList.length > 0) {
      for (const insight of insightsList) {
        await supabase.from('insights').insert({
          user_id: uid,
          content: insight.content,
          status: 'pending',
        });
      }
    }

    return {
      insights: insightsList,
      dataPoints: totalEntries,
      message:
        insightsList.length > 0
          ? `Found ${insightsList.length} patterns based on ${totalEntries} data points from the last ${lookBack} days.`
          : `Analyzed ${totalEntries} data points but no clear patterns yet. Keep logging for better insights.`,
    };
  },
});
