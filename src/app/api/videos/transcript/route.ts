import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/videos/transcript?id=<youtube_id> → { transcript, status }
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("videos")
    .select("transcript, transcript_status")
    .eq("youtube_id", id)
    .single();

  if (error) return NextResponse.json({ transcript: null, status: null });
  return NextResponse.json({ transcript: data?.transcript ?? null, status: data?.transcript_status ?? null });
}
