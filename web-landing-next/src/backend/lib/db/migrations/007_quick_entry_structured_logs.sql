-- Quick Entry Structured Logs Migration
-- Why: Adds deterministic storage for Bearable-style quick-entry factors and
-- health measurements, plus source tagging so quick-entry edits can replace
-- prior structured saves without disturbing chat-derived history.

ALTER TABLE mood_logs
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat';

ALTER TABLE medication_logs
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat';

ALTER TABLE timeline_entries
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'chat';

ALTER TABLE timeline_entries
  DROP CONSTRAINT IF EXISTS timeline_entries_type_check;

ALTER TABLE timeline_entries
  ADD CONSTRAINT timeline_entries_type_check
  CHECK (type IN ('symptom', 'medication', 'supplement', 'diet', 'test', 'reaction', 'note', 'mood', 'factor', 'measurement'));

CREATE TABLE IF NOT EXISTS factor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category_key TEXT NOT NULL,
  category_label TEXT NOT NULL,
  factor_key TEXT NOT NULL,
  factor_name TEXT NOT NULL,
  rating INTEGER,
  scale_max INTEGER,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'quick_entry',
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT factor_logs_rating_check CHECK (
    rating IS NULL OR (rating >= 0 AND rating <= 10)
  ),
  CONSTRAINT factor_logs_scale_check CHECK (
    scale_max IS NULL OR scale_max IN (3, 10)
  )
);

CREATE INDEX IF NOT EXISTS factor_logs_user_date_idx
  ON factor_logs (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS factor_logs_user_factor_idx
  ON factor_logs (user_id, category_key, factor_key, logged_at DESC);

CREATE TABLE IF NOT EXISTS health_measurement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  value_numeric DOUBLE PRECISION NOT NULL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'quick_entry',
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS health_measurement_logs_user_date_idx
  ON health_measurement_logs (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS health_measurement_logs_user_metric_idx
  ON health_measurement_logs (user_id, metric_key, logged_at DESC);
