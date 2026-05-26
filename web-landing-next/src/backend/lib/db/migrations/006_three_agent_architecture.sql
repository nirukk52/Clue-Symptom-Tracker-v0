-- Migration: three-agent architecture support
-- Why: Adds durable cursor tracking for post-turn agents and extends insights
-- so the Insight Agent can store the next-question clue contract explicitly.

ALTER TABLE insights
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'pattern',
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS priority REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS insights_user_type_idx
  ON insights (user_id, type, created_at DESC);

COMMENT ON COLUMN insights.type IS
'Insight category. "next_question" is owned by the Insight Agent; legacy generated insights default to "pattern".';

COMMENT ON COLUMN insights.reasoning IS
'Optional machine-readable or human-readable rationale for why the insight was generated.';

COMMENT ON COLUMN insights.priority IS
'Relative importance score for ranking insights or next-question clues.';

COMMENT ON COLUMN insights.metadata IS
'Flexible JSON payload for debugging, top conditions, or clue-generation method details.';

CREATE TABLE IF NOT EXISTS agent_cursors (
  user_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  cursor_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_running BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, agent_name)
);

CREATE INDEX IF NOT EXISTS agent_cursors_running_idx
  ON agent_cursors (agent_name, is_running);

COMMENT ON TABLE agent_cursors IS
'Tracks the last successful watermark for background agents so retries can catch up without losing data.';
