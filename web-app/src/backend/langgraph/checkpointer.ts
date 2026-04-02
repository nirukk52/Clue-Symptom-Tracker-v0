/**
 * LangGraph Checkpointer
 *
 * Why this exists: Provides checkpoint persistence for LangGraph runs.
 * Prefer Postgres when a real database connection string is configured, but
 * keep local development functional with an in-process saver when only the
 * Supabase REST credentials are available.
 */

import { BaseCheckpointSaver, MemorySaver } from '@langchain/langgraph-checkpoint';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let checkpointerInstance: BaseCheckpointSaver | null = null;
let setupPromise: Promise<BaseCheckpointSaver> | null = null;

/**
 * Returns the first configured Postgres connection string.
 * Why this exists: The Postgres saver must use real database credentials.
 * Supabase JWT API keys are not valid database passwords.
 */
function getConfiguredConnectionString(): string | null {
  const configuredUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl || !supabaseDbPassword) {
    return null;
  }

  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid Supabase URL format');
  }

  const projectRef = match[1];
  return `postgresql://postgres:${supabaseDbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
}

/**
 * Creates the in-process saver used when no working Postgres DSN exists.
 * Why this exists: Local development still benefits from thread continuity
 * during a single dev-server session without spamming connection failures.
 */
function createMemoryCheckpointer(reason: string): BaseCheckpointSaver {
  console.warn(`[Checkpointer] Using MemorySaver: ${reason}`);
  return new MemorySaver();
}

/**
 * Gets or creates the checkpointer singleton.
 * Why this exists: Reuses one saver across requests and avoids repeated setup
 * or repeated connection failures in development.
 */
export async function getCheckpointer(): Promise<BaseCheckpointSaver> {
  if (checkpointerInstance) {
    return checkpointerInstance;
  }

  if (!setupPromise) {
    setupPromise = (async () => {
      const connectionString = getConfiguredConnectionString();

      if (!connectionString) {
        checkpointerInstance = createMemoryCheckpointer(
          'No DATABASE_URL/POSTGRES_URL or SUPABASE_DB_PASSWORD was configured.'
        );
        return checkpointerInstance;
      }

      try {
        const postgresSaver = PostgresSaver.fromConnString(connectionString, {
          schema: 'public',
        });
        await postgresSaver.setup();
        console.log('[Checkpointer] PostgresSaver initialized');
        checkpointerInstance = postgresSaver;
        return checkpointerInstance;
      } catch (error) {
        console.error('[Checkpointer] PostgresSaver setup failed, falling back to MemorySaver:', error);
        checkpointerInstance = createMemoryCheckpointer(
          'Postgres connection failed. Set DATABASE_URL or POSTGRES_URL to enable durable checkpoints.'
        );
        return checkpointerInstance;
      }
    })();
  }

  return setupPromise;
}

/**
 * Creates a thread configuration for a conversation.
 * Why this exists: Each conversation needs a unique thread_id for checkpoint
 * isolation and replay.
 */
export function createThreadConfig(
  conversationId: string,
  checkpointNs: string = ''
): { configurable: { thread_id: string; checkpoint_ns: string } } {
  return {
    configurable: {
      thread_id: conversationId,
      checkpoint_ns: checkpointNs,
    },
  };
}

/**
 * Creates a new thread ID for a fresh conversation.
 * Why this exists: Anonymous or new conversations need a deterministic but
 * unique thread identifier.
 */
export function generateThreadId(userId: string): string {
  return `${userId}:${Date.now()}`;
}
