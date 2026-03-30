-- Knowledge Graph Tables Migration
-- Why: Stores the user's health knowledge graph as nodes and edges in Supabase.
-- The graph visualizes symptoms, factors, medications, conditions, AI-generated clues,
-- and unknown questions. This enables the interactive ChatCanvas graph rendering
-- with Reagraph and powers the insight generation pipeline.

-- =============================================================================
-- ENUMS: Stable vocabularies for node and edge types
-- =============================================================================

-- Node types for the knowledge graph
-- Using an enum for type safety and query performance
CREATE TYPE graph_node_type AS ENUM (
  'symptom',      -- User-reported symptoms (headache, fatigue, pain)
  'factor',       -- Contributing factors (sleep, stress, diet, activity, weather)
  'medication',   -- Medications and supplements
  'condition',    -- Diagnosed conditions (IBS, Fibromyalgia, POTS)
  'clue',         -- AI-generated insights connecting multiple nodes
  'unknown'       -- Questions Clue still needs answered (tap to ask)
);

-- Edge relationship types between nodes
-- Defines how nodes are connected in the graph
CREATE TYPE graph_edge_relationship AS ENUM (
  'SUPPORTED_BY',   -- Clue/insight is supported by evidence nodes
  'ABOUT',          -- Node is about another node (e.g., factor about symptom)
  'NEEDS_INFO',     -- Unknown node needs info from another node
  'HAS_SYMPTOM',    -- Condition has symptom
  'HAS_FACTOR',     -- Symptom/condition has contributing factor
  'CORRELATES_WITH',-- Statistical correlation between nodes (r > threshold)
  'TRIGGERS',       -- Factor triggers symptom/flare (causal direction inferred)
  'IMPROVES',       -- Factor/medication improves symptom
  'CO_OCCURS'       -- Symptoms that frequently appear together
);

-- Node status for lifecycle management
CREATE TYPE graph_node_status AS ENUM (
  'active',     -- Currently active in the graph
  'dismissed',  -- User dismissed this node
  'resolved',   -- Symptom/issue resolved
  'archived'    -- Historical, no longer relevant
);

-- Confidence levels for clue/insight nodes
CREATE TYPE graph_confidence_level AS ENUM (
  'high',       -- Strong statistical evidence (p < 0.01, multiple observations)
  'medium',     -- Moderate evidence (p < 0.05, some observations)
  'low',        -- Preliminary pattern (few observations, suggestive)
  'uncertain'   -- Not enough data yet
);

-- =============================================================================
-- TABLE: graph_nodes
-- =============================================================================
-- Stores all entities in the user's health knowledge graph.
-- Each node has a type, display info, and optional metadata in data_json.

CREATE TABLE IF NOT EXISTS graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership
  user_id TEXT NOT NULL,
  
  -- Node classification
  type graph_node_type NOT NULL,
  status graph_node_status NOT NULL DEFAULT 'active',
  
  -- Display properties
  name TEXT NOT NULL,                    -- Primary label (e.g., "Headache", "Poor Sleep")
  sub_label TEXT,                        -- Secondary label (e.g., "Severity 7/10", "Tap to answer")
  
  -- For clue/insight nodes
  confidence graph_confidence_level,     -- How confident is this insight
  confidence_score REAL,                 -- Numeric confidence (0.0 to 1.0)
  
  -- For unknown nodes (questions)
  question_text TEXT,                    -- The question to ask the user
  question_priority INTEGER DEFAULT 0,   -- Higher = more important to ask
  
  -- Flexible metadata storage
  -- Stores type-specific fields like severity, duration, dosage, evidence_refs, etc.
  data_json JSONB DEFAULT '{}',
  
  -- Source tracking for atomic facts
  source_memory_id TEXT,                 -- mem0 memory ID if extracted from memory
  source_message_id UUID,                -- chat_messages ID if extracted from chat
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS graph_nodes_user_idx ON graph_nodes (user_id);
CREATE INDEX IF NOT EXISTS graph_nodes_user_type_idx ON graph_nodes (user_id, type);
CREATE INDEX IF NOT EXISTS graph_nodes_user_status_idx ON graph_nodes (user_id, status);
CREATE INDEX IF NOT EXISTS graph_nodes_user_active_idx ON graph_nodes (user_id) WHERE status = 'active';

