-- Add category column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category text DEFAULT null;
