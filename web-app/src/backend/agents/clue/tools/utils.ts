/**
 * Shared utilities for Clue chat tools
 *
 * Why this exists: Provides shared Supabase client and user ID management
 * across all tool definitions, preventing code duplication.
 */

import { createClient } from '@supabase/supabase-js';

/** Server-side Supabase client for tool operations (lazy-initialized for build safety) */
export function getSupabase() {
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

export function getUid() {
  return _activeUserId;
}
