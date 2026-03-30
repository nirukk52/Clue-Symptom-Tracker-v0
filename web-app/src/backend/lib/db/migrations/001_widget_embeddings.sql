-- Widget Embeddings Migration
-- Why: Enables RAG-powered widget selection using pgvector
-- Pre-embed the 30 widgets from onboarding-flow.json for semantic search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Widget embeddings table
CREATE TABLE IF NOT EXISTS widget_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Widget identification
  widget_id TEXT NOT NULL UNIQUE,        -- e.g., "w1_time_of_day_energy"
  q2_key TEXT NOT NULL,                  -- e.g., "energy_envelope"
  condition TEXT NOT NULL,               -- e.g., "fatigue", "flares", "migraines"

  -- The text that was embedded
  embedding_content TEXT NOT NULL,

  -- Vector embedding (1536 dimensions for text-embedding-3-small)
  embedding vector(1536) NOT NULL,

  -- Widget metadata (denormalized for fast retrieval)
  widget_name TEXT NOT NULL,
  widget_type TEXT NOT NULL,
  question TEXT NOT NULL,
  q4_value TEXT NOT NULL,
  captures TEXT[] NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS widget_embeddings_embedding_idx
ON widget_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Index for filtering by condition
CREATE INDEX IF NOT EXISTS widget_embeddings_condition_idx
ON widget_embeddings (condition);

-- Function to match widgets by embedding similarity
CREATE OR REPLACE FUNCTION match_widgets(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  filter_condition text DEFAULT NULL
)
RETURNS TABLE (
  widget_id text,
  q2_key text,
  condition text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    we.widget_id,
    we.q2_key,
    we.condition,
    1 - (we.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'widgetName', we.widget_name,
      'widgetType', we.widget_type,
      'question', we.question,
      'q4Value', we.q4_value,
      'captures', we.captures
    ) AS metadata
  FROM widget_embeddings we
  WHERE
    (filter_condition IS NULL OR we.condition = filter_condition)
    AND (1 - (we.embedding <=> query_embedding)) > match_threshold
  ORDER BY we.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION match_widgets TO authenticated;
GRANT EXECUTE ON FUNCTION match_widgets TO service_role;
