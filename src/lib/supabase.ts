import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase instance (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase instance (uses service role — only for API routes/server actions)
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Database types ────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  published_at: string;
  view_count: number | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  youtube_playlist_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_count: number;
  published_at: string | null;
  created_at: string;
}

export interface QASection {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface QA {
  id: string;
  question: string;
  answer: string | null;
  source: "telegram" | "manual" | "website";
  telegram_message_id: number | null;
  section_id: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  user_id: string | null;
  is_private: boolean;
  published: boolean;
  created_at: string;
}
