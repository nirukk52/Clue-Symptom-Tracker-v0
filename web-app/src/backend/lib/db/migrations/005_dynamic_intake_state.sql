-- Migration: Add canonical dynamic intake state to user_preferences
-- Why: Structured intake now has one owner for the active question and problem
-- thread state instead of spreading control across prompts and graph nodes.

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS active_intake_question JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS intake_problem_threads JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active_problem_thread_id TEXT DEFAULT NULL;

COMMENT ON COLUMN user_preferences.active_intake_question IS
'Canonical structured intake question waiting for an answer. Stored as JSON so the questionnaire engine can own terse-reply resolution.';

COMMENT ON COLUMN user_preferences.intake_problem_threads IS
'JSON array of active/background problem threads so users can shift between multiple symptoms or conditions without overwriting intake state.';

COMMENT ON COLUMN user_preferences.active_problem_thread_id IS
'Current problem thread for structured intake. Used to attach validated events to the correct symptom or condition thread.';

