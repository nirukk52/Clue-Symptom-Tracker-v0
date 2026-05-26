import type { UIMessage } from 'ai';

/**
 * Minimal stored chat row shape shared across loaders and debug scripts.
 * Why this exists: `chat_messages.content` currently contains a mix of legacy
 * plain text rows and new serialized `UIMessage` JSON strings.
 */
export interface StoredChatMessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string | null;
}

/**
 * Detects whether a parsed JSON value looks like a `UIMessage`.
 * Why this exists: Stored chat rows must tolerate legacy plain text content
 * while safely upgrading to structured message persistence.
 */
function isStoredUIMessage(value: unknown): value is UIMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'parts' in value &&
    Array.isArray((value as { parts?: unknown }).parts)
  );
}

/**
 * Extracts visible text from a `UIMessage`.
 * Why this exists: Memory, analysis, and reconciliation flows only need the
 * human-readable text, not every structured tool part.
 */
export function extractTextFromUIMessage(message: Pick<UIMessage, 'parts'>): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim();
}

/**
 * Serializes a `UIMessage` for storage in the current `TEXT` column.
 * Why this exists: We want to persist the full AI SDK message shape now without
 * requiring an immediate database migration.
 */
export function serializeUIMessage(message: UIMessage): string {
  return JSON.stringify(message);
}

/**
 * Reconstructs a `UIMessage` from a stored database row.
 * Why this exists: The client should load both old plain text rows and new
 * serialized `UIMessage` rows without breaking the chat experience.
 */
export function deserializeStoredChatMessage(row: StoredChatMessageRow): UIMessage {
  const rawContent = row.content ?? '';

  try {
    const parsed = JSON.parse(rawContent) as unknown;
    if (isStoredUIMessage(parsed)) {
      return {
        ...parsed,
        id: typeof parsed.id === 'string' ? parsed.id : row.id,
        role:
          parsed.role === 'user' || parsed.role === 'assistant' || parsed.role === 'system'
            ? parsed.role
            : row.role,
      };
    }
  } catch {
    // Legacy plain text rows intentionally fall through to the text-only shape.
  }

  return {
    id: row.id,
    role: row.role,
    parts: [{ type: 'text', text: rawContent }],
  };
}

/**
 * Extracts plain text from a stored chat row.
 * Why this exists: Backend readers need a stable text representation regardless
 * of whether the row was stored in legacy plain text or structured JSON format.
 */
export function extractTextFromStoredChatMessage(row: StoredChatMessageRow): string {
  return extractTextFromUIMessage(deserializeStoredChatMessage(row));
}
