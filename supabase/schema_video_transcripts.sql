-- Video transcripts (fetched by a nightly GitHub Action running yt-dlp).
--   transcript           → cleaned plain-text transcript (Arabic auto-subs)
--   transcript_status    → null = not attempted, 'ok', 'none' (no captions), 'error'
--   transcript_fetched_at→ when it was last attempted
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript text DEFAULT null;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript_status text DEFAULT null;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS transcript_fetched_at timestamptz DEFAULT null;

-- Speed up "which videos still need a transcript" lookups
CREATE INDEX IF NOT EXISTS videos_transcript_status_idx ON videos (transcript_status);
