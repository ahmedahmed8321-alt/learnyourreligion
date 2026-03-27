import { NextResponse } from "next/server";
import { fetchChannelPlaylists, fetchPlaylistVideoIds } from "@/lib/youtube";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch all playlists from YouTube
    const playlists = await fetchChannelPlaylists();

    // 2. Upsert playlists into DB
    const playlistRows = playlists.map((p) => ({
      youtube_playlist_id: p.playlistId,
      title: p.title,
      description: p.description,
      thumbnail_url: p.thumbnailUrl,
      video_count: p.videoCount,
      published_at: p.publishedAt,
    }));

    const { error: plErr } = await supabase
      .from("playlists")
      .upsert(playlistRows, { onConflict: "youtube_playlist_id" });

    if (plErr) throw plErr;

    // 3. For each playlist, fetch video IDs and store the relationship
    let totalLinks = 0;
    for (const playlist of playlists) {
      const videoItems = await fetchPlaylistVideoIds(playlist.playlistId);
      if (videoItems.length === 0) continue;

      const linkRows = videoItems.map((item) => ({
        video_youtube_id: item.videoId,
        playlist_youtube_id: playlist.playlistId,
        position: item.position,
      }));

      const { error: linkErr } = await supabase
        .from("video_playlists")
        .upsert(linkRows, { onConflict: "video_youtube_id,playlist_youtube_id" });

      if (linkErr) console.error(`Error linking playlist ${playlist.playlistId}:`, linkErr);
      else totalLinks += linkRows.length;
    }

    return NextResponse.json({
      success: true,
      playlists: playlists.length,
      videoLinks: totalLinks,
    });
  } catch (err: any) {
    console.error("Playlist sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
