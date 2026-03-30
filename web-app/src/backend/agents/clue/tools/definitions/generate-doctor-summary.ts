/**
 * generate_doctor_summary Tool
 *
 * Why this exists: Generates a structured report suitable for sharing with a doctor.
 * Aggregates data from all tables into a formatted summary with talking points.
 */

import { tool } from 'ai';
import { z } from 'zod';

import { getSupabase, getUid } from '../utils';

export const generateDoctorSummary = tool({
  description:
    'Generate a doctor-friendly summary report of the user\'s health data. Call this when users want to prepare for a doctor visit or need a report.',
  inputSchema: z.object({
    daysBack: z
      .number()
      .optional()
      .describe('Number of days to cover in the report. Defaults to 30.'),
  }),
  execute: async ({ daysBack }) => {
    const supabase = getSupabase();
    const uid = getUid();
    const lookBack = daysBack || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookBack);
    const startIso = startDate.toISOString();

    const [symptomsResult, medsResult, moodsResult, insightsResult] = await Promise.all([
      supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startIso),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startIso),
      supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('logged_at', startIso),
      supabase
        .from('insights')
        .select('*')
        .eq('user_id', uid)
        .gte('created_at', startIso)
        .order('confidence', { ascending: false })
        .limit(5),
    ]);

    const symptoms = symptomsResult.data || [];
    const meds = medsResult.data || [];
    const moods = moodsResult.data || [];
    const insights = insightsResult.data || [];

    // Build summary sections
    const sections: Record<string, string> = {};

    // Symptom summary
    const symptomCounts: Record<string, { count: number; avgSeverity: number | null }> = {};
    for (const s of symptoms) {
      if (!symptomCounts[s.symptom_name]) {
        symptomCounts[s.symptom_name] = { count: 0, avgSeverity: null };
      }
      symptomCounts[s.symptom_name].count++;
      if (s.severity != null) {
        const prev = symptomCounts[s.symptom_name].avgSeverity ?? 0;
        const prevCount = symptomCounts[s.symptom_name].count - 1;
        symptomCounts[s.symptom_name].avgSeverity =
          (prev * prevCount + s.severity) / symptomCounts[s.symptom_name].count;
      }
    }

    const sortedSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    sections['Symptoms'] = sortedSymptoms.length > 0
      ? sortedSymptoms
          .map(
            ([name, data]) =>
              `- ${name}: ${data.count} occurrences${data.avgSeverity != null ? `, avg severity ${data.avgSeverity.toFixed(1)}/10` : ''}`
          )
          .join('\n')
      : 'No symptoms logged in this period.';

    // Medication summary
    sections['Medications'] = meds.length > 0
      ? [...new Set(meds.map((m) => m.med_name))]
          .map((name) => {
            const medEntries = meds.filter((m) => m.med_name === name);
            const taken = medEntries.filter((m) => m.taken).length;
            return `- ${name}: ${taken}/${medEntries.length} doses taken${medEntries[0]?.dosage ? ` (${medEntries[0].dosage})` : ''}`;
          })
          .join('\n')
      : 'No medications logged in this period.';

    // Mood summary
    if (moods.length > 0) {
      const avgMood = (moods.reduce((s, m) => s + m.rating, 0) / moods.length).toFixed(1);
      const minMood = Math.min(...moods.map((m) => m.rating));
      const maxMood = Math.max(...moods.map((m) => m.rating));
      sections['Mood'] = `Average: ${avgMood}/10 (range: ${minMood}-${maxMood}, ${moods.length} entries)`;
    }

    // AI insights
    if (insights.length > 0) {
      sections['AI-Detected Patterns'] = insights
        .map((i) => `- ${i.content} (confidence: ${Math.round((i.confidence ?? 0) * 100)}%)`)
        .join('\n');
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    const reportContent = Object.entries(sections)
      .map(([title, content]) => `### ${title}\n${content}`)
      .join('\n\n');

    const fullReport = `# Health Summary Report\n**Period:** ${startDateStr} to ${endDate} (${lookBack} days)\n**Total data points:** ${symptoms.length + meds.length + moods.length}\n\n${reportContent}`;

    // Persist the summary
    await supabase.from('doctor_summaries').insert({
      user_id: uid,
      date_range_start: startDateStr,
      date_range_end: endDate,
      content: fullReport,
      sections_json: sections,
    });

    return {
      success: true,
      report: fullReport,
      sections,
      message: `Generated ${lookBack}-day health summary with ${Object.keys(sections).length} sections.`,
    };
  },
});
