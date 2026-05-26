/**
 * Purge Test User Script
 *
 * Why this exists: Wipes all data for a given user across every app table so
 * that testing can restart from a clean first-conversation state.  The auth
 * record itself is preserved — the user can still log in again immediately.
 *
 * Run:
 *   npx tsx --env-file=.env.local src/backend/scripts/purge-test-user.ts <email>
 *
 * Example:
 *   npx tsx --env-file=.env.local src/backend/scripts/purge-test-user.ts me@example.com
 */

import { createClient } from '@supabase/supabase-js';
//
// ---------------------------------------------------------------------------
// Config email niranjan.kurambhatti@gmail.com
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
  console.error('❌  Usage: npx tsx --env-file=.env.local src/backend/scripts/purge-test-user.ts <email>');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Supabase admin client (service role bypasses RLS)
// ---------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Delete rows by direct user_id column and return count deleted. */
async function purgeByUserId(table: string, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('user_id', userId)
    .select('id');

  if (error) {
    // Table doesn't exist (direct PG code or PostgREST schema cache miss)
    if (error.code === '42P01' || error.message?.includes('schema cache')) {
      console.warn(`  ⚠️  Table "${table}" does not exist yet — skipping.`);
      return 0;
    }
    throw new Error(`Failed to purge ${table}: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Delete chat_messages via sub-select on conversation_id.
 * chat_messages has no user_id — it links via chat_conversations.
 */
async function purgeChatMessages(userId: string): Promise<number> {
  // Fetch conversation IDs belonging to this user first
  const { data: convos, error: convErr } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('user_id', userId);

  if (convErr) throw new Error(`Failed to fetch conversations: ${convErr.message}`);
  if (!convos || convos.length === 0) return 0;

  const convIds = convos.map((c) => c.id);

  const { data, error } = await supabase
    .from('chat_messages')
    .delete()
    .in('conversation_id', convIds)
    .select('id');

  if (error) throw new Error(`Failed to purge chat_messages: ${error.message}`);
  return data?.length ?? 0;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🧹  Purging data for: ${email}\n`);

  // 1. Resolve user ID from auth
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('❌  Could not fetch users:', userError.message);
    process.exit(1);
  }

  const user = users.users.find((u) => u.email === email);

  if (!user) {
    console.error(`❌  No user found with email "${email}".`);
    console.log('\nExisting users:');
    users.users.forEach((u) => console.log(`  • ${u.email}`));
    process.exit(1);
  }

  const userId = user.id;
  console.log(`   User ID: ${userId}\n`);

  // 2. Wipe in FK-safe order.
  //    graph_edges → graph_nodes (edges reference nodes)
  //    chat_messages → chat_conversations (messages reference conversations via conversation_id)
  let totalDeleted = 0;

  // Tables with direct user_id column (FK-safe order: edges before nodes)
  const directTables = [
    'graph_edges',
    'graph_nodes',
    'symptom_logs',
    'medication_logs',
    'mood_logs',
    'timeline_entries',
    'insights',
    'user_preferences',
    'doctor_summaries',
  ];

  for (const table of directTables) {
    const count = await purgeByUserId(table, userId);
    console.log(`  ✓  ${table.padEnd(28)} — ${count} row(s) deleted`);
    totalDeleted += count;
  }

  // chat_messages has no user_id — must go via conversation_id sub-select
  const msgCount = await purgeChatMessages(userId);
  console.log(`  ✓  ${'chat_messages'.padEnd(28)} — ${msgCount} row(s) deleted`);
  totalDeleted += msgCount;

  const convoCount = await purgeByUserId('chat_conversations', userId);
  console.log(`  ✓  ${'chat_conversations'.padEnd(28)} — ${convoCount} row(s) deleted`);
  totalDeleted += convoCount;

  console.log(`\n✅  Done. ${totalDeleted} total rows deleted for ${email}.\n`);
  console.log('   The auth account is preserved — you can sign in again immediately.\n');
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err);
  process.exit(1);
});
