-- Add audio_url column to qa table for voice answers from Telegram
ALTER TABLE qa ADD COLUMN IF NOT EXISTS audio_url text DEFAULT null;
