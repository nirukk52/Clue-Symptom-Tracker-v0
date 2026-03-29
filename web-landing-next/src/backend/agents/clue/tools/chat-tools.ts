/**
 * Chat Tools for the Clue Agent
 *
 * Why this exists: Provides concrete, Supabase-backed tools that GPT-4o
 * can call during streaming conversations. Each tool handles one domain
 * (symptoms, medications, moods, timeline, insights, doctor summaries, flare mode).
 */

import { tool } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

/** Server-side Supabase client for tool operations (lazy-initialized for build safety) */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Actual user ID set by the API route before tool execution.
 * Prevents GPT-4o from fabricating user IDs in tool calls.
 */
let _activeUserId = 'anonymous';

export function setActiveUserId(uid: string) {
  _activeUserId = uid;
}

function getUid() {
  return _activeUserId;
}

/**
 * Extracts and logs structured symptom data from a user's message.
 * Writes to symptom_logs and timeline_entries.
 */
const logSymptom = tool({
  description:
    'Log a symptom mentioned by the user. Call this whenever the user describes how they feel, reports pain, fatigue, or any health symptom.',
  inputSchema: z.object({
    symptomName: z.string().describe('Name of the symptom (e.g. "headache", "fatigue", "nausea")'),
    severity: z.number().min(0).max(10).optional().describe('Severity on 0-10 scale if mentioned'),
    notes: z.string().optional().describe('Additional context the user provided'),
  }),
  execute: async ({ symptomName, severity, notes }) => {
    const uid = getUid();

    const supabase = getSupabase();
    const { data: symptomLog, error: logError } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: uid,
        symptom_name: symptomName,
        severity: severity ?? null,
        notes: notes ?? null,
      })
      .select('id')
      .single();

    if (logError) {
      console.error('[log_symptom] symptom_logs insert failed:', logError);
      return { success: false, message: `Failed to log symptom: ${logError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'symptom',
      title: symptomName,
      description: notes ?? null,
      severity: severity ?? null,
      status: 'current',
    });

    if (timelineError) {
      console.error('[log_symptom] timeline_entries insert failed:', timelineError);
    }

    const severityText = severity !== undefined ? ` at ${severity}/10` : '';
    return {
      success: true,
      message: `Logged ${symptomName}${severityText}.`,
      logId: symptomLog?.id,
    };
  },
});

/**
 * Records medication intake or changes.
 * Writes to medication_logs and timeline_entries.
 */
const logMedication = tool({
  description:
    'Log a medication the user mentions taking, skipping, or changing. Call this when users discuss their meds.',
  inputSchema: z.object({
    medName: z.string().describe('Medication name'),
    dosage: z.string().optional().describe('Dosage if mentioned (e.g. "150mg")'),
    taken: z.boolean().describe('Whether the medication was taken'),
    timing: z.string().optional().describe('When it was taken (e.g. "morning", "8am")'),
    notes: z.string().optional().describe('Additional context'),
  }),
  execute: async ({ medName, dosage, taken, timing, notes }) => {
    const supabase = getSupabase();
    const uid = getUid();

    const { error: medError } = await supabase.from('medication_logs').insert({
      user_id: uid,
      med_name: medName,
      dosage: dosage ?? null,
      taken,
      timing: timing ?? null,
      notes: notes ?? null,
    });

    if (medError) {
      console.error('[log_medication] insert failed:', medError);
      return { success: false, message: `Failed to log medication: ${medError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'medication',
      title: medName,
      description: taken ? `Taken${dosage ? ` - ${dosage}` : ''}` : 'Skipped',
      dosage: dosage ?? null,
      status: taken ? 'current' : 'issue',
    });

    if (timelineError) {
      console.error('[log_medication] timeline insert failed:', timelineError);
    }

    const statusText = taken ? 'Logged' : 'Noted as skipped';
    return {
      success: true,
      message: `${statusText}: ${medName}${dosage ? ` (${dosage})` : ''}.`,
    };
  },
});

/**
 * Records a mood rating.
 * Writes to mood_logs and timeline_entries.
 */
const logMood = tool({
  description:
    'Log the user\'s mood or emotional state on a 1-10 scale. Call this when users share how they feel emotionally.',
  inputSchema: z.object({
    rating: z.number().min(1).max(10).describe('Mood rating 1-10'),
    note: z.string().optional().describe('Brief note about mood context'),
  }),
  execute: async ({ rating, note }) => {
    const supabase = getSupabase();
    const uid = getUid();

    const { error: moodError } = await supabase.from('mood_logs').insert({
      user_id: uid,
      rating,
      note: note ?? null,
    });

    if (moodError) {
      console.error('[log_mood] insert failed:', moodError);
      return { success: false, message: `Failed to log mood: ${moodError.message}` };
    }

    const { error: timelineError } = await supabase.from('timeline_entries').insert({
      user_id: uid,
      type: 'note',
      title: `Mood: ${rating}/10`,
      description: note ?? null,
    });

    if (timelineError) {
      console.error('[log_mood] timeline insert failed:', timelineError);
    }

    return {
      success: true,
      message: `Logged mood at ${rating}/10.`,
    };
  },
});

