-- Add image columns to qa table:
--   image_url        → optional photo attached to the QUESTION by the submitter
--   answer_image_url → optional photo attached to the ANSWER by the Sheikh/admin
-- Images are stored in the existing public "summaries" storage bucket under qa/.
ALTER TABLE qa ADD COLUMN IF NOT EXISTS image_url text DEFAULT null;
ALTER TABLE qa ADD COLUMN IF NOT EXISTS answer_image_url text DEFAULT null;
