-- User notes / learning progress tracker
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  video_youtube_id text DEFAULT null,
  video_title text DEFAULT null,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_video ON user_notes(video_youtube_id);

-- User file attachments (images, etc.)
CREATE TABLE IF NOT EXISTS user_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_attachments_note ON user_attachments(note_id);

-- RLS: users can only access their own data
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notes" ON user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON user_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON user_notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own attachments" ON user_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attachments" ON user_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own attachments" ON user_attachments FOR DELETE USING (auth.uid() = user_id);

-- Service role bypasses RLS, so API routes using getSupabaseAdmin() work fine
