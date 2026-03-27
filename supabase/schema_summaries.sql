-- ── Summaries (PDF files uploaded by sheikh) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS summaries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INTEGER,
  category    TEXT,
  published   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "summaries_public_read" ON summaries FOR SELECT USING (published = true);

-- Storage bucket: run this manually in Supabase Dashboard → Storage
-- 1. Create bucket named: summaries
-- 2. Make it PUBLIC
-- 3. Add policy: allow authenticated service-role uploads
