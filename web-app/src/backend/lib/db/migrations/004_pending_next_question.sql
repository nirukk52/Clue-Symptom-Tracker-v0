-- Migration: Add pending_next_question to user_preferences
-- Why: Enables conversational pacing — when ask_severity is called, we defer
-- the next question to the following turn instead of asking both at once.

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS pending_next_question TEXT DEFAULT NULL;

COMMENT ON COLUMN user_preferences.pending_next_question IS 
'Stores the next question to ask when the previous turn used ask_severity. Cleared after use.';
