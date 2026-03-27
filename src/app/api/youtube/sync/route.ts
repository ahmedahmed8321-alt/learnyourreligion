import { NextResponse } from "next/server";
import { fetchChannelVideos } from "@/lib/youtube";
import { getSupabaseAdmin } from "@/lib/supabase";

// Can be called manually or via a Vercel cron job
export async function POST(req: Request) {
  // Simple secret check (set CRON_SECRET in env for production)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await fetchChannelVideos();
    const supabase = getSupabaseAdmin();

    const rows = videos.map((v) => ({
      youtube_id: v.youtubeId,
      title: v.title,
      description: v.description,
      thumbnail_url: v.thumbnailUrl,
      published_at: v.publishedAt,
      view_count: v.viewCount ?? 0,
    }));

    const { error } = await supabase.from("videos").upsert(rows, {
      onConflict: "youtube_id",
    });

    if (error) throw error;

    return NextResponse.json({ success: true, synced: rows.length });
  } catch (err: any) {
    console.error("YouTube sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Allow GET for easy manual testing in browser
export async function GET(req: Request) {
  return POST(req);
}
