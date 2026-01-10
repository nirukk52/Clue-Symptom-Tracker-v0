-- Marketing Attribution Tables for Landing Page
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zvpudxinbcsrfyojrhhv/sql

-- Beta signups table - tracks email signups with attribution
CREATE TABLE IF NOT EXISTS beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,

  -- UTM Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Context
  landing_url TEXT,
  referrer TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing events table - tracks page views and CTA clicks
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'cta_click'

  -- UTM Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Event context
  element_id TEXT,        -- which CTA was clicked
  element_text TEXT,      -- button text for clarity
  page_url TEXT,
  referrer TEXT,

  -- Session tracking
  session_id TEXT,        -- group events from same visit

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_beta_signups_campaign ON beta_signups(utm_campaign, utm_content);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created ON beta_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_campaign ON marketing_events(utm_campaign, utm_content);
CREATE INDEX IF NOT EXISTS idx_marketing_events_created ON marketing_events(created_at);
CREATE INDEX IF NOT EXISTS idx_marketing_events_session ON marketing_events(session_id);

-- Enable RLS but allow anonymous inserts (for landing page)
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (landing page uses anon key)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON beta_signups;
CREATE POLICY "Allow anonymous inserts" ON beta_signups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous inserts" ON marketing_events;
CREATE POLICY "Allow anonymous inserts" ON marketing_events FOR INSERT WITH CHECK (true);

-- Policy: Allow reads for dashboard
DROP POLICY IF EXISTS "Allow reads" ON beta_signups;
CREATE POLICY "Allow reads" ON beta_signups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow reads" ON marketing_events;
CREATE POLICY "Allow reads" ON marketing_events FOR SELECT USING (true);
