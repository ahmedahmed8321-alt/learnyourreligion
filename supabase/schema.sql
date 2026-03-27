-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Sheikh Website — Supabase Database Schema                  ║
-- ║  Run this in: Supabase Dashboard → SQL Editor               ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── Videos (synced from YouTube) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id    TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT NOT NULL,
  published_at  TIMESTAMPTZ NOT NULL,
  view_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos (published_at DESC);

-- ── Articles (written by admin) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  excerpt     TEXT,
  slug        TEXT UNIQUE NOT NULL,
  published   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (published, created_at DESC);

-- ── Q&A (from Telegram bot or manual) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qa (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question            TEXT NOT NULL,
  answer              TEXT,
  source              TEXT CHECK (source IN ('telegram', 'manual')) DEFAULT 'manual',
  telegram_message_id INTEGER,
  published           BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS qa_published_idx ON qa (published, created_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Allow public READ of published content
ALTER TABLE videos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa       ENABLE ROW LEVEL SECURITY;

-- Videos: public read
CREATE POLICY "videos_public_read" ON videos FOR SELECT USING (true);

-- Articles: only published ones are publicly readable
CREATE POLICY "articles_public_read" ON articles FOR SELECT USING (published = true);

-- Q&A: only published+answered ones are publicly readable
CREATE POLICY "qa_public_read" ON qa FOR SELECT USING (published = true AND answer IS NOT NULL);

-- All write operations go through service-role key (bypasses RLS)
-- No additional policies needed for writes — use SUPABASE_SERVICE_ROLE_KEY server-side
