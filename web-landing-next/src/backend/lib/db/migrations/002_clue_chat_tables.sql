-- Clue Chat Tables Migration
-- Why: Creates all tables needed for the AI chat agent to persist
-- symptom logs, medications, moods, timeline, insights, and doctor summaries.

-- Add user_id and updated_at columns to existing chat_conversations table
-- (chat_conversations was created by 002_create_chat_conversations.sql in the archived migrations)
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS chat_conversations_user_id_idx ON chat_conversations (user_id);
CREATE INDEX IF NOT EXISTS chat_conversations_updated_at_idx ON chat_conversations (updated_at DESC);

-- Chat messages - ensure foreign key references chat_conversations (not conversations)
-- Note: chat_messages table was created in the archived migration with correct FK
-- This just ensures the indexes exist
CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages (conversation_id, created_at);

-- Symptom logs from chat extraction
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  symptom_name TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 0 AND severity <= 10),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS symptom_logs_user_date_idx ON symptom_logs (user_id, logged_at DESC);

-- Medication logs
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  med_name TEXT NOT NULL,
  dosage TEXT,
  taken BOOLEAN DEFAULT TRUE,
  timing TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medication_logs_user_date_idx ON medication_logs (user_id, logged_at DESC);

-- Mood logs
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  note TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mood_logs_user_date_idx ON mood_logs (user_id, logged_at DESC);

-- Unified timeline entries (populated by tools when logging symptoms, meds, etc.)
CREATE TABLE IF NOT EXISTS timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('symptom', 'medication', 'supplement', 'diet', 'test', 'reaction', 'note', 'mood')),
  title TEXT NOT NULL,
  description TEXT,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('start', 'ongoing', 'tolerated', 'issue', 'current', 'completed')),
  severity INTEGER CHECK (severity >= 0 AND severity <= 10),
  dosage TEXT,
  duration TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS timeline_entries_user_date_idx ON timeline_entries (user_id, entry_time DESC);

-- AI-generated insights
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  content TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  evidence_json JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'correcting', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS insights_user_idx ON insights (user_id, created_at DESC);

-- Doctor summaries
CREATE TABLE IF NOT EXISTS doctor_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  content TEXT NOT NULL,
  sections_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS doctor_summaries_user_idx ON doctor_summaries (user_id, created_at DESC);

-- User preferences (flare mode, energy state, etc.)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  flare_mode BOOLEAN DEFAULT FALSE,
  energy_state TEXT DEFAULT 'normal' CHECK (energy_state IN ('normal', 'low_energy', 'flare')),
  primary_condition TEXT,
  conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_preferences_user_idx ON user_preferences (user_id);
