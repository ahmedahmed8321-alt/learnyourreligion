import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/search?q=... → { playlists, videos:[{...,snippet}] }
// Searches playlist titles/descriptions and video titles/descriptions/transcripts.
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  const safe = q.replace(/[(),*%]/g, " ").trim();
  if (!safe) return NextResponse.json({ playlists: [], videos: [] });

  const supabase = getSupabaseAdmin();
  const [plRes, vRes] = await Promise.all([
    supabase
      .from("playlists")
      .select("id,youtube_playlist_id,title,description,thumbnail_url,video_count")
      .or(`title.ilike.%${safe}%,description.ilike.%${safe}%`)
      .order("published_at", { ascending: false })
      .limit(18),
    supabase
      .from("videos")
      .select("id,youtube_id,title,thumbnail_url,published_at,transcript")
      .or(`title.ilike.%${safe}%,description.ilike.%${safe}%,transcript.ilike.%${safe}%`)
      .order("published_at", { ascending: false })
      .limit(48),
  ]);

  const videos = (vRes.data ?? []).map((v: any) => {
    let snippet: { text: string; q: string } | null = null;
    if (v.transcript) {
      let idx = v.transcript.indexOf(safe);
      if (idx === -1) idx = v.transcript.toLowerCase().indexOf(safe.toLowerCase());
      if (idx !== -1) {
        const start = Math.max(0, idx - 60);
        const end = Math.min(v.transcript.length, idx + safe.length + 90);
        snippet = { text: v.transcript.slice(start, end).trim(), q: safe };
      }
    }
    const { transcript, ...rest } = v;
    return { ...rest, snippet };
  });

  return NextResponse.json({ playlists: plRes.data ?? [], videos });
}
