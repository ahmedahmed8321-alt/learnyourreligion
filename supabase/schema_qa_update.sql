-- ── QA Sections (categories) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qa_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Update QA table ───────────────────────────────────────────────────────────
ALTER TABLE qa ADD COLUMN IF NOT EXISTS section_id     UUID REFERENCES qa_sections(id) ON DELETE SET NULL;
ALTER TABLE qa ADD COLUMN IF NOT EXISTS submitter_name TEXT;
ALTER TABLE qa ADD COLUMN IF NOT EXISTS submitter_email TEXT;

-- Allow 'website' as a source value
ALTER TABLE qa DROP CONSTRAINT IF EXISTS qa_source_check;
ALTER TABLE qa ADD CONSTRAINT qa_source_check
  CHECK (source IN ('telegram', 'manual', 'website'));

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE qa_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qa_sections_public_read" ON qa_sections FOR SELECT USING (true);

-- Allow anyone to INSERT a question via website (source='website', published=false)
CREATE POLICY "qa_public_insert" ON qa FOR INSERT WITH CHECK (
  source = 'website' AND published = false AND answer IS NULL
);
