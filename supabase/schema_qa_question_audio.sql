-- Add a dedicated column for the QUESTION's voice recording.
--   question_audio_url → voice attached to the QUESTION (e.g. a voice question)
--   audio_url          → stays as the ANSWER's voice (unchanged)
-- This lets a single Q&A hold text + image + voice on BOTH sides independently.
ALTER TABLE qa ADD COLUMN IF NOT EXISTS question_audio_url text DEFAULT null;
