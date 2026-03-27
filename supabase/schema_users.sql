-- ── User profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       TEXT,
  email      TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Admin can read all profiles via service role (bypasses RLS)

-- ── Update QA table ───────────────────────────────────────────────────────────
ALTER TABLE qa ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE qa ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- ── Update QA RLS: public can read published+public, users can read their own ─
DROP POLICY IF EXISTS "qa_public_read"   ON qa;
DROP POLICY IF EXISTS "qa_public_insert" ON qa;

CREATE POLICY "qa_read" ON qa FOR SELECT USING (
  -- Published, answered, not private → everyone can see
  (published = true AND answer IS NOT NULL AND (is_private = false OR is_private IS NULL))
  OR
  -- User can always see their own questions (public or private)
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

CREATE POLICY "qa_insert" ON qa FOR INSERT WITH CHECK (
  source IN ('website', 'manual', 'telegram') AND published = false AND answer IS NULL
);

-- ── Auto-create profile on signup ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
