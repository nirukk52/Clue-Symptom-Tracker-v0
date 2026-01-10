-- Chat Conversations Table for Post-Signup Chat
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zvpudxinbcsrfyojrhhv/sql

-- Conversations table - tracks chat sessions started after signup
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to signup/auth context
  modal_session_id TEXT,        -- Links to modal_sessions for Q1-Q4 context
  user_email TEXT,              -- Email from signup (for later user linking)

  -- UTM Attribution (preserved from signup)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,

  -- Product context
  product_offering TEXT,        -- flare-forecast, top-suspect, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table - stores individual messages in conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL,           -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,        -- The message text

  -- Chip selection tracking (for user messages)
  selected_chip TEXT,           -- If user clicked a chip, which one
  was_chip_selection BOOLEAN DEFAULT false,

  -- LLM metadata (for assistant messages)
  model_used TEXT,              -- 'gpt-4o-mini', etc.
  tokens_used INTEGER,
  latency_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chat_conversations_modal_session ON chat_conversations(modal_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_email ON chat_conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (landing page uses anon key)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON chat_conversations;
CREATE POLICY "Allow anonymous inserts" ON chat_conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous inserts" ON chat_messages;
CREATE POLICY "Allow anonymous inserts" ON chat_messages FOR INSERT WITH CHECK (true);

-- Policy: Allow reads (for later dashboard/debugging)
DROP POLICY IF EXISTS "Allow reads" ON chat_conversations;
CREATE POLICY "Allow reads" ON chat_conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reads" ON chat_messages;
CREATE POLICY "Allow reads" ON chat_messages FOR SELECT USING (true);

-- Policy: Allow updates (for last_message_at)
DROP POLICY IF EXISTS "Allow updates" ON chat_conversations;
CREATE POLICY "Allow updates" ON chat_conversations FOR UPDATE USING (true);
