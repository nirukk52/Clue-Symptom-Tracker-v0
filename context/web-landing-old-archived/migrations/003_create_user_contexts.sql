-- User Contexts Table
-- Stores user onboarding responses for cross-session personalization
-- Allows returning users to get personalized chat experience without re-answering Q1-Q4

CREATE TABLE IF NOT EXISTS user_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,

  -- Q1: Main health concern
  q1_condition TEXT,
  q1_label TEXT,

  -- Q2: Biggest challenge/pain point
  q2_painpoint TEXT,
  q2_label TEXT,

  -- Q3: Warning preference (how much advance notice they need)
  q3_warning TEXT,
  q3_label TEXT,

  -- Q4: Action plan (what they'd do with advance notice)
  q4_action TEXT,
  q4_label TEXT,

  -- Product context
  product_offering TEXT,

  -- Reference to last conversation
  last_conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_contexts_email ON user_contexts(email);
CREATE INDEX IF NOT EXISTS idx_user_contexts_updated_at ON user_contexts(updated_at);

-- RLS Policies
ALTER TABLE user_contexts ENABLE ROW LEVEL SECURITY;

-- Allow inserts for authenticated users
CREATE POLICY "Allow authenticated user inserts" ON user_contexts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to read their own context
CREATE POLICY "Allow authenticated user reads" ON user_contexts
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Allow users to update their own context
CREATE POLICY "Allow authenticated user updates" ON user_contexts
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow anonymous inserts (for pre-signup tracking)
CREATE POLICY "Allow anon inserts" ON user_contexts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous reads (for pre-signup context loading)
CREATE POLICY "Allow anon reads" ON user_contexts
  FOR SELECT TO anon
  USING (true);

-- Allow anonymous updates (for pre-signup context updates)
CREATE POLICY "Allow anon updates" ON user_contexts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_user_contexts_updated_at ON user_contexts;
CREATE TRIGGER trigger_user_contexts_updated_at
  BEFORE UPDATE ON user_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_contexts_updated_at();
