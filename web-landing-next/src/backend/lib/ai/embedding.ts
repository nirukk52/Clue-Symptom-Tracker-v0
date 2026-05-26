/**
 * AI Embedding Functions
 *
 * Why this exists: Enables RAG-powered widget selection by embedding
 * user messages and finding semantically similar widgets from the
 * onboarding-flow.json knowledge base.
 *
 * Based on Vercel AI SDK RAG guide patterns.
 */

import { openai } from '@ai-sdk/openai';
// =============================================================================
// SUPABASE VECTOR OPERATIONS
// =============================================================================
import { createClient } from '@supabase/supabase-js';
import { embed, embedMany } from 'ai';

// Use OpenAI's text-embedding-3-small for cost efficiency
const embeddingModel = openai.embedding('text-embedding-3-small');

// =============================================================================
// GENERATE EMBEDDINGS
// =============================================================================

/**
 * Generate a single embedding from an input string
 * Used for embedding user queries during retrieval
 */
export async function generateEmbedding(value: string): Promise<number[]> {
  const input = value.replaceAll('\n', ' ').trim();
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

/**
 * Generate multiple embeddings from an array of strings
 * Used for batch embedding widgets during seeding
 */
export async function generateEmbeddings(
  values: string[]
): Promise<{ embedding: number[]; content: string }[]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values,
  });
  return embeddings.map((e, i) => ({ content: values[i], embedding: e }));
}

// =============================================================================
// WIDGET EMBEDDING TYPES
// =============================================================================

/**
 * Widget embedding record stored in Supabase
 */
export interface WidgetEmbedding {
  id: string;
  widgetId: string; // e.g., "w1_time_of_day_energy"
  q2Key: string; // e.g., "energy_envelope"
  condition: string; // e.g., "fatigue"
  embeddingContent: string; // The text that was embedded
  embedding: number[]; // The vector
  metadata: {
    widgetName: string;
    widgetType: string;
    question: string;
    q4Value: string;
    captures: string[];
  };
}

/**
 * Widget search result with similarity score
 */
export interface WidgetSearchResult {
  widgetId: string;
  q2Key: string;
  condition: string;
  similarity: number;
  metadata: WidgetEmbedding['metadata'];
}

// =============================================================================
// CHUNK GENERATION FOR WIDGETS
// =============================================================================

/**
 * Generate embeddable content from a widget definition
 * Combines multiple fields to create rich semantic representation
 */
export function generateWidgetEmbeddingContent(widget: {
  id: string;
  name: string;
  q2Key: string;
  question: string;
  q4Value: string;
  captures: string[];
  conditionQuestion: string;
}): string {
  // Create a rich text representation for embedding
  const parts = [
    `Widget: ${widget.name}`,
    `Question: ${widget.question}`,
    `Value proposition: ${widget.q4Value}`,
    `Condition context: ${widget.conditionQuestion}`,
    `Captures: ${widget.captures.join(', ')}`,
  ];
  return parts.join('. ');
}

// Supabase configuration with fallbacks (same pattern as src/lib/supabase.ts)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zvpudxinbcsrfyojrhhv.supabase.co';

// For server-side operations, use service role key if available, else anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cHVkeGluYmNzcmZ5b2pyaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTE3MjksImV4cCI6MjA4MjUyNzcyOX0.5vV65qusPzu7847VxbiodRU0DZG1AryUuoklX3qFAWk';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Find relevant widgets using vector similarity search
 * Uses Supabase's built-in pgvector functions
 */
export async function findRelevantWidgets(
  userQuery: string,
  options: {
    condition?: string; // Filter by condition
    limit?: number; // Max results
    similarityThreshold?: number; // Minimum similarity (0-1)
  } = {}
): Promise<WidgetSearchResult[]> {
  const { condition, limit = 5, similarityThreshold = 0.5 } = options;

  // Generate embedding for user query
  const queryEmbedding = await generateEmbedding(userQuery);

  // Call Supabase RPC function for vector similarity search
  // This requires a stored procedure (created via migration)
  const { data, error } = await supabase.rpc('match_widgets', {
    query_embedding: queryEmbedding,
    match_threshold: similarityThreshold,
    match_count: limit,
    filter_condition: condition || null,
  });

  if (error) {
    console.error('Widget search error:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    widgetId: row.widget_id as string,
    q2Key: row.q2_key as string,
    condition: row.condition as string,
    similarity: row.similarity as number,
    metadata: row.metadata as WidgetEmbedding['metadata'],
  }));
}

/**
 * Store widget embeddings in Supabase
 * Used during seeding process
 */
export async function storeWidgetEmbedding(
  embedding: WidgetEmbedding
): Promise<void> {
  const { error } = await supabase.from('widget_embeddings').upsert({
    id: embedding.id,
    widget_id: embedding.widgetId,
    q2_key: embedding.q2Key,
    condition: embedding.condition,
    embedding_content: embedding.embeddingContent,
    embedding: embedding.embedding,
    widget_name: embedding.metadata.widgetName,
    widget_type: embedding.metadata.widgetType,
    question: embedding.metadata.question,
    q4_value: embedding.metadata.q4Value,
    captures: embedding.metadata.captures,
  });

  if (error) {
    console.error('Failed to store widget embedding:', error);
    throw error;
  }
}

/**
 * Batch store widget embeddings
 */
export async function storeWidgetEmbeddings(
  embeddings: WidgetEmbedding[]
): Promise<void> {
  const rows = embeddings.map((e) => ({
    id: e.id,
    widget_id: e.widgetId,
    q2_key: e.q2Key,
    condition: e.condition,
    embedding_content: e.embeddingContent,
    embedding: e.embedding,
    widget_name: e.metadata.widgetName,
    widget_type: e.metadata.widgetType,
    question: e.metadata.question,
    q4_value: e.metadata.q4Value,
    captures: e.metadata.captures,
  }));

  const { error } = await supabase.from('widget_embeddings').upsert(rows);

  if (error) {
    console.error('Failed to store widget embeddings:', error);
    throw error;
  }
}
