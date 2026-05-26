/**
 * Shared utilities for Clue chat tools
 *
 * Why this exists: Provides shared Supabase client and request-scoped user ID
 * access across all tool definitions, preventing cross-request leakage.
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { createClient } from '@supabase/supabase-js';

/** Server-side Supabase client for tool operations (lazy-initialized for build safety) */
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const activeUserIdStorage = new AsyncLocalStorage<string>();

/**
 * Runs one callback inside a request-scoped tool user context.
 * Why this exists: Parallel chat requests must not share one mutable global
 * user ID or tool writes can bleed across conversations.
 */
export function withActiveUserId<T>(uid: string, run: () => T): T {
  return activeUserIdStorage.run(uid, run);
}

/**
 * Returns the current request-scoped tool user ID.
 * Why this exists: Tool definitions need a deterministic user target without
 * trusting the model to supply one in every tool call.
 */
export function getUid() {
  return activeUserIdStorage.getStore() ?? 'anonymous';
}
