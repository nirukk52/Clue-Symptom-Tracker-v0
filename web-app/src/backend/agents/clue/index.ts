/**
 * Clue Agent - Public API
 *
 * Why this exists: Exports the tools and prompts used by the Clue chat agent.
 * The actual chat orchestration happens in /api/chat/route.ts using streamText.
 */

// Chat tools for Supabase-backed operations
export { chatTools, setActiveUserId } from './tools/chat-tools';

// System prompt builder
export { buildSystemPrompt } from './prompts/system';
