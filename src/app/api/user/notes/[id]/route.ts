import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getUser(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/** PATCH /api/user/notes/:id — update a note */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, video_youtube_id, video_title } = body;

  const supabase = getSupabaseAdmin();
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (content !== undefined) updates.content = content.trim();
  if (video_youtube_id !== undefined) updates.video_youtube_id = video_youtube_id || null;
  if (video_title !== undefined) updates.video_title = video_title || null;

  const { data, error } = await supabase
    .from("user_notes")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*, user_attachments(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

/** DELETE /api/user/notes/:id — delete a note and its attachments */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Get attachments to delete from storage
  const { data: attachments } = await supabase
    .from("user_attachments")
    .select("file_url")
    .eq("note_id", params.id)
    .eq("user_id", user.id);

  // Delete storage files
  if (attachments?.length) {
    const paths = attachments
      .map((a) => {
        const match = a.file_url.match(/\/summaries\/(.+)$/);
        return match?.[1];
      })
      .filter(Boolean) as string[];
    if (paths.length) {
      await supabase.storage.from("summaries").remove(paths);
    }
  }

  // Delete note (cascades to attachments via FK)
  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