-- Unique constraint: one node per user/type/name combo (deduplication)
-- This allows upsert behavior when extracting entities
CREATE UNIQUE INDEX IF NOT EXISTS graph_nodes_user_type_name_uniq 
  ON graph_nodes (user_id, type, LOWER(name)) 
  WHERE status = 'active';

-- GIN index on data_json for JSONB queries
CREATE INDEX IF NOT EXISTS graph_nodes_data_json_idx ON graph_nodes USING GIN (data_json);

-- =============================================================================
-- TABLE: graph_edges
-- =============================================================================
-- Stores relationships between nodes in the knowledge graph.
-- Edges are directional: source -> target with a relationship type.

CREATE TABLE IF NOT EXISTS graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ownership (denormalized for query performance)
  user_id TEXT NOT NULL,
  
  -- Edge endpoints
  source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  
  -- Relationship type
  relationship graph_edge_relationship NOT NULL,
  
  -- Edge strength/weight
  -- For CORRELATES_WITH: Pearson/Spearman r value (-1 to 1)
  -- For SUPPORTED_BY: evidence strength (0 to 1)
  -- For TRIGGERS/IMPROVES: confidence (0 to 1)
  weight REAL DEFAULT 1.0,
  
  -- Statistical evidence (for CORRELATES_WITH, TRIGGERS, etc.)
  p_value REAL,                          -- Statistical significance
  observation_count INTEGER DEFAULT 0,   -- Number of data points
  
  -- Metadata for edge display and analysis
  data_json JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS graph_edges_user_idx ON graph_edges (user_id);
CREATE INDEX IF NOT EXISTS graph_edges_source_idx ON graph_edges (source_node_id);
CREATE INDEX IF NOT EXISTS graph_edges_target_idx ON graph_edges (target_node_id);
CREATE INDEX IF NOT EXISTS graph_edges_relationship_idx ON graph_edges (user_id, relationship);

-- Unique constraint: one edge per source/target/relationship combo
CREATE UNIQUE INDEX IF NOT EXISTS graph_edges_unique_idx 
  ON graph_edges (user_id, source_node_id, target_node_id, relationship);

-- =============================================================================
-- FUNCTIONS: Graph operations
-- =============================================================================

