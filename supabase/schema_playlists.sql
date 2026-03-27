-- ── Playlists (synced from YouTube) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlists (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_playlist_id  TEXT UNIQUE NOT NULL,
  title                TEXT NOT NULL,
  description          TEXT,
  thumbnail_url        TEXT,
  video_count          INTEGER DEFAULT 0,
  published_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Video ↔ Playlist (many-to-many) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS video_playlists (
  video_youtube_id    TEXT NOT NULL,
  playlist_youtube_id TEXT NOT NULL,
  position            INTEGER DEFAULT 0,
  PRIMARY KEY (video_youtube_id, playlist_youtube_id)
);

CREATE INDEX IF NOT EXISTS video_playlists_playlist_idx ON video_playlists (playlist_youtube_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE playlists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_public_read"       ON playlists       FOR SELECT USING (true);
CREATE POLICY "video_playlists_public_read" ON video_playlists FOR SELECT USING (true);
