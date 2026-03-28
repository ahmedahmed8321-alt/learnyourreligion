import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getUser(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/** GET /api/user/notes — list notes for current user */
export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_notes")
    .select("*, user_attachments(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/user/notes — create a note */
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, video_youtube_id, video_title } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "المحتوى مطلوب" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: user.id,
      content: content.trim(),
      video_youtube_id: video_youtube_id || null,
      video_title: video_title || null,
    })
    .select("*, user_attachments(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
