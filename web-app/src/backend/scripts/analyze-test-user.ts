/**
 * Analyze Test User Script
 *
 * Why this exists: Gives a developer a complete snapshot of everything stored
 * for a given user — conversations, graph nodes, symptom/medication/mood logs,
 * and insights — so you can debug what the Clue agent has learned without
 * opening the Supabase dashboard.
 *
 * Run:
 *   npx tsx --env-file=.env.local src/backend/scripts/analyze-test-user.ts <email>
 *
 * Example:
 *   npx tsx --env-file=.env.local src/backend/scripts/analyze-test-user.ts me@example.com
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zvpudxinbcsrfyojrhhv.supabase.co';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY is missing from your env file.');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌  Usage: npx tsx --env-file=.env.local src/backend/scripts/analyze-test-user.ts <email>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function section(title: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

function empty(label: string) {
  console.log(`  (no ${label})`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Resolve user
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) { console.error('❌  Could not fetch users:', userError.message); process.exit(1); }

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    console.error(`❌  No user found with email "${email}".`);
    console.log('\nExisting users:');
    users.users.forEach((u) => console.log(`  • ${u.email}`));
    process.exit(1);
  }

  const userId = user.id;
  console.log(`\n👤  User: ${email}`);
  console.log(`    ID:   ${userId}`);
  console.log(`    Signed up: ${new Date(user.created_at).toLocaleString()}`);

  // -------------------------------------------------------------------------
  // 2. Conversations + messages
  // -------------------------------------------------------------------------
  section('💬  CONVERSATIONS');

  const { data: convos } = await supabase
    .from('chat_conversations')
    .select('id, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!convos?.length) {
    empty('conversations');
  } else {
    console.log(`  ${convos.length} conversation(s)\n`);

    for (const convo of convos) {
      console.log(`  📁 ${convo.id}  (${new Date(convo.created_at).toLocaleString()})`);

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: true });

      if (!msgs?.length) {
        console.log('     (empty)');
      } else {
        for (const msg of msgs) {
          const prefix = msg.role === 'user' ? '  👤' : '  🤖';
          // Truncate long messages for readability
          const text = (msg.content as string).replace(/\n/g, ' ').slice(0, 120);
          const ellipsis = (msg.content as string).length > 120 ? '…' : '';
          console.log(`     ${prefix} [${msg.role}] ${text}${ellipsis}`);
        }
      }
      console.log('');
    }
  }

  // -------------------------------------------------------------------------
  // 3. Knowledge graph
  // -------------------------------------------------------------------------
  section('🕸️   KNOWLEDGE GRAPH');

  const { data: nodes } = await supabase
    .from('graph_nodes')
    .select('type, name, sub_label, confidence, status')
    .eq('user_id', userId)
    .order('type');

  if (!nodes?.length) {
    empty('graph nodes');
  } else {
    const byType = nodes.reduce<Record<string, typeof nodes>>((acc, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    }, {});

    for (const [type, group] of Object.entries(byType)) {
      console.log(`\n  ${type.toUpperCase()} (${group.length})`);
      for (const n of group) {
        const label = n.sub_label ? ` [${n.sub_label}]` : '';
        const conf = n.confidence ? ` — confidence: ${n.confidence}` : '';
        console.log(`    • ${n.name}${label}${conf}  (${n.status})`);
      }
    }

    const { data: edges } = await supabase
      .from('graph_edges')
      .select('relationship, weight')
      .in('source_node_id',
        (await supabase.from('graph_nodes').select('id').eq('user_id', userId)).data?.map(n => n.id) ?? []
      );

    console.log(`\n  EDGES: ${edges?.length ?? 0} relationship(s)`);
    if (edges?.length) {
      const edgeCounts = edges.reduce<Record<string, number>>((acc, e) => {
        acc[e.relationship] = (acc[e.relationship] || 0) + 1;
        return acc;
      }, {});
      for (const [rel, count] of Object.entries(edgeCounts)) {
        console.log(`    • ${rel}: ${count}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Symptom logs
  // -------------------------------------------------------------------------
  section('🩺  SYMPTOM LOGS');

  const { data: symptoms } = await supabase
    .from('symptom_logs')
    .select('symptom_name, severity, notes, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(20);

  if (!symptoms?.length) {
    empty('symptom logs');
  } else {
    for (const s of symptoms) {
      const sev = s.severity != null ? ` [severity ${s.severity}/10]` : '';
      const note = s.notes ? ` — "${s.notes}"` : '';
      console.log(`  • ${new Date(s.logged_at).toLocaleString()}  ${s.symptom_name}${sev}${note}`);
    }
    if (symptoms.length === 20) console.log('  (showing latest 20)');
  }

  // -------------------------------------------------------------------------
  // 5. Medication logs
  // -------------------------------------------------------------------------
  section('💊  MEDICATION LOGS');

  const { data: meds } = await supabase
    .from('medication_logs')
    .select('med_name, dosage, taken, timing, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(20);

  if (!meds?.length) {
    empty('medication logs');
  } else {
    for (const m of meds) {
      const dose = m.dosage ? ` ${m.dosage}` : '';
      const taken = m.taken ? '✓' : '✗';
      console.log(`  ${taken} ${new Date(m.logged_at).toLocaleString()}  ${m.med_name}${dose}`);
    }
    if (meds.length === 20) console.log('  (showing latest 20)');
  }

  // -------------------------------------------------------------------------
  // 6. Mood logs
  // -------------------------------------------------------------------------
  section('😌  MOOD LOGS');

  const { data: moods } = await supabase
    .from('mood_logs')
    .select('rating, note, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(10);

  if (!moods?.length) {
    empty('mood logs');
  } else {
    for (const m of moods) {
      const note = m.note ? ` — "${m.note}"` : '';
      console.log(`  • ${new Date(m.logged_at).toLocaleString()}  rating: ${m.rating}/10${note}`);
    }
  }

  // -------------------------------------------------------------------------
  // 7. Timeline
  // -------------------------------------------------------------------------
  section('📅  TIMELINE ENTRIES');

  const { data: timeline } = await supabase
    .from('timeline_entries')
    .select('type, title, description, severity, entry_time')
    .eq('user_id', userId)
    .order('entry_time', { ascending: false })
    .limit(20);

  if (!timeline?.length) {
    empty('timeline entries');
  } else {
    for (const t of timeline) {
      const sev = t.severity != null ? ` [${t.severity}/10]` : '';
      const desc = t.description ? ` — ${t.description.slice(0, 60)}` : '';
      console.log(`  • ${new Date(t.entry_time).toLocaleString()}  [${t.type}] ${t.title}${sev}${desc}`);
    }
    if (timeline.length === 20) console.log('  (showing latest 20)');
  }

  // -------------------------------------------------------------------------
  // 8. Insights
  // -------------------------------------------------------------------------
  section('💡  INSIGHTS');

  const { data: insights } = await supabase
    .from('insights')
    .select('content, confidence, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!insights?.length) {
    empty('insights');
  } else {
    for (const i of insights) {
      const conf = i.confidence != null ? ` [conf: ${(i.confidence * 100).toFixed(0)}%]` : '';
      console.log(`  • [${i.status}]${conf} ${i.content.slice(0, 100)}`);
    }
  }

  // -------------------------------------------------------------------------
  // 9. Summary
  // -------------------------------------------------------------------------
  section('📊  SUMMARY');
  console.log(`  Conversations  : ${convos?.length ?? 0}`);
  const totalMsgs = convos?.length
    ? (await supabase.from('chat_messages').select('id', { count: 'exact', head: true })
        .in('conversation_id', convos.map(c => c.id))).count ?? 0
    : 0;
  console.log(`  Messages       : ${totalMsgs}`);
  console.log(`  Graph nodes    : ${nodes?.length ?? 0}`);
  console.log(`  Symptom logs   : ${symptoms?.length ?? 0}${symptoms?.length === 20 ? '+' : ''}`);
  console.log(`  Medication logs: ${meds?.length ?? 0}${meds?.length === 20 ? '+' : ''}`);
  console.log(`  Mood logs      : ${moods?.length ?? 0}`);
  console.log(`  Timeline       : ${timeline?.length ?? 0}${timeline?.length === 20 ? '+' : ''}`);
  console.log(`  Insights       : ${insights?.length ?? 0}`);
  console.log('');
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err);
  process.exit(1);
});
