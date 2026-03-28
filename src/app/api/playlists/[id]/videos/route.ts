import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface Props { params: { id: string } }

export async function GET(_req: Request, { params }: Props) {
  const supabase = getSupabaseAdmin();

  // Get video IDs from junction table, ordered by position
  const { data: vpData } = await supabase
    .from("video_playlists")
    .select("video_youtube_id, position")
    .eq("playlist_youtube_id", params.id)
    .order("position", { ascending: true })
    .limit(100);

  const videoIds = (vpData ?? []).map((r: any) => r.video_youtube_id);

  if (videoIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: vData } = await supabase
    .from("videos")
    .select("id, youtube_id, title, thumbnail_url, published_at")
    .in("youtube_id", videoIds);

  // Sort by playlist position
  const posMap = Object.fromEntries(
    (vpData ?? []).map((r: any) => [r.video_youtube_id, r.position])
  );
  const videos = (vData ?? []).sort(
    (a: any, b: any) => (posMap[a.youtube_id] ?? 0) - (posMap[b.youtube_id] ?? 0)
  );

  return NextResponse.json(videos);
}
