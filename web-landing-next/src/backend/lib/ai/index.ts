/**
 * AI Library - Public Exports
 *
 * Why this exists: Central export point for AI utilities
 */

// Provider configuration
export type { ModelKey } from './providers';
export {
  composeSystemPrompt,
  getModel,
  googleProvider,
  models,
  openaiProvider,
  systemPromptFragments,
} from './providers';

// Embedding and RAG functions
export type { WidgetEmbedding, WidgetSearchResult } from './embedding';
export {
  findRelevantWidgets,
  generateEmbedding,
  generateEmbeddings,
  generateWidgetEmbeddingContent,
  storeWidgetEmbedding,
  storeWidgetEmbeddings,
} from './embedding';