/**
 * Fetches timeline entries for a given date or date range.
 * Reads from timeline_entries table.
 */
const getTimeline = tool({
  description:
    'Get the user\'s timeline entries for a specific date or recent period. Call this when users ask about their history or what happened on a given day.',
  inputSchema: z.object({
    date: z.string().optional().describe('Specific date in YYYY-MM-DD format. Defaults to today.'),
    daysBack: z.number().optional().describe('Number of days to look back. Defaults to 1 (today only).'),
  }),
  execute: async ({ date, daysBack }) => {
    const supabase = getSupabase();
    const uid = getUid();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const lookBack = daysBack || 1;

    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - (lookBack - 1));

    const { data: entries } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('user_id', uid)
      .gte('entry_time', startDate.toISOString())
      .lte('entry_time', new Date(targetDate + 'T23:59:59').toISOString())
      .order('entry_time', { ascending: true });

    if (!entries || entries.length === 0) {
      return {
        entries: [],
        message: `No entries found for ${lookBack === 1 ? targetDate : `the last ${lookBack} days`}.`,
      };
    }

    return {
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        time: new Date(e.entry_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        status: e.status,
        severity: e.severity,
        dosage: e.dosage,
        duration: e.duration,
      })),
      message: `Found ${entries.length} entries.`,
    };
  },
});

/**
 * Analyzes the user's logged data to find patterns and correlations.
 * Reads from symptom_logs, medication_logs, mood_logs. Writes to insights.
 */
const generateInsights = tool({
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

    // Focus area specific
    if (focusArea && symptomCounts[focusArea.toLowerCase()]) {
      const focused = symptomCounts[focusArea.toLowerCase()];
      const avgSev =
        focused.totalSeverity > 0
          ? (focused.totalSeverity / focused.count).toFixed(1)
          : 'not rated';

      insightsList.push({
        content: `${focusArea}: reported ${focused.count} times, average severity ${avgSev}.`,
        confidence: Math.min(focused.count / 5, 0.85),
      });
    }

    // Persist insights
    for (const insight of insightsList) {
      await supabase.from('insights').insert({
        user_id: uid,
        content: insight.content,
        confidence: insight.confidence,
        evidence_json: { period: `${lookBack}d`, dataPoints: totalEntries },
        status: 'pending',
      });
    }

    return {
      insights: insightsList,
      message:
        insightsList.length > 0
          ? `Found ${insightsList.length} patterns from ${totalEntries} data points over ${lookBack} days.`
          : `No clear patterns yet from ${totalEntries} entries. More data will help.`,
      dataPoints: totalEntries,
    };
  },
});

/**
 * Generates a structured report suitable for sharing with a doctor.
 * Aggregates data from all tables into a formatted summary.
 */
const generateDoctorSummary = tool({
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

/**
 * Asks the user to rate symptom severity via a slider UI.
 * Returns structured data that the client renders as an interactive component.
 * Why this exists: Deterministic, tool-based severity collection removes
 * dependency on prompt phrasing and regex detection.
 */
const askSeverity = tool({
  description:
    'Ask the user to rate the severity of a symptom on a 0-10 scale. Call this AFTER logging a symptom when the user did not mention a severity number (like "7/10" or "mild/moderate/severe"). The UI will show an interactive slider.',
  inputSchema: z.object({
    symptom: z.string().describe('The symptom to ask about (e.g. "fatigue", "headache")'),
    prompt: z.string().optional().describe('Optional custom prompt text to show above the slider'),
  }),
  execute: async ({ symptom, prompt }) => {
    return {
      interactive: true,
      type: 'severity-slider',
      symptom,
      prompt: prompt || `How bad is the ${symptom}?`,
      initialValue: 5,
    };
  },
});

/**
 * Toggles flare mode on/off, changing the agent's behavior to
 * minimize cognitive load on the user.
 */
const toggleFlareMode = tool({
  description:
    'Toggle flare mode on or off. Call this when the user indicates they are having a flare, crash, or very bad day, OR when they say they are feeling better and want to exit flare mode.',
  inputSchema: z.object({
    activate: z.boolean().describe('True to activate flare mode, false to deactivate'),
  }),
  execute: async ({ activate }) => {
    const supabase = getSupabase();
    const uid = getUid();

    await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: uid,
          flare_mode: activate,
          energy_state: activate ? 'flare' : 'normal',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    return {
      success: true,
      flareMode: activate,
      message: activate
        ? 'Flare mode activated. I\'ll keep things minimal.'
        : 'Flare mode deactivated. Welcome back.',
    };
  },
});

/**
 * All chat tools exported as a single registry for the API route.
 */
export const chatTools = {
  log_symptom: logSymptom,
  log_medication: logMedication,
  log_mood: logMood,
  get_timeline: getTimeline,
  generate_insights: generateInsights,
  generate_doctor_summary: generateDoctorSummary,
  toggle_flare_mode: toggleFlareMode,
  ask_severity: askSeverity,
};
