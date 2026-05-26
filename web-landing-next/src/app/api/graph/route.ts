/**
 * Graph API Route
 *
 * Why this exists: Returns the user's knowledge graph in Reagraph-compatible format.
 * Supplements graph data with information from symptom_logs, medication_logs, and mood_logs
 * to enrich node sub-labels with recent data points.
 */

import { createClient } from '@supabase/supabase-js';
import { getUserGraph } from '@/backend/lib/graph';
import type { GraphData, GraphNode } from '@/components/clue-chat/types';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return Response.json(
      { error: 'Missing userId parameter' },
      { status: 400 }
    );
  }

  try {
    // Get the base graph from the graph tables
    const graphData = await getUserGraph(userId);

    // Enrich nodes with recent data from log tables
    const enrichedNodes = await enrichNodesWithLogs(userId, graphData.nodes);

    return Response.json({
      nodes: enrichedNodes,
      edges: graphData.edges,
    } satisfies GraphData);
  } catch (error) {
    console.error('[api/graph] Failed to get graph:', error);
    return Response.json(
      { error: 'Failed to retrieve graph data' },
      { status: 500 }
    );
  }
}

/**
 * Enriches graph nodes with data from symptom_logs, medication_logs, mood_logs.
 * Updates subLabels with recent severity, dosage, timing information.
 */
async function enrichNodesWithLogs(
  userId: string,
  nodes: GraphNode[]
): Promise<GraphNode[]> {
  const supabase = getSupabase();

  // Get recent symptom logs (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [symptomLogs, medicationLogs, moodLogs] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('symptom_name, severity, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString())
      .order('logged_at', { ascending: false })
      .limit(50),
    supabase
      .from('medication_logs')
      .select('med_name, dosage, timing, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString())
      .order('logged_at', { ascending: false })
      .limit(50),
    supabase
      .from('mood_logs')
      .select('rating, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgo.toISOString())
      .order('logged_at', { ascending: false })
      .limit(20),
  ]);

  // Build lookup maps for enrichment
  const symptomMap = buildSymptomMap(symptomLogs.data ?? []);
  const medicationMap = buildMedicationMap(medicationLogs.data ?? []);
  const moodData = buildMoodSummary(moodLogs.data ?? []);

  // Enrich each node based on type
  return nodes.map((node) => {
    switch (node.type) {
      case 'symptom': {
        const symptomData = symptomMap.get(node.label.toLowerCase());
        if (symptomData) {
          return {
            ...node,
            subLabel: symptomData.subLabel,
            data: { ...node.data, ...symptomData.data },
          };
        }
        break;
      }
      case 'medication': {
        const medData = medicationMap.get(node.label.toLowerCase());
        if (medData) {
          return {
            ...node,
            subLabel: medData.subLabel,
            data: { ...node.data, ...medData.data },
          };
        }
        break;
      }
      case 'factor': {
        // Check if this is a mood-related factor
        if (node.label.toLowerCase().includes('mood') && moodData) {
          return {
            ...node,
            subLabel: moodData.subLabel,
            data: { ...node.data, ...moodData.data },
          };
        }
        break;
      }
    }
    return node;
  });
}

interface SymptomEnrichment {
  subLabel: string;
  data: { avgSeverity: number; logCount: number; lastLogged: string };
}

function buildSymptomMap(
  logs: Array<{ symptom_name: string; severity: number | null; logged_at: string }>
): Map<string, SymptomEnrichment> {
  const map = new Map<string, SymptomEnrichment>();
  const aggregates = new Map<string, { severities: number[]; lastLogged: string }>();

  for (const log of logs) {
    const key = log.symptom_name.toLowerCase();
    const existing = aggregates.get(key);
    if (existing) {
      if (log.severity !== null) {
        existing.severities.push(log.severity);
      }
    } else {
      aggregates.set(key, {
        severities: log.severity !== null ? [log.severity] : [],
        lastLogged: log.logged_at,
      });
    }
  }

  for (const [name, data] of aggregates.entries()) {
    const avgSeverity = data.severities.length > 0
      ? Math.round((data.severities.reduce((a, b) => a + b, 0) / data.severities.length) * 10) / 10
      : 0;
    const logCount = data.severities.length;
    const daysAgo = Math.floor(
      (Date.now() - new Date(data.lastLogged).getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeLabel = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo}d ago`;

    map.set(name, {
      subLabel: avgSeverity > 0 ? `Avg ${avgSeverity}/10 · ${logCount}x this week` : `Logged ${timeLabel}`,
      data: { avgSeverity, logCount, lastLogged: data.lastLogged },
    });
  }

  return map;
}

interface MedicationEnrichment {
  subLabel: string;
  data: { dosage: string | null; timing: string | null; logCount: number };
}

function buildMedicationMap(
  logs: Array<{ med_name: string; dosage: string | null; timing: string | null; logged_at: string }>
): Map<string, MedicationEnrichment> {
  const map = new Map<string, MedicationEnrichment>();
  const aggregates = new Map<string, { dosage: string | null; timing: string | null; count: number }>();

  for (const log of logs) {
    const key = log.med_name.toLowerCase();
    const existing = aggregates.get(key);
    if (existing) {
      existing.count++;
      // Use most recent dosage/timing
      if (!existing.dosage && log.dosage) existing.dosage = log.dosage;
      if (!existing.timing && log.timing) existing.timing = log.timing;
    } else {
      aggregates.set(key, {
        dosage: log.dosage,
        timing: log.timing,
        count: 1,
      });
    }
  }

  for (const [name, data] of aggregates.entries()) {
    const parts: string[] = [];
    if (data.dosage) parts.push(data.dosage);
    if (data.timing) parts.push(data.timing);
    parts.push(`${data.count}x this week`);

    map.set(name, {
      subLabel: parts.join(' · '),
      data: { dosage: data.dosage, timing: data.timing, logCount: data.count },
    });
  }

  return map;
}

interface MoodEnrichment {
  subLabel: string;
  data: { avgRating: number; logCount: number };
}

function buildMoodSummary(
  logs: Array<{ rating: number; logged_at: string }>
): MoodEnrichment | null {
  if (logs.length === 0) return null;

  const avgRating = Math.round(
    (logs.reduce((a, b) => a + b.rating, 0) / logs.length) * 10
  ) / 10;

  return {
    subLabel: `Avg ${avgRating}/10 · ${logs.length} entries`,
    data: { avgRating, logCount: logs.length },
  };
}
