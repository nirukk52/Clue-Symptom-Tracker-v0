/**
 * Memory Service (mem0 integration)
 *
 * Why this exists: Provides per-user persistent memory so the Clue agent
 * remembers conditions, preferences, and patterns across sessions.
 * Uses mem0's hosted MemoryClient for managed memory extraction and retrieval.
 */

/**
 * Retrieves memories relevant to the current conversation context.
 * Called BEFORE generating a response to inject user context into the system prompt.
 */
export async function getRelevantMemories(
  userId: string,
  query: string
): Promise<string> {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) {
    return '';
  }

  try {
    const { MemoryClient } = await import('mem0ai');
    const client = new MemoryClient({ apiKey });

    const results = await client.search(query, {
      user_id: userId,
    });

    if (!results || results.length === 0) {
      return '';
    }

    return results
      .slice(0, 10)
      .map((m: { memory?: string }) => `- ${m.memory ?? ''}`)
      .filter((line: string) => line !== '- ')
      .join('\n');
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    return '';
  }
}

/**
 * Stores new memories from a conversation exchange.
 * Called AFTER a response is generated to persist learnings about the user.
 */
export async function storeMemory(
  userId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<void> {
  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey) {
    return;
  }

  try {
    const { MemoryClient } = await import('mem0ai');
    const client = new MemoryClient({ apiKey });

    await client.add(messages, { user_id: userId });
  } catch (error) {
    console.error('Memory storage failed:', error);
  }
}