-- Upsert a graph node (insert or update by user/type/name)
-- Returns the node ID (existing or newly created)
CREATE OR REPLACE FUNCTION upsert_graph_node(
  p_user_id TEXT,
  p_type graph_node_type,
  p_name TEXT,
  p_sub_label TEXT DEFAULT NULL,
  p_confidence graph_confidence_level DEFAULT NULL,
  p_confidence_score REAL DEFAULT NULL,
  p_question_text TEXT DEFAULT NULL,
  p_question_priority INTEGER DEFAULT 0,
  p_data_json JSONB DEFAULT '{}',
  p_source_memory_id TEXT DEFAULT NULL,
  p_source_message_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_node_id UUID;
BEGIN
  -- Try to find existing active node
  SELECT id INTO v_node_id
  FROM graph_nodes
  WHERE user_id = p_user_id
    AND type = p_type
    AND LOWER(name) = LOWER(p_name)
    AND status = 'active'
  LIMIT 1;
  
  IF v_node_id IS NOT NULL THEN
    -- Update existing node
    UPDATE graph_nodes
    SET
      sub_label = COALESCE(p_sub_label, sub_label),
      confidence = COALESCE(p_confidence, confidence),
      confidence_score = COALESCE(p_confidence_score, confidence_score),
      question_text = COALESCE(p_question_text, question_text),
      question_priority = CASE WHEN p_question_priority > 0 THEN p_question_priority ELSE question_priority END,
      data_json = data_json || p_data_json,
      source_memory_id = COALESCE(p_source_memory_id, source_memory_id),
      source_message_id = COALESCE(p_source_message_id, source_message_id),
      updated_at = NOW()
    WHERE id = v_node_id;
  ELSE
    -- Insert new node
    INSERT INTO graph_nodes (
      user_id, type, name, sub_label, confidence, confidence_score,
      question_text, question_priority, data_json,
      source_memory_id, source_message_id
    )
    VALUES (
      p_user_id, p_type, p_name, p_sub_label, p_confidence, p_confidence_score,
      p_question_text, p_question_priority, p_data_json,
      p_source_memory_id, p_source_message_id
    )
    RETURNING id INTO v_node_id;
  END IF;
  
  RETURN v_node_id;
END;
$$;

-- Upsert a graph edge (insert or update by source/target/relationship)
CREATE OR REPLACE FUNCTION upsert_graph_edge(
  p_user_id TEXT,
  p_source_node_id UUID,
  p_target_node_id UUID,
  p_relationship graph_edge_relationship,
  p_weight REAL DEFAULT 1.0,
  p_p_value REAL DEFAULT NULL,
  p_observation_count INTEGER DEFAULT 0,
  p_data_json JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_edge_id UUID;
BEGIN
  INSERT INTO graph_edges (
    user_id, source_node_id, target_node_id, relationship,
    weight, p_value, observation_count, data_json
  )
  VALUES (
    p_user_id, p_source_node_id, p_target_node_id, p_relationship,
    p_weight, p_p_value, p_observation_count, p_data_json
  )
  ON CONFLICT (user_id, source_node_id, target_node_id, relationship)
  DO UPDATE SET
    weight = EXCLUDED.weight,
    p_value = COALESCE(EXCLUDED.p_value, graph_edges.p_value),
    observation_count = GREATEST(EXCLUDED.observation_count, graph_edges.observation_count),
    data_json = graph_edges.data_json || EXCLUDED.data_json,
    updated_at = NOW()
  RETURNING id INTO v_edge_id;
  
  RETURN v_edge_id;
END;
$$;

-- Get the full graph for a user (nodes + edges for Reagraph)
-- Returns JSON ready for the frontend
CREATE OR REPLACE FUNCTION get_user_graph(p_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_nodes JSONB;
  v_edges JSONB;
BEGIN
  -- Get all active nodes
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', n.id,
      'type', n.type,
      'label', n.name,
      'subLabel', n.sub_label,
      'confidence', n.confidence,
      'confidenceScore', n.confidence_score,
      'questionText', n.question_text,
      'questionPriority', n.question_priority,
      'data', n.data_json,
      'createdAt', n.created_at,
      'updatedAt', n.updated_at
    ) ORDER BY 
      CASE n.type 
        WHEN 'clue' THEN 1 
        WHEN 'unknown' THEN 2 
        ELSE 3 
      END,
      n.created_at DESC
  ), '[]'::jsonb) INTO v_nodes
  FROM graph_nodes n
  WHERE n.user_id = p_user_id AND n.status = 'active';
  
  -- Get all edges for active nodes
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'source', e.source_node_id,
      'target', e.target_node_id,
      'relationship', e.relationship,
      'weight', e.weight,
      'pValue', e.p_value,
      'observationCount', e.observation_count,
      'data', e.data_json
    )
  ), '[]'::jsonb) INTO v_edges
  FROM graph_edges e
  WHERE e.user_id = p_user_id
    AND e.source_node_id IN (SELECT id FROM graph_nodes WHERE user_id = p_user_id AND status = 'active')
    AND e.target_node_id IN (SELECT id FROM graph_nodes WHERE user_id = p_user_id AND status = 'active');
  
  RETURN jsonb_build_object(
    'nodes', v_nodes,
    'edges', v_edges
  );
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/modify their own graph nodes
CREATE POLICY graph_nodes_user_policy ON graph_nodes
  FOR ALL
  USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Users can only see/modify their own graph edges
CREATE POLICY graph_edges_user_policy ON graph_edges
  FOR ALL
  USING (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = auth.uid()::text OR user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can access all rows (for backend operations)
CREATE POLICY graph_nodes_service_policy ON graph_nodes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY graph_edges_service_policy ON graph_edges
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant access to functions
GRANT EXECUTE ON FUNCTION upsert_graph_node TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_graph_node TO service_role;
GRANT EXECUTE ON FUNCTION upsert_graph_edge TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_graph_edge TO service_role;
GRANT EXECUTE ON FUNCTION get_user_graph TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_graph TO service_role;

-- Grant table access
GRANT SELECT, INSERT, UPDATE, DELETE ON graph_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON graph_nodes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON graph_edges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON graph_edges TO service_role;

-- Grant enum type usage
GRANT USAGE ON TYPE graph_node_type TO authenticated;
GRANT USAGE ON TYPE graph_node_type TO service_role;
GRANT USAGE ON TYPE graph_edge_relationship TO authenticated;
GRANT USAGE ON TYPE graph_edge_relationship TO service_role;
GRANT USAGE ON TYPE graph_node_status TO authenticated;
GRANT USAGE ON TYPE graph_node_status TO service_role;
GRANT USAGE ON TYPE graph_confidence_level TO authenticated;
GRANT USAGE ON TYPE graph_confidence_level TO service_role;
